"use client";

import React from "react";

/**
 * GlassEffect — efeito liquid glass real (estilo macOS Tahoe / Apple Vision Pro)
 *
 * Usa SVG filter (feTurbulence + feDisplacementMap + feSpecularLighting)
 * para criar DISTORÇÃO REAL do que está atrás do card, como se fosse vidro líquido.
 *
 * Renderização por camadas (z-index):
 *   0 — backdrop-blur + distortion filter
 *   10 — overlay sutil branco translúcido
 *   20 — inset shadow para highlights nas bordas
 *   30 — conteúdo real
 *
 * IMPORTANTE: sempre renderizar <GlassFilter /> uma vez na página (pode ser
 * no layout) para o filter SVG ficar disponível globalmente.
 */

interface GlassEffectProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** Cor do overlay interno. Default rgba(255,255,255,0.15) */
  overlayColor?: string;
  /** Cor das bordas internas (highlights). Default branco */
  highlightColor?: string;
}

export const GlassEffect: React.FC<GlassEffectProps> = ({
  children,
  className = "",
  style = {},
  overlayColor = "rgba(255, 255, 255, 0.12)",
  highlightColor = "rgba(255, 255, 255, 0.4)",
}) => {
  const glassStyle: React.CSSProperties = {
    boxShadow:
      "0 6px 6px rgba(0, 0, 0, 0.25), 0 0 40px rgba(0, 0, 0, 0.15), 0 0 60px rgba(255, 198, 10, 0.08)",
    transitionTimingFunction: "cubic-bezier(0.175, 0.885, 0.32, 2.2)",
    ...style,
  };

  return (
    <div
      className={`relative overflow-hidden transition-all duration-700 ${className}`}
      style={glassStyle}
    >
      {/* Camada 0 — distorção real do background via SVG filter */}
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

      {/* Camada 1 — overlay translúcido para suavizar */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background: overlayColor,
          borderRadius: "inherit",
        }}
      />

      {/* Camada 2 — highlights nas bordas (refração de luz) */}
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

      {/* Camada 3 — conteúdo real */}
      <div className="relative z-30">{children}</div>
    </div>
  );
};

/**
 * Filter SVG que cria a distorção líquida.
 * Renderizar uma única vez por página/layout.
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
      {/* Ruído orgânico */}
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.001 0.005"
        numOctaves="1"
        seed="17"
        result="turbulence"
      />

      {/* Transforma o ruído em mapa de deslocamento */}
      <feComponentTransfer in="turbulence" result="mapped">
        <feFuncR type="gamma" amplitude="1" exponent="10" offset="0.5" />
        <feFuncG type="gamma" amplitude="0" exponent="1" offset="0" />
        <feFuncB type="gamma" amplitude="0" exponent="1" offset="0.5" />
      </feComponentTransfer>

      {/* Suaviza o mapa */}
      <feGaussianBlur in="turbulence" stdDeviation="3" result="softMap" />

      {/* Luz especular simulando reflexo */}
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

      {/* Aplica deslocamento ao conteúdo atrás do glass */}
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
