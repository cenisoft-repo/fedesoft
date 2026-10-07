"use client";

import { useEffect, useId, useRef, useState } from "react";

export type EstadoMascota = "reposo" | "atento" | "pensando" | "hablando" | "feliz" | "durmiendo";

/**
 * Sofi, la mascota de la asistente. Identidad Fedesoft: cuerpo navy, ojos en
 * azure y la barra del wordmark como boca. Los ojos siguen el puntero, parpadea
 * sola y cambia de gesto según lo que pasa en la conversación.
 *
 * Es decorativa (aria-hidden): quien la usa pone la etiqueta accesible.
 */
export function Mascota({
  estado = "reposo",
  tamano = 64,
  seguirPuntero = true,
  flotar = true,
}: {
  estado?: EstadoMascota;
  tamano?: number;
  seguirPuntero?: boolean;
  flotar?: boolean;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const [mirada, setMirada] = useState({ x: 0, y: 0 });
  const uid = useId().replace(/:/g, "");

  /* Los ojos miran hacia el puntero, con un tope para que no se salgan del visor. */
  useEffect(() => {
    if (!seguirPuntero) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let marco = 0;
    const mover = (e: PointerEvent) => {
      cancelAnimationFrame(marco);
      marco = requestAnimationFrame(() => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height * 0.45);
        const d = Math.hypot(dx, dy) || 1;
        const fuerza = Math.min(1, d / 260);
        setMirada({ x: (dx / d) * 4.5 * fuerza, y: (dy / d) * 3.2 * fuerza });
      });
    };
    window.addEventListener("pointermove", mover, { passive: true });
    return () => {
      window.removeEventListener("pointermove", mover);
      cancelAnimationFrame(marco);
    };
  }, [seguirPuntero]);

  /* Pensando mira arriba a un lado; dormida o feliz no sigue el puntero. */
  const ojo =
    estado === "pensando" ? { x: 3.5, y: -3 } : estado === "durmiendo" || estado === "feliz" ? { x: 0, y: 0 } : mirada;

  const cuerpo = `sofi-cuerpo-${uid}`;
  const brillo = `sofi-brillo-${uid}`;
  const resplandor = `sofi-resplandor-${uid}`;

  return (
    <svg
      ref={ref}
      viewBox="0 0 120 124"
      width={tamano}
      height={(tamano * 124) / 120}
      aria-hidden
      focusable="false"
      className={flotar && estado !== "durmiendo" ? "sofi-flota" : undefined}
      style={{ overflow: "visible" }}
    >
      <defs>
        <linearGradient id={cuerpo} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a4a86" />
          <stop offset="55%" stopColor="#0D2343" />
          <stop offset="100%" stopColor="#0a1c38" />
        </linearGradient>
        <linearGradient id={brillo} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <filter id={resplandor} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Sombra en el piso */}
      <ellipse cx="60" cy="119" rx="26" ry="3.5" fill="#071429" opacity="0.18" />

      <g className={estado === "feliz" ? "sofi-saluda" : undefined}>
        {/* Antena con la luz de estado */}
        <line x1="60" y1="24" x2="60" y2="12" stroke="#11428a" strokeWidth="3.5" strokeLinecap="round" />
        <circle
          cx="60"
          cy="9"
          r="5.5"
          fill="#008BED"
          filter={`url(#${resplandor})`}
          className={estado === "pensando" ? "sofi-antena-rapida" : estado === "durmiendo" ? undefined : "sofi-antena"}
          opacity={estado === "durmiendo" ? 0.35 : 1}
        />

        {/* Cuerpo: hombros con la barra de la marca al pecho */}
        <rect x="34" y="88" width="52" height="26" rx="13" fill={`url(#${cuerpo})`} />
        <rect x="50" y="99" width="20" height="4" rx="2" fill="#008BED" opacity="0.9" />

        {/* Orejas */}
        <rect x="9" y="45" width="12" height="24" rx="6" fill="#11428a" />
        <rect x="99" y="45" width="12" height="24" rx="6" fill="#11428a" />

        {/* Cabeza */}
        <rect x="17" y="22" width="86" height="70" rx="28" fill={`url(#${cuerpo})`} />
        <rect x="17" y="22" width="86" height="34" rx="28" fill={`url(#${brillo})`} />
        <rect x="17.75" y="22.75" width="84.5" height="68.5" rx="27.25" fill="none" stroke="#ffffff" strokeOpacity="0.14" strokeWidth="1.5" />

        {/* Visor */}
        <rect x="27" y="35" width="66" height="44" rx="19" fill="#071429" />

        {/* Ojos */}
        <g style={{ transform: `translate(${ojo.x.toFixed(2)}px, ${ojo.y.toFixed(2)}px)`, transition: "transform 120ms ease-out" }}>
          {estado === "feliz" ? (
            <g stroke="#008BED" strokeWidth="3.6" strokeLinecap="round" fill="none" filter={`url(#${resplandor})`}>
              <path d="M40 57 q6 -8 12 0" />
              <path d="M68 57 q6 -8 12 0" />
            </g>
          ) : estado === "durmiendo" ? (
            <g stroke="#008BED" strokeWidth="3" strokeLinecap="round" opacity="0.7">
              <line x1="40" y1="56" x2="52" y2="56" />
              <line x1="68" y1="56" x2="80" y2="56" />
            </g>
          ) : (
            <g filter={`url(#${resplandor})`}>
              <rect
                className="sofi-parpadeo"
                x="40.5"
                y={estado === "atento" ? 45 : 47}
                width="11"
                height={estado === "atento" ? 17 : 15}
                rx="5.5"
                fill="#008BED"
              />
              <rect
                className="sofi-parpadeo"
                x="68.5"
                y={estado === "atento" ? 45 : 47}
                width="11"
                height={estado === "atento" ? 17 : 15}
                rx="5.5"
                fill="#008BED"
              />
              <circle cx="49" cy="50" r="1.8" fill="#ffffff" opacity="0.85" />
              <circle cx="77" cy="50" r="1.8" fill="#ffffff" opacity="0.85" />
            </g>
          )}
        </g>

        {/* Boca: la barra del wordmark */}
        <rect
          className={estado === "hablando" ? "sofi-habla" : undefined}
          x={estado === "feliz" ? 50 : 53}
          y="67"
          width={estado === "feliz" ? 20 : 14}
          height="3.6"
          rx="1.8"
          fill="#008BED"
          opacity={estado === "durmiendo" ? 0.45 : 1}
        />
      </g>

      {estado === "durmiendo" && (
        <text x="92" y="24" className="sofi-zeta" fill="#008BED" fontSize="13" fontWeight="700" fontFamily="var(--font-montserrat)">
          z
        </text>
      )}
    </svg>
  );
}
