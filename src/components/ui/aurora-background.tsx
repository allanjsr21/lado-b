"use client";

import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * AuroraBackground — efeito aurora boreal animado + blobs + twinkling stars.
 * Adaptado de 21st.dev para LADO ₿ (tons dourados Bitcoin).
 *
 * 3 camadas:
 *  1. Gradientes radiais pulsando (aurora)
 *  2. Blobs gigantes flutuando com blur (depth)
 *  3. Estrelinhas piscando (twinkle)
 *
 * Uso: wrapper full-screen para qualquer conteúdo.
 */

export interface AuroraBackgroundProps {
  className?: string;
  children?: React.ReactNode;
  starCount?: number;
  pulseDuration?: number;
  ariaLabel?: string;
}

export default function AuroraBackground({
  className = "",
  children,
  starCount = 60,
  pulseDuration = 10,
  ariaLabel = "Animated aurora background",
}: AuroraBackgroundProps) {
  // Stars só renderizam no client (evita mismatch de hydration com Math.random)
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const stars = useMemo(
    () =>
      Array.from({ length: starCount }).map(() => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        opacity: Math.random() * 0.9,
        duration: Math.random() * 3 + 2,
        delay: Math.random() * 5,
      })),
    [starCount],
  );

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className={cn(
        "relative flex flex-col w-full min-h-screen items-center justify-center bg-black text-slate-50 overflow-hidden",
        className,
      )}
    >
      {/* Camadas decorativas (escondidas de screen readers) */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        {/* 1. Aurora pulsante — gradientes radiais em amarelo LADO ₿ */}
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage: `
              radial-gradient(circle at 30% 30%, rgba(255, 198, 10, 0.22) 0%, transparent 70%),
              radial-gradient(circle at 70% 60%, rgba(255, 198, 10, 0.18) 0%, transparent 70%)
            `,
            backgroundSize: "100% 100%",
            animation: `aurora-pulse ${pulseDuration}s ease-in-out infinite`,
          }}
        />

        {/* 2. Blobs gigantes flutuando — criam profundidade e drama */}
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        >
          {/* Blob 1 — dourado principal (canto sup-esq) */}
          <motion.div
            className="absolute -top-1/4 -left-[15%] w-[45%] h-[45%] rounded-full filter blur-3xl opacity-45"
            style={{ background: "#ffc60a" }}
            animate={{
              x: [-40, 40, -40],
              y: [-25, 25, -25],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 28,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
            }}
          />
          {/* Blob 2 — âmbar (canto inf-dir) — equilibra o blob 1 */}
          <motion.div
            className="absolute -bottom-1/4 -right-[15%] w-[45%] h-[45%] rounded-full filter blur-3xl opacity-45"
            style={{ background: "#ffc60a" }}
            animate={{
              x: [40, -40, 40],
              y: [25, -25, 25],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 32,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
            }}
          />
          {/* Blob 3 — canto sup-dir para equilibrar ainda mais */}
          <motion.div
            className="absolute -top-1/4 -right-[10%] w-[35%] h-[35%] rounded-full filter blur-3xl opacity-30"
            style={{ background: "#ffc60a" }}
            animate={{
              x: [-20, 20, -20],
              y: [20, -20, 20],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 40,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
            }}
          />
          {/* Blob 4 — canto inf-esq para equilibrar o blob 2 */}
          <motion.div
            className="absolute -bottom-1/4 -left-[10%] w-[35%] h-[35%] rounded-full filter blur-3xl opacity-30"
            style={{ background: "#ffc60a" }}
            animate={{
              x: [20, -20, 20],
              y: [-20, 20, -20],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 38,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
            }}
          />
        </motion.div>

        {/* 3. Twinkling stars — partículas piscando (só no client) */}
        {mounted &&
          stars.map((star, i) => (
            <motion.div
              key={i}
              className="absolute w-0.5 h-0.5 bg-white rounded-full"
              initial={{
                x: `${star.x}vw`,
                y: `${star.y}vh`,
                opacity: 0,
              }}
              animate={{
                opacity: [0, star.opacity, 0],
              }}
              transition={{
                duration: star.duration,
                repeat: Infinity,
                delay: star.delay,
              }}
            />
          ))}

        {/* Vignette sutil */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50 pointer-events-none" />
      </div>

      {/* Conteúdo */}
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
