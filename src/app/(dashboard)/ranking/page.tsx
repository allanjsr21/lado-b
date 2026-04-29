"use client";

import { useState, useEffect } from "react";
import { Trophy, Flame, Users, Loader2 } from "lucide-react";
import { Card, PageHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Página Ranking — placar dos leitores com mais streak e indicações.
 *
 * Busca dados via fetch client-side pra evitar incompatibilidade
 * com static export do GitHub Pages (fallback pra mock se sem Supabase).
 *
 * TODO (time de tech): expor view materializada no Supabase pra
 * não recalcular ranking a cada request em produção.
 */

type TabId = "streak" | "referrals";

interface RankRow {
  position: number;
  user_id: string;
  full_name: string;
  value: number;
  isCurrentUser?: boolean;
}

// Mock para demo sem Supabase
const MOCK_STREAK: RankRow[] = Array.from({ length: 15 }).map((_, i) => ({
  position: i + 1,
  user_id: `mock-${i}`,
  full_name:
    ["Lucas M.", "Maria S.", "João P.", "Ana R.", "Pedro L."][i % 5] +
    (i > 4 ? ` #${i}` : ""),
  value: 45 - i * 2,
  isCurrentUser: i === 0,
}));

const MOCK_REFERRALS: RankRow[] = Array.from({ length: 15 }).map((_, i) => ({
  position: i + 1,
  user_id: `mock-ref-${i}`,
  full_name:
    ["Carlos F.", "Bia T.", "Rafa K.", "Sofia M.", "Diego B."][i % 5] +
    (i > 4 ? ` #${i}` : ""),
  value: 28 - i,
  isCurrentUser: false,
}));

export default function RankingPage() {
  const [tab, setTab] = useState<TabId>("streak");
  const [rows, setRows] = useState<RankRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/ranking?type=${tab}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.rows?.length) {
          setRows(data.rows);
        } else {
          // Fallback mock
          setRows(tab === "streak" ? MOCK_STREAK : MOCK_REFERRALS);
        }
      })
      .catch(() => {
        setRows(tab === "streak" ? MOCK_STREAK : MOCK_REFERRALS);
      })
      .finally(() => setLoading(false));
  }, [tab]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ranking"
        subtitle="Os leitores mais engajados do LADO ₿"
      />

      <div className="flex gap-2 p-1 rounded-xl bg-white/5 border border-white/10 w-fit">
        <TabButton
          active={tab === "streak"}
          onClick={() => setTab("streak")}
          icon={<Flame size={14} />}
          label="Streak"
        />
        <TabButton
          active={tab === "referrals"}
          onClick={() => setTab("referrals")}
          icon={<Users size={14} />}
          label="Indicações"
        />
      </div>

      <Card className="p-0 sm:p-0">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="text-[#ffc60a] animate-spin" />
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {rows.map((row) => (
              <RankRow
                key={row.position}
                position={row.position}
                name={row.full_name}
                value={row.value}
                valueLabel={tab === "streak" ? "dias" : "indicações"}
                isCurrentUser={row.isCurrentUser ?? false}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
        active ? "bg-[#ffc60a] text-black" : "text-white/60 hover:text-white",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function RankRow({
  position,
  name,
  value,
  valueLabel,
  isCurrentUser,
}: {
  position: number;
  name: string;
  value: number;
  valueLabel: string;
  isCurrentUser: boolean;
}) {
  const isPodium = position <= 3;
  return (
    <div
      className={cn(
        "flex items-center gap-4 px-5 sm:px-6 py-3 transition-colors",
        isCurrentUser && "bg-[#ffc60a]/10",
      )}
    >
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
          isPodium ? "bg-[#ffc60a] text-black" : "bg-white/5 text-white/60",
        )}
      >
        {isPodium ? <Trophy size={14} /> : position}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-white text-sm truncate">
          {name}
          {isCurrentUser && (
            <span className="ml-2 text-xs text-[#ffc60a]">(você)</span>
          )}
        </div>
      </div>
      <div className="flex-shrink-0 text-right">
        <div className="font-bold text-white text-sm">{value}</div>
        <div className="text-[10px] text-white/40">{valueLabel}</div>
      </div>
    </div>
  );
}
