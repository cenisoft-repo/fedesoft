"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export type EstadoSofi = "reposo" | "atento" | "pensando" | "hablando" | "feliz" | "durmiendo";
type Pose = "saluda" | "explica" | "escribe" | "celebra";
/** Caja en fracciones de la imagen: [izquierda, arriba, derecha, abajo]. */
type Caja = readonly [number, number, number, number];

/**
 * Arte oficial de Sofi: cuatro poses del robot de Fedesoft.
 * - `cabeza`: centro de la cabeza y su ancho relativo, para encuadrar la cara
 *   en el avatar redondo.
 * - `ojos` y `boca`: dónde están los LED de la cara, medidos sobre cada imagen;
 *   ahí parpadea y ahí se enciende la boca cuando habla.
 */
const ARTE: Record<Pose, { src: string; cabeza: { x: number; y: number; ancho: number }; ojos: readonly [Caja, Caja]; boca: Caja }> = {
  saluda: {
    src: "/recursos/sofi/sofi-saluda.webp",
    cabeza: { x: 0.534, y: 0.2, ancho: 0.47 },
    ojos: [[0.417, 0.211, 0.517, 0.27], [0.578, 0.225, 0.677, 0.284]],
    boca: [0.5, 0.283, 0.584, 0.317],
  },
  explica: {
    src: "/recursos/sofi/sofi-explica.webp",
    cabeza: { x: 0.32, y: 0.215, ancho: 0.48 },
    ojos: [[0.225, 0.241, 0.325, 0.3], [0.384, 0.211, 0.478, 0.272]],
    boca: [0.317, 0.284, 0.4, 0.322],
  },
  escribe: {
    src: "/recursos/sofi/sofi-escribe.webp",
    cabeza: { x: 0.444, y: 0.223, ancho: 0.51 },
    ojos: [[0.353, 0.27, 0.466, 0.33], [0.533, 0.267, 0.631, 0.327]],
    boca: [0.448, 0.339, 0.541, 0.369],
  },
  celebra: {
    src: "/recursos/sofi/sofi-celebra.webp",
    cabeza: { x: 0.526, y: 0.207, ancho: 0.48 },
    ojos: [[0.416, 0.227, 0.506, 0.281], [0.583, 0.245, 0.67, 0.306]],
    boca: [0.489, 0.281, 0.589, 0.348],
  },
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

/** Chispas de la celebración: dirección, distancia y color de la paleta complementaria del manual. */
const CHISPAS = [
  { a: -90, d: 1.0, c: "#008BED" },
  { a: -50, d: 0.9, c: "#EABC12" },
  { a: -15, d: 1.05, c: "#3CACC8" },
  { a: 25, d: 0.85, c: "#2EA0F9" },
  { a: 60, d: 1.0, c: "#EABC12" },
  { a: 110, d: 0.9, c: "#008BED" },
  { a: 150, d: 1.05, c: "#3CACC8" },
  { a: 195, d: 0.85, c: "#2EA0F9" },
  { a: 230, d: 1.0, c: "#EABC12" },
  { a: 265, d: 0.9, c: "#3CACC8" },
] as const;

const enCaja = ([x0, y0, x1, y1]: Caja) => ({
  left: `${x0 * 100}%`,
  top: `${y0 * 100}%`,
  width: `${(x1 - x0) * 100}%`,
  height: `${(y1 - y0) * 100}%`,
});

const sinMovimiento = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Sofi animada:
 * - cambia de pose según el estado (saluda, escribe mientras piensa, presenta
 *   al responder, celebra) con un pequeño rebote;
 * - parpadea, enciende la boca al hablar, cierra los ojos al dormirse;
 * - flota, se inclina hacia el puntero y salta cuando la miran;
 * - celebra con chispas, y su anillo de luz dice si piensa o habla.
 *
 * `modo="cabeza"` es el avatar redondo; `modo="cuerpo"`, la ilustración entera.
 * Los gestos finos (parpadeo, boca, chispas) solo se dibujan desde 40 px: más
 * pequeños no se verían y solo costarían.
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
  const marco = useRef<HTMLDivElement>(null);
  const [giro, setGiro] = useState({ x: 0, y: 0 });
  const [rafaga, setRafaga] = useState(0);
  const pose = POSE_DE[estado];
  const detalle = tamano >= 40;

  /* Se inclina hacia el puntero, con tope: un gesto, no un mareo. */
  useEffect(() => {
    if (!interactivo || sinMovimiento()) return;
    let cuadro = 0;
    const mover = (e: PointerEvent) => {
      cancelAnimationFrame(cuadro);
      cuadro = requestAnimationFrame(() => {
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
      cancelAnimationFrame(cuadro);
    };
  }, [interactivo]);

  /* Rebote al cambiar de pose o al despertar: se nota que reacciona. */
  const previo = useRef({ pose, estado });
  useEffect(() => {
    const antes = previo.current;
    previo.current = { pose, estado };
    const cambio = antes.pose !== pose || (antes.estado === "durmiendo" && estado !== "durmiendo");
    if (!cambio || sinMovimiento()) return;
    marco.current?.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(0.93) translateY(2px)" },
        { transform: "scale(1.04) translateY(-3px)" },
        { transform: "scale(1)" },
      ],
      { duration: 460, easing: "cubic-bezier(0.34, 1.56, 0.64, 1)" },
    );
  }, [pose, estado]);

  /* Cada celebración lanza una ráfaga nueva de chispas. */
  useEffect(() => {
    if (estado === "feliz") setRafaga((n) => n + 1);
  }, [estado]);

  const dormida = estado === "durmiendo";
  const redondo = modo === "cabeza";
  /* Flotan el lanzador y la ilustración entera; los avatares de los mensajes quedan quietos. */
  const flota = interactivo || modo === "cuerpo";
  /* Instancias desfasadas: varias Sofi en pantalla no parpadean al unísono. */
  const desfase = `${((tamano * 7) % 23) / 10}s`;

  return (
    <div ref={ref} aria-hidden className="relative shrink-0" style={{ width: tamano, height: tamano, perspective: 600 }}>
      {/* Anillo de estado: gira mientras piensa, late mientras habla o celebra */}
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

      {/* Capas de movimiento separadas: la animación de una no pisa la transformación de otra. */}
      <div
        className="relative h-full w-full"
        style={{
          transform: `rotateX(${giro.x.toFixed(2)}deg) rotateY(${giro.y.toFixed(2)}deg)`,
          transition: "transform 180ms ease-out",
          transformStyle: "preserve-3d",
        }}
      >
        <div className={`h-full w-full ${dormida ? "sofi-respira" : flota ? "sofi-flota" : ""}`}>
          <div
            className={`h-full w-full ${estado === "atento" ? "sofi-salta" : estado === "pensando" ? "sofi-teclea" : ""}`}
          >
            <div
              ref={marco}
              className={`relative h-full w-full overflow-hidden ${redondo ? "rounded-full ring-2 ring-white/70" : "rounded-2xl"}`}
              style={{ background: FONDO, filter: dormida ? "saturate(0.6) brightness(0.94)" : undefined }}
            >
              {POSES.map((p) => {
                const { src, cabeza, ojos, boca } = ARTE[p];
                const activa = p === pose;
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
                    style={{ ...estilo, opacity: activa ? 1 : 0 }}
                  >
                    <Image
                      src={src}
                      alt=""
                      fill
                      sizes={`${Math.round(tamano * zoom * 2)}px`}
                      className="object-cover"
                      priority={interactivo && p === "saluda"}
                    />
                    {activa && detalle && (
                      <>
                        {ojos.map((o, i) => (
                          <span
                            key={i}
                            className={`sofi-parpado absolute ${dormida ? "sofi-parpado-cerrado" : ""}`}
                            style={{ ...enCaja(o), animationDelay: desfase }}
                          />
                        ))}
                        {estado === "hablando" && <span className="sofi-boca absolute" style={enCaja(boca)} />}
                        {(estado === "atento" || estado === "feliz") &&
                          ojos.map((o, i) => <span key={`b${i}`} className="sofi-brillo absolute" style={enCaja(o)} />)}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Chispas de celebración, fuera del marco para que vuelen alrededor */}
      {estado === "feliz" && detalle && (
        <span key={rafaga} className="pointer-events-none absolute inset-0">
          {CHISPAS.map((c, i) => {
            const rad = (c.a * Math.PI) / 180;
            const dist = tamano * 0.62 * c.d;
            return (
              <span
                key={i}
                className={`sofi-chispa absolute left-1/2 top-1/2 ${i % 2 ? "rounded-full" : "sofi-estrella"}`}
                style={
                  {
                    width: Math.max(5, tamano * 0.075),
                    height: Math.max(5, tamano * 0.075),
                    background: c.c,
                    "--dx": `${Math.cos(rad) * dist}px`,
                    "--dy": `${Math.sin(rad) * dist}px`,
                    animationDelay: `${(i % 3) * 40}ms`,
                  } as React.CSSProperties
                }
              />
            );
          })}
        </span>
      )}

      {dormida && (
        <>
          <span className="sofi-zeta absolute -right-1 -top-2 font-display text-[13px] font-bold text-accent">z</span>
          <span
            className="sofi-zeta absolute -right-3 -top-5 font-display text-[10px] font-bold text-accent"
            style={{ animationDelay: "1.2s" }}
          >
            z
          </span>
        </>
      )}
    </div>
  );
}
