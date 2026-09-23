import { limitar } from "@/components/landing/useEscenaFija";

const NIVELES = [
  { nivel: "Nivel I", texto: "Software hecho en Colombia, para Colombia" },
  { nivel: "Nivel II", texto: "Software desde Colombia, para la región" },
  { nivel: "Nivel III", texto: "Colombia, país origen de software para el mundo" },
];

/**
 * La escala de ambición sectorial: el equivalente a la escala de Kardashev.
 * El avance (0 a 1) lo pone la escena que la contiene: cada nivel ocupa un
 * tercio del recorrido y la barra azul se llena sobre el nivel en curso.
 */
export function Escala({ avance }: { avance: number }) {
  const total = NIVELES.length;
  const actual = Math.min(total - 1, Math.floor(avance * total));

  return (
    <ol className="grid gap-0">
      {NIVELES.map((n, i) => {
        const encendido = i <= actual;
        const esActual = i === actual;
        return (
          <li
            key={n.nivel}
            aria-current={esActual ? "step" : undefined}
            className="relative grid grid-cols-[86px_1fr] items-baseline gap-4 border-t border-white/10 py-5 transition-opacity duration-500 sm:grid-cols-[120px_1fr] sm:gap-6"
            style={{ opacity: encendido ? 1 : 0.28 }}
          >
            {/* La barra: recorre el borde del nivel mientras se asciende a él */}
            <span
              aria-hidden
              className="absolute -top-px left-0 h-[2px] w-full origin-left bg-[var(--brand-azure)] transition-transform duration-300 ease-out"
              style={{ transform: `scaleX(${limitar(avance * total - i)})` }}
            />
            <span className="font-mono text-[12.5px] uppercase tracking-[0.12em] text-white/50">{n.nivel}</span>
            <span
              className="text-[clamp(16px,2.2vw,22px)] leading-snug transition-colors duration-500"
              style={{ color: esActual ? "#ffffff" : "rgba(255,255,255,0.62)" }}
            >
              {n.texto}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
