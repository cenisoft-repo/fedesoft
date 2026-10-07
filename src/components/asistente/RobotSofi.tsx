"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { CaraSofi, type Expresion } from "./CaraSofi";

export type EstadoSofi =
  | "reposo"
  | "atento"
  | "escuchando"
  | "pensando"
  | "hablando"
  | "feliz"
  | "guino"
  | "confundido"
  | "triste"
  | "durmiendo";
type Pose = "saluda" | "explica" | "escribe" | "celebra";
/** Escenas de cuerpo entero: saludando, trabajando en la laptop o en su centro de mando. */
export type EscenaSofi = "cuerpo" | "laptop" | "mando";

/**
 * Arte oficial de Sofi: cuatro poses del robot de Fedesoft, con su geometría
 * medida sobre cada imagen (fracciones del ancho):
 * - `cabeza`: centro y ancho relativo, para encuadrar la cara en el avatar redondo;
 * - `cara`: punto medio entre los ojos, distancia entre ojos y giro de la cabeza,
 *   para montar encima la cara LED vectorial;
 * - `frente`: la luz de la frente, que respira.
 */
const ARTE: Record<
  Pose,
  {
    src: string;
    cabeza: { x: number; y: number; ancho: number };
    cara: { x: number; y: number; d: number; giro: number };
    frente: { x: number; y: number };
  }
> = {
  saluda: {
    src: "/recursos/sofi/sofi-saluda.webp",
    cabeza: { x: 0.534, y: 0.2, ancho: 0.47 },
    cara: { x: 0.5473, y: 0.2475, d: 0.1611, giro: 5 },
    frente: { x: 0.568, y: 0.064 },
  },
  explica: {
    src: "/recursos/sofi/sofi-explica.webp",
    cabeza: { x: 0.32, y: 0.215, ancho: 0.48 },
    cara: { x: 0.353, y: 0.256, d: 0.1587, giro: -10.5 },
    frente: { x: 0.323, y: 0.076 },
  },
  escribe: {
    src: "/recursos/sofi/sofi-escribe.webp",
    cabeza: { x: 0.444, y: 0.223, ancho: 0.51 },
    cara: { x: 0.4957, y: 0.2985, d: 0.1725, giro: -1 },
    frente: { x: 0.494, y: 0.092 },
  },
  celebra: {
    src: "/recursos/sofi/sofi-celebra.webp",
    cabeza: { x: 0.526, y: 0.207, ancho: 0.48 },
    cara: { x: 0.5437, y: 0.2648, d: 0.1669, giro: 7.4 },
    frente: { x: 0.566, y: 0.067 },
  },
};

const POSES = Object.keys(ARTE) as Pose[];

/** Qué hace el cuerpo en cada momento de la conversación. */
const POSE_DE: Record<EstadoSofi, Pose> = {
  reposo: "saluda",
  atento: "saluda",
  escuchando: "saluda",
  pensando: "escribe",
  hablando: "explica",
  feliz: "celebra",
  guino: "saluda",
  confundido: "explica",
  triste: "saluda",
  durmiendo: "saluda",
};

/** Qué cara pone en cada estado. */
const CARA_DE: Record<EstadoSofi, Expresion> = {
  reposo: "abiertos",
  atento: "escucha",
  escuchando: "escucha",
  pensando: "pensando",
  hablando: "habla",
  feliz: "estrellas",
  guino: "guino",
  confundido: "confundido",
  triste: "triste",
  durmiendo: "dormido",
};

/** Gesto del cuerpo entero en cada estado (clases de globals.css). */
const GESTO_DE: Partial<Record<EstadoSofi, string>> = {
  atento: "sofi-salta",
  escuchando: "sofi-inclina",
  pensando: "sofi-teclea",
  hablando: "sofi-habla",
  feliz: "sofi-brinca",
  guino: "sofi-ladea-corto",
  confundido: "sofi-ladea",
  triste: "sofi-decae",
};

/** Cada escena: su pose, su cara, hacia dónde mira y su gesto. */
const ESCENA: Record<EscenaSofi, { pose: Pose; expresion: Expresion; mirada: { x: number; y: number }; gesto: string }> = {
  cuerpo: { pose: "saluda", expresion: "abiertos", mirada: { x: 0, y: 0.5 }, gesto: "sofi-saluda-cuerpo" },
  laptop: { pose: "escribe", expresion: "escucha", mirada: { x: 3, y: 3 }, gesto: "sofi-teclea" },
  mando: { pose: "explica", expresion: "abiertos", mirada: { x: 4, y: -1.5 }, gesto: "sofi-mando" },
};

