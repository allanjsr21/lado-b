import { NextRequest, NextResponse } from "next/server";
// import crypto from "crypto";
// import { createSupabaseAdminClient } from "@/lib/supabase";

/**
 * POST /api/webhooks/beehiiv
 *
 * Webhook do Beehiiv — recebe eventos quando assinantes abrem edições.
 *
 * Eventos que escutamos:
 *  - post.opened → um assinante abriu uma edição
 *                  - Insere em readings (user_id, beehiiv_post_id, read_at)
 *                  - Atualiza streaks (current_streak, longest_streak, last_read_date)
 *                  - Checa e atualiza user_missions (marca completed ao atingir target)
 *
 * Segurança:
 *  - Valida assinatura HMAC-SHA256 com BEEHIIV_WEBHOOK_SECRET
 *  - Rejeita requests sem header x-beehiiv-signature
 *
 * TODO (time de tech):
 *  - Implementar seguindo doc do Beehiiv:
 *    https://developers.beehiiv.com/docs/webhooks
 *  - Configurar webhook no painel Beehiiv apontando pra esta rota
 *  - Lógica de streak:
 *    - Se last_read_date == ontem → current_streak += 1
 *    - Se last_read_date == hoje → não incrementa (já leu hoje)
 *    - Se last_read_date < ontem → reseta current_streak = 1
 *    - Atualiza longest_streak = MAX(current, longest)
 */
export async function POST(req: NextRequest) {
  try {
    // const rawBody = await req.text();
    // const signature = req.headers.get("x-beehiiv-signature");

    // if (!signature) {
    //   return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    // }

    // const expected = crypto
    //   .createHmac("sha256", process.env.BEEHIIV_WEBHOOK_SECRET!)
    //   .update(rawBody)
    //   .digest("hex");
    // if (signature !== expected) {
    //   return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    // }

    // const payload = JSON.parse(rawBody);
    // const supabase = createSupabaseAdminClient();

    // if (payload.event === "post.opened") {
    //   const subscriberId = payload.data.subscription_id;
    //   const postId = payload.data.post_id;
    //   const postTitle = payload.data.post_title;

    //   // Encontra user pelo beehiiv_subscription_id
    //   const { data: user } = await supabase
    //     .from("users")
    //     .select("id")
    //     .eq("beehiiv_subscription_id", subscriberId)
    //     .single();
    //   if (!user) return NextResponse.json({ ok: true });

    //   // Registra leitura (unique constraint evita duplicata)
    //   await supabase.from("readings").upsert({
    //     user_id: user.id,
    //     beehiiv_post_id: postId,
    //     post_title: postTitle,
    //   }, { onConflict: "user_id,beehiiv_post_id" });

    //   // Atualiza streak
    //   const today = new Date().toISOString().split("T")[0];
    //   const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    //   const { data: streak } = await supabase
    //     .from("streaks")
    //     .select("*")
    //     .eq("user_id", user.id)
    //     .single();

    //   let newCurrent = 1;
    //   if (streak) {
    //     if (streak.last_read_date === today) {
    //       // já leu hoje, não atualiza
    //       return NextResponse.json({ ok: true });
    //     }
    //     if (streak.last_read_date === yesterday) {
    //       newCurrent = streak.current_streak + 1;
    //     }
    //   }

    //   await supabase.from("streaks").upsert({
    //     user_id: user.id,
    //     current_streak: newCurrent,
    //     longest_streak: Math.max(newCurrent, streak?.longest_streak ?? 0),
    //     last_read_date: today,
    //     updated_at: new Date().toISOString(),
    //   });

    //   // Atualiza user_missions
    //   const { data: missions } = await supabase.from("missions").select("*").eq("is_active", true);
    //   for (const m of missions ?? []) {
    //     await supabase.from("user_missions").upsert({
    //       user_id: user.id,
    //       mission_id: m.id,
    //       progress: newCurrent,
    //       completed: newCurrent >= m.target_days,
    //       completed_at: newCurrent >= m.target_days ? new Date().toISOString() : null,
    //     }, { onConflict: "user_id,mission_id" });
    //   }
    // }

    return NextResponse.json({ ok: true, stub: true });
  } catch (error) {
    console.error("Erro no webhook Beehiiv:", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }
}
