"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function scoreColor(score: number) {
  if (score < 40) return { bar: "bg-red-500", text: "text-red-400" };
  if (score < 70) return { bar: "bg-amber-500", text: "text-amber-400" };
  return { bar: "bg-emerald-500", text: "text-emerald-400" };
}

function Crop({
  imageUrl,
  region,
  size = 224,
}: {
  imageUrl: string;
  region: number[];
  size?: number;
}) {
  const w = Math.min(Math.max(region[2] ?? 100, 5), 99);
  const h = Math.min(Math.max(region[3] ?? 100, 5), 99);
  const x = Math.max(Math.min(region[0] ?? 0, 100 - w), 0);
  const y = Math.max(Math.min(region[1] ?? 0, 100 - h), 0);

  const bgW = (100 / w) * 100;
  const bgH = (100 / h) * 100;
  const bgX = w >= 100 ? 0 : (x / (100 - w)) * 100;
  const bgY = h >= 100 ? 0 : (y / (100 - h)) * 100;

  return (
    <div
      className="rounded-xl overflow-hidden border border-zinc-900 shrink-0"
      style={{
        width: size,
        height: size,
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: `${bgW}% ${bgH}%`,
        backgroundPosition: `${bgX}% ${bgY}%`,
        backgroundRepeat: "no-repeat",
        backgroundColor: "#09090b",
      }}
    />
  );
}

