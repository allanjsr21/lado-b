"use client";

import {
  Rocket,
  Calendar,
  Sparkles,
  Medal,
  Crown,
  Coffee,
  type LucideIcon,
} from "lucide-react";
import { Card, PageHeader, ProgressBar } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Página Missões — lista de conquistas com progresso individual.
 *
 * TODO (time de tech):
 *  - Buscar missions + user_missions do Supabase (JOIN por user_id)
 *  - Atualizar progresso via trigger do webhook Beehiiv (ler edição → +1)
 */

interface Mission {
  slug: string;
  name: string;
  description: string;
  icon: LucideIcon;
  progress: number;
  target: number;
}

// Mock (substituir por fetch do Supabase)
const MISSIONS: Mission[] = [
  {
    slug: "starter-pack",
    name: "Starter Pack",
    description: "leia 7 edições seguidas",
    icon: Rocket,
    progress: 1,
    target: 7,
  },
  {
    slug: "criador-de-habitos",
    name: "Criador de Hábitos",
    description: "abra o LADO ₿ por 21 dias",
    icon: Calendar,
    progress: 1,
    target: 21,
  },
  {
    slug: "tons-de-informacao",
    name: "Tons de Informação",
    description: "abra o LADO ₿ por 50 dias",
    icon: Sparkles,
    progress: 1,
    target: 50,
  },
  {
    slug: "yellow-crew",
    name: "Yellow Crew",
    description: "abra o LADO ₿ por 100 dias",
    icon: Medal,
    progress: 1,
    target: 100,
  },
  {
    slug: "colunista-invisivel",
    name: "Colunista Invisível",
    description: "abra o LADO ₿ por 150 dias",
    icon: Crown,
    progress: 1,
    target: 150,
  },
];

interface Badge {
  name: string;
  icon: LucideIcon;
  unlocked: boolean;
  description: string;
}

const BADGES: Badge[] = [
  {
    name: "Bem-vindo",
    icon: Coffee,
    unlocked: true,
    description: "1 dia seguido",
  },
];

export default function MissionsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Suas missões"
        subtitle="Conclua desafios e desbloqueie conquistas exclusivas"
      />

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider">
          Em progresso
        </h2>
        {MISSIONS.map((m) => {
          const Icon = m.icon;
          return (
            <Card
              key={m.slug}
              className="transition-transform hover:scale-[1.01]"
            >
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-[#ffc60a]/15 border border-[#ffc60a]/25 flex items-center justify-center">
                  <Icon size={24} className="text-[#ffc60a]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <h3 className="font-semibold text-white text-sm sm:text-base truncate">
                      {m.name}
                    </h3>
                    <span className="text-xs font-mono text-[#ffc60a] flex-shrink-0">
                      {m.progress}/{m.target}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-white/60 mb-2">
                    {m.description}
                  </p>
                  <ProgressBar value={m.progress} max={m.target} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="space-y-3 pt-4">
        <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider">
          Badges conquistadas
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {BADGES.map((b) => {
            const Icon = b.icon;
            return (
              <Card key={b.name} className="text-center">
                <div
                  className={cn(
                    "mb-2 flex justify-center",
                    !b.unlocked && "opacity-30",
                  )}
                >
                  <div className="w-14 h-14 rounded-full bg-[#ffc60a]/15 border border-[#ffc60a]/25 flex items-center justify-center">
                    <Icon size={28} className="text-[#ffc60a]" />
                  </div>
                </div>
                <div className="font-semibold text-white text-xs">{b.name}</div>
                <div className="text-[10px] text-white/50 mt-1">
                  {b.description}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
