"use client";

import React from "react";
import { cn } from "@/lib/utils";

/**
 * CryptoGrid — background estilo trading terminal / Bloomberg / Binance.
 *
 * Combina:
 *  - Grid fino e sutil (linhas verticais + horizontais)
 *  - Dot matrix nos cruzamentos (cara tech)
 *  - Glow radial dourado ao centro (identidade Bitcoin)
 *  - Scanline animado (opcional, só em destaques)
 *  - Fundo preto profundo
 *
 * Uso típico: background full-screen de páginas (login, dashboard, etc.)
 */

interface CryptoGridProps {
  children?: React.ReactNode;
  className?: string;
  /** Tamanho da célula do grid em px. Default 48 */
  gridSize?: number;
  /** Opacidade das linhas (0-1). Default 0.08 */
  lineOpacity?: number;
  /** Exibir glow radial dourado no centro. Default true */
  showGlow?: boolean;
  /** Exibir scanline animado horizontal. Default false */
  showScanline?: boolean;
}

export default function CryptoGrid({
  children,
  className,
  gridSize = 48,
  lineOpacity = 0.08,
  showGlow = true,
  showScanline = false,
}: CryptoGridProps) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden bg-[#050505]",
        className,
      )}
    >
      {/* Grid de linhas finas */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 198, 10, ${lineOpacity}) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 198, 10, ${lineOpacity}) 1px, transparent 1px)
          `,
          backgroundSize: `${gridSize}px ${gridSize}px`,
        }}
      />

      {/* Dots nos cruzamentos do grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 0 0, rgba(255, 198, 10, 0.25) 1px, transparent 1.5px)
          `,
          backgroundSize: `${gridSize}px ${gridSize}px`,
        }}
      />

      {/* Glow radial dourado central */}
      {showGlow && (
        <>
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{
              width: "900px",
              height: "900px",
              background:
                "radial-gradient(circle, rgba(255, 198, 10, 0.12) 0%, rgba(255, 198, 10, 0.04) 30%, transparent 70%)",
              filter: "blur(40px)",
            }}
          />
          <div
            className="absolute left-0 bottom-0 pointer-events-none"
            style={{
              width: "500px",
              height: "500px",
              background:
                "radial-gradient(circle, rgba(255, 198, 10, 0.08) 0%, transparent 70%)",
              filter: "blur(60px)",
            }}
          />
        </>
      )}

      {/* Scanline sutil (linha horizontal passando) */}
      {showScanline && (
        <div
          className="absolute left-0 right-0 h-px pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255, 198, 10, 0.6) 50%, transparent 100%)",
            animation: "scanline 8s linear infinite",
          }}
        />
      )}

      {/* Vignette sutil nas bordas */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0, 0, 0, 0.7) 100%)",
        }}
      />

      {children}
    </div>
  );
}
