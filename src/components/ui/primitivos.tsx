import type { ReactNode } from "react";

/* ── La barra: el gesto del wordmark ───────────────────────────────── */
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="barra flex items-center gap-3 text-[11.5px] font-semibold uppercase tracking-[0.16em] text-muted">
      {children}
    </p>
  );
}

/* ── Superficie ────────────────────────────────────────────────────────
   Por defecto casi no se nota: el aire hace la separación, no el borde.
   `destacada` es el único énfasis permitido por pantalla.               */
export function Card({
  children,
  className = "",
  destacada = false,
  plana = false,
}: {
  children: ReactNode;
  className?: string;
  destacada?: boolean;
  /** Sin borde ni sombra: solo un cambio de superficie. */
  plana?: boolean;
}) {
  const base = plana
    ? "bg-surface"
    : "border border-line bg-surface shadow-[var(--shadow-card)]";
  return (
    <div className={`rounded-xl ${base} ${destacada ? "border-t-[3px] border-t-accent" : ""} ${className}`}>
      {children}
    </div>
  );
}

/* ── Cifra protagonista ────────────────────────────────────────────────
   Montserrat liviana y grande: el número es lo que la gente mira.        */
export function Cifra({
  valor,
  etiqueta,
  detalle,
  tamano = "md",
}: {
  valor: string;
  etiqueta?: string;
  detalle?: string;
  tamano?: "sm" | "md" | "lg";
}) {
  const escala = { sm: "text-[28px]", md: "text-[40px]", lg: "text-[clamp(40px,5vw,58px)]" }[tamano];
  return (
    <div>
      {etiqueta && (
        <p className="text-[11.5px] font-semibold uppercase tracking-[0.16em] text-muted">{etiqueta}</p>
      )}
      <p className={`num mt-2 font-display font-light leading-none tracking-[-0.03em] ${escala}`}>{valor}</p>
      {detalle && <p className="mt-2.5 max-w-[38ch] text-[14px] leading-relaxed text-muted">{detalle}</p>}
    </div>
  );
}

/* ── Chips de estado ───────────────────────────────────────────────── */
type Tono = "exito" | "aviso" | "error" | "info" | "neutro";

const TONOS: Record<Tono, string> = {
  exito: "bg-success-bg text-success",
  aviso: "bg-warning-bg text-warning",
  error: "bg-danger-bg text-danger",
  info: "bg-info-bg text-info",
  neutro: "border border-line text-muted",
};

export function Chip({ tono = "neutro", children }: { tono?: Tono; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[12.5px] font-semibold ${TONOS[tono]}`}
    >
      {children}
    </span>
  );
}

/* ── Botones ───────────────────────────────────────────────────────── */
type Variante = "primario" | "secundario" | "fantasma" | "peligro";

const VARIANTES: Record<Variante, string> = {
  primario: "bg-[var(--navy-700)] text-white hover:brightness-115",
  secundario: "border border-line bg-surface text-ink hover:border-accent",
  fantasma: "text-link hover:bg-info-bg",
  peligro: "bg-danger text-white hover:brightness-110",
};

export function Boton({
  children,
  variante = "primario",
  tamano = "md",
  className = "",
  ...props
}: {
  children: ReactNode;
  variante?: Variante;
  tamano?: "sm" | "md";
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
        tamano === "sm" ? "px-4 py-2 text-[13.5px]" : "px-5 py-2.5 text-[15px]"
      } ${VARIANTES[variante]} ${className}`}
    >
      {children}
    </button>
  );
}

/* ── Estado vacío ──────────────────────────────────────────────────── */
export function Vacio({ titulo, detalle, accion }: { titulo: string; detalle: string; accion?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2.5 px-6 py-16 text-center">
      <p className="font-display text-[18px] font-semibold">{titulo}</p>
      <p className="max-w-[46ch] text-[14.5px] leading-relaxed text-muted">{detalle}</p>
      {accion ? <div className="mt-2">{accion}</div> : null}
    </div>
  );
}

/* ── Encabezado de página ───────────────────────────────────────────── */
export function PageHeader({
  eyebrow,
  titulo,
  lede,
  acciones,
}: {
  eyebrow: string;
  titulo: string;
  lede?: string;
  acciones?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-6 pb-2">
      <div className="grid gap-3">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="max-w-[20ch] font-display text-[clamp(30px,4.4vw,44px)] font-light leading-[1.08]">
          {titulo}
        </h1>
        {lede ? <p className="max-w-[62ch] text-[16.5px] leading-relaxed text-muted">{lede}</p> : null}
      </div>
      {acciones ? <div className="flex flex-wrap gap-2 pb-1">{acciones}</div> : null}
    </header>
  );
}

/* ── Título de sección ─────────────────────────────────────────────── */
export function Seccion({ titulo, extra }: { titulo: string; extra?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-3">
      <h2 className="font-display text-[21px] font-semibold tracking-[-0.01em]">{titulo}</h2>
      {extra}
    </div>
  );
}
