import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { verifyOtpCode, getUserReferral } from "@/lib/supabase";

/**
 * POST /api/referral/verify-otp
 * Verifica código OTP e libera link de indicação único.
 *
 * Body: { code: string }
 * Retorna: { ok: true, ref_code: string } ou { error: string }
 */
export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "não autenticado" }, { status: 401 });
  }

  try {
    const { code } = await req.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "código inválido" }, { status: 400 });
    }

    const valid = await verifyOtpCode(userId, code.trim());

    if (!valid) {
      return NextResponse.json(
        { error: "Código incorreto ou expirado" },
        { status: 400 },
      );
    }

    // Busca ref_code gerado pelo trigger do Supabase
    const referral = await getUserReferral(userId);

    return NextResponse.json({
      ok: true,
      ref_code: referral?.ref_code ?? null,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro ao verificar OTP";
    console.error("[api/referral/verify-otp]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
