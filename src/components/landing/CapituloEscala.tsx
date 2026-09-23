"use client";

import type { CSSProperties } from "react";
import { Escala } from "@/components/landing/Escala";
import { VideoTextura } from "@/components/landing/VideoTextura";
import { limitar, useEscenaFija } from "@/components/landing/useEscenaFija";

/** Tramo del recorrido en el que se asciende por los tres niveles. */
const ESCALA_DESDE = 0.1;
const ESCALA_HASTA = 0.9;

/**
 * La escala de ambición como segundo capítulo inmersivo, con el mismo motor
 * que el manifiesto. Mientras la escena está fijada el lector asciende nivel
 * por nivel, y el metraje responde: arranca cerrado y velado y, a medida que
 * la ambición crece, se abre (la cámara se aleja) y el rostro gana luz.
 */
export function CapituloEscala() {
  const { seccion, escena, avance } = useEscenaFija();
  const avanceEscala = limitar((avance - ESCALA_DESDE) / (ESCALA_HASTA - ESCALA_DESDE));

  return (
    <section ref={seccion} aria-labelledby="escala-titulo" className="relative h-[240vh] motion-reduce:h-auto">
      <div
        ref={escena}
        className="sticky top-0 flex h-dvh items-center overflow-hidden bg-navy-abismo px-6"
        style={{ "--p": 0 } as CSSProperties}
      >
        {/* Metraje a sangre: se abre y se ilumina con el avance */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            opacity: "calc(0.3 + var(--p) * 0.65)",
            transform: "scale(calc(1.16 - var(--p) * 0.16))",
            transformOrigin: "62% 45%",
            willChange: "transform, opacity",
          }}
        >
          <VideoTextura src="/recursos/video/rostro-datos.mp4" poster="/recursos/video/rostro-datos-poster.jpg" />
          <div className="absolute inset-0 bg-[var(--brand-azure)] opacity-[0.22] mix-blend-overlay" />
        </div>

        {/* El velo entra por la izquierda, donde vive el texto, y cede un poco al final */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, var(--navy-abismo) 0%, rgba(7,20,41,0.92) 32%, rgba(7,20,41,0.45) 62%, rgba(7,20,41,0.1) 100%)",
            opacity: "calc(1 - var(--p) * 0.2)",
          }}
        />
        {/* Fundidos de entrada y salida con el navy de las secciones vecinas */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, var(--navy-abismo) 0%, rgba(7,20,41,0) 22%, rgba(7,20,41,0) 76%, var(--navy-abismo) 100%)",
          }}
        />

        <div className="relative z-10 mx-auto w-full max-w-[1240px]">
          <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-white/45">La escala de la industria</p>
          <h2
            id="escala-titulo"
            className="mt-5 max-w-[16ch] font-display text-[clamp(34px,5.4vw,66px)] font-light leading-[1.06] tracking-[-0.015em]"
          >
            Aspiramos a ser un país origen de software
          </h2>
          <div className="mt-12 max-w-[680px]">
            <Escala avance={avanceEscala} />
          </div>
        </div>
      </div>
    </section>
  );
}
