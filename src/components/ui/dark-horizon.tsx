"use client";

import React from "react";
import { cn } from "@/lib/utils";

/**
 * DarkHorizon — background minimalista com glow radial no horizonte.
 * Adaptado de 21st.dev "Dark Horizon Glow" para identidade LADO ₿.
 *
 * Visual: preto profundo em cima + glow dourado sutil embaixo.
 * Cara de: Stripe, Linear, Vercel, SpaceX.
 *
 * Zero animação, zero ruído, 100% classe.
 */

interface DarkHorizonProps {
  children?: React.ReactNode;
  className?: string;
  /** Cor do horizonte (default: dourado LADO ₿) */
  glowColor?: string;
  /** Posição vertical do glow (0-100). Default 90 (embaixo). */
  glowPosition?: number;
  /** Intensidade do glow (0-1). Default 0.25 */
  glowIntensity?: number;
}

export default function DarkHorizon({
  children,
  className,
  glowColor = "#ffc60a",
  glowPosition = 90,
  glowIntensity = 0.25,
}: DarkHorizonProps) {
  // Converte hex para rgb
  const hex = glowColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const glowRgba = `rgba(${r}, ${g}, ${b}, ${glowIntensity})`;

  return (
    <div className={cn("relative w-full min-h-screen", className)}>
      {/* Gradient radial — horizonte dourado */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: `radial-gradient(125% 125% at 50% ${glowPosition}%, #000000 40%, ${glowRgba} 100%)`,
        }}
      />
      {/* Conteúdo */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
