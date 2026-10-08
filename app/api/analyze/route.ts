
import OpenAI from "openai";
import { NextResponse } from "next/server";
import { COMPETITOR_SCORES, COMPETITOR_DOMAINS, avgScore } from "@/lib/competitor-scores";
import { supabaseAdmin } from "@/lib/supabase";

const client = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
  maxRetries: 0,
});

const SYSTEM = `You are ShelfMind. Score the user's beverage can against pre-computed competitors.

Return ONLY valid JSON. No markdown.

Rules:
- Headline: 6-10 words, about the user's can.
- Issues: max 12 words each.
- Gaps: max 12 words each.
- Tests: max 10 words each.
- No notes. Scores only.

REGIONS — VERY IMPORTANT:
Every top issue MUST include a "region": [x, y, width, height] in percentages
(0-100) from the top-left of the USER's image. The region must point to the
specific part of their can that the issue refers to.

Examples:
- Issue about the flavor name in the top-right: region [55, 8, 40, 20]
- Issue about the brand mark in the center:    region [25, 30, 50, 25]
- Issue about the back label:                  region [10, 60, 80, 30]

NEVER use [0, 0, 100, 100]. Always point to a specific area.

Exact JSON shape:
{
  "user_scores": {
    "brand_recognition": 0,
    "category_clarity": 0,
    "flavor_clarity": 0,
    "benefit_clarity": 0,
    "shelf_visibility": 0,
    "digital_shelf_readability": 0,
    "differentiation": 0,
    "sku_confusion_risk": 0
  },
  "headline": "string",
  "top_issues": [
    { "issue": "string", "region": [0, 0, 0, 0] },
    { "issue": "string", "region": [0, 0, 0, 0] },
    { "issue": "string", "region": [0, 0, 0, 0] }
  ],
  "gaps_vs_leader": ["string", "string", "string"],
  "recommended_tests": ["string", "string", "string"]
}`;

const MODELS = [
  "gemini-2.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-3.5-flash",
];

async function callModel(model: string, messages: any[]): Promise<string> {
  const res = await client.chat.completions.create({
    model,
    messages,
    response_format: { type: "json_object" },
    temperature: 0.2,
    max_tokens: 1400,
  } as any);
  return res.choices[0].message.content || "{}";
}

async function callWithFallback(messages: any[]): Promise<string> {
  let lastErr: any = null;
  for (let i = 0; i < MODELS.length; i++) {
    try {
      return await callModel(MODELS[i], messages);
    } catch (e: any) {
      lastErr = e;
      continue;
    }
  }
  throw lastErr;
}

