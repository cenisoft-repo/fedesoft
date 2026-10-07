"use client";

import { useId } from "react";

export type Expresion =
  | "abiertos"
  | "habla"
  | "pensando"
  | "estrellas"
  | "dormido"
  | "escucha"
  | "confundido"
  | "triste"
  | "guino";

/* Colores medidos sobre el arte oficial: núcleo cian de los LED, halo azul y el visor. */
const NUCLEO = "#aef3ff";
const HALO = "#1f8bff";
const VISOR = ["#00081f", "#000b2a", "#021238"] as const;

/**
 * La cara LED de Sofi, en vector, sobre el visor del arte oficial.
 *
 * Coordenadas propias: los ojos en x = ±22 (44 unidades = distancia entre ojos
 * medida en cada pose), las cejas en y = -16 y la boca en y = 14. Un parche del
 * color del visor tapa la cara pintada y encima se dibujan ojos, cejas y boca
 * que pueden mirar, parpadear, hablar y cambiar de expresión.
 *
 * `mirada` desplaza ojos (y a medias las cejas) en unidades: ±4 en x, ±3 en y.
 */
export function CaraSofi({ expresion, mirada }: { expresion: Expresion; mirada: { x: number; y: number } }) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const brillo = `sofi-brillo-${id}`;
  const visor = `sofi-visor-${id}`;
  const difuso = `sofi-difuso-${id}`;
  const parpadea = expresion === "abiertos" || expresion === "escucha" || expresion === "triste" || expresion === "pensando";

  return (
    <svg viewBox="-50 -36 100 72" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden focusable="false">
      <defs>
        <filter id={brillo} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2.1" result="b" />
          <feFlood floodColor={HALO} floodOpacity="0.95" />
          <feComposite in2="b" operator="in" result="halo" />
          <feMerge>
            <feMergeNode in="halo" />
            <feMergeNode in="halo" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id={visor} cx="50%" cy="48%" r="62%">
          <stop offset="0%" stopColor={VISOR[0]} />
          <stop offset="72%" stopColor={VISOR[1]} />
          <stop offset="100%" stopColor={VISOR[2]} />
        </radialGradient>
        <filter id={difuso} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.4" />
        </filter>
      </defs>

      {/* Parche del visor: tapa la cara pintada con bordes difusos */}
      <rect x="-43" y="-28" width="86" height="57" rx="20" fill={`url(#${visor})`} filter={`url(#${difuso})`} />

      <g filter={`url(#${brillo})`} fill={NUCLEO} stroke={NUCLEO} strokeLinecap="round" strokeLinejoin="round">
        {/* key: al cambiar de expresión, la cara se enciende de nuevo con un pequeño rebote */}
        <g key={expresion} className="cara-entra">
          <Cejas expresion={expresion} mirada={mirada} />
          <g style={{ transform: `translate(${mirada.x}px, ${mirada.y}px)`, transition: "transform 160ms ease-out" }}>
            <g className={parpadea ? "cara-parpadeo" : undefined}>
              <Ojos expresion={expresion} />
            </g>
          </g>
          <Boca expresion={expresion} />
        </g>
      </g>
    </svg>
  );
}

/* Un ojo feliz: la media luna de la imagen original. */
const MEDIA_LUNA = "M-12 3.5 Q0 -10.5 12 3.5 Q0 -3.5 -12 3.5Z";
const ESTRELLA = "M0 -9.5 L2.7 -2.7 L9.5 0 L2.7 2.7 L0 9.5 L-2.7 2.7 L-9.5 0 L-2.7 -2.7Z";

