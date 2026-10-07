"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export type EstadoSofi = "reposo" | "atento" | "pensando" | "hablando" | "feliz" | "durmiendo";
type Pose = "saluda" | "explica" | "escribe" | "celebra";

/**
 * Arte oficial de Sofi: cuatro poses del robot de Fedesoft. `cabeza` es el
 * centro de la cabeza en cada imagen (fracción del ancho y del alto) y su
 * ancho relativo: con eso el avatar redondo encuadra la cara en cualquier pose.
 */
const ARTE: Record<Pose, { src: string; cabeza: { x: number; y: number; ancho: number } }> = {
  saluda: { src: "/recursos/sofi/sofi-saluda.webp", cabeza: { x: 0.534, y: 0.2, ancho: 0.47 } },
  explica: { src: "/recursos/sofi/sofi-explica.webp", cabeza: { x: 0.32, y: 0.215, ancho: 0.48 } },
  escribe: { src: "/recursos/sofi/sofi-escribe.webp", cabeza: { x: 0.444, y: 0.223, ancho: 0.51 } },
  celebra: { src: "/recursos/sofi/sofi-celebra.webp", cabeza: { x: 0.526, y: 0.207, ancho: 0.48 } },
};

const POSES = Object.keys(ARTE) as Pose[];

/** Qué hace Sofi en cada momento de la conversación. */
const POSE_DE: Record<EstadoSofi, Pose> = {
  reposo: "saluda",
  atento: "saluda",
  pensando: "escribe",
  hablando: "explica",
  feliz: "celebra",
  durmiendo: "saluda",
};

/** Fondo del arte: el mismo azul grisáceo de las imágenes, para que el marco no se note. */
const FONDO = "radial-gradient(circle at 50% 38%, #eef3fb 0%, #dfe7f5 55%, #d3dff2 100%)";

/**
 * Sofi animada: cambia de pose según el estado (saluda, escribe mientras
 * piensa, presenta al responder, celebra), flota, se inclina hacia el puntero
 * y tiene un anillo de luz que dice si está pensando o hablando.
 *
 * `modo="cabeza"` es el avatar redondo; `modo="cuerpo"`, la ilustración entera.
 * Decorativa (aria-hidden): quien la usa pone la etiqueta accesible.
 */
export function RobotSofi({
  estado = "reposo",
  modo = "cabeza",
  tamano = 64,
  interactivo = false,
}: {
  estado?: EstadoSofi;
  modo?: "cabeza" | "cuerpo";
  tamano?: number;
  interactivo?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [giro, setGiro] = useState({ x: 0, y: 0 });
  const pose = POSE_DE[estado];

  /* Se inclina hacia el puntero, con tope: un gesto, no un mareo. */
  useEffect(() => {
    if (!interactivo) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let marco = 0;
    const mover = (e: PointerEvent) => {
      cancelAnimationFrame(marco);
      marco = requestAnimationFrame(() => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        const d = Math.hypot(dx, dy) || 1;
        const fuerza = Math.min(1, d / 420);
        /* Redondeado a medio grado: sin re-render si el gesto no cambia. */
        const x = Math.round((-dy / d) * 10 * fuerza * 2) / 2;
        const y = Math.round((dx / d) * 14 * fuerza * 2) / 2;
        setGiro((g) => (g.x === x && g.y === y ? g : { x, y }));
      });
    };
    window.addEventListener("pointermove", mover, { passive: true });
    return () => {
      window.removeEventListener("pointermove", mover);
      cancelAnimationFrame(marco);
    };
  }, [interactivo]);

  const quieta = estado === "durmiendo";
  const redondo = modo === "cabeza";

  return (
    <div
      ref={ref}
      aria-hidden
      className="relative shrink-0"
      style={{ width: tamano, height: tamano, perspective: 600 }}
    >
      {/* Anillo de estado: gira mientras piensa, late mientras habla */}
      {redondo && (estado === "pensando" || estado === "hablando" || estado === "feliz") && (
        <span
          className={`absolute -inset-[3px] rounded-full ${estado === "pensando" ? "sofi-gira" : "sofi-pulso"}`}
          style={{
            background:
              estado === "pensando"
                ? "conic-gradient(from 0deg, transparent 0deg, #008BED 120deg, transparent 240deg)"
                : "radial-gradient(circle, rgba(0,139,237,0.55) 55%, transparent 72%)",
          }}
        />
      )}

      <div
        className={`relative h-full w-full ${quieta ? "" : "sofi-flota"}`}
        style={{
          transform: `rotateX(${giro.x.toFixed(2)}deg) rotateY(${giro.y.toFixed(2)}deg)`,
          transition: "transform 180ms ease-out",
          transformStyle: "preserve-3d",
        }}
      >
        <div
          className={`relative h-full w-full overflow-hidden ${redondo ? "rounded-full ring-2 ring-white/70" : "rounded-2xl"} ${
            estado === "atento" ? "sofi-saluda" : ""
          }`}
          style={{ background: FONDO, filter: quieta ? "saturate(0.55) brightness(0.92)" : undefined }}
        >
          {POSES.map((p) => {
            const { src, cabeza } = ARTE[p];
            /* Encuadre: en cabeza, la cara ocupa ~95% del círculo; en cuerpo, la imagen entera. */
            const zoom = redondo ? 0.95 / cabeza.ancho : 1;
            const estilo = redondo
              ? {
                  width: `${zoom * 100}%`,
                  height: `${zoom * 100}%`,
                  left: `calc(50% - ${cabeza.x * zoom * 100}%)`,
                  top: `calc(50% - ${cabeza.y * zoom * 100}%)`,
                }
              : { inset: 0 };
            return (
              <div
                key={p}
                className="absolute transition-opacity duration-300 ease-out"
                style={{ ...estilo, opacity: p === pose ? 1 : 0 }}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes={`${Math.round(tamano * zoom * 2)}px`}
                  className="object-cover"
                  priority={interactivo && p === "saluda"}
                />
              </div>
            );
          })}
        </div>
      </div>

      {estado === "durmiendo" && (
        <span className="sofi-zeta absolute -right-1 -top-2 font-display text-[13px] font-bold text-accent">z</span>
      )}
    </div>
  );
}
