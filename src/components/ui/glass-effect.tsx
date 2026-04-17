"use client";

import React from "react";

/**
 * GlassEffect — efeito liquid glass real (macOS Tahoe / Apple Vision Pro).
 *
 * Usa SVG filter (feTurbulence + feDisplacementMap + feSpecularLighting)
 * para distorcer o que está atrás do card como vidro líquido.
 *
 * Renderização por camadas (z-index):
 *   0  — backdrop-blur + distortion filter (SVG url(#glass-distortion))
 *   10 — overlay branco translúcido (25% por padrão — branco leitoso)
 *   20 — inset shadow criando highlights nas bordas (brilho de vidro)
 *   30 — conteúdo real
 *
 * IMPORTANTE: <GlassFilter /> precisa estar renderizado uma vez na página.
 */

interface GlassEffectProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** Cor do overlay (default rgba(255,255,255,0.25) — branco 25% como o original) */
  overlayColor?: string;
  /** Cor dos highlights nas bordas (default rgba(255,255,255,0.5) — branco 50%) */
  highlightColor?: string;
}

export const GlassEffect: React.FC<GlassEffectProps> = ({
  children,
  className = "",
  style = {},
  overlayColor = "rgba(255, 255, 255, 0.25)",
  highlightColor = "rgba(255, 255, 255, 0.5)",
}) => {
  const glassStyle: React.CSSProperties = {
    boxShadow:
      "0 6px 6px rgba(0, 0, 0, 0.2), 0 0 20px rgba(0, 0, 0, 0.1)",
    transitionTimingFunction: "cubic-bezier(0.175, 0.885, 0.32, 2.2)",
    ...style,
  };

  return (
    <div
      className={`relative overflow-hidden transition-all duration-700 ${className}`}
      style={glassStyle}
    >
      {/* Camada 0 — distorção real do background via SVG filter + blur sutil */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backdropFilter: "blur(3px)",
          WebkitBackdropFilter: "blur(3px)",
          filter: "url(#glass-distortion)",
          isolation: "isolate",
          borderRadius: "inherit",
        }}
      />

      {/* Camada 1 — overlay branco leitoso */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background: overlayColor,
          borderRadius: "inherit",
        }}
      />

      {/* Camada 2 — highlights nas bordas (refração de vidro) */}
      <div
        className="absolute inset-0 z-20"
        style={{
          borderRadius: "inherit",
          boxShadow: `
            inset 2px 2px 1px 0 ${highlightColor},
            inset -1px -1px 1px 1px ${highlightColor}
          `,
        }}
      />

      {/* Camada 3 — conteúdo */}
      <div className="relative z-30">{children}</div>
    </div>
  );
};

/**
 * Filter SVG para distorção líquida (renderizar uma vez por página).
 */
export const GlassFilter: React.FC = () => (
  <svg style={{ display: "none" }} aria-hidden="true">
    <filter
      id="glass-distortion"
      x="0%"
      y="0%"
      width="100%"
      height="100%"
      filterUnits="objectBoundingBox"
    >
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.001 0.005"
        numOctaves="1"
        seed="17"
        result="turbulence"
      />
      <feComponentTransfer in="turbulence" result="mapped">
        <feFuncR type="gamma" amplitude="1" exponent="10" offset="0.5" />
        <feFuncG type="gamma" amplitude="0" exponent="1" offset="0" />
        <feFuncB type="gamma" amplitude="0" exponent="1" offset="0.5" />
      </feComponentTransfer>
      <feGaussianBlur in="turbulence" stdDeviation="3" result="softMap" />
      <feSpecularLighting
        in="softMap"
        surfaceScale="5"
        specularConstant="1"
        specularExponent="100"
        lightingColor="white"
        result="specLight"
      >
        <fePointLight x="-200" y="-200" z="300" />
      </feSpecularLighting>
      <feComposite
        in="specLight"
        operator="arithmetic"
        k1="0"
        k2="1"
        k3="1"
        k4="0"
        result="litImage"
      />
      <feDisplacementMap
        in="SourceGraphic"
        in2="softMap"
        scale="200"
        xChannelSelector="R"
        yChannelSelector="G"
      />
    </filter>
  </svg>
);
