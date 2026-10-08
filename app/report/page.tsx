"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { COMPETITOR_SCORES, COMPETITOR_DOMAINS, avgScore, CATEGORY_COMPETITORS } from "@/lib/competitor-scores";

const STEPS = [
  "Reading can dimensions",
  "Detecting brand mark",
  "Reading flavor band",
  "Scoring shelf visibility",
  "Scoring digital readability",
  "Comparing to competitors",
  "Ranking all cans",
  "Drafting tests",
];

function ShareMenu({ reportId }: { reportId?: string | null }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = reportId || sessionStorage.getItem("shelfmind_last_id");
    if (id) setShareUrl(`${window.location.origin}/r/${id}`);
  }, [reportId]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function copyLink() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Copy this link:", shareUrl);
    }
  }

  function printPdf() {
    setOpen(false);
    setTimeout(() => window.print(), 100);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="bg-white text-black px-8 py-3 rounded-full font-medium hover:bg-zinc-200 transition min-w-[220px]"
      >
        Share report
      </button>

      {open && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 border border-zinc-800 rounded-2xl bg-zinc-950 p-2 shadow-2xl">
          <button
            onClick={printPdf}
            className="w-full text-left px-4 py-3 rounded-xl hover:bg-zinc-900 transition flex items-center gap-3"
          >
            <span className="text-lg">📄</span>
            <div>
              <div className="text-sm font-medium">Export as PDF</div>
              <div className="text-xs text-zinc-500">
                Download or print the report
              </div>
            </div>
          </button>
          <button
            onClick={copyLink}
            disabled={!shareUrl}
            className="w-full text-left px-4 py-3 rounded-xl hover:bg-zinc-900 transition flex items-center gap-3 disabled:opacity-50"
          >
            <span className="text-lg">🔗</span>
            <div>
              <div className="text-sm font-medium">
                {copied ? "Link copied ✓" : "Copy link"}
              </div>
              <div className="text-xs text-zinc-500">
                {shareUrl ? "Anyone with the link can view" : "Link unavailable"}
              </div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="14 40" className="text-emerald-400" />
    </svg>
  );
}

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

