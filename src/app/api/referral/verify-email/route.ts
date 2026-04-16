import { NextResponse } from "next/server";
// import { auth } from "@clerk/nextjs/server";
// import { createSupabaseServerClient } from "@/lib/supabase";
// import { sendOtpEmail } from "@/lib/resend";

/**
 * POST /api/referral/verify-email
 *
 * Dispara o envio de código OTP de 6 dígitos pro email do usuário logado.
 * Usado na página /referral antes de liberar o link de indicação.
 *
 * Fluxo:
 *  1. Autentica usuário via Clerk
 *  2. Busca dados do user no Supabase
 *  3. Se já verificado → retorna 200 com { alreadyVerified: true }
 *  4. Rate limit: 1 código a cada 60s (verifica último OTP em otp_codes)
 *  5. Gera código de 6 dígitos (000000 a 999999)
 *  6. Salva em otp_codes (user_id, email, code, expires_at = now + 10min)
 *  7. Envia por email via Resend
 *  8. Retorna 200 { ok: true }
 *
 * TODO (time de tech):
 *  - Implementar seguindo o pseudocódigo acima
 *  - Verificar Clerk webhook secret
 *  - Criar lib/supabase.ts e lib/resend.ts
 */
export async function POST() {
  try {
    // TODO: const { userId } = await auth();
    // if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // const supabase = createSupabaseServerClient();
    // const { data: user } = await supabase.from("users").select("*").eq("clerk_id", userId).single();

    // if (user.referral_email_verified) {
    //   return NextResponse.json({ alreadyVerified: true });
    // }

    // Rate limit (1 código a cada 60s)
    // const { data: lastOtp } = await supabase
    //   .from("otp_codes")
    //   .select("created_at")
    //   .eq("user_id", user.id)
    //   .order("created_at", { ascending: false })
    //   .limit(1)
    //   .single();
    // if (lastOtp && Date.now() - new Date(lastOtp.created_at).getTime() < 60_000) {
    //   return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    // }

    // const code = String(Math.floor(100000 + Math.random() * 900000));
    // const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // await supabase.from("otp_codes").insert({
    //   user_id: user.id,
    //   email: user.email,
    //   code,
    //   expires_at: expiresAt.toISOString(),
    // });

    // await sendOtpEmail(user.email, code);

    return NextResponse.json({ ok: true, stub: true });
  } catch (error) {
    console.error("Erro ao enviar OTP:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
