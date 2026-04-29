import { Mail } from "lucide-react";
import { GlassEffect } from "@/components/ui/glass-effect";
import { listPosts, beehiivDate, type BeehiivPost } from "@/lib/beehiiv";
import { StreakContent } from "./streak-content";

/**
 * Página Streak (Home) — server component.
 *
 * Faz fetch das edições mais recentes da Beehiiv em build-time
 * (compatível com static export do GitHub Pages) e passa o card
 * renderizado como prop pra parte interativa (StreakContent).
 *
 * TODO (time de tech):
 *  - Buscar streak real do Supabase (via Clerk userId)
 *  - Webhook Beehiiv pra registrar leituras (precisa Vercel/edge runtime)
 */

export default async function StreakPage() {
  let latestPost: BeehiivPost | null = null;
  try {
    const { data } = await listPosts({ limit: 1 });
    latestPost = data[0] ?? null;
  } catch (err) {
    console.error("[streak] Beehiiv fetch failed:", err);
  }

  const latestEditionCard = latestPost ? (
    <GlassEffect
      className="rounded-2xl"
      overlayColor="rgba(255, 255, 255, 0.04)"
      highlightColor="rgba(255, 198, 10, 0.2)"
    >
      <div className="p-5 sm:p-6">
        <h2 className="font-semibold text-white mb-3 flex items-center gap-2">
          <Mail size={16} className="text-[#ffc60a]" />
          última edição LADO ₿
        </h2>
        <div className="text-xs text-white/40 mb-2">
          {beehiivDate(latestPost.publish_date).toLocaleDateString("pt-BR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </div>
        <h3 className="font-bold text-white text-base sm:text-lg mb-2 leading-snug">
          {latestPost.title}
        </h3>
        {(latestPost.subtitle || latestPost.preview_text) && (
          <p className="text-white/70 text-sm leading-relaxed">
            {latestPost.subtitle ?? latestPost.preview_text}
          </p>
        )}
        <a
          href={latestPost.web_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block text-sm font-semibold text-[#ffc60a] hover:text-[#ffd63d] transition-colors"
        >
          ler edição →
        </a>
      </div>
    </GlassEffect>
  ) : (
    <GlassEffect
      className="rounded-2xl"
      overlayColor="rgba(255, 255, 255, 0.04)"
      highlightColor="rgba(255, 198, 10, 0.2)"
    >
      <div className="p-5 sm:p-6">
        <h2 className="font-semibold text-white mb-3 flex items-center gap-2">
          <Mail size={16} className="text-[#ffc60a]" />
          última edição LADO ₿
        </h2>
        <p className="text-white/60 text-sm">
          Nenhuma edição disponível no momento.
        </p>
      </div>
    </GlassEffect>
  );

  return <StreakContent latestEditions={latestEditionCard} />;
}