export default function Report() {
  const [data, setData] = useState<any>(null);
  const [images, setImages] = useState<any>(null);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [testsWritten, setTestsWritten] = useState(0);
  const [status, setStatus] = useState<"idle" | "pending" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [testsOpen, setTestsOpen] = useState(false);
  const [swapOpenIdx, setSwapOpenIdx] = useState<number | null>(null);
  const startedRef = useRef(false);
  const router = useRouter();

  useEffect(() => {
    const raw = sessionStorage.getItem("shelfmind_report");
    const imgs = sessionStorage.getItem("shelfmind_images");
    const pending = sessionStorage.getItem("shelfmind_pending");
    if (raw) {
      setData(JSON.parse(raw));
      if (imgs) setImages(JSON.parse(imgs));
      setStatus("done");
      return;
    }
    if (pending) {
      const p = JSON.parse(pending);
      setPendingImage(p.image);
      setStatus("pending");
    }
  }, []);

  useEffect(() => {
    if (status !== "pending" || startedRef.current) return;
    startedRef.current = true;
    async function run() {
      const p = JSON.parse(sessionStorage.getItem("shelfmind_pending")!);
      try {
        const blob = await (await fetch(p.image)).blob();
        const form = new FormData();
        form.append("category", p.category);
        form.append("session_id", p.session_id || "anonymous");
        p.competitors.forEach((name: string) => form.append("competitor_names", name));
        form.append("your_can", blob, "your-can.jpg");
        const res = await fetch("/api/analyze", { method: "POST", body: form });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Analysis failed");
        sessionStorage.setItem("shelfmind_report", JSON.stringify(json));
        if (json.id) sessionStorage.setItem("shelfmind_last_id", json.id);
        sessionStorage.setItem("shelfmind_images", JSON.stringify({ your_can: p.image }));
        sessionStorage.removeItem("shelfmind_pending");
        setTimeout(() => {
          setData(json);
          setImages({ your_can: p.image });
          setStatus("done");
        }, 400);
      } catch (e: any) {
        setError(e.message);
        setStatus("error");
      }
    }
    run();
  }, [status]);

  useEffect(() => {
    if (status !== "pending") return;
    const id = setInterval(() => {
      setStepIndex((i) => (i < STEPS.length - 1 ? i + 1 : i));
    }, 900);
    return () => clearInterval(id);
  }, [status]);

  useEffect(() => {
    if (status !== "pending") return;
    if (stepIndex < STEPS.length - 1) return;
    if (testsWritten >= 3) return;
    const id = setTimeout(() => setTestsWritten((n) => n + 1), 400);
    return () => clearTimeout(id);
  }, [status, stepIndex, testsWritten]);

  function redesign() {
    sessionStorage.removeItem("shelfmind_report");
    sessionStorage.removeItem("shelfmind_images");
    sessionStorage.removeItem("shelfmind_pending");
    startedRef.current = false;
    setData(null);
    setImages(null);
    setStatus("idle");
    router.push("/upload");
  }

  async function swapCompetitor(idx: number, newName: string) {
    if (!data) return;

    const newScores = COMPETITOR_SCORES[newName];
    if (!newScores) return;

    const newLeaderboard = [...(data.leaderboard || [])].map((c: any, i: number) => {
      if (i !== idx) return c;
      return {
        name: newName,
        is_user: false,
        rank: 0,
        score: avgScore(newScores),
        scores: Object.fromEntries(
          Object.entries(newScores).map(([k, v]) => [k, { score: v, notes: "" }])
        ),
      };
    });

    const sorted = [...newLeaderboard].sort((a: any, b: any) => b.score - a.score);
    const reranked = sorted.map((c: any, i: number) => ({ ...c, rank: i + 1 }));

    const userRow = reranked.find((c: any) => c.is_user);
    const leaderRow = reranked[0];
    const topName = leaderRow.name;
    const topDomain = COMPETITOR_DOMAINS[topName] || "";

    const nextData = {
      ...data,
      leaderboard: reranked,
      user_rank: userRow?.rank ?? 0,
      user_score: userRow?.score ?? 0,
      leader_name: leaderRow.name,
      leader_score: leaderRow.score,
      competitor_reference: {
        ...(data.competitor_reference || {}),
        brand: topName,
        domain: topDomain,
      },
    };

    setData(nextData);
    sessionStorage.setItem("shelfmind_report", JSON.stringify(nextData));
    setSwapOpenIdx(null);

    const id = data.id || sessionStorage.getItem("shelfmind_last_id");
    if (id) {
      fetch(`/api/report/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ report: nextData }),
      }).catch(() => {});
    }
  }

  // ---- LOADING ----
  if (status === "pending") {
    return (
      <main className="min-h-screen bg-black text-white p-6 md:p-16">
        <style>{`
          @keyframes scan {
            0% { transform: translateY(0); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateY(100%); opacity: 0; }
          }
          .scanline { animation: scan 1.4s ease-in-out infinite; }
        `}</style>
        <div className="max-w-5xl mx-auto">
          <div className="text-xs text-zinc-500 uppercase tracking-widest mb-3">Analyzing</div>
          <div className="grid md:grid-cols-[280px_1fr] gap-10 items-start mb-12">
            <div className="relative rounded-2xl overflow-hidden border border-zinc-900 bg-zinc-950">
              {pendingImage && <img src={pendingImage} alt="your can" className="w-full" />}
              <div className="absolute inset-0 pointer-events-none">
                <div className="scanline absolute left-0 right-0 h-[2px] bg-emerald-400 shadow-[0_0_24px_4px_rgba(52,211,153,0.55)]" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-8">Looking at your can.</h1>
              <ul className="space-y-3">
                {STEPS.map((step, i) => {
                  const done = i < stepIndex;
                  const active = i === stepIndex;
                  const isDrafting = i === STEPS.length - 1;
                  return (
                    <li key={step} className={`flex items-center gap-3 text-sm transition-opacity ${done || active ? "opacity-100" : "opacity-25"}`}>
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 ${done ? "bg-emerald-500 text-black" : active ? "border border-emerald-500 text-emerald-400" : "border border-zinc-800"}`}>
                        {done ? "✓" : ""}
                      </span>
                      <span className={done ? "text-zinc-500" : active ? "text-white" : "text-zinc-600"}>
                        {step}
                        {active && !isDrafting && <span className="ml-1 text-emerald-400 animate-pulse">…</span>}
                        {active && isDrafting && (
                          <span className="ml-2 inline-flex items-center gap-2 font-mono text-emerald-400">
                            <Spinner />
                            {testsWritten}/3
                          </span>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <p className="text-red-400 mb-6">{error}</p>
          <button onClick={redesign} className="bg-white text-black px-6 py-3 rounded-full font-medium">Try again</button>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-zinc-500 mb-6">No report yet.</p>
          <a href="/upload" className="inline-block bg-white text-black px-6 py-3 rounded-full font-medium">Upload a can</a>
        </div>
      </main>
    );
  }

  // ---- REPORT ----
  const sorted = [...(data.leaderboard || [])].sort((a: any, b: any) => a.rank - b.rank);
  const userCan = sorted.find((c: any) => c.is_user);
  const leader = sorted[0];
  const userImage = images?.your_can ?? null;

  const allInCategory = CATEGORY_COMPETITORS[data.category] || [];
  const currentNames = new Set(sorted.map((c: any) => c.name));
  const alternatives = allInCategory.filter((n) => !currentNames.has(n));

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
        <div className="flex justify-between items-center mb-10 no-print">
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

        <div className="text-xs text-zinc-500 uppercase tracking-widest mb-4">
          {String(data.category || "").replace("_", " ")}
        </div>

        <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight mb-4">
          {data.first_impression?.headline}
        </h1>

        {userCan && (
          <section className="mb-16 border border-zinc-900 rounded-3xl p-8 md:p-10 bg-zinc-950 print-page-break">
            <div className="grid md:grid-cols-[1fr_auto] gap-8 items-center">
              <div>
                <div className="text-xs text-zinc-500 uppercase tracking-widest mb-3">Your rank</div>
                <div className="flex items-baseline gap-4 mb-3">
                  <div className="text-6xl md:text-7xl font-bold tracking-tight">#{userCan.rank}</div>
                  <div className="text-zinc-500 text-lg">of {sorted.length}</div>
                </div>
                <p className="text-zinc-400 max-w-lg">
                  {leader && userCan.rank !== 1 && (
                    <>
                      <span className="text-white font-medium">{leader.name}</span> leads at {leader.score}. You&apos;re at {userCan.score}.
                    </>
                  )}
                  {leader && userCan.rank === 1 && <>You lead the category. Defend it.</>}
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
          <div className="flex justify-between items-baseline mb-6">
            <div className="text-xs text-zinc-500 uppercase tracking-widest">Leaderboard</div>
            {alternatives.length > 0 && (
              <div className="text-[10px] uppercase tracking-widest text-zinc-600 no-print">
                click ↺ to swap a competitor
              </div>
            )}
          </div>
          <div className="space-y-3">
            {sorted.map((c: any, idx: number) => {
              const c_colors = scoreColor(c.score);
              const canSwap = !c.is_user && alternatives.length > 0;
              const isOpen = swapOpenIdx === idx;
              return (
                <div key={c.name} className="relative print-page-break">
                  <div
                    className={`flex items-center gap-4 p-4 rounded-2xl border transition ${
                      c.is_user ? "border-emerald-800 bg-emerald-950/20" : "border-zinc-900"
                    }`}
                  >
                    <div className="w-8 text-2xl font-mono text-zinc-500 shrink-0">{c.rank}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`font-medium truncate ${c.is_user ? "text-white" : "text-zinc-300"}`}>
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
                          className={`h-full ${c.is_user ? "bg-emerald-500" : c_colors.bar}`}
                          style={{ width: `${c.score}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-12 text-right font-mono text-lg shrink-0">{c.score}</div>
                    {canSwap && (
                      <button
                        onClick={() => setSwapOpenIdx(isOpen ? null : idx)}
                        className="no-print w-8 h-8 rounded-full border border-zinc-800 hover:border-zinc-600 flex items-center justify-center text-zinc-500 hover:text-white transition text-sm shrink-0"
                        title="Swap for another competitor"
                      >
                        ↺
                      </button>
                    )}
                  </div>

                  {isOpen && canSwap && (
                    <div className="no-print mt-2 border border-zinc-800 rounded-2xl p-3 bg-zinc-950">
                      <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 px-2">
                        Swap {c.name} for
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {alternatives.map((alt) => (
                          <button
                            key={alt}
                            onClick={() => swapCompetitor(idx, alt)}
                            className="text-left px-3 py-2 rounded-xl border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900 transition text-sm"
                          >
                            {alt}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {data.gaps_vs_leader?.length > 0 && (
          <section className="mb-16 print-page-break">
            <div className="text-xs text-zinc-500 uppercase tracking-widest mb-6">Why you&apos;re behind</div>
            <ul className="space-y-4">
              {data.gaps_vs_leader.map((g: string, i: number) => (
                <li key={i} className="border-l-2 border-red-500 pl-4 text-lg leading-snug">{g}</li>
              ))}
            </ul>
          </section>
        )}

        {userCan && leader && (
          <section className="mb-16 print-page-break">
            <div className="text-xs text-zinc-500 uppercase tracking-widest mb-6">You vs {leader.name}</div>
            <div className="border border-zinc-900 rounded-2xl overflow-hidden">
              <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-5 py-3 border-b border-zinc-900 text-xs uppercase tracking-widest text-zinc-500">
                <div>Dimension</div>
                <div className="w-16 text-right">You</div>
                <div className="w-16 text-right">{leader.name.slice(0, 10)}</div>
              </div>
              {scoreKeys.map(([label, key]) => {
                const yours = userCan.scores?.[key]?.score ?? 0;
                const theirs = leader.scores?.[key]?.score ?? 0;
                const youWin = yours >= theirs;
                return (
                  <div key={key} className="grid grid-cols-[1fr_auto_auto] gap-4 px-5 py-4 border-b border-zinc-900 last:border-0 items-center">
                    <div className="text-sm text-zinc-400">{label}</div>
                    <div className={`w-16 text-right font-mono ${youWin ? "text-emerald-400" : "text-zinc-300"}`}>{yours}</div>
                    <div className={`w-16 text-right font-mono ${!youWin ? "text-emerald-400" : "text-zinc-300"}`}>{theirs}</div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {userImage && data.top_issues?.length > 0 && (
          <section className="mb-16">
            <div className="text-xs text-zinc-500 uppercase tracking-widest mb-6">What&apos;s failing on your can</div>
            <div className="space-y-6">
              {data.top_issues.map((item: any, i: number) => {
                const r = item.region || [0, 0, 100, 100];
                const isFull = isFullRegion(r);
                return (
                  <div key={i} className={`border border-zinc-900 rounded-2xl p-5 gap-6 items-center print-page-break ${isFull ? "" : "grid md:grid-cols-[200px_1fr]"}`}>
                    {!isFull && <Crop imageUrl={userImage} region={r} />}
                    <div>
                      <div className="text-xs text-zinc-500 uppercase mb-2">Issue {i + 1}</div>
                      <p className="text-lg leading-snug">{item.issue}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section className="mb-16 print-page-break">
          <button
            onClick={() => setTestsOpen(!testsOpen)}
            className="no-print w-full flex justify-between items-center border border-zinc-900 rounded-2xl p-5 hover:border-zinc-700 transition"
          >
            <span className="text-xs text-zinc-500 uppercase tracking-widest">Tests to run before you print</span>
            <span className="text-zinc-500 text-xl leading-none">{testsOpen ? "−" : "+"}</span>
          </button>
          <div className="hidden print:block text-xs text-zinc-500 uppercase tracking-widest mb-4">
            Tests to run before you print
          </div>
          <ul className={`space-y-4 ${testsOpen ? "mt-6" : ""} px-2 print:mt-6 print:block`}>
            {data.recommended_tests?.map((t: string, i: number) => (
              <li
                key={i}
                className={`border-l-2 border-emerald-500 pl-4 text-lg ${testsOpen ? "block" : "hidden print:block"}`}
              >
                {t}
              </li>
            ))}
          </ul>
        </section>

        <div className="flex justify-center pt-6 border-t border-zinc-900 no-print">
          <ShareMenu reportId={data.id} />
        </div>
      </div>
    </main>
  );
}