function extractJson(text: string): any {
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```json\s*/i, "").replace(/^```\s*/i, "");
  cleaned = cleaned.replace(/```\s*$/i, "").trim();
  const s = cleaned.indexOf("{");
  const e = cleaned.lastIndexOf("}");
  if (s !== -1 && e !== -1) cleaned = cleaned.slice(s, e + 1);
  return JSON.parse(cleaned);
}

function salvageJson(text: string): any {
  const result: any = {
    user_scores: {},
    headline: "",
    top_issues: [],
    gaps_vs_leader: [],
    recommended_tests: [],
  };

  const scoreKeys = [
    "brand_recognition",
    "category_clarity",
    "flavor_clarity",
    "benefit_clarity",
    "shelf_visibility",
    "digital_shelf_readability",
    "differentiation",
    "sku_confusion_risk",
  ];
  for (const k of scoreKeys) {
    const m = text.match(new RegExp(`"${k}"\\s*:\\s*(\\d+(?:\\.\\d+)?)`));
    if (m) result.user_scores[k] = Number(m[1]);
  }

  const h = text.match(/"headline"\s*:\s*"([^"]*)"/);
  if (h) result.headline = h[1];

  const issueMatches = text.matchAll(
    /"issue"\s*:\s*"([^"]*)"[^}]*?"region"\s*:\s*\[\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\]/g
  );
  for (const m of issueMatches) {
    result.top_issues.push({
      issue: m[1],
      region: [Number(m[2]), Number(m[3]), Number(m[4]), Number(m[5])],
    });
  }

  const gapsMatch = text.match(/"gaps_vs_leader"\s*:\s*\[([^\]]*)\]/);
  if (gapsMatch) {
    const items = gapsMatch[1].matchAll(/"([^"]*)"/g);
    for (const m of items) result.gaps_vs_leader.push(m[1]);
  }

  const testsMatch = text.match(/"recommended_tests"\s*:\s*\[([^\]]*)\]/);
  if (testsMatch) {
    const items = testsMatch[1].matchAll(/"([^"]*)"/g);
    for (const m of items) result.recommended_tests.push(m[1]);
  }

  return result;
}

function parseOrSalvage(text: string): any {
  try {
    return extractJson(text);
  } catch (e) {
    console.warn("JSON parse failed — salvaging");
    return salvageJson(text);
  }
}

function clampRegion(r: any): number[] {
  if (!Array.isArray(r) || r.length !== 4) return [0, 0, 100, 100];
  return r.map((n) => Math.max(0, Math.min(100, Number(n) || 0)));
}

function trim(s: any, max: number): string {
  const str = String(s || "").trim();
  const w = str.split(/\s+/);
  return w.length <= max ? str : w.slice(0, max).join(" ") + "…";
}

function clampScore(n: any) {
  return Math.max(0, Math.min(100, Number(n) || 0));
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const category = (form.get("category") as string) || "functional_soda";
    const yourCan = form.get("your_can") as File;
    const competitorNames = form.getAll("competitor_names") as string[];

    if (!yourCan) return NextResponse.json({ error: "No can uploaded" }, { status: 400 });
    if (competitorNames.length < 2)
      return NextResponse.json({ error: "Pick at least 2 competitors" }, { status: 400 });

    const cached = competitorNames
      .map((name) => {
        const s = COMPETITOR_SCORES[name];
        if (!s) return null;
        return { name, scores: s, overall: avgScore(s), domain: COMPETITOR_DOMAINS[name] || "" };
      })
      .filter(Boolean) as { name: string; scores: any; overall: number; domain: string }[];

    if (cached.length < 2) {
      return NextResponse.json({ error: "Some competitors are not recognised." }, { status: 400 });
    }

    const competitorBlock = cached
      .map((c) => `${c.name} (${c.overall}): ${JSON.stringify(c.scores)}`)
      .join("\n");

    const content: any[] = [
      {
        type: "text",
        text: `Category: ${category}

Pre-computed competitor scores (use as given):
${competitorBlock}

Score the USER's can in the image. For each issue, give a specific region
of the image where the problem is visible.

Return JSON.`,
      },
      { type: "text", text: `IMAGE — USER'S CAN:` },
    ];

    const buf = Buffer.from(await yourCan.arrayBuffer());
    content.push({
      type: "image_url",
      image_url: {
        url: `data:${yourCan.type || "image/jpeg"};base64,${buf.toString("base64")}`,
      },
    });

    const messages = [
      { role: "system", content: SYSTEM },
      { role: "user", content },
    ];

    const rawText = await callWithFallback(messages);
    const parsed = parseOrSalvage(rawText);

    const us = parsed.user_scores || {};
    const userScores = {
      brand_recognition: { score: clampScore(us.brand_recognition), notes: "" },
      category_clarity: { score: clampScore(us.category_clarity), notes: "" },
      flavor_clarity: { score: clampScore(us.flavor_clarity), notes: "" },
      benefit_clarity: { score: clampScore(us.benefit_clarity), notes: "" },
      shelf_visibility: { score: clampScore(us.shelf_visibility), notes: "" },
      digital_shelf_readability: { score: clampScore(us.digital_shelf_readability), notes: "" },
      differentiation: { score: clampScore(us.differentiation), notes: "" },
      sku_confusion_risk: { score: clampScore(us.sku_confusion_risk), notes: "" },
    };
    const userOverall = Math.round(
      (userScores.brand_recognition.score +
        userScores.category_clarity.score +
        userScores.flavor_clarity.score +
        userScores.benefit_clarity.score +
        userScores.shelf_visibility.score +
        userScores.digital_shelf_readability.score +
        userScores.differentiation.score +
        userScores.sku_confusion_risk.score) /
        8
    );

    type Row = { name: string; is_user: boolean; score: number; scores: any };
    const rows: Row[] = [
      { name: "Your can", is_user: true, score: userOverall, scores: userScores },
      ...cached.map((c) => ({
        name: c.name,
        is_user: false,
        score: c.overall,
        scores: Object.fromEntries(
          Object.entries(c.scores).map(([k, v]) => [k, { score: clampScore(v), notes: "" }])
        ) as any,
      })),
    ];

    rows.sort((a, b) => b.score - a.score);
    const leaderboard = rows.map((r, i) => ({ ...r, rank: i + 1 }));

    const userRow = leaderboard.find((r) => r.is_user)!;
    const leaderRow = leaderboard[0];
    const topCompetitor = cached.reduce(
      (best, c) => (c.overall > best.overall ? c : best),
      cached[0]
    );

    const issues = (parsed.top_issues || []).slice(0, 3).map((i: any) =>
      typeof i === "string"
        ? { issue: trim(i, 12), region: [0, 0, 100, 100] }
        : { issue: trim(i.issue || "", 12), region: clampRegion(i.region) }
    );
    const gaps = (parsed.gaps_vs_leader || []).slice(0, 3).map((g: any) => trim(g, 12));
    const tests = (parsed.recommended_tests || []).slice(0, 3).map((t: any) => trim(t, 10));

    const response = {
      category,
      first_impression: {
        headline: trim(parsed.headline || "Analysis complete.", 12),
        summary: "",
        attention_order: [],
      },
      user_rank: userRow.rank,
      user_score: userRow.score,
      leader_name: leaderRow.name,
      leader_score: leaderRow.score,
      leaderboard,
      top_issues: issues,
      gaps_vs_leader: gaps,
      competitor_reference: {
        brand: topCompetitor.name,
        domain: topCompetitor.domain,
        what_they_do_differently: "",
        what_to_copy: "",
      },
      recommended_tests: tests,
    };
    // Save to Supabase
    const sessionId = (form.get("session_id") as string) || "anonymous";
    const { data: saved, error: saveError } = await supabaseAdmin
      .from("analyses")
      .insert({
        session_id: sessionId,
        category,
        image_url: `data:${yourCan.type || "image/jpeg"};base64,${buf.toString("base64")}`,
        report: response,
      })
      .select("id")
      .single();

    if (saveError) {
      console.error("SUPABASE SAVE ERROR:", saveError);
      // Still return the report even if save fails
      return NextResponse.json({ ...response, id: null });
    }

    return NextResponse.json({ ...response, id: saved.id });
  } catch (e: any) {
    console.error("ANALYZE ERROR:", e);
    return NextResponse.json({ error: e.message || "Analysis failed" }, { status: 500 });
  }
}