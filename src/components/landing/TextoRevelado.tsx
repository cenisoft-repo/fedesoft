"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Revela el texto palabra por palabra según el avance del scroll:
 * el gesto característico del referente. Las palabras pasan de apagadas
 * a plena luz a medida que la sección cruza la pantalla.
 */
export function TextoRevelado({
  texto,
  className = "",
  acento,
}: {
  texto: string;
  className?: string;
  /** Palabras finales que se tiñen con el azul de marca. */
  acento?: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [avance, setAvance] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const alScroll = () => {
      const r = el.getBoundingClientRect();
      const alto = window.innerHeight;
      // 0 cuando entra por abajo, 1 cuando llega al tercio superior
      const bruto = (alto - r.top) / (alto * 0.75);
      setAvance(Math.min(1, Math.max(0, bruto)));
    };

    alScroll();
    window.addEventListener("scroll", alScroll, { passive: true });
    window.addEventListener("resize", alScroll);
    return () => {
      window.removeEventListener("scroll", alScroll);
      window.removeEventListener("resize", alScroll);
    };
  }, []);

  const palabras = texto.split(" ");
  const acentoDesde = acento ? palabras.length - acento.split(" ").length : -1;

  return (
    <p ref={ref} className={className}>
      {palabras.map((palabra, i) => {
        const umbral = i / palabras.length;
        const encendida = avance > umbral;
        const esAcento = acentoDesde >= 0 && i >= acentoDesde;
        return (
          <span
            key={i}
            style={{
              opacity: encendida ? 1 : 0.22,
              color: encendida && esAcento ? "var(--brand-azure)" : undefined,
              transition: "opacity 420ms ease, color 420ms ease",
            }}
          >
            {palabra}{" "}
          </span>
        );
      })}
    </p>
  );
}
