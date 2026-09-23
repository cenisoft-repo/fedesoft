"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { VideoTextura } from "@/components/landing/VideoTextura";
import { limitar, useEscenaFija } from "@/components/landing/useEscenaFija";

export interface Pieza {
  /** Se usa como título cuando la pieza no trae marca propia. */
  titulo: string;
  bajada: string;
  /** Nombre base del clip en /recursos/video. */
  video: string;
  logo?: { src: string; alto: number; w: number; h: number };
}

/** Pausa al entrar y al salir: la pista arranca y termina quieta un instante. */
const PISTA_DESDE = 0.04;
const PISTA_HASTA = 0.96;

/** Distancia (en fotogramas) dentro de la cual un clip se reproduce. */
const RADIO_ACTIVO = 1.1;

const dos = (n: number) => String(n).padStart(2, "0");

/**
 * La federación en marcha como travelling horizontal. La escena se fija y el
 * scroll vertical desplaza una pista de fotogramas de derecha a izquierda:
 * el que pasa por el foco crece, se ilumina y descubre su título; los demás
 * esperan atenuados. Dentro de cada fotograma el metraje se mueve más lento
 * que el marco (paralaje), y grano y viñeta unifican los nueve clips.
 *
 * Los clips son 640×360: por eso el fotograma ocupa dos tercios del ancho y
 * no la pantalla entera, y la gradación hace el resto. Solo se reproducen el
 * fotograma en foco y sus vecinos. Con `prefers-reduced-motion` la pista se
 * vuelve un carrusel nativo con desplazamiento lateral y fotogramas fijos.
 */
