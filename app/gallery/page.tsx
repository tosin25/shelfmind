"use client";
import { useEffect, useState } from "react";

type Row = {
  id: string;
  category: string;
  image: string | null;
  headline: string;
  rank: number | null;
  total: number;
  score: number | null;
  leader: string | null;
  created_at: string;
};

function rankBadge(rank: number | null, total: number) {
  if (!rank) return "";
  if (rank === 1) return "text-emerald-400 border-emerald-800";
  if (rank <= 3) return "text-white border-zinc-700";
  return "text-zinc-500 border-zinc-900";
}

export default function Gallery() {
  const [reports, setReports] = useState<Row[]>([]);
  const [status, setStatus] = useState<"loading" | "done">("loading");

  useEffect(() => {
    fetch("/api/gallery")
      .then((r) => r.json())
      .then((d) => {
        setReports(d.reports || []);
        setStatus("done");
      })
      .catch(() => setStatus("done"));
  }, []);

  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-16">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-16">
          <a href="/" className="text-sm font-semibold tracking-tight">
            ShelfMind
          </a>
          <div className="flex items-center gap-4">
            <a
              href="/history"
              className="text-sm text-zinc-500 hover:text-white transition"
            >
              My reports
            </a>
            <a
              href="/upload"
              className="text-sm bg-white text-black rounded-full px-4 py-1.5 font-medium hover:bg-zinc-200 transition"
            >
              Rank mine
            </a>
          </div>
        </div>

        <div className="max-w-3xl mb-16">
          <div className="text-xs text-zinc-500 uppercase tracking-widest mb-4">
            Gallery
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[0.95] mb-6">
            Every can, ranked.
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed">
            Real beverage packaging, scored against real competitors. See where
            yours would land.
          </p>
        </div>

        {status === "loading" && (
          <div className="text-zinc-500 text-sm">Loading…</div>
        )}

        {status === "done" && reports.length === 0 && (
          <div className="border border-zinc-900 rounded-2xl p-12 text-center">
            <p className="text-zinc-500 mb-4">No public reports yet.</p>
            <a
              href="/upload"
              className="inline-block bg-white text-black px-6 py-3 rounded-full font-medium hover:bg-zinc-200 transition"
            >
              Be the first
            </a>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {reports.map((r) => (
            <a
              key={r.id}
              href={`/r/${r.id}`}
              className="group border border-zinc-900 rounded-2xl overflow-hidden hover:border-zinc-700 transition"
            >
              <div className="aspect-[3/4] bg-zinc-950 overflow-hidden relative">
                {r.image && (
                  <img
                    src={r.image}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                  />
                )}
                {r.rank && (
                  <div
                    className={`absolute top-3 right-3 border rounded-full px-3 py-1 text-xs font-mono backdrop-blur bg-black/60 ${rankBadge(
                      r.rank,
                      r.total
                    )}`}
                  >
                    #{r.rank} / {r.total}
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="text-xs text-zinc-500 uppercase tracking-widest mb-2">
                  {String(r.category || "").replace("_", " ")}
                </div>
                <p className="text-sm leading-snug text-zinc-300 line-clamp-2 mb-3">
                  {r.headline}
                </p>
                {r.score !== null && (
                  <div className="flex justify-between text-xs text-zinc-500">
                    <span>Score {r.score}</span>
                    {r.leader && <span>Top: {r.leader}</span>}
                  </div>
                )}
              </div>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}