"use client";

import type { CSSProperties } from "react";
import { TextoRevelado } from "@/components/landing/TextoRevelado";
import { VideoTextura } from "@/components/landing/VideoTextura";
import { limitar, useEscenaFija } from "@/components/landing/useEscenaFija";

const TEXTO =
  "Fedesoft reúne a las empresas que escriben el código con el que Colombia trabaja, estudia, se atiende y se mueve — y que hoy empieza a mover al mundo.";
const ACENTO = "empieza a mover al mundo.";

/** Tramo del recorrido en el que se revela el texto: entra tarde y termina antes del rótulo. */
const TEXTO_DESDE = 0.06;
const TEXTO_HASTA = 0.7;

/** Ancho de la columna de metraje: el clip es 9:16 y ocupa el alto completo de la escena. */
const COLUMNA = "lg:w-[56.25dvh] lg:right-[max(4vw,calc((100vw-1240px)/2-2vw))]";

/**
 * Manifiesto como capítulo inmersivo. La escena se fija mientras el lector
 * recorre la sección y el scroll hace de línea de tiempo: el metraje se
 * acerca, el texto se enciende palabra por palabra y al final aparece el
 * rótulo. El clip trae fondo negro y se funde con `screen`, así que no hay
 * caja: las partículas flotan directamente sobre el lienzo navy.
 *
 * La línea de tiempo (`--p`, reducción de movimiento) la pone `useEscenaFija`.
 */
export function CapituloIA() {
  const { seccion, escena, avance } = useEscenaFija();
  const avanceTexto = limitar((avance - TEXTO_DESDE) / (TEXTO_HASTA - TEXTO_DESDE));

  return (
    <section ref={seccion} aria-label="Manifiesto" className="relative h-[240vh] motion-reduce:h-auto">
      <div
        ref={escena}
        className="sticky top-0 flex h-dvh items-start overflow-hidden bg-navy-abismo px-6 pt-[14vh] lg:items-center lg:pt-0"
        style={{ "--p": 0 } as CSSProperties}
      >
        {/* Halo azul detrás del rostro: crece con el acercamiento */}
        <div
          aria-hidden
          className={`pointer-events-none absolute bottom-[8%] left-1/2 aspect-square w-[80vw] -translate-x-1/2 rounded-full blur-[110px] lg:left-auto lg:translate-x-0 ${COLUMNA}`}
          style={{
            background: "radial-gradient(circle, #008BED 0%, transparent 68%)",
            opacity: "calc(0.12 + var(--p) * 0.4)",
          }}
        />

        {/* Metraje sin marco: se funde con screen sobre el fondo de la escena y se disuelve en
            los bordes. El blend va en la capa exterior: cualquier transformación crea un grupo
            aislado y el screen dejaría de ver el navy. */}
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-y-0 left-1/2 aspect-[9/16] -translate-x-1/2 opacity-60 mix-blend-screen lg:left-auto lg:translate-x-0 lg:opacity-100 ${COLUMNA}`}
        >
          <div
            className="absolute inset-0"
            style={{
              opacity: "clamp(0, calc(0.35 + var(--p) * 4), 1)",
              transform:
                "translate3d(0, calc((0.5 - var(--p)) * 5vh), 0) scale(calc(0.94 + var(--p) * 0.16))",
              transformOrigin: "50% 62%",
              // El negro del clip no es puro: el contraste lo hunde para que el screen no deje marco
              filter: "contrast(1.2)",
              maskImage: "radial-gradient(ellipse 54% 62% at 50% 56%, #000 42%, transparent 98%)",
              WebkitMaskImage: "radial-gradient(ellipse 54% 62% at 50% 56%, #000 42%, transparent 98%)",
              willChange: "transform, opacity",
            }}
          >
            <VideoTextura src="/recursos/video/ia-volumen.mp4" poster="/recursos/video/ia-volumen-poster.jpg" />
            {/* Tinte de marca: lo blanco del clip vira a azul claro, lo negro sigue negro */}
            <div className="absolute inset-0 bg-[var(--brand-azure)] opacity-50 mix-blend-multiply" />
          </div>
        </div>

        {/* En móvil el texto y el rótulo van sobre el rostro: velo arriba y abajo para que lean */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 lg:hidden"
          style={{
            background:
              "linear-gradient(180deg, var(--navy-abismo) 0%, rgba(7,20,41,0.82) 34%, rgba(7,20,41,0) 62%, rgba(7,20,41,0) 72%, rgba(7,20,41,0.9) 100%)",
          }}
        />

        {/* Fundido de salida: el borde inferior de la escena se entrega al navy de la sección siguiente */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[24vh]"
          style={{ background: "linear-gradient(180deg, rgba(7,20,41,0) 0%, var(--navy-abismo) 100%)" }}
        />

        <div className="relative z-10 mx-auto w-full max-w-[1240px]">
          <div className="flex gap-6 lg:w-[54%] lg:gap-8">
            {/* La barra, vertical: marca el avance del capítulo */}
            <div aria-hidden className="relative w-[3px] shrink-0 self-stretch bg-white/10">
              <div
                className="absolute inset-0 origin-top bg-[var(--brand-azure)]"
                style={{ transform: "scaleY(var(--p))" }}
              />
            </div>
            <TextoRevelado
              texto={TEXTO}
              acento={ACENTO}
              avance={avanceTexto}
              className="font-display text-[clamp(30px,4.6vw,62px)] font-light leading-[1.14] tracking-[-0.015em]"
            />
          </div>
        </div>

        {/* Rótulo del metraje: llega cuando el texto ya está encendido */}
        <div
          className={`absolute inset-x-6 bottom-[7vh] z-10 lg:inset-x-auto ${COLUMNA}`}
          style={{
            opacity: "clamp(0, calc((var(--p) - 0.7) * 6), 1)",
            transform: "translateY(calc((1 - clamp(0, calc((var(--p) - 0.7) * 6), 1)) * 14px))",
          }}
        >
          <div className="mx-auto max-w-[34ch] border-t border-white/15 pt-4 lg:px-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--brand-azure)]">
              Inteligencia artificial
            </p>
            <p className="mt-2 text-[14px] font-light leading-relaxed text-white/70">
              La capacidad que está redefiniendo lo que la industria colombiana puede exportar.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
