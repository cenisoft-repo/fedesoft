"use client";

import { useEffect, useRef, useState } from "react";

export const limitar = (v: number) => Math.min(1, Math.max(0, v));

/**
 * Motor de los capítulos inmersivos: una sección alta con una escena fijada
 * (sticky) cuyo recorrido de scroll se vuelve una línea de tiempo de 0 a 1.
 *
 * El avance se escribe en la variable CSS `--p` de la escena, sin pasar por
 * React, para que las transformaciones corran a la tasa del navegador; el
 * estado solo se actualiza cuantizado a centésimas, una vez por cuadro.
 * Con `prefers-reduced-motion` la escena queda en 1: completa y quieta.
 */
export function useEscenaFija() {
  const seccion = useRef<HTMLElement>(null);
  const escena = useRef<HTMLDivElement>(null);
  const [avance, setAvance] = useState(0);
  /** Verdadero con `prefers-reduced-motion`: la escena no se fija ni anima. */
  const [quieto, setQuieto] = useState(false);

  useEffect(() => {
    const el = seccion.current;
    const lienzo = escena.current;
    if (!el || !lienzo) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      lienzo.style.setProperty("--p", "1");
      setAvance(1);
      setQuieto(true);
      return;
    }

    let raf = 0;
    const medir = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const recorrido = r.height - window.innerHeight;
      const p = recorrido > 0 ? limitar(-r.top / recorrido) : 1;
      lienzo.style.setProperty("--p", p.toFixed(4));
      setAvance(Math.round(p * 100) / 100);
    };
    const alScroll = () => {
      if (!raf) raf = requestAnimationFrame(medir);
    };

    medir();
    window.addEventListener("scroll", alScroll, { passive: true });
    window.addEventListener("resize", alScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", alScroll);
      window.removeEventListener("resize", alScroll);
    };
  }, []);

  return { seccion, escena, avance, quieto };
}
