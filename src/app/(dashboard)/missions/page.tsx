"use client";

import { useState, useEffect } from "react";
import {
  Rocket,
  Calendar,
  Sparkles,
  Medal,
  Crown,
  Coffee,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { Card, PageHeader, ProgressBar } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Página Missões — lista de conquistas com progresso individual.
 *
 * Busca dados via /api/missions (client-side fetch).
 * Fallback pra mock se Supabase não estiver configurado.
 */

const ICON_MAP: Record<string, LucideIcon> = {
  "starter-pack": Rocket,
  "criador-de-habitos": Calendar,
  "tons-de-informacao": Sparkles,
  "yellow-crew": Medal,
  "colunista-invisivel": Crown,
};

interface MissionData {
  slug: string;
  name: string;
  description: string;
  target_days: number;
  progress: number;
  completed: boolean;
  completed_at: string | null;
}

// Mock para demo sem Supabase
const MOCK_MISSIONS: MissionData[] = [
  { slug: "starter-pack", name: "Starter Pack", description: "leia 7 edições seguidas", target_days: 7, progress: 1, completed: false, completed_at: null },
  { slug: "criador-de-habitos", name: "Criador de Hábitos", description: "abra o LADO ₿ por 21 dias", target_days: 21, progress: 1, completed: false, completed_at: null },
  { slug: "tons-de-informacao", name: "Tons de Informação", description: "abra o LADO ₿ por 50 dias", target_days: 50, progress: 1, completed: false, completed_at: null },
  { slug: "yellow-crew", name: "Yellow Crew", description: "abra o LADO ₿ por 100 dias", target_days: 100, progress: 1, completed: false, completed_at: null },
  { slug: "colunista-invisivel", name: "Colunista Invisível", description: "abra o LADO ₿ por 150 dias", target_days: 150, progress: 1, completed: false, completed_at: null },
];

export default function MissionsPage() {
  const [missions, setMissions] = useState<MissionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/missions")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setMissions(data?.missions?.length ? data.missions : MOCK_MISSIONS);
      })
      .catch(() => setMissions(MOCK_MISSIONS))
      .finally(() => setLoading(false));
  }, []);

  const inProgress = missions.filter((m) => !m.completed);
  const completed = missions.filter((m) => m.completed);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Suas missões"
        subtitle="Conclua desafios e desbloqueie conquistas exclusivas"
      />

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={28} className="text-[#ffc60a] animate-spin" />
        </div>
      ) : (
        <>
          {inProgress.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider">
                Em progresso
              </h2>
              {inProgress.map((m) => {
                const Icon = ICON_MAP[m.slug] ?? Rocket;
                return (
                  <Card key={m.slug} className="transition-transform hover:scale-[1.01]">
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
                            {m.progress}/{m.target_days}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-white/60 mb-2">
                          {m.description}
                        </p>
                        <ProgressBar value={m.progress} max={m.target_days} />
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Badge inicial (sempre desbloqueada) + missões completadas */}
          <div className="space-y-3 pt-4">
            <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider">
              Badges conquistadas
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {/* Badge de boas-vindas — sempre presente */}
              <Card className="text-center">
                <div className="mb-2 flex justify-center">
                  <div className="w-14 h-14 rounded-full bg-[#ffc60a]/15 border border-[#ffc60a]/25 flex items-center justify-center">
                    <Coffee size={28} className="text-[#ffc60a]" />
                  </div>
                </div>
                <div className="font-semibold text-white text-xs">Bem-vindo</div>
                <div className="text-[10px] text-white/50 mt-1">1 dia seguido</div>
              </Card>

              {completed.map((m) => {
                const Icon = ICON_MAP[m.slug] ?? Medal;
                return (
                  <Card key={m.slug} className="text-center">
                    <div className="mb-2 flex justify-center">
                      <div className="w-14 h-14 rounded-full bg-[#ffc60a]/20 border-2 border-[#ffc60a]/60 flex items-center justify-center">
                        <Icon size={28} className="text-[#ffc60a]" />
                      </div>
                    </div>
                    <div className="font-semibold text-white text-xs">{m.name}</div>
                    {m.completed_at && (
                      <div className="text-[10px] text-white/50 mt-1">
                        {new Date(m.completed_at).toLocaleDateString("pt-BR")}
                      </div>
                    )}
                  </Card>
                );
              })}

              {/* Missões futuras travadas */}
              {inProgress.slice(1).map((m) => {
                const Icon = ICON_MAP[m.slug] ?? Medal;
                return (
                  <Card key={`locked-${m.slug}`} className="text-center">
                    <div className="mb-2 flex justify-center opacity-25">
                      <div className="w-14 h-14 rounded-full bg-white/10 border border-white/10 flex items-center justify-center">
                        <Icon size={28} className="text-white" />
                      </div>
                    </div>
                    <div className="font-semibold text-white/30 text-xs">{m.name}</div>
                    <div className="text-[10px] text-white/30 mt-1">
                      {m.target_days} dias
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
