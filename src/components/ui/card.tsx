"use client";

import React from "react";
import { cn } from "@/lib/utils";

/**
 * Card — wrapper padrão de card com liquid glass no dashboard LADO ₿.
 * Centralizado pra reaproveitar em todas as páginas (Streak, Missões, Ranking, etc.)
 */
export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("relative rounded-2xl overflow-hidden", className)}
      style={{
        background: `linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 50%, rgba(255, 198, 10, 0.03) 100%)`,
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: `
          0 8px 32px rgba(0, 0, 0, 0.4),
          inset 1px 1px 0 rgba(255, 255, 255, 0.1),
          inset -1px -1px 0 rgba(255, 198, 10, 0.05)
        `,
      }}
    >
      {/* Highlight no topo */}
      <div
        className="absolute top-0 left-6 right-6 h-px pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.25), transparent)",
        }}
      />
      {/* Glow no canto superior esquerdo */}
      <div
        className="absolute top-0 left-0 w-32 h-32 rounded-br-full opacity-40 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at top left, rgba(255, 198, 10, 0.08), transparent 70%)",
        }}
      />
      <div className="relative p-5 sm:p-6">{children}</div>
    </div>
  );
}

/**
 * PageHeader — cabeçalho padrão de cada página (título + subtítulo).
 */
export function PageHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
          {title}
        </h1>
        {subtitle && (
          <p className="text-white/60 text-xs sm:text-sm mt-1">{subtitle}</p>
        )}
      </div>
      {children && <div className="flex-shrink-0">{children}</div>}
    </div>
  );
}

/**
 * ProgressBar — barra de progresso reutilizável.
 */
export function ProgressBar({
  value,
  max,
  className,
}: {
  value: number;
  max: number;
  className?: string;
}) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div
      className={cn(
        "w-full h-1.5 rounded-full bg-white/10 overflow-hidden",
        className,
      )}
    >
      <div
        className="h-full bg-[#ffc60a] transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
