import { NextRequest, NextResponse } from "next/server";
// import { auth } from "@clerk/nextjs/server";
// import { createSupabaseServerClient } from "@/lib/supabase";

/**
 * POST /api/referral/confirm-otp
 *
 * Valida o código OTP digitado pelo usuário. Se válido:
 *  - Marca users.referral_email_verified = TRUE
 *  - Trigger do Supabase gera ref_code único automaticamente
 *
 * Body esperado: { code: "123456" }
 *
 * Fluxo:
 *  1. Autentica usuário via Clerk
 *  2. Valida body (código deve ser string de 6 dígitos)
 *  3. Busca último OTP não usado do user em otp_codes
 *  4. Compara code
 *  5. Verifica se não expirou (expires_at > now)
 *  6. Incrementa attempts (máx. 5 tentativas por código)
 *  7. Se OK: marca used_at = now, update users.referral_email_verified = TRUE
 *  8. Trigger do Supabase gera ref_code
 *  9. Retorna 200 { ok: true, refCode: user.ref_code }
 *
 * TODO (time de tech):
 *  - Implementar seguindo o pseudocódigo acima
 *  - Bloquear user por 30min se errar 5 vezes
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code } = body as { code?: string };

    if (!code || !/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: "Código inválido" },
        { status: 400 },
      );
    }

    // TODO: const { userId } = await auth();
    // if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // const supabase = createSupabaseServerClient();
    // const { data: user } = await supabase.from("users").select("*").eq("clerk_id", userId).single();

    // const { data: otp } = await supabase
    //   .from("otp_codes")
    //   .select("*")
    //   .eq("user_id", user.id)
    //   .is("used_at", null)
    //   .order("created_at", { ascending: false })
    //   .limit(1)
    //   .single();

    // if (!otp) return NextResponse.json({ error: "Código não encontrado" }, { status: 404 });
    // if (new Date(otp.expires_at).getTime() < Date.now()) {
    //   return NextResponse.json({ error: "Código expirado" }, { status: 410 });
    // }
    // if (otp.attempts >= 5) {
    //   return NextResponse.json({ error: "Tentativas excedidas" }, { status: 429 });
    // }

    // if (otp.code !== code) {
    //   await supabase.from("otp_codes").update({ attempts: otp.attempts + 1 }).eq("id", otp.id);
    //   return NextResponse.json({ error: "Código incorreto" }, { status: 400 });
    // }

    // // Marca OTP como usado + email verificado (trigger gera ref_code)
    // await supabase.from("otp_codes").update({ used_at: new Date().toISOString() }).eq("id", otp.id);
    // await supabase
    //   .from("users")
    //   .update({ referral_email_verified: true })
    //   .eq("id", user.id);

    // const { data: updatedUser } = await supabase
    //   .from("users")
    //   .select("ref_code")
    //   .eq("id", user.id)
    //   .single();

    // return NextResponse.json({ ok: true, refCode: updatedUser.ref_code });

    return NextResponse.json({ ok: true, stub: true, refCode: "stub" });
  } catch (error) {
    console.error("Erro ao confirmar OTP:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
