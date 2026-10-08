import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("analyses")
    .select("id, category, image_url, report, created_at")
    .eq("public", true)
    .order("created_at", { ascending: false })
    .limit(60);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Flatten the report for easy rendering
  const rows = (data || []).map((r: any) => {
    const sorted = [...(r.report?.leaderboard || [])].sort(
      (a: any, b: any) => a.rank - b.rank
    );
    const user = sorted.find((c: any) => c.is_user);
    return {
      id: r.id,
      category: r.category,
      image: r.image_url,
      headline: r.report?.first_impression?.headline || "",
      rank: user?.rank ?? null,
      total: sorted.length,
      score: user?.score ?? null,
      leader: sorted[0]?.name ?? null,
      created_at: r.created_at,
    };
  });

  return NextResponse.json({ reports: rows });
}