"use client";

import { useEffect, useRef, useState } from "react";

/** Margen alrededor de la pantalla dentro del cual un clip ya se considera visible. */
const MARGEN = 300;

/**
 * Metraje tratado como textura, no como protagonista. Los archivos ya vienen
 * en escala de grises: el tinte navy, la opacidad y el velo los pone quien lo
 * usa, de modo que catorce clips distintos lean como una sola familia.
 *
 * El póster se pinta desde el servidor, así que el bloque nunca aparece vacío.
 * El video se monta cuando el bloque se acerca a la pantalla —para que no
 * compitan todos por la red al cargar— y se pausa al salir. La medición usa
 * el mismo gesto de scroll que el resto de la landing. Con
 * `prefers-reduced-motion` se queda en el fotograma fijo.
 */
export function VideoTextura({
  src,
  poster,
  className = "",
}: {
  src: string;
  poster: string;
  className?: string;
}) {
  const contenedor = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    const el = contenedor.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const alScroll = () => {
      const r = el.getBoundingClientRect();
      const cerca = r.bottom > -MARGEN && r.top < window.innerHeight + MARGEN;
      if (cerca) {
        setMontado(true);
        video.current?.play().catch(() => {
          /* el navegador puede negar la reproducción: queda el póster */
        });
      } else {
        video.current?.pause();
      }
    };

    alScroll();
    window.addEventListener("scroll", alScroll, { passive: true });
    window.addEventListener("resize", alScroll);
    return () => {
      window.removeEventListener("scroll", alScroll);
      window.removeEventListener("resize", alScroll);
    };
  }, []);

  return (
    <div
      ref={contenedor}
      aria-hidden
      className={`absolute inset-0 bg-cover bg-center ${className}`}
      style={{ backgroundImage: `url(${poster})` }}
    >
      {montado && (
        <video
          ref={video}
          className="h-full w-full object-cover"
          src={src}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
      )}
    </div>
  );
}
