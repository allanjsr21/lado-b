"use client";

import { Gift, Calendar, Users } from "lucide-react";
import { Card, PageHeader } from "@/components/ui/card";

/**
 * Página Giveaway — sorteios ativos.
 *
 * TODO (time de tech):
 *  - Buscar giveaways ativos do Supabase WHERE is_active = TRUE
 *  - Buscar giveaway_entries do usuário logado
 *  - Permitir participar (botão inscrever)
 */

// Mock (substituir por fetch do Supabase)
const ACTIVE_GIVEAWAY = {
  title: "Giveaway Insider — 9 anos LADO ₿",
  description: "R$1.000 em produtos Insider. 5 ganhadores!",
  endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  minReferrals: 1,
  participants: 0,
  myReferrals: 0,
};

export default function GiveawayPage() {
  const daysLeft = Math.ceil(
    (ACTIVE_GIVEAWAY.endsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Giveaways"
        subtitle="Sorteios e promoções exclusivas para leitores"
      />

      {/* Banner do giveaway principal */}
      <Card className="overflow-hidden">
        <div className="relative">
          {/* Badge "ativo" */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ffc60a]/15 border border-[#ffc60a]/30 text-[#ffc60a] text-[10px] font-semibold uppercase tracking-wider mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ffc60a] animate-pulse" />
            Ativo
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
            {ACTIVE_GIVEAWAY.title}
          </h2>
          <p className="text-white/70 text-sm sm:text-base">
            {ACTIVE_GIVEAWAY.description}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <Calendar size={16} className="text-[#ffc60a]" />
              <span>
                <strong className="text-white">{daysLeft} dias</strong> restantes
              </span>
            </div>
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <Users size={16} className="text-[#ffc60a]" />
              <span>
                <strong className="text-white">
                  {ACTIVE_GIVEAWAY.participants}
                </strong>{" "}
                inscritos
              </span>
            </div>
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <Gift size={16} className="text-[#ffc60a]" />
              <span>
                Mín. <strong className="text-white">{ACTIVE_GIVEAWAY.minReferrals}</strong>{" "}
                indicação
              </span>
            </div>
          </div>

          <button
            type="button"
            className="mt-6 w-full sm:w-auto rounded-xl bg-[#ffc60a] px-6 py-3 font-bold text-black transition hover:bg-[#ffd63d]"
          >
            Ver regras completas
          </button>
        </div>
      </Card>

      {/* Como participar */}
      <Card>
        <h3 className="font-semibold text-white mb-3">📋 Regras do sorteio</h3>
        <ul className="space-y-2 text-sm text-white/70">
          <li className="flex gap-2">
            <span className="text-[#ffc60a] flex-shrink-0">1.</span>
            <span>
              Para participar, você precisa ter no mínimo{" "}
              <strong>{ACTIVE_GIVEAWAY.minReferrals} indicação válida</strong>{" "}
              no período.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-[#ffc60a] flex-shrink-0">2.</span>
            <span>
              Cada indicação válida conta como uma entrada no sorteio. Mais
              indicações = mais chances.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-[#ffc60a] flex-shrink-0">3.</span>
            <span>
              O sorteio acontece no dia do encerramento e os ganhadores são
              comunicados por email.
            </span>
          </li>
        </ul>
      </Card>

      {/* Status do usuário */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] text-white/50 uppercase tracking-wider">
              Suas entradas
            </div>
            <div className="text-3xl font-bold text-[#ffc60a] mt-1">
              {ACTIVE_GIVEAWAY.myReferrals}
            </div>
          </div>
          <a
            href="/referral"
            className="text-sm font-semibold text-[#ffc60a] hover:text-[#ffd63d] transition-colors"
          >
            Indicar mais →
          </a>
        </div>
      </Card>
    </div>
  );
}
