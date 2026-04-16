"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * LampContainer — efeito "lâmpada cinematográfica" (Aceternity UI).
 * Adaptado para tom dourado Bitcoin LADO ₿.
 *
 * Visual: duas luzes cônicas invertidas convergindo no topo, formando
 * um halo dourado + linha horizontal de luz + glow central.
 * Cara de abertura de filme, palco, ou Apple Keynote.
 */

interface LampContainerProps {
  children?: React.ReactNode;
  className?: string;
  /** Cor principal da luz. Default dourado LADO ₿. */
  color?: string;
}

export function LampContainer({
  children,
  className,
  color = "#ffc60a",
}: LampContainerProps) {
  return (
    <div
      className={cn(
        "relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950 w-full rounded-md z-0",
        className,
      )}
    >
      <div className="relative flex w-full flex-1 scale-y-125 items-center justify-center isolate z-0">
        {/* Luz cônica esquerda */}
        <motion.div
          initial={{ opacity: 0.5, width: "15rem" }}
          whileInView={{ opacity: 1, width: "30rem" }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          style={{
            backgroundImage: `conic-gradient(from 70deg at center top, ${color}, transparent, transparent)`,
          }}
          className="absolute inset-auto right-1/2 h-56 overflow-visible w-[30rem] text-white"
        >
          <div className="absolute w-[100%] left-0 bg-slate-950 h-40 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]" />
          <div className="absolute w-40 h-[100%] left-0 bg-slate-950 bottom-0 z-20 [mask-image:linear-gradient(to_right,white,transparent)]" />
        </motion.div>

        {/* Luz cônica direita */}
        <motion.div
          initial={{ opacity: 0.5, width: "15rem" }}
          whileInView={{ opacity: 1, width: "30rem" }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          style={{
            backgroundImage: `conic-gradient(from 290deg at center top, transparent, transparent, ${color})`,
          }}
          className="absolute inset-auto left-1/2 h-56 w-[30rem] text-white"
        >
          <div className="absolute w-40 h-[100%] right-0 bg-slate-950 bottom-0 z-20 [mask-image:linear-gradient(to_left,white,transparent)]" />
          <div className="absolute w-[100%] right-0 bg-slate-950 h-40 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]" />
        </motion.div>

        {/* Faixa de blur suavizando a base das luzes */}
        <div className="absolute top-1/2 h-48 w-full translate-y-12 scale-x-150 bg-slate-950 blur-2xl" />
        <div className="absolute top-1/2 z-50 h-48 w-full bg-transparent opacity-10 backdrop-blur-md" />

        {/* Halo dourado central */}
        <div
          className="absolute inset-auto z-50 h-36 w-[28rem] -translate-y-1/2 rounded-full opacity-50 blur-3xl"
          style={{ background: color }}
        />

        {/* Glow dourado concentrado */}
        <motion.div
          initial={{ width: "8rem" }}
          whileInView={{ width: "16rem" }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="absolute inset-auto z-30 h-36 w-64 -translate-y-[6rem] rounded-full blur-2xl"
          style={{ background: color }}
        />

        {/* Linha horizontal de luz (a "régua" da lâmpada) */}
        <motion.div
          initial={{ width: "15rem" }}
          whileInView={{ width: "30rem" }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="absolute inset-auto z-50 h-0.5 w-[30rem] -translate-y-[7rem]"
          style={{ background: color }}
        />

        {/* Máscara que corta a parte de cima */}
        <div className="absolute inset-auto z-40 h-44 w-full -translate-y-[12.5rem] bg-slate-950" />
      </div>

      {/* Conteúdo (fica embaixo do lamp effect) */}
      <div className="relative z-50 flex -translate-y-80 flex-col items-center px-5 w-full">
        {children}
      </div>
    </div>
  );
}

/**
 * LampBackground — apenas o efeito de lâmpada, sem wrapper de conteúdo.
 * Ideal para usar como background absoluto de uma página.
 */
export function LampBackground({
  className,
  color = "#ffc60a",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <div
      className={cn(
        "absolute inset-0 flex flex-col items-center justify-start overflow-hidden bg-slate-950 w-full h-full z-0",
        className,
      )}
    >
      <div className="relative flex w-full h-full scale-y-125 items-start justify-center isolate z-0 pt-0">
        {/* Luz cônica esquerda */}
        <motion.div
          initial={{ opacity: 0.5, width: "15rem" }}
          animate={{ opacity: 1, width: "35rem" }}
          transition={{ delay: 0.3, duration: 1, ease: "easeInOut" }}
          style={{
            backgroundImage: `conic-gradient(from 70deg at center top, ${color}, transparent, transparent)`,
          }}
          className="absolute inset-auto right-1/2 top-0 h-72 overflow-visible w-[35rem] text-white"
        >
          <div className="absolute w-[100%] left-0 bg-slate-950 h-40 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]" />
          <div className="absolute w-40 h-[100%] left-0 bg-slate-950 bottom-0 z-20 [mask-image:linear-gradient(to_right,white,transparent)]" />
        </motion.div>

        {/* Luz cônica direita */}
        <motion.div
          initial={{ opacity: 0.5, width: "15rem" }}
          animate={{ opacity: 1, width: "35rem" }}
          transition={{ delay: 0.3, duration: 1, ease: "easeInOut" }}
          style={{
            backgroundImage: `conic-gradient(from 290deg at center top, transparent, transparent, ${color})`,
          }}
          className="absolute inset-auto left-1/2 top-0 h-72 w-[35rem] text-white"
        >
          <div className="absolute w-40 h-[100%] right-0 bg-slate-950 bottom-0 z-20 [mask-image:linear-gradient(to_left,white,transparent)]" />
          <div className="absolute w-[100%] right-0 bg-slate-950 h-40 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]" />
        </motion.div>

        {/* Faixa de blur suavizando a base das luzes */}
        <div className="absolute top-64 h-48 w-full scale-x-150 bg-slate-950 blur-2xl" />

        {/* Halo dourado central */}
        <div
          className="absolute inset-x-0 mx-auto top-24 z-10 h-36 w-[32rem] rounded-full opacity-40 blur-3xl"
          style={{ background: color }}
        />

        {/* Glow dourado concentrado (núcleo) */}
        <motion.div
          initial={{ width: "8rem" }}
          animate={{ width: "18rem" }}
          transition={{ delay: 0.3, duration: 1, ease: "easeInOut" }}
          className="absolute inset-x-0 mx-auto top-20 z-20 h-36 rounded-full blur-2xl opacity-70"
          style={{ background: color }}
        />

        {/* Linha horizontal de luz (a "régua" da lâmpada) */}
        <motion.div
          initial={{ width: "15rem", opacity: 0 }}
          animate={{ width: "30rem", opacity: 1 }}
          transition={{ delay: 0.3, duration: 1, ease: "easeInOut" }}
          className="absolute inset-x-0 mx-auto top-16 z-30 h-0.5"
          style={{ background: color, boxShadow: `0 0 20px ${color}` }}
        />
      </div>
    </div>
  );
}

export default LampContainer;
