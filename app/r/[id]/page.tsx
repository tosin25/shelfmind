"use client";
import { useEffect, useState, use } from "react";

function scoreColor(score: number) {
  if (score < 40) return { bar: "bg-red-500", text: "text-red-400" };
  if (score < 70) return { bar: "bg-amber-500", text: "text-amber-400" };
  return { bar: "bg-emerald-500", text: "text-emerald-400" };
}

function Crop({
  imageUrl,
  region,
  size = 200,
}: {
  imageUrl: string;
  region: number[];
  size?: number;
}) {
  const [x, y, w, h] = region;
  const m = Math.max(Math.min(w, h), 5);
  const scalePct = 10000 / m;
  const bgX = m >= 100 ? 0 : (x * 100) / (100 - m);
  const bgY = m >= 100 ? 0 : (y * 100) / (100 - m);
  return (
    <div
      className="rounded-xl overflow-hidden border border-zinc-900 shrink-0 bg-zinc-950"
      style={{
        width: size,
        height: size,
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: `${scalePct}% ${scalePct}%`,
        backgroundPosition: `${bgX}% ${bgY}%`,
        backgroundRepeat: "no-repeat",
      }}
    />
  );
}

function isFullRegion(r: number[]) {
  if (!Array.isArray(r) || r.length !== 4) return true;
  return r[0] <= 5 && r[1] <= 5 && r[2] >= 90 && r[3] >= 90;
}

