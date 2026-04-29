import { NextResponse } from "next/server";
import crypto from "crypto";
import { createSupabaseAdminClient, recordReading } from "@/lib/supabase";

/**
 * POST /api/webhooks/beehiiv
 * Registra leituras da newsletter → atualiza streak e missões.
 *
 * Evento: post.opened
 * Payload Beehiiv inclui:
 *  - data.email     → email do leitor
 *  - data.post.id   → ID do post na Beehiiv
 *  - data.post.title
 *
 * Configurar em: app.beehiiv.com → Settings → Integrations → Webhooks
 * URL: https://<domínio>/api/webhooks/beehiiv
 * Secret → BEEHIIV_WEBHOOK_SECRET
 */
export async function POST(req: Request) {
  const secret = process.env.BEEHIIV_WEBHOOK_SECRET;
  const payload = await req.text();

  // Valida assinatura HMAC (se secret configurado)
  if (secret) {
    const sig = req.headers.get("beehiiv-signature") ?? "";
    const expected = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");

    if (sig !== expected) {
      console.error("[webhook/beehiiv] Assinatura inválida");
      return NextResponse.json({ error: "invalid signature" }, { status: 401 });
    }
  }

  let body: {
    type: string;
    data: {
      email: string;
      post?: { id: string; title?: string };
    };
  };

  try {
    body = JSON.parse(payload);
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  if (body.type !== "post.opened") {
    return NextResponse.json({ ok: true }); // ignora outros eventos
  }

  const { email, post } = body.data;

  if (!email || !post?.id) {
    return NextResponse.json({ error: "dados incompletos" }, { status: 400 });
  }

  try {
    const db = createSupabaseAdminClient();

    // Busca clerk_id pelo email
    const { data: user } = await db
      .from("users")
      .select("clerk_id")
      .eq("email", email)
      .single();

    if (!user) {
      // Usuário não cadastrado na área de membros ainda — ignora silenciosamente
      return NextResponse.json({ ok: true, skipped: true });
    }

    await recordReading(user.clerk_id, post.id, post.title);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[webhook/beehiiv] Erro ao registrar leitura:", err);
    return NextResponse.json({ error: "record failed" }, { status: 500 });
  }
}
