"use client";
import { useEffect, useRef, useState } from "react";

const FRAME_COUNT = 160;

const FRAME_PATH = (i: number) =>
  `/peel/frame-${String(i + 1).padStart(3, "0")}.jpg`;

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const frameIdxRef = useRef(0);
  const rafRef = useRef(0);
  const targetIdxRef = useRef(0);

  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [progress, setProgress] = useState(0);

  // Preload all frames
  useEffect(() => {
    let cancelled = false;
    const loaded: HTMLImageElement[] = [];
    let count = 0;
    let errors = 0;

    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.src = FRAME_PATH(i);
      const check = () => {
        if (cancelled) return;
        if (count + errors === FRAME_COUNT) {
          if (errors > FRAME_COUNT / 2) {
            setFailed(true);
          } else {
            framesRef.current = loaded;
            setReady(true);
          }
        }
      };
      img.onload = () => {
        count++;
        check();
      };
      img.onerror = () => {
        errors++;
        check();
      };
      loaded[i] = img;
    }

    return () => {
      cancelled = true;
    };
  }, []);

  const draw = () => {
    const canvas = canvasRef.current;
    const idx = Math.round(frameIdxRef.current);
    const img = framesRef.current[idx];
    if (!canvas || !img || !img.complete) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    // Canvas matches the frame aspect by construction — fill it completely.
    ctx.drawImage(img, 0, 0, w, h);
  };

  useEffect(() => {
    if (!ready) return;
    const container = containerRef.current;
    if (!container) return;

    function onScroll() {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const p = Math.min(1, Math.max(0, -rect.top / (total || 1)));
      setProgress(p);
      targetIdxRef.current = Math.min(
        FRAME_COUNT - 1,
        Math.floor(p * FRAME_COUNT)
      );
    }

    function tick() {
      const current = frameIdxRef.current;
      const target = targetIdxRef.current;
      const delta = target - current;
      if (Math.abs(delta) > 0.3) {
        frameIdxRef.current = current + delta * 0.25;
        draw();
      } else if (current !== target) {
        frameIdxRef.current = target;
        draw();
      }
      rafRef.current = requestAnimationFrame(tick);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", draw);
    onScroll();
    draw();
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", draw);
      cancelAnimationFrame(rafRef.current);
    };
  }, [ready]);

  if (failed) {
    return (
      <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
        <div className="max-w-2xl text-center flex flex-col gap-6">
          <div className="text-xs text-zinc-500 uppercase tracking-widest">
            ShelfMind
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight">
            Know where your can stands. Before you print.
          </h1>
          <p className="text-zinc-400 text-lg">
            Upload your can. Add competitors. See your rank, your gaps, and
            what to change.
          </p>
          <div>
            <a
              href="/upload"
              className="inline-block bg-white text-black px-8 py-3 rounded-full font-medium hover:bg-zinc-200 transition"
            >
              Rank my can
            </a>
          </div>
        </div>
      </main>
    );
  }

  if (!ready) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xs text-zinc-600 uppercase tracking-widest">
          ShelfMind
        </div>
      </main>
    );
  }

  return (
    <main className="bg-black text-white">
      <div ref={containerRef} className="h-[300vh] relative">
        <div className="sticky top-0 h-screen overflow-hidden flex items-center justify-center">
          {/* Rounded frame around the can */}
          <div
            className="relative rounded-2xl overflow-hidden bg-black ring-1 ring-zinc-900 shadow-[0_0_60px_-15px_rgba(255,255,255,0.08)]"
            style={{
              aspectRatio: "400 / 711",
              height: "78vh",
              maxWidth: "90vw",
            }}
          >
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full"
            />
            {/* Subtle bottom shading inside the frame for depth */}
            <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
          </div>

          {/* Top wordmark */}
          <div
            className="absolute top-8 left-1/2 -translate-x-1/2 text-xs uppercase tracking-widest text-white/70 transition-opacity duration-500"
            style={{ opacity: 1 - progress * 0.6 }}
          >
            ShelfMind
          </div>

          {/* Headline — bottom of viewport, not inside the frame */}
          <div
            className="absolute bottom-20 left-8 right-8 md:left-16 md:right-16 max-w-2xl transition-opacity duration-300"
            style={{ opacity: Math.max(0, (progress - 0.3) * 2) }}
          >
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[0.95] mb-6">
              Know where your can stands.
              <br />
              Before you print.
            </h1>
            <a
              href="/upload"
              className="inline-block bg-white text-black px-8 py-4 rounded-full font-medium hover:bg-zinc-200 transition"
            >
              Rank my can
            </a>
          </div>

          {/* Scroll hint */}
          <div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-widest text-white/40"
            style={{ opacity: Math.max(0, 1 - progress * 3) }}
          >
            scroll
          </div>
        </div>
      </div>

      <section className="py-32 px-8 md:px-16 max-w-4xl mx-auto">
        <div className="text-xs text-zinc-500 uppercase tracking-widest mb-6">
          What you get
        </div>
        <div className="space-y-6 text-2xl md:text-3xl font-medium tracking-tight leading-tight">
          <p className="text-zinc-500">Your rank against 5 competitors.</p>
          <p className="text-zinc-500">Eight clarity scores side by side.</p>
          <p className="text-zinc-500">The crops causing the gap.</p>
          <p className="text-white">Three tests to run before you print.</p>
        </div>
      </section>

      <section className="py-32 px-8 md:px-16 text-center">
        <a
          href="/upload"
          className="inline-block bg-white text-black px-10 py-4 rounded-full font-medium hover:bg-zinc-200 transition"
        >
          Rank my can
        </a>
      </section>
    </main>
  );
}