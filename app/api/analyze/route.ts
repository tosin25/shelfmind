import OpenAI from "openai";
import { NextResponse } from "next/server";

const client = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
  maxRetries: 0,
});

const SYSTEM = `You are ShelfMind, a beverage DTC packaging intelligence system.

You are NOT a design critic. You are a retail/product diagnostician.

Return ONLY valid JSON. No markdown. No prose. No code fences.
Every key must be present. Every score must be a number 0-100.

For each top issue, you MUST provide a "region" — the rectangular area of the image
that the issue refers to. Regions are in percentage from the top-left of the image:
[x, y, width, height], each between 0 and 100.

Example: a small flavor name in the top-right would be [60, 10, 30, 20].

Exact JSON shape (do not rename keys):
{
  "first_impression": {
    "summary": "string",
    "attention_order": ["string", "string", "string"]
  },
  "brand_recognition": { "score": 0, "notes": "string" },
  "category_clarity": { "score": 0, "notes": "string" },
  "flavor_clarity": { "score": 0, "notes": "string" },
  "benefit_clarity": { "score": 0, "notes": "string" },
  "shelf_visibility": { "score": 0, "notes": "string" },
  "digital_shelf_readability": { "score": 0, "notes": "string" },
  "differentiation": { "score": 0, "notes": "string" },
  "sku_confusion_risk": { "score": 0, "notes": "string" },
  "top_issues": [
    { "issue": "string", "region": [0, 0, 0, 0] },
    { "issue": "string", "region": [0, 0, 0, 0] },
    { "issue": "string", "region": [0, 0, 0, 0] }
  ],
  "competitor_reference": {
    "brand": "string (a real competitor in this category)",
    "what_they_do_differently": "string",
    "what_to_copy": "string"
  },
  "recommended_tests": ["string", "string", "string"]
}`;

const MODELS = [
  "gemini-3.8-flash",
  "gemini-3.5-flash",
  "gemini-3.1-flash-lite",
  "gemini-2.5-flash",
];

async function callWithRetry(messages: any[], modelIndex = 0, attempt = 0): Promise<string> {
  const model = MODELS[modelIndex];
  const maxAttemptsPerModel = 3;

  try {
    const res = await client.chat.completions.create({
      model,
      messages,
      response_format: { type: "json_object" },
      temperature: 0.2,
    });
    return res.choices[0].message.content || "{}";
  } catch (e: any) {
    const status = e?.status || e?.response?.status;
    const retryable = status === 503 || status === 429 || status >= 500;

    if (retryable && attempt < maxAttemptsPerModel - 1) {
      const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500;
      await new Promise((r) => setTimeout(r, delay));
      return callWithRetry(messages, modelIndex, attempt + 1);
    }

    if (modelIndex < MODELS.length - 1) {
      console.warn(`Model ${model} failed, falling back to ${MODELS[modelIndex + 1]}`);
      return callWithRetry(messages, modelIndex + 1, 0);
    }

    throw e;
  }
}

function extractJson(text: string): any {
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```json\s*/i, "").replace(/^```\s*/i, "");
  cleaned = cleaned.replace(/```\s*$/i, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start !== -1 && end !== -1) cleaned = cleaned.slice(start, end + 1);
  return JSON.parse(cleaned);
}

function clampRegion(r: any): [number, number, number, number] {
  if (!Array.isArray(r) || r.length !== 4) return [0, 0, 100, 100];
  return r.map((n) => Math.max(0, Math.min(100, Number(n) || 0))) as any;
}

function normalize(raw: any, category: string) {
  const score = (v: any) =>
    typeof v === "object" && v !== null
      ? { score: Number(v.score) || 0, notes: String(v.notes || "") }
      : { score: Number(v) || 0, notes: "" };

  const issues = (raw.top_issues || raw.topIssues || []).slice(0, 3).map((i: any) => {
    if (typeof i === "string") return { issue: i, region: [0, 0, 100, 100] };
    return {
      issue: String(i.issue || i.text || ""),
      region: clampRegion(i.region),
    };
  });

  return {
    category,
    first_impression: {
      summary:
        raw.first_impression?.summary ||
        raw.firstImpression?.summary ||
        raw.summary ||
        "Analysis complete.",
      attention_order:
        raw.first_impression?.attention_order ||
        raw.firstImpression?.attentionOrder ||
        raw.attention_order ||
        [],
    },
    brand_recognition: score(raw.brand_recognition || raw.brandRecognition),
    category_clarity: score(raw.category_clarity || raw.categoryClarity),
    flavor_clarity: score(raw.flavor_clarity || raw.flavorClarity),
    benefit_clarity: score(raw.benefit_clarity || raw.benefitClarity),
    shelf_visibility: score(raw.shelf_visibility || raw.shelfVisibility),
    digital_shelf_readability: score(
      raw.digital_shelf_readability || raw.digitalShelfReadability
    ),
    differentiation: score(raw.differentiation),
    sku_confusion_risk: score(raw.sku_confusion_risk || raw.skuConfusionRisk),
    top_issues: issues,
    competitor_reference: raw.competitor_reference || raw.competitorReference || null,
    recommended_tests: raw.recommended_tests || raw.recommendedTests || [],
  };
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("image") as File;
    const category = (form.get("category") as string) || "beverage";

    if (!file) return NextResponse.json({ error: "No image" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const b64 = buffer.toString("base64");

    const messages = [
      { role: "system", content: SYSTEM },
      {
        role: "user",
        content: [
          { type: "text", text: `Analyze this ${category} beverage packaging.` },
          {
            type: "image_url",
            image_url: { url: `data:${file.type};base64,${b64}` },
          },
        ],
      },
    ];

    const rawText = await callWithRetry(messages);
    const parsed = extractJson(rawText);
    const normalized = normalize(parsed, category);

    return NextResponse.json(normalized);
  } catch (e: any) {
    console.error("=== ANALYZE ERROR ===", e);
    return NextResponse.json(
      { error: e.message || "Analysis failed" },
      { status: 500 }
    );
  }
}