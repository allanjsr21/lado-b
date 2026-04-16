"use client";

import { useState } from "react";
import { Flame, Trophy, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassEffect } from "@/components/ui/glass-effect";

/**
 * Página Streak (Home) — dashboard principal após login.
 *
 * Mostra:
 *  - Saudação + streak atual / recorde
 *  - Calendário semanal ou mensal de leituras
 *  - Card de próxima conquista
 *  - Card da edição mais recente ("à venda", etc.)
 *
 * TODO (time de tech):
 *  - Buscar dados reais do Supabase (streaks + readings)
 *  - Conectar useUser() do Clerk para nome
 */

// Mock de dias lidos (depois vem do Supabase)
const MOCK_READ_DAYS = [new Date().getDate() - 1]; // ontem leu

export default function StreakPage() {
  const [view, setView] = useState<"weekly" | "monthly">("weekly");
  const today = new Date();
  const currentStreak = 1;
  const recordStreak = 1;

  return (
    <div className="space-y-6">
      {/* Saudação + Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white leading-tight">
            Que começo incrível! Bem-vindo à sua nova jornada!
          </h1>
          <p className="text-white/60 text-xs sm:text-sm mt-2">
            {today.toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">
          <StreakStat
            icon={<Flame className="text-[#ffc60a]" size={20} />}
            value={currentStreak}
            label="streak atual"
          />
          <div className="w-px h-10 bg-white/10" />
          <StreakStat
            icon={<Trophy className="text-[#ffc60a]" size={20} />}
            value={recordStreak}
            label="streak recorde"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendário — ocupa 2 colunas */}
        <Card className="lg:col-span-2">
          <CalendarHeader view={view} setView={setView} />
          <div className="mt-6">
            {view === "weekly" ? (
              <WeeklyCalendar readDays={MOCK_READ_DAYS} />
            ) : (
              <MonthlyCalendar readDays={MOCK_READ_DAYS} />
            )}
          </div>
        </Card>

        {/* Próxima conquista */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Target size={18} className="text-[#ffc60a]" />
            <h2 className="font-semibold text-white">Próxima conquista</h2>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#ffc60a]/5 border border-[#ffc60a]/20">
            <div className="w-12 h-12 rounded-lg bg-[#ffc60a]/20 flex items-center justify-center text-2xl">
              ✅
            </div>
            <div>
              <div className="font-semibold text-white text-sm">
                Starter Pack
              </div>
              <div className="text-xs text-white/60">
                leia 7 edições seguidas
              </div>
              <div className="mt-1">
                <ProgressBar value={1} max={7} />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Última edição */}
      <Card>
        <h2 className="font-semibold text-white mb-3">
          📬 última edição LADO ₿
        </h2>
        <p className="text-white/70 text-sm leading-relaxed">
          Bom dia, bitcoiner. Hoje a gente destrincha o que realmente mexe com o
          preço no ciclo atual — e o que ainda vai surpreender muita gente.
        </p>
        <button
          type="button"
          className="mt-4 text-sm font-semibold text-[#ffc60a] hover:text-[#ffd63d] transition-colors"
        >
          ler edição de hoje →
        </button>
      </Card>
    </div>
  );
}

// ===================== Sub-componentes =====================

function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <GlassEffect
      className={cn("rounded-2xl", className)}
      overlayColor="rgba(255, 255, 255, 0.04)"
      highlightColor="rgba(255, 198, 10, 0.2)"
    >
      <div className="p-5 sm:p-6">{children}</div>
    </GlassEffect>
  );
}

function StreakStat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <div>
        <div className="text-lg sm:text-xl font-bold text-white leading-none whitespace-nowrap">
          {value} {value === 1 ? "dia" : "dias"}
        </div>
        <div className="text-[10px] sm:text-xs text-white/50 mt-1 whitespace-nowrap">
          {label}
        </div>
      </div>
    </div>
  );
}

function CalendarHeader({
  view,
  setView,
}: {
  view: "weekly" | "monthly";
  setView: (v: "weekly" | "monthly") => void;
}) {
  const today = new Date();
  return (
    <div className="flex items-center justify-between">
      <div className="text-sm font-medium text-white/80">
        {today.toLocaleDateString("pt-BR", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })}
      </div>
      <div className="flex items-center gap-1 p-1 rounded-lg bg-white/5 border border-white/10">
        {(["weekly", "monthly"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
              view === v
                ? "bg-[#ffc60a] text-black"
                : "text-white/60 hover:text-white",
            )}
          >
            {v === "weekly" ? "semanal" : "mensal"}
          </button>
        ))}
      </div>
    </div>
  );
}

function WeeklyCalendar({ readDays }: { readDays: number[] }) {
  const today = new Date();
  const todayDate = today.getDate();
  const weekDays = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

  // gera os 7 dias da semana atual (domingo a sábado)
  const week = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - d.getDay() + i);
    return d.getDate();
  });

  return (
    <div>
      <div className="grid grid-cols-7 gap-2 mb-3">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-xs text-center text-white/40 font-medium"
          >
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {week.map((day) => {
          const isToday = day === todayDate;
          const wasRead = readDays.includes(day);
          return (
            <div
              key={day}
              className={cn(
                "aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-colors",
                wasRead
                  ? "bg-[#ffc60a] text-black"
                  : isToday
                    ? "bg-transparent border-2 border-[#ffc60a] text-[#ffc60a]"
                    : "bg-white/5 text-white/60 border border-white/10",
              )}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MonthlyCalendar({ readDays }: { readDays: number[] }) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayDate = today.getDate();

  const weekDays = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
  const days = Array.from({ length: firstDay }, () => null).concat(
    Array.from({ length: daysInMonth }, (_, i) => i + 1) as (number | null)[],
  );

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((d) => (
          <div
            key={d}
            className="text-xs text-center text-white/40 font-medium"
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          if (day === null) return <div key={`blank-${i}`} />;
          const isToday = day === todayDate;
          const wasRead = readDays.includes(day);
          return (
            <div
              key={day}
              className={cn(
                "aspect-square rounded-md flex items-center justify-center text-xs font-medium",
                wasRead
                  ? "bg-[#ffc60a] text-black"
                  : isToday
                    ? "bg-transparent border border-[#ffc60a] text-[#ffc60a]"
                    : "text-white/50",
              )}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
      <div
        className="h-full bg-[#ffc60a] transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
