import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { getOrCreateUser } from "@/lib/supabase";

/**
 * POST /api/webhooks/clerk
 * Sincroniza usuários Clerk → Supabase.
 *
 * Eventos tratados:
 *  - user.created → cria linha em users + streaks
 *  - user.updated → atualiza full_name / avatar_url / email
 *
 * Configurar em: https://dashboard.clerk.com → Webhooks
 * URL: https://<domínio>/api/webhooks/clerk
 * Eventos: user.created, user.updated
 * Secret → CLERK_WEBHOOK_SECRET
 */
export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;

  if (!secret) {
    console.error("[webhook/clerk] CLERK_WEBHOOK_SECRET não configurado");
    return NextResponse.json({ error: "not configured" }, { status: 500 });
  }

  // Verifica assinatura Svix
  const payload = await req.text();
  const headers = {
    "svix-id": req.headers.get("svix-id") ?? "",
    "svix-timestamp": req.headers.get("svix-timestamp") ?? "",
    "svix-signature": req.headers.get("svix-signature") ?? "",
  };

  let event: {
    type: string;
    data: {
      id: string;
      email_addresses: { email_address: string }[];
      first_name: string | null;
      last_name: string | null;
      image_url: string | null;
    };
  };

  try {
    const wh = new Webhook(secret);
    event = wh.verify(payload, headers) as typeof event;
  } catch (err) {
    console.error("[webhook/clerk] Assinatura inválida:", err);
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  if (event.type !== "user.created" && event.type !== "user.updated") {
    return NextResponse.json({ ok: true });
  }

  try {
    const { id, email_addresses, first_name, last_name, image_url } =
      event.data;
    const email = email_addresses[0]?.email_address ?? "";
    const fullName = [first_name, last_name].filter(Boolean).join(" ") || null;

    await getOrCreateUser(id, email, fullName ?? undefined, image_url ?? undefined);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[webhook/clerk] Erro ao sincronizar usuário:", err);
    return NextResponse.json({ error: "sync failed" }, { status: 500 });
  }
}
