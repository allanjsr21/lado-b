import { NextResponse } from "next/server";
import { getRanking, isSupabaseConfigured } from "@/lib/supabase";

/**
 * GET /api/ranking?type=streak|referrals
 * Retorna o ranking dos top 50 leitores.
 * Usado pela página /ranking via fetch client-side.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") === "referrals" ? "referrals" : "streak";

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ rows: [] });
  }

  try {
    const rows = await getRanking(type);
    return NextResponse.json({ rows });
  } catch (err) {
    console.error("[api/ranking]", err);
    return NextResponse.json({ rows: [] });
  }
}
