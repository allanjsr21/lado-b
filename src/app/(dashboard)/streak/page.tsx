import { Mail } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { GlassEffect } from "@/components/ui/glass-effect";
import { listPosts, beehiivDate } from "@/lib/beehiiv";
import {
  isSupabaseConfigured,
  getUserStreak,
  getReadingDays,
} from "@/lib/supabase";
import { StreakContent } from "./streak-content";

/**
 * Página Streak (Home) — server component.
 *
 * Busca em paralelo:
 *  1. Última edição Beehiiv (build-time no GitHub Pages, runtime no Vercel)
 *  2. Streak real do Supabase (runtime, requer Vercel + Supabase configurados)
 *  3. Dias lidos no mês atual (runtime, idem)
 *
 * Fallback: se Supabase/Clerk não estiver configurado, usa dados mock.
 */

// Mock para demo sem Supabase
const MOCK_READ_DAYS = [new Date().getDate() - 1];
const MOCK_STREAK = { currentStreak: 1, longestStreak: 1 };

export default async function StreakPage() {
  const today = new Date();

  // ── 1. Edição mais recente (Beehiiv) ──────────────────────────────────
  let latestPost = null;
  try {
    const { data } = await listPosts({ limit: 1 });
    latestPost = data[0] ?? null;
  } catch (err) {
    console.error("[streak] Beehiiv fetch failed:", err);
  }

  // ── 2. Streak + dias lidos (Supabase + Clerk) ─────────────────────────
  let currentStreak = MOCK_STREAK.currentStreak;
  let longestStreak = MOCK_STREAK.longestStreak;
  let readDays = MOCK_READ_DAYS;

  if (isSupabaseConfigured()) {
    try {
      const { userId } = await auth();

      if (userId) {
        const [streakData, days] = await Promise.all([
          getUserStreak(userId),
          getReadingDays(userId, today.getFullYear(), today.getMonth()),
        ]);

        if (streakData) {
          currentStreak = streakData.currentStreak;
          longestStreak = streakData.longestStreak;
        }
        readDays = days;
      }
    } catch (err) {
      console.error("[streak] Supabase fetch failed:", err);
    }
  }

  // ── 3. Card da última edição ──────────────────────────────────────────
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

  return (
    <StreakContent
      latestEditions={latestEditionCard}
      currentStreak={currentStreak}
      longestStreak={longestStreak}
      readDays={readDays}
    />
  );
}
