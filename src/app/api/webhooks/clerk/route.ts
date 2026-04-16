import { NextRequest, NextResponse } from "next/server";
// import { Webhook } from "svix";
// import { createSupabaseAdminClient } from "@/lib/supabase";

/**
 * POST /api/webhooks/clerk
 *
 * Webhook do Clerk — sincroniza mudanças de usuário com nossa tabela users no Supabase.
 *
 * Eventos que escutamos:
 *  - user.created   → cria linha em users (clerk_id, email, full_name, avatar_url)
 *                     Se cookie ?ref=xxx estiver presente → vincula referred_by
 *  - user.updated   → atualiza email / nome / avatar
 *  - user.deleted   → soft delete (ou hard, dependendo da política LGPD)
 *  - email.created  → quando email é verificado, converte indicação pra "valid"
 *
 * Segurança:
 *  - Valida assinatura via svix (CLERK_WEBHOOK_SECRET)
 *  - Rejeita requests sem header svix-signature
 *
 * TODO (time de tech):
 *  - Implementar o handler completo seguindo doc do Clerk:
 *    https://clerk.com/docs/integrations/webhooks/sync-data
 *  - Configurar webhook no dashboard Clerk apontando para esta rota
 */
export async function POST(req: NextRequest) {
  try {
    // const payload = await req.text();
    // const headerPayload = req.headers;
    // const svixId = headerPayload.get("svix-id");
    // const svixTimestamp = headerPayload.get("svix-timestamp");
    // const svixSignature = headerPayload.get("svix-signature");

    // if (!svixId || !svixTimestamp || !svixSignature) {
    //   return NextResponse.json({ error: "Missing headers" }, { status: 400 });
    // }

    // const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
    // const evt = wh.verify(payload, {
    //   "svix-id": svixId,
    //   "svix-timestamp": svixTimestamp,
    //   "svix-signature": svixSignature,
    // });

    // const supabase = createSupabaseAdminClient();

    // switch (evt.type) {
    //   case "user.created":
    //     await supabase.from("users").insert({
    //       clerk_id: evt.data.id,
    //       email: evt.data.email_addresses[0].email_address,
    //       full_name: `${evt.data.first_name} ${evt.data.last_name}`.trim(),
    //       avatar_url: evt.data.image_url,
    //       // referred_by: buscar do cookie/metadata se houver ?ref
    //     });
    //     break;
    //   case "user.updated":
    //     await supabase.from("users").update({...}).eq("clerk_id", evt.data.id);
    //     break;
    //   case "email.created":
    //     // Se o email foi verificado → atualiza referral pending → valid
    //     // ...
    //     break;
    // }

    return NextResponse.json({ ok: true, stub: true });
  } catch (error) {
    console.error("Erro no webhook Clerk:", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }
}
