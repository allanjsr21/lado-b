"use client";

import React, { useState, useEffect, CSSProperties } from "react";

/**
 * BackgroundScene — beams de luz subindo do chão com coluna central + floor glow.
 * Adaptado de 21st.dev para LADO ₿ (dourado Bitcoin).
 *
 * Estrutura DOM (estilizada em globals.css):
 *  .scene                      → container fullscreen com perspective + grid
 *  .floor                      → glow pulsante na base
 *  .main-column                → coluna vertical luminosa central
 *  .light-stream-container     → wrapper dos beams
 *  .light-beam                 → cada beam individual (rise + fade + drop)
 *
 * TODO (time de tech): as classes CSS estão em globals.css (seção "aurora-scene").
 */

export interface BackgroundSceneProps {
  /** Número de beams animados (padrão 60) */
  beamCount?: number;
  /** Classe extra opcional no wrapper */
  className?: string;
}

const BACKGROUND_BEAM_COUNT = 60;

const BackgroundScene: React.FC<BackgroundSceneProps> = ({
  beamCount = BACKGROUND_BEAM_COUNT,
  className = "",
}) => {
  const [beams, setBeams] = useState<
    Array<{ id: number; style: CSSProperties }>
  >([]);

  // Gera beams só no client (evita hydration mismatch por conta de Math.random)
  useEffect(() => {
    const generated = Array.from({ length: beamCount }).map((_, i) => {
      const riseDur = Math.random() * 2 + 4; // 4–6s subida
      const fadeDur = riseDur; // fade em sync com subida
      const dropDur = Math.random() * 3 + 3; // 3–6s queda

      return {
        id: i,
        style: {
          left: `${Math.random() * 100}%`,
          width: `${Math.floor(Math.random() * 3) + 1}px`,
          animationDelay: `${Math.random() * 5}s`,
          animationDuration: `${riseDur}s, ${fadeDur}s, ${dropDur}s`,
        } as CSSProperties,
      };
    });
    setBeams(generated);
  }, [beamCount]);

  return (
    <div
      className={`scene ${className}`}
      role="img"
      aria-label="Animated digital data background"
    >
      <div className="floor" />
      <div className="main-column" />
      <div className="light-stream-container">
        {beams.map((beam) => (
          <div key={beam.id} className="light-beam" style={beam.style} />
        ))}
      </div>
    </div>
  );
};

export default BackgroundScene;
