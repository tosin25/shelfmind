"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

async function compressImage(file: File, maxDim = 384): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.65));
    };
    img.onerror = reject;
    img.src = url;
  });
}

const CATEGORIES: Record<string, { label: string; competitors: string[] }> = {
  functional_soda: {
    label: "Functional Soda",
    competitors: ["Olipop", "Poppi", "Culture Pop", "Zevia", "Spindrift", "Sanzo"],
  },
  energy: {
    label: "Energy",
    competitors: ["Red Bull", "Monster", "Celsius", "Alani Nu", "Ghost", "C4"],
  },
  sparkling_water: {
    label: "Sparkling Water",
    competitors: ["LaCroix", "Spindrift", "Waterloo", "Bubly", "Aura Bora", "Sanzo"],
  },
  coffee: {
    label: "Coffee",
    competitors: ["Stumptown", "La Colombe", "Chamberlain", "Cometeer", "Wandering Bear", "Grady's"],
  },
  juice: {
    label: "Juice",
    competitors: ["Tropicana", "Simply", "Natalie's", "Evolution", "Suja", "Uncle Matt's"],
  },
};

export default function Upload() {
  const [yourCan, setYourCan] = useState<string | null>(null);
  const [category, setCategory] = useState("functional_soda");
  const [picked, setPicked] = useState<string[]>([]);
  const router = useRouter();

  async function pickYourCan(f: File | null) {
    if (!f) return;
    const dataUrl = await compressImage(f);
    setYourCan(dataUrl);
  }

  function toggleCompetitor(name: string) {
    setPicked((prev) => {
      if (prev.includes(name)) return prev.filter((n) => n !== name);
      if (prev.length >= 5) return prev;
      return [...prev, name];
    });
  }

  function changeCategory(next: string) {
    setCategory(next);
    setPicked([]);
  }

  const canSubmit = Boolean(yourCan) && picked.length >= 2;
  const hint = !yourCan
    ? "Upload your can first."
    : picked.length === 0
    ? "Pick 2–5 competitors."
    : picked.length === 1
    ? "Pick at least 1 more competitor."
    : null;

  function submit() {
    if (!canSubmit || !yourCan) return;
    // Generate a session ID once per browser
    let sessionId = localStorage.getItem("shelfmind_sid");
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem("shelfmind_sid", sessionId);
    }
    sessionStorage.removeItem("shelfmind_report");
    sessionStorage.setItem(
      "shelfmind_pending",
      JSON.stringify({
        image: yourCan,
        category,
        competitors: picked,
        session_id: sessionId,
      })
    );
    router.push("/report");
  }

  const competitors = CATEGORIES[category].competitors;

  return (
    <main className="min-h-screen bg-black text-white p-8 md:p-16">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center">
          <a href="/" className="text-zinc-500 text-sm hover:text-white">
            ← ShelfMind
          </a>
          <a href="/gallery" className="text-zinc-500 text-sm hover:text-white">
            Gallery →
          </a>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mt-10 mb-3">
          Rank your can.
        </h1>
        <p className="text-zinc-400 mb-10">
          Upload your packaging. Pick your competitors. See where you stand.
        </p>

        <div className="mb-10">
          <label className="block text-xs text-zinc-500 uppercase tracking-widest mb-3">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => changeCategory(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3"
          >
            {Object.entries(CATEGORIES).map(([key, c]) => (
              <option key={key} value={key}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-12">
          <div className="text-xs text-zinc-500 uppercase tracking-widest mb-3">
            Your can
          </div>
          <label className="border border-dashed border-zinc-800 rounded-xl p-6 flex flex-col items-center gap-3 cursor-pointer hover:border-zinc-600 transition">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => pickYourCan(e.target.files?.[0] ?? null)}
            />
            {yourCan ? (
              <img src={yourCan} alt="" className="max-h-64 rounded-lg" />
            ) : (
              <>
                <span className="text-zinc-400">Click to upload your can</span>
                <span className="text-zinc-600 text-xs">JPG or PNG</span>
              </>
            )}
          </label>
        </div>

        <div className="mb-10">
          <div className="flex justify-between items-baseline mb-3">
            <div className="text-xs text-zinc-500 uppercase tracking-widest">
              Competitors
            </div>
            <div className="text-xs text-zinc-500">{picked.length}/5 picked</div>
          </div>
          <p className="text-sm text-zinc-500 mb-4">
            Pick 2–5 brands to rank against.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {competitors.map((name) => {
              const isPicked = picked.includes(name);
              const disabled = !isPicked && picked.length >= 5;
              return (
                <button
                  key={name}
                  onClick={() => toggleCompetitor(name)}
                  disabled={disabled}
                  className={`text-left px-4 py-3 rounded-xl border transition ${
                    isPicked
                      ? "border-emerald-500 bg-emerald-950/30 text-white"
                      : disabled
                      ? "border-zinc-900 text-zinc-700 cursor-not-allowed"
                      : "border-zinc-800 text-zinc-300 hover:border-zinc-600"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] ${
                        isPicked
                          ? "bg-emerald-500 border-emerald-500 text-black"
                          : "border-zinc-700"
                      }`}
                    >
                      {isPicked && "✓"}
                    </span>
                    {name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={submit}
          disabled={!canSubmit}
          className="w-full bg-white text-black py-4 rounded-full font-medium disabled:opacity-40 hover:bg-zinc-200 transition"
        >
          Rank my can
        </button>

        {hint && (
          <p className="text-zinc-500 text-sm mt-3 text-center">{hint}</p>
        )}
      </div>
    </main>
  );
}