/** Lo que brota de la laptop mientras trabaja. */
const GLIFOS = ["</>", "{ }", "✓", "01", "•••"] as const;

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

/** Lo que hace sola cuando nadie le habla: mirar alrededor, guiñar, ladear la cabeza, brincar. */
type Micro = { mirada?: { x: number; y: number }; expresion?: Expresion; gesto?: string };
const MICROS: Micro[] = [
  { mirada: { x: -4, y: -1 } },
  { mirada: { x: 4, y: -1.5 } },
  { mirada: { x: 3, y: 2.5 } },
  { expresion: "guino", gesto: "sofi-ladea-corto" },
  { gesto: "sofi-ladea-corto", mirada: { x: -2.5, y: 1 } },
  { gesto: "sofi-salta", expresion: "escucha" },
];

const QUIETA = { x: 0, y: 0 };

/** Duración y curva de la transformación del avatar (círculo ↔ escena). */
const MORFO = "650ms cubic-bezier(0.34, 1.2, 0.64, 1)";

const sinMovimiento = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Sofi animada sobre el arte oficial:
 * - una cara LED vectorial que mira al puntero, parpadea, habla con la boca,
 *   guiña, duda, se pone triste, celebra con ojos de estrella y duerme;
 * - el cuerpo cambia de pose con un rebote, flota, se inclina hacia el puntero
 *   y hace un gesto propio en cada estado (brinca, ladea, se inclina a escuchar);
 * - cuando nadie le habla, mira alrededor, guiña o brinca por su cuenta;
 * - la luz de la frente respira, las chispas celebran y el anillo dice si piensa o habla.
 *
 * `modo="cabeza"` es el avatar redondo; `modo="cuerpo"`, la ilustración entera.
 * La cara LED y las chispas se dibujan desde 40 px; más pequeña queda el arte quieto.
 * Decorativa (aria-hidden): quien la usa pone la etiqueta accesible.
 */
