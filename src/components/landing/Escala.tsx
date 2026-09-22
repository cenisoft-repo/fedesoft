"use client";

import { useEffect, useRef, useState } from "react";

const NIVELES = [
  { nivel: "Nivel I", texto: "Software hecho en Colombia, para Colombia" },
  { nivel: "Nivel II", texto: "Software desde Colombia, para la región" },
  { nivel: "Nivel III", texto: "Colombia, país origen de software para el mundo" },
];

/** La escala de ambición sectorial: el equivalente a la escala de Kardashev. */
export function Escala() {
  const ref = useRef<HTMLDivElement>(null);
  const [activo, setActivo] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const alScroll = () => {
      const r = el.getBoundingClientRect();
      const alto = window.innerHeight;
      const avance = (alto - r.top) / (alto * 0.9);
      setActivo(Math.min(NIVELES.length - 1, Math.max(0, Math.floor(avance * NIVELES.length))));
    };
    alScroll();
    window.addEventListener("scroll", alScroll, { passive: true });
    return () => window.removeEventListener("scroll", alScroll);
  }, []);

  return (
    <div ref={ref} className="grid gap-0">
      {NIVELES.map((n, i) => {
        const encendido = i <= activo;
        const esActual = i === activo;
        return (
          <div
            key={n.nivel}
            className="grid grid-cols-[86px_1fr] items-baseline gap-4 border-t border-white/10 py-5 transition-all duration-500 sm:grid-cols-[120px_1fr] sm:gap-6"
            style={{ opacity: encendido ? 1 : 0.28 }}
          >
            <span className="font-mono text-[12.5px] uppercase tracking-[0.12em] text-white/50">{n.nivel}</span>
            <span
              className="text-[clamp(16px,2.2vw,22px)] leading-snug transition-colors duration-500"
              style={{ color: esActual ? "#ffffff" : "rgba(255,255,255,0.62)" }}
            >
              {n.texto}
            </span>
          </div>
        );
      })}
    </div>
  );
}