function Ojos({ expresion }: { expresion: Expresion }) {
  const par = (izq: React.ReactNode, der: React.ReactNode = izq) => (
    <>
      <g transform="translate(-22 0)">{izq}</g>
      <g transform="translate(22 0)">{der}</g>
    </>
  );
  switch (expresion) {
    case "habla":
      return par(<path d={MEDIA_LUNA} stroke="none" />);
    case "estrellas":
      return par(
        <g className="cara-estrella">
          <path d={ESTRELLA} stroke="none" />
        </g>,
      );
    case "dormido":
      return par(<path d="M-10 1 Q0 5 10 1" fill="none" strokeWidth="3.2" />);
    case "pensando":
      return par(<ellipse rx="5" ry="6.2" stroke="none" />);
    case "escucha":
      return par(<ellipse rx="6.6" ry="8.4" stroke="none" />);
    case "confundido":
      return par(<ellipse rx="6.2" ry="7.6" stroke="none" />, <path d="M-8 0 L8 0" fill="none" strokeWidth="3.6" />);
    case "triste":
      return par(<ellipse rx="5.6" ry="6.6" cy="1.5" stroke="none" />);
    case "guino":
      return par(<path d={MEDIA_LUNA} stroke="none" />, <path d="M-10 1 Q0 -5 10 1" fill="none" strokeWidth="3.6" />);
    default:
      return par(<ellipse rx="6.2" ry="7.8" stroke="none" />);
  }
}

function Cejas({ expresion, mirada }: { expresion: Expresion; mirada: { x: number; y: number } }) {
  /* Cada ceja: altura y giro propios; siguen la mirada a medias. */
  const forma: Record<Expresion, [number, number, number, number]> = {
    //            y izq, giro izq, y der, giro der
    abiertos: [-17, 0, -17, 0],
    habla: [-18, 0, -18, 0],
    pensando: [-16, 4, -21, -10],
    estrellas: [-19, 0, -19, 0],
    dormido: [-13, 0, -13, 0],
    escucha: [-20, 0, -20, 0],
    confundido: [-21, 10, -14, -6],
    triste: [-17, -14, -17, 14],
    guino: [-18, 0, -15, 6],
  };
  const [yi, gi, yd, gd] = forma[expresion];
  const ceja = "M-9 0 Q0 -3.5 9 0";
  return (
    <g
      fill="none"
      strokeWidth="2.6"
      opacity="0.85"
      style={{ transform: `translate(${mirada.x / 2}px, ${mirada.y / 2}px)`, transition: "transform 160ms ease-out" }}
    >
      <path d={expresion === "dormido" ? "M-9 0 Q0 -1.5 9 0" : ceja} transform={`translate(-22 ${yi}) rotate(${gi})`} />
      <path d={expresion === "dormido" ? "M-9 0 Q0 -1.5 9 0" : ceja} transform={`translate(22 ${yd}) rotate(${gd})`} />
    </g>
  );
}

function Boca({ expresion }: { expresion: Expresion }) {
  switch (expresion) {
    case "habla":
      return (
        <g transform="translate(0 14)">
          <g className="cara-habla">
            <ellipse rx="6.8" ry="4.6" stroke="none" />
          </g>
        </g>
      );
    case "estrellas":
      return <path d="M-11 12 Q0 12 11 12 Q10 25 0 25 Q-10 25 -11 12Z" stroke="none" className="cara-risa" />;
    case "pensando":
      return (
        <g transform="translate(0 15)" stroke="none">
          {[-6, 0, 6].map((x, i) => (
            <circle key={x} cx={x} r="1.9" className="cara-punto" style={{ animationDelay: `${i * 0.16}s` }} />
          ))}
        </g>
      );
    case "dormido":
      return (
        <g transform="translate(0 15)">
          <circle r="2.6" fill="none" strokeWidth="2.2" className="cara-respira" />
        </g>
      );
    case "confundido":
      return <path d="M-8 15 Q-4 12 0 15 Q4 18 8 15" fill="none" strokeWidth="2.6" />;
    case "triste":
      return <path d="M-8 17 Q0 10 8 17" fill="none" strokeWidth="2.8" />;
    case "guino":
      return <path d="M-11 12 Q0 23 11 12 Q0 18 -11 12Z" stroke="none" />;
    case "escucha":
      return <path d="M-6 13.5 Q0 18 6 13.5" fill="none" strokeWidth="2.6" />;
    default:
      return <path d="M-9 12.5 Q0 21 9 12.5 Q0 16.5 -9 12.5Z" stroke="none" />;
  }
}
