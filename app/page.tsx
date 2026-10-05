export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* HERO */}
      <section className="min-h-screen flex flex-col justify-between p-8 md:p-16 max-w-6xl mx-auto">
        <header className="flex justify-between items-center">
          <div className="text-sm font-semibold tracking-tight">ShelfMind</div>
          <a
            href="/upload"
            className="text-sm text-zinc-500 hover:text-white transition"
          >
            Try it →
          </a>
        </header>

        <div className="max-w-3xl">
          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-6">
            Packaging intelligence for beverage founders
          </p>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[0.95] mb-8">
            See how your can ranks against your category.
          </h1>
          <p className="text-xl text-zinc-400 leading-relaxed mb-10 max-w-2xl">
            Upload your packaging. Add your top competitors. In 60 seconds
            you&apos;ll see where you rank, why you&apos;re there, and what to
            change to climb.
          </p>
          <a
            href="/upload"
            className="inline-block bg-white text-black px-8 py-4 rounded-full font-medium hover:bg-zinc-200 transition"
          >
            Rank my packaging
          </a>
        </div>

        <div className="text-xs text-zinc-600">
          Built for DTC beverage founders. Functional soda, energy, sparkling
          water, coffee, juice.
        </div>
      </section>

      {/* PROBLEM — founder voice */}
      <section className="py-32 px-8 md:px-16 max-w-4xl mx-auto">
        <div className="space-y-6 text-2xl md:text-4xl font-medium tracking-tight leading-tight">
          <p className="text-zinc-700">
            You just got the can back from the designer.
          </p>
          <p className="text-zinc-700">
            It looks good on your screen.
          </p>
          <p className="text-white">
            Now put it next to Olipop, Poppi, and Culture Pop on a shelf. Does
            it still hold up?
          </p>
        </div>
      </section>

      {/* WHAT YOU GET — the leaderboard promise */}
      <section className="py-32 px-8 md:px-16 max-w-6xl mx-auto">
        <div className="text-xs text-zinc-500 uppercase tracking-widest mb-12">
          What you get
        </div>
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <div className="text-5xl font-bold mb-4 text-zinc-800">01</div>
            <h3 className="text-xl font-semibold mb-3">
              Your rank against your category
            </h3>
            <p className="text-zinc-400">
              Your can scored against 5 competitors you pick. You see exactly
              where you land — and why.
            </p>
          </div>
          <div>
            <div className="text-5xl font-bold mb-4 text-zinc-800">02</div>
            <h3 className="text-xl font-semibold mb-3">
              Eight clarity scores, side by side
            </h3>
            <p className="text-zinc-400">
              Brand, category, flavor, benefit, shelf, digital, differentiation,
              SKU confusion. Yours vs. the leader.
            </p>
          </div>
          <div>
            <div className="text-5xl font-bold mb-4 text-zinc-800">03</div>
            <h3 className="text-xl font-semibold mb-3">
              The exact crops causing the gap
            </h3>
            <p className="text-zinc-400">
              Not generic advice. The region of your can that&apos;s losing to
              the winner&apos;s — shown side by side.
            </p>
          </div>
          <div>
            <div className="text-5xl font-bold mb-4 text-zinc-800">04</div>
            <h3 className="text-xl font-semibold mb-3">
              What to change to climb
            </h3>
            <p className="text-zinc-400">
              Three concrete changes. Enough to brief your designer with. Before
              you print.
            </p>
          </div>
        </div>
      </section>

      {/* PROOF — the leaderboard mock */}
      <section className="py-32 px-8 md:px-16 max-w-3xl mx-auto">
        <div className="text-xs text-zinc-500 uppercase tracking-widest mb-8">
          Example
        </div>
        <div className="border border-zinc-900 rounded-3xl p-8 bg-zinc-950">
          <div className="text-xs text-zinc-500 uppercase tracking-widest mb-6">
            Functional soda · 6 cans
          </div>
          <div className="space-y-4">
            {[
              ["Olipop", 84],
              ["Poppi", 81],
              ["Culture Pop", 76],
              ["Your can", 71, true],
              ["Zevia", 68],
              ["Spindrift", 62],
            ].map(([name, score, you]: any, i) => (
              <div
                key={name}
                className={`flex items-center gap-4 ${
                  you ? "text-white" : "text-zinc-500"
                }`}
              >
                <div className="w-6 text-sm font-mono">{i + 1}</div>
                <div className="flex-1 font-medium">
                  {name}
                  {you && (
                    <span className="ml-3 text-xs uppercase tracking-widest text-emerald-400">
                      You
                    </span>
                  )}
                </div>
                <div className="w-32 h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      you ? "bg-emerald-500" : "bg-zinc-700"
                    }`}
                    style={{ width: `${score}%` }}
                  />
                </div>
                <div className="w-8 text-right font-mono text-sm">{score}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-8 md:px-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">
            Know where you stand. Before you print.
          </h2>
          <a
            href="/upload"
            className="inline-block bg-white text-black px-10 py-4 rounded-full font-medium hover:bg-zinc-200 transition"
          >
            Rank my packaging
          </a>
        </div>
      </section>

      <footer className="border-t border-zinc-900 p-8 md:p-16 text-sm text-zinc-600 flex justify-between max-w-6xl mx-auto w-full">
        <div>ShelfMind</div>
        <div>Built by Tosin</div>
      </footer>
    </main>
  );
}