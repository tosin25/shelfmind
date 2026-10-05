"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

async function compressImage(file: File, maxDim = 1024): Promise<string> {
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
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = reject;
    img.src = url;
  });
}

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [category, setCategory] = useState("functional_soda");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function onPick(f: File | null) {
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  async function submit() {
    if (!file) return;
    setLoading(true);
    setError(null);

    try {
      const dataUrl = await compressImage(file);
      sessionStorage.setItem("shelfmind_image", dataUrl);

      const blob = await (await fetch(dataUrl)).blob();
      const form = new FormData();
      form.append("image", blob, "packaging.jpg");
      form.append("category", category);

      const res = await fetch("/api/analyze", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      sessionStorage.setItem("shelfmind_report", JSON.stringify(data));
      router.push("/report");
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-lg flex flex-col gap-6">
        <a href="/" className="text-zinc-500 text-sm hover:text-white">
          ← ShelfMind
        </a>

        <h1 className="text-4xl font-bold tracking-tight">Drop your packaging.</h1>
        <p className="text-zinc-400">
          Upload a can, bottle, or label. ShelfMind tells you what it
          communicates — and what to test.
        </p>

        <label className="border border-dashed border-zinc-800 rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer hover:border-zinc-600 transition">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onPick(e.target.files?.[0] ?? null)}
          />
          {preview ? (
            <img src={preview} alt="preview" className="max-h-64 rounded-lg" />
          ) : (
            <>
              <span className="text-zinc-400">Click to choose an image</span>
              <span className="text-zinc-600 text-xs">JPG or PNG</span>
            </>
          )}
        </label>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-zinc-900 border border-zinc-800 rounded-lg p-3"
        >
          <option value="functional_soda">Functional Soda</option>
          <option value="sparkling_water">Sparkling Water</option>
          <option value="energy">Energy</option>
          <option value="coffee">Coffee</option>
          <option value="juice">Juice</option>
        </select>

        <button
          onClick={submit}
          disabled={!file || loading}
          className="bg-white text-black py-3 rounded-full font-medium disabled:opacity-40 hover:bg-zinc-200 transition"
        >
          {loading ? "Analyzing…" : "Analyze"}
        </button>

        {error && <p className="text-red-400 text-sm">{error}</p>}
      </div>
    </main>
  );
}