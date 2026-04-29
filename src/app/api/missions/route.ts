import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserMissions, isSupabaseConfigured } from "@/lib/supabase";

/**
 * GET /api/missions
 * Retorna as missões do usuário com progresso real do Supabase.
 */
export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ missions: [] });
  }

  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ missions: [] });

    const missions = await getUserMissions(userId);
    return NextResponse.json({ missions });
  } catch (err) {
    console.error("[api/missions]", err);
    return NextResponse.json({ missions: [] });
  }
}