function CompetitorLogo({ domain, brand }: { domain?: string; brand: string }) {
  const [failed, setFailed] = useState(false);
  const initial = brand?.[0]?.toUpperCase() || "?";
  const src = domain ? `https://unavatar.io/${domain}?fallback=false` : null;

  if (!src || failed) {
    return (
      <div className="w-14 h-14 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xl font-semibold text-zinc-500">
        {initial}
      </div>
    );
  }

  return (
    <div className="w-14 h-14 rounded-xl bg-white border border-zinc-800 flex items-center justify-center overflow-hidden">
      <img
        src={src}
        alt={brand}
        className="w-full h-full object-contain p-1.5"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

export default function Report() {
  const [data, setData] = useState<any>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [testsOpen, setTestsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const raw = sessionStorage.getItem("shelfmind_report");
    const img = sessionStorage.getItem("shelfmind_image");
    if (raw) setData(JSON.parse(raw));
    if (img) setImageUrl(img);
  }, []);

  function redesign() {
    sessionStorage.removeItem("shelfmind_report");
    sessionStorage.removeItem("shelfmind_image");
    router.push("/upload");
  }

  if (!data) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-zinc-500">
          No report yet.{" "}
          <a href="/upload" className="underline">
            Upload one →
          </a>
        </p>
      </main>
    );
  }

  const scores = [
    ["Brand recognition", data.brand_recognition],
    ["Category clarity", data.category_clarity],
    ["Flavor clarity", data.flavor_clarity],
    ["Benefit clarity", data.benefit_clarity],
    ["Shelf visibility", data.shelf_visibility],
    ["Digital shelf", data.digital_shelf_readability],
    ["Differentiation", data.differentiation],
    ["SKU confusion risk", data.sku_confusion_risk],
  ];

  const headline =
    data.first_impression?.headline || data.first_impression?.summary || "";
  const summary = data.first_impression?.summary || "";

  return (
    <main className="min-h-screen bg-black text-white p-8 md:p-16">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <a href="/upload" className="text-zinc-500 text-sm hover:text-white">
            ← New analysis
          </a>
          <button
            onClick={redesign}
            className="text-sm border border-zinc-800 hover:border-zinc-600 rounded-full px-4 py-1.5 transition"
          >
            Redesign
          </button>
        </div>

        <div className="text-xs text-zinc-500 uppercase tracking-widest mb-3">
          Packaging · {String(data.category || "").replace("_", " ")}
        </div>

        <section className="grid md:grid-cols-[280px_1fr] gap-8 mb-14 items-start">
          {imageUrl && (
            <div className="rounded-2xl overflow-hidden border border-zinc-900 bg-zinc-950">
              <img src={imageUrl} alt="packaging" className="w-full" />
            </div>
          )}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight mb-3">
              {headline}
            </h1>
            {summary && summary !== headline && (
              <p className="text-zinc-400 mb-8 leading-relaxed">{summary}</p>
            )}

            <div className="text-xs text-zinc-500 uppercase tracking-widest mb-4">
              Attention order
            </div>
            <ol className="space-y-2">
              {data.first_impression?.attention_order?.map(
                (a: string, i: number) => (
                  <li key={i} className="flex gap-3 items-baseline">
                    <span className="w-6 h-6 rounded-full bg-zinc-900 flex items-center justify-center text-xs font-mono text-zinc-400 shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-zinc-300">{a}</span>
                  </li>
                )
              )}
            </ol>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-14">
          {scores.map(([label, s]: any) => {
            const c = scoreColor(s?.score ?? 0);
            return (
              <div key={label} className="border border-zinc-900 rounded-xl p-5">
                <div className="flex justify-between items-baseline mb-3">
                  <span className="text-sm text-zinc-400">{label}</span>
                  <span className={`font-mono text-lg ${c.text}`}>
                    {s?.score}
                  </span>
                </div>
                <div className="h-1 bg-zinc-900 rounded-full mb-3 overflow-hidden">
                  <div
                    className={`h-full ${c.bar} transition-all`}
                    style={{ width: `${s?.score ?? 0}%` }}
                  />
                </div>
                <p className="text-sm text-zinc-500">{s?.notes}</p>
              </div>
            );
          })}
        </section>

        <section className="mb-14">
          <div className="text-xs text-zinc-500 uppercase tracking-widest mb-6">
            Top 3 issues
          </div>
          <div className="space-y-6">
            {data.top_issues?.map((item: any, i: number) => (
              <div
                key={i}
                className="border border-zinc-900 rounded-2xl p-5 grid md:grid-cols-[224px_1fr] gap-6 items-center"
              >
                {imageUrl && item.region && (
                  <Crop imageUrl={imageUrl} region={item.region} />
                )}
                <div>
                  <div className="text-xs text-zinc-500 uppercase mb-2">
                    Issue {i + 1}
                  </div>
                  <p className="text-lg leading-snug">{item.issue}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {data.competitor_reference?.brand && (
          <section className="mb-14">
            <div className="text-xs text-zinc-500 uppercase tracking-widest mb-4">
              Competitor reference
            </div>
            <div className="border border-zinc-900 rounded-2xl p-6">
              <div className="flex items-center gap-4 mb-6">
                <CompetitorLogo
                  domain={data.competitor_reference.domain}
                  brand={data.competitor_reference.brand}
                />
                <div>
                  <div className="text-xl font-semibold">
                    {data.competitor_reference.brand}
                  </div>
                  {data.competitor_reference.domain && (
                    <div className="text-xs text-zinc-500">
                      {data.competitor_reference.domain}
                    </div>
                  )}
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="text-xs text-zinc-500 uppercase mb-2">
                    What they do differently
                  </div>
                  <p className="text-zinc-300 text-sm leading-relaxed">
                    {data.competitor_reference.what_they_do_differently}
                  </p>
                </div>
                <div>
                  <div className="text-xs text-zinc-500 uppercase mb-2">
                    What to copy
                  </div>
                  <p className="text-zinc-300 text-sm leading-relaxed">
                    {data.competitor_reference.what_to_copy}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="mb-14">
          <button
            onClick={() => setTestsOpen(!testsOpen)}
            className="w-full flex justify-between items-center border border-zinc-900 rounded-2xl p-5 hover:border-zinc-700 transition"
          >
            <span className="text-xs text-zinc-500 uppercase tracking-widest">
              Tests to run
            </span>
            <span className="text-zinc-500 text-xl leading-none">
              {testsOpen ? "−" : "+"}
            </span>
          </button>
          {testsOpen && (
            <ul className="space-y-4 mt-6 px-2">
              {data.recommended_tests?.map((t: string, i: number) => (
                <li
                  key={i}
                  className="border-l-2 border-emerald-500 pl-4 text-lg"
                >
                  {t}
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="flex justify-center pt-6 border-t border-zinc-900">
          <button
            onClick={redesign}
            className="bg-white text-black px-8 py-3 rounded-full font-medium hover:bg-zinc-200 transition"
          >
            Redesign packaging
          </button>
        </div>
      </div>
    </main>
  );
}