"use client";
import { useEffect, useState } from "react";

type ReportRow = {
  id: string;
  category: string;
  image_url: string | null;
  created_at: string;
};

export default function History() {
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [status, setStatus] = useState<"loading" | "done">("loading");

  useEffect(() => {
    const sid = localStorage.getItem("shelfmind_sid");
    if (!sid) {
      setStatus("done");
      return;
    }
    fetch(`/api/history?session_id=${sid}`)
      .then((r) => r.json())
      .then((d) => {
        setReports(d.reports || []);
        setStatus("done");
      })
      .catch(() => setStatus("done"));
  }, []);

  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-16">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <a href="/" className="text-sm font-semibold tracking-tight">
            ShelfMind
          </a>
          <div className="flex items-center gap-4">
            <a
              href="/gallery"
              className="text-sm text-zinc-500 hover:text-white transition"
            >
              Gallery
            </a>
            <a
              href="/upload"
              className="text-sm bg-white text-black rounded-full px-4 py-1.5 font-medium hover:bg-zinc-200 transition"
            >
              New analysis
            </a>
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
          Your reports.
        </h1>
        <p className="text-zinc-400 mb-12">
          Every can you&apos;ve ranked, in order.
        </p>

        {status === "loading" && (
          <div className="text-zinc-500 text-sm">Loading…</div>
        )}

        {status === "done" && reports.length === 0 && (
          <div className="border border-zinc-900 rounded-2xl p-8 text-center">
            <p className="text-zinc-500 mb-4">No reports yet.</p>
            <a
              href="/upload"
              className="inline-block bg-white text-black px-6 py-3 rounded-full font-medium hover:bg-zinc-200 transition"
            >
              Rank your first can
            </a>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map((r) => (
            <a
              key={r.id}
              href={`/r/${r.id}`}
              className="group border border-zinc-900 rounded-2xl overflow-hidden hover:border-zinc-700 transition"
            >
              <div className="aspect-[3/2] bg-zinc-950 overflow-hidden">
                {r.image_url && (
                  <img
                    src={r.image_url}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                )}
              </div>
              <div className="p-5 flex justify-between items-baseline">
                <div>
                  <div className="text-xs text-zinc-500 uppercase tracking-widest mb-1">
                    {String(r.category || "").replace("_", " ")}
                  </div>
                  <div className="text-sm text-zinc-400">
                    {new Date(r.created_at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                </div>
                <span className="text-zinc-600 group-hover:text-white transition">
                  →
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}