export function RobotSofi({
  estado = "reposo",
  modo = "cabeza",
  tamano = 64,
  interactivo = false,
  escena,
}: {
  estado?: EstadoSofi;
  modo?: "cabeza" | "cuerpo";
  tamano?: number;
  interactivo?: boolean;
  /** De cuerpo entero en una escena; manda sobre el estado mientras dura. */
  escena?: EscenaSofi;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const marco = useRef<HTMLDivElement>(null);
  const [giro, setGiro] = useState({ x: 0, y: 0 });
  const [puntero, setPuntero] = useState(QUIETA);
  const [rafaga, setRafaga] = useState(0);
  const [micro, setMicro] = useState<Micro | null>(null);
  const enEscena = escena ? ESCENA[escena] : null;
  const pose = enEscena ? enEscena.pose : POSE_DE[estado];
  const detalle = tamano >= 40;
  /* Las que se ven grandes tienen vida propia: el lanzador y la ilustración entera. */
  const viva = detalle && (interactivo || modo === "cuerpo");

  /* Los ojos siguen al puntero; el lanzador además se inclina hacia él (con tope: un gesto, no un mareo). */
  useEffect(() => {
    if (!detalle || sinMovimiento()) return;
    let cuadro = 0;
    const mover = (e: PointerEvent) => {
      cancelAnimationFrame(cuadro);
      cuadro = requestAnimationFrame(() => {
        const r = ref.current?.getBoundingClientRect();
        if (!r || r.width === 0) return;
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        const d = Math.hypot(dx, dy) || 1;
        const fuerza = Math.min(1, d / 420);
        /* Redondeado a medio punto: sin re-render si la mirada no cambia. */
        const mx = Math.round((dx / d) * 4 * Math.min(1, d / 160) * 2) / 2;
        const my = Math.round((dy / d) * 3 * Math.min(1, d / 160) * 2) / 2;
        setPuntero((p) => (p.x === mx && p.y === my ? p : { x: mx, y: my }));
        if (!interactivo) return;
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
  }, [detalle, interactivo]);

  /* Vida propia en reposo: cada pocos segundos, un gesto breve al azar. */
  useEffect(() => {
    setMicro(null);
    if (!viva || estado !== "reposo" || escena || sinMovimiento()) return;
    let espera = 0;
    let fin = 0;
    const programar = () => {
      espera = window.setTimeout(() => {
        setMicro(MICROS[Math.floor(Math.random() * MICROS.length)]);
        fin = window.setTimeout(() => {
          setMicro(null);
          programar();
        }, 1100);
      }, 3200 + Math.random() * 3800);
    };
    programar();
    return () => {
      window.clearTimeout(espera);
      window.clearTimeout(fin);
    };
  }, [viva, estado, escena]);

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
  const enReposo = !enEscena && estado === "reposo" && micro;
  const expresion = enEscena ? enEscena.expresion : enReposo && micro.expresion ? micro.expresion : CARA_DE[estado];
  const gesto = enEscena ? enEscena.gesto : enReposo && micro.gesto ? micro.gesto : GESTO_DE[estado];
  /* La mirada: hacia arriba al pensar, hacia el campo al escuchar, al frente dormida; si no, al puntero. */
  const mirada = enEscena
    ? enEscena.mirada
    : estado === "pensando"
      ? { x: 3.5, y: -3 }
      : estado === "escuchando"
        ? { x: -1, y: 3 }
        : dormida
          ? QUIETA
          : enReposo && micro.mirada
            ? micro.mirada
            : puntero;
  const hablaFuerte = estado === "hablando" || estado === "pensando" || estado === "feliz";

  return (
    <div
      ref={ref}
      aria-hidden
      className={`relative shrink-0 ${interactivo ? "sofi-aparece" : ""}`}
      style={{ width: tamano, height: tamano, perspective: 600, transition: `width ${MORFO}, height ${MORFO}` }}
    >
      {/* Anillo de estado: gira mientras piensa, late mientras habla o celebra */}
      {redondo && !escena && (estado === "pensando" || estado === "hablando" || estado === "feliz") && (
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
          {/* Cambiar de clase reinicia el gesto; sin remontar el arte (el rebote y las poses siguen vivos). */}
          <div className={`h-full w-full ${detalle ? (gesto ?? "") : ""}`}>
            <div
              ref={marco}
              className={`relative h-full w-full overflow-hidden ${redondo ? "ring-2 ring-white/70" : ""}`}
              style={{
                background: FONDO,
                filter: dormida ? "saturate(0.6) brightness(0.94)" : undefined,
                /* El círculo del avatar se vuelve un recuadro redondeado cuando entra en escena. */
                borderRadius: redondo ? (escena ? "30%" : "50%") : "1rem",
                transition: `border-radius ${MORFO}`,
              }}
            >
              {POSES.map((p) => {
                const { src, cabeza, cara, frente } = ARTE[p];
                const activa = p === pose;
                /* Encuadre: en cabeza, la cara ocupa ~95% del círculo; en cuerpo o en escena, la imagen
                   entera. Siempre con las mismas propiedades, para que el paso de uno a otro se anime
                   como una cámara que se aleja de la cara. */
                const completo = !redondo || Boolean(escena);
                const zoom = completo ? 1 : 0.95 / cabeza.ancho;
                const estilo = completo
                  ? { width: "100%", height: "100%", left: "0%", top: "0%" }
                  : {
                      width: `${zoom * 100}%`,
                      height: `${zoom * 100}%`,
                      left: `calc(50% - ${cabeza.x * zoom * 100}%)`,
                      top: `calc(50% - ${cabeza.y * zoom * 100}%)`,
                    };
                /* La cara LED: 100 unidades de ancho, 44 de ellas son la distancia entre ojos. */
                const ancho = (cara.d * 100) / 44;
                const alto = ancho * 0.72;
                return (
                  <div
                    key={p}
                    className="absolute"
                    style={{
                      ...estilo,
                      opacity: activa ? 1 : 0,
                      transition: `opacity 300ms ease-out, left ${MORFO}, top ${MORFO}, width ${MORFO}, height ${MORFO}`,
                    }}
                  >
                    <Image
                      src={src}
                      alt=""
                      fill
                      /* El lanzador cambia de tamaño al entrar en escena: un solo tamaño de imagen, sin recargas. */
                      sizes={interactivo ? "400px" : `${Math.round(tamano * zoom * 2)}px`}
                      className="object-cover"
                      priority={interactivo && p === "saluda"}
                    />
                    {activa && detalle && (
                      <>
                        <span
                          className={`absolute rounded-full ${hablaFuerte ? "sofi-frente-viva" : "sofi-frente"}`}
                          style={{
                            left: `${(frente.x - 0.022) * 100}%`,
                            top: `${(frente.y - 0.03) * 100}%`,
                            width: "4.4%",
                            height: "6%",
                          }}
                        />
                        <div
                          className="absolute"
                          style={{
                            left: `${(cara.x - ancho / 2) * 100}%`,
                            top: `${(cara.y - alto / 2) * 100}%`,
                            width: `${ancho * 100}%`,
                            height: `${alto * 100}%`,
                            transform: `rotate(${cara.giro}deg)`,
                          }}
                        >
                          <CaraSofi expresion={expresion} mirada={mirada} />
                        </div>
                        {escena && <Escenario escena={escena} tamano={tamano} />}
                      </>
                    )}
                  </div>
                );
              })}
              {/* En escena, los bordes se oscurecen hacia el navy de la marca: sin fondo blanco plano. */}
              {redondo && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background: "radial-gradient(ellipse at 50% 45%, transparent 52%, rgba(13, 35, 67, 0.42) 100%)",
                    opacity: escena ? 1 : 0,
                    transition: `opacity ${MORFO}`,
                  }}
                />
              )}
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

/**
 * Lo que se anima alrededor de Sofi en cada escena, medido sobre su imagen
 * (porcentajes del arte): la luz y los glifos de la laptop, el barrido del
 * holograma y el anillo de la mano en el centro de mando, los destellos al saludar.
 */
function Escenario({ escena, tamano }: { escena: EscenaSofi; tamano: number }) {
  if (escena === "laptop") {
    return (
      <>
        {/* La pantalla ilumina a Sofi desde detrás de la tapa */}
        <span className="escena-luz absolute rounded-full" style={{ left: "28%", top: "38%", width: "52%", height: "52%" }} />
        {/* El logo de la tapa late */}
        <span className="escena-logo absolute rounded-full" style={{ left: "74%", top: "63%", width: "12%", height: "14%" }} />
        {GLIFOS.map((g, i) => (
          <span
            key={g}
            className="escena-glifo absolute font-mono font-bold text-[#008BED]"
            style={
              {
                left: `${70 + i * 5.5}%`,
                top: "49%",
                fontSize: Math.max(8, tamano * 0.055),
                animationDelay: `${i * 0.45}s`,
                "--sube": `${-tamano * 0.24}px`,
              } as React.CSSProperties
            }
          >
            {g}
          </span>
        ))}
      </>
    );
  }
  if (escena === "mando") {
    return (
      <>
        {/* Barrido sobre el holograma */}
        <span className="absolute overflow-hidden rounded-md" style={{ left: "57%", top: "13%", width: "39%", height: "34%" }}>
          <span className="escena-barrido absolute inset-x-0 h-[18%]" />
        </span>
        {/* Esquinas del holograma que parpadean */}
        {[
          ["57%", "13%", "border-l-2 border-t-2"],
          ["93%", "11%", "border-r-2 border-t-2"],
          ["57%", "44%", "border-b-2 border-l-2"],
          ["93%", "44%", "border-b-2 border-r-2"],
        ].map(([l, t, b]) => (
          <span key={l + t} className={`escena-esquina absolute h-[3.5%] w-[3.5%] border-[#008BED] ${b}`} style={{ left: l, top: t }} />
        ))}
        {/* Anillo de datos que gira sobre la mano */}
        <span className="absolute" style={{ left: "73%", top: "50%", width: "18%", height: "10%" }}>
          <span className="block h-full w-full" style={{ transform: "scaleY(0.4)" }}>
            <span className="escena-anillo block h-full w-full rounded-full border-2 border-dashed border-[#2EA0F9]" />
          </span>
        </span>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="escena-dato absolute rounded-full bg-[#2EA0F9]"
            style={
              {
                left: `${78 + i * 4}%`,
                top: "52%",
                width: Math.max(3, tamano * 0.018),
                height: Math.max(3, tamano * 0.018),
                animationDelay: `${i * 0.5}s`,
                "--sube": `${-tamano * 0.2}px`,
              } as React.CSSProperties
            }
          />
        ))}
      </>
    );
  }
  return (
    <>
      {[
        ["10%", "30%", 0],
        ["84%", "18%", 0.5],
        ["88%", "58%", 1],
        ["6%", "70%", 1.4],
      ].map(([l, t, d]) => (
        <span
          key={String(l) + String(t)}
          className="escena-destello sofi-estrella absolute bg-[#EABC12]"
          style={{ left: l, top: t, width: "5%", height: "5%", animationDelay: `${d}s` } as React.CSSProperties}
        />
      ))}
    </>
  );
}
