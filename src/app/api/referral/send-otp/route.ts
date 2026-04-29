import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { createOtpCode } from "@/lib/supabase";
import { sendOtpEmail } from "@/lib/resend";

/**
 * POST /api/referral/send-otp
 * Gera código OTP e envia por email para liberar link de indicação.
 *
 * Rate limiting simples: 1 código a cada 60s (controlado pelo Supabase —
 * o insert vai falhar se houver OTP válido criado há menos de 60s,
 * mas preferimos invalidar o anterior e criar um novo).
 */
export async function POST() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "não autenticado" }, { status: 401 });
  }

  try {
    const user = await currentUser();
    const email = user?.emailAddresses[0]?.emailAddress;

    if (!email) {
      return NextResponse.json(
        { error: "email não encontrado na conta Clerk" },
        { status: 400 },
      );
    }

    const code = await createOtpCode(userId, email);
    await sendOtpEmail(email, code);

    return NextResponse.json({ ok: true, email });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro ao enviar OTP";
    console.error("[api/referral/send-otp]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