export function CapituloFederacion({ piezas, otros }: { piezas: Pieza[]; otros: string[] }) {
  const { seccion, escena, avance, quieto } = useEscenaFija();
  const ultimo = piezas.length - 1;
  const posicion = limitar((avance - PISTA_DESDE) / (PISTA_HASTA - PISTA_DESDE)) * ultimo;
  const enFoco = Math.round(posicion);

  return (
    <section
      ref={seccion}
      aria-labelledby="federacion-titulo"
      className="relative h-[500vh] motion-reduce:h-auto"
    >
      <div
        ref={escena}
        className="pista sticky top-0 flex h-dvh flex-col justify-center overflow-hidden bg-navy-abismo pt-16 lg:pt-24"
        style={
          {
            "--p": 0,
            "--n": ultimo,
            // Posición de la pista en fotogramas (0 a n), con las pausas de entrada y salida
            "--x": `calc(clamp(0, (var(--p) - ${PISTA_DESDE}) / ${(PISTA_HASTA - PISTA_DESDE).toFixed(2)}, 1) * var(--n))`,
          } as CSSProperties
        }
      >
        <div className="mx-auto flex w-full max-w-[1288px] items-end justify-between gap-8 px-6">
          <div>
            <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-white/45">La federación en marcha</p>
            <h2
              id="federacion-titulo"
              className="mt-4 max-w-[22ch] font-display text-[clamp(26px,3.4vw,44px)] font-light leading-[1.1] tracking-[-0.015em]"
            >
              Frentes, verticales e iniciativas con nombre propio
            </h2>
          </div>
          {!quieto && (
            <div aria-hidden className="hidden shrink-0 pb-1 sm:block">
              <p className="num font-mono text-[13px] tracking-[0.14em] text-white/45">
                <span className="text-white">{dos(enFoco + 1)}</span> / {dos(piezas.length)}
              </p>
              {/* La barra: avance del travelling */}
              <div className="mt-3 h-[3px] w-28 bg-white/10">
                <div
                  className="h-full origin-left bg-[var(--brand-azure)]"
                  style={{ transform: "scaleX(calc(var(--x) / var(--n)))" }}
                />
              </div>
            </div>
          )}
        </div>

        <ol
          className={`mt-8 flex gap-[var(--g)] lg:mt-10 ${quieto ? "snap-x snap-mandatory overflow-x-auto pb-4" : ""}`}
          style={{
            // El fotograma en foco queda centrado: el anterior y el siguiente asoman a los lados
            paddingLeft: "calc((100vw - var(--w)) / 2)",
            paddingRight: "calc((100vw - var(--w)) / 2)",
            transform: quieto ? undefined : "translate3d(calc(var(--x) * -1 * (var(--w) + var(--g))), 0, 0)",
            willChange: quieto ? undefined : "transform",
          }}
        >
          {piezas.map((p, i) => (
            <li
              key={p.titulo}
              className="relative aspect-[4/5] w-[var(--w)] shrink-0 snap-center overflow-hidden rounded-md bg-black sm:aspect-video"
              style={
                quieto
                  ? undefined
                  : ({
                      "--i": i,
                      // Distancia al foco, de 0 (en foco) a 1 (un fotograma o más)
                      "--d": "min(1, max(var(--x) - var(--i), var(--i) - var(--x)))",
                      transform: "scale(calc(1 - var(--d) * 0.1))",
                                            opacity: "calc(1 - var(--d) * 0.5)",
                    } as CSSProperties)
              }
            >
              {/* Metraje con paralaje: se mueve más lento que el marco */}
              <div
                aria-hidden
                className="absolute inset-0"
                style={
                  quieto
                    ? undefined
                    : {
                        transform:
                          "translate3d(calc(clamp(-1, var(--i) - var(--x), 1) * 7%), 0, 0) scale(1.16)",
                        filter: "brightness(calc(1 - var(--d) * 0.45))",
                      }
                }
              >
                <VideoTextura
                  src={`/recursos/video/${p.video}.mp4`}
                  poster={`/recursos/video/${p.video}-poster.jpg`}
                  activo={Math.abs(i - posicion) < RADIO_ACTIVO}
                  className="opacity-80"
                />
                <div className="absolute inset-0 bg-[var(--brand-azure)] opacity-[0.2] mix-blend-overlay" />
              </div>
              {/* Viñeta y velo inferior para el título */}
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(ellipse 90% 80% at 50% 40%, rgba(7,20,41,0) 40%, rgba(7,20,41,0.55) 100%), linear-gradient(180deg, rgba(7,20,41,0) 40%, rgba(7,20,41,0.94) 100%)",
                }}
              />

              <div
                className="absolute inset-x-0 bottom-0 p-5 sm:p-7 lg:p-9"
                style={
                  quieto
                    ? undefined
                    : {
                        opacity: "calc(1 - var(--d) * 1.6)",
                        transform: "translate3d(0, calc(var(--d) * 18px), 0)",
                      }
                }
              >
                <p className="num font-mono text-[11.5px] tracking-[0.18em] text-[var(--brand-azure)]">
                  {dos(i + 1)}
                </p>
                <div className="mt-3">
                  {p.logo ? (
                    <Image
                      src={p.logo.src}
                      alt={p.titulo}
                      width={Math.round((p.logo.alto * 1.5 * p.logo.w) / p.logo.h)}
                      height={Math.round(p.logo.alto * 1.5)}
                    />
                  ) : (
                    <h3 className="font-display text-[clamp(22px,2.6vw,36px)] font-light leading-[1.1] tracking-[-0.01em]">
                      {p.titulo}
                    </h3>
                  )}
                </div>
                <p className="mt-3 max-w-[40ch] text-[14px] font-light leading-relaxed text-white/70 sm:text-[15px]">
                  {p.bajada}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mx-auto mt-8 flex w-full max-w-[1288px] flex-wrap items-center gap-x-6 gap-y-2 px-6 lg:mt-10">
          <span className="font-mono text-[11.5px] uppercase tracking-[0.18em] text-white/30">Y además</span>
          {otros.map((o) => (
            <span key={o} className="text-[14px] font-light text-white/45">
              {o}
            </span>
          ))}
        </div>

        {/* Grano de película sobre toda la escena */}
        <div aria-hidden className="grano pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay" />
      </div>
    </section>
  );
}
