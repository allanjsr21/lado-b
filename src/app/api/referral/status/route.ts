import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserReferral, isSupabaseConfigured } from "@/lib/supabase";

/**
 * GET /api/referral/status
 * Retorna status de verificação + ref_code + contadores do usuário.
 */
export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ email_verified: false, ref_code: null });
  }

  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "não autenticado" }, { status: 401 });

    const referral = await getUserReferral(userId);
    if (!referral) return NextResponse.json({ email_verified: false, ref_code: null });

    return NextResponse.json({
      email_verified: referral.email_verified,
      ref_code: referral.ref_code,
      confirmed: referral.confirmed,
      pending: referral.pending,
    });
  } catch (err) {
    console.error("[api/referral/status]", err);
    return NextResponse.json({ email_verified: false, ref_code: null });
  }
}