export default function SharedReport({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [data, setData] = useState<any>(null);
  const [userImage, setUserImage] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "done" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const [testsOpen, setTestsOpen] = useState(false);

  useEffect(() => {
    fetch(`/api/report/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setData(d.report);
        setUserImage(d.image);
        setStatus("done");
      })
      .catch((e) => {
        setError(e.message);
        setStatus("error");
      });
  }, [id]);

  if (status === "loading") {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xs text-zinc-600 uppercase tracking-widest">
          Loading report…
        </div>
      </main>
    );
  }

  if (status === "error" || !data) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <p className="text-red-400 mb-6">{error || "Not found"}</p>
          <a
            href="/upload"
            className="inline-block bg-white text-black px-6 py-3 rounded-full font-medium"
          >
            Analyze a can
          </a>
        </div>
      </main>
    );
  }

  const sorted = [...(data.leaderboard || [])].sort(
    (a: any, b: any) => a.rank - b.rank
  );
  const userCan = sorted.find((c: any) => c.is_user);
  const leader = sorted[0];

  const scoreKeys = [
    ["Brand", "brand_recognition"],
    ["Category", "category_clarity"],
    ["Flavor", "flavor_clarity"],
    ["Benefit", "benefit_clarity"],
    ["Shelf", "shelf_visibility"],
    ["Digital", "digital_shelf_readability"],
    ["Differentiation", "differentiation"],
    ["SKU risk", "sku_confusion_risk"],
  ];

  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-16">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <a href="/" className="text-zinc-500 text-sm hover:text-white">
            ShelfMind
          </a>
          <a
            href="/upload"
            className="text-sm bg-white text-black rounded-full px-4 py-1.5 font-medium hover:bg-zinc-200 transition"
          >
            Analyze yours
          </a>
        </div>

        <div className="text-xs text-zinc-500 uppercase tracking-widest mb-4">
          {String(data.category || "").replace("_", " ")}
        </div>

        <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight mb-4">
          {data.first_impression?.headline}
        </h1>

        {userCan && (
          <section className="mb-16 border border-zinc-900 rounded-3xl p-8 md:p-10 bg-zinc-950">
            <div className="grid md:grid-cols-[1fr_auto] gap-8 items-center">
              <div>
                <div className="text-xs text-zinc-500 uppercase tracking-widest mb-3">
                  Your rank
                </div>
                <div className="flex items-baseline gap-4 mb-3">
                  <div className="text-6xl md:text-7xl font-bold tracking-tight">
                    #{userCan.rank}
                  </div>
                  <div className="text-zinc-500 text-lg">
                    of {sorted.length}
                  </div>
                </div>
                <p className="text-zinc-400 max-w-lg">
                  {leader && userCan.rank !== 1 && (
                    <>
                      <span className="text-white font-medium">
                        {leader.name}
                      </span>{" "}
                      leads at {leader.score}. You&apos;re at {userCan.score}.
                    </>
                  )}
                  {leader && userCan.rank === 1 && (
                    <>You lead the category. Defend it.</>
                  )}
                </p>
              </div>
              {userImage && (
                <div className="rounded-2xl overflow-hidden border border-zinc-900 w-full md:w-48">
                  <img src={userImage} alt="your can" className="w-full" />
                </div>
              )}
            </div>
          </section>
        )}

        <section className="mb-16">
          <div className="text-xs text-zinc-500 uppercase tracking-widest mb-6">
            Leaderboard
          </div>
          <div className="space-y-3">
            {sorted.map((c: any) => {
              const c_colors = scoreColor(c.score);
              return (
                <div
                  key={c.name}
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition ${
                    c.is_user
                      ? "border-emerald-800 bg-emerald-950/20"
                      : "border-zinc-900"
                  }`}
                >
                  <div className="w-8 text-2xl font-mono text-zinc-500 shrink-0">
                    {c.rank}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`font-medium truncate ${
                          c.is_user ? "text-white" : "text-zinc-300"
                        }`}
                      >
                        {c.name}
                      </span>
                      {c.is_user && (
                        <span className="text-[10px] uppercase tracking-widest text-emerald-400 border border-emerald-800 rounded-full px-2 py-0.5">
                          You
                        </span>
                      )}
                    </div>
                    <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          c.is_user ? "bg-emerald-500" : c_colors.bar
                        }`}
                        style={{ width: `${c.score}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-12 text-right font-mono text-lg shrink-0">
                    {c.score}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {data.gaps_vs_leader?.length > 0 && (
          <section className="mb-16">
            <div className="text-xs text-zinc-500 uppercase tracking-widest mb-6">
              Why you&apos;re behind
            </div>
            <ul className="space-y-4">
              {data.gaps_vs_leader.map((g: string, i: number) => (
                <li
                  key={i}
                  className="border-l-2 border-red-500 pl-4 text-lg leading-snug"
                >
                  {g}
                </li>
              ))}
            </ul>
          </section>
        )}

        {userCan && leader && (
          <section className="mb-16">
            <div className="text-xs text-zinc-500 uppercase tracking-widest mb-6">
              You vs {leader.name}
            </div>
            <div className="border border-zinc-900 rounded-2xl overflow-hidden">
              <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-5 py-3 border-b border-zinc-900 text-xs uppercase tracking-widest text-zinc-500">
                <div>Dimension</div>
                <div className="w-16 text-right">You</div>
                <div className="w-16 text-right">
                  {leader.name.slice(0, 10)}
                </div>
              </div>
              {scoreKeys.map(([label, key]) => {
                const yours = userCan.scores?.[key]?.score ?? 0;
                const theirs = leader.scores?.[key]?.score ?? 0;
                const youWin = yours >= theirs;
                return (
                  <div
                    key={key}
                    className="grid grid-cols-[1fr_auto_auto] gap-4 px-5 py-4 border-b border-zinc-900 last:border-0 items-center"
                  >
                    <div className="text-sm text-zinc-400">{label}</div>
                    <div
                      className={`w-16 text-right font-mono ${
                        youWin ? "text-emerald-400" : "text-zinc-300"
                      }`}
                    >
                      {yours}
                    </div>
                    <div
                      className={`w-16 text-right font-mono ${
                        !youWin ? "text-emerald-400" : "text-zinc-300"
                      }`}
                    >
                      {theirs}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {userImage && data.top_issues?.length > 0 && (
          <section className="mb-16">
            <div className="text-xs text-zinc-500 uppercase tracking-widest mb-6">
              What&apos;s failing on your can
            </div>
            <div className="space-y-6">
              {data.top_issues.map((item: any, i: number) => {
                const r = item.region || [0, 0, 100, 100];
                const isFull = isFullRegion(r);
                return (
                  <div
                    key={i}
                    className={`border border-zinc-900 rounded-2xl p-5 gap-6 items-center ${
                      isFull ? "" : "grid md:grid-cols-[200px_1fr]"
                    }`}
                  >
                    {!isFull && <Crop imageUrl={userImage} region={r} />}
                    <div>
                      <div className="text-xs text-zinc-500 uppercase mb-2">
                        Issue {i + 1}
                      </div>
                      <p className="text-lg leading-snug">{item.issue}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section className="mb-16">
          <button
            onClick={() => setTestsOpen(!testsOpen)}
            className="w-full flex justify-between items-center border border-zinc-900 rounded-2xl p-5 hover:border-zinc-700 transition"
          >
            <span className="text-xs text-zinc-500 uppercase tracking-widest">
              Tests to run before you print
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
          <a
            href="/upload"
            className="bg-white text-black px-8 py-3 rounded-full font-medium hover:bg-zinc-200 transition"
          >
            Rank your own can
          </a>
        </div>
      </div>
    </main>
  );
}