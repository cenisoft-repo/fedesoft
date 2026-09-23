"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Revela el texto palabra por palabra según el avance del scroll:
 * el gesto característico del referente. Las palabras pasan de apagadas
 * a plena luz a medida que la sección cruza la pantalla.
 *
 * Dentro de una escena fijada (sticky) el texto no se mueve, así que su
 * posición no sirve de medida: quien lo contiene pasa el `avance` y el
 * componente deja de escuchar el scroll.
 */
export function TextoRevelado({
  texto,
  className = "",
  acento,
  avance: avanceExterno,
}: {
  texto: string;
  className?: string;
  /** Palabras finales que se tiñen con el azul de marca. */
  acento?: string;
  /** Avance de 0 a 1 controlado desde fuera; si falta, se mide por la posición. */
  avance?: number;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [avanceMedido, setAvance] = useState(0);
  const controlado = avanceExterno !== undefined;
  const avance = controlado ? avanceExterno : avanceMedido;

  useEffect(() => {
    const el = ref.current;
    if (!el || controlado) return;

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
  }, [controlado]);

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
