import type { ReactNode } from "react";

/* ── La barra: el gesto del wordmark ───────────────────────────────── */
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="barra flex items-center gap-2.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">
      {children}
    </p>
  );
}

/* ── Tarjeta ───────────────────────────────────────────────────────── */
export function Card({
  children,
  className = "",
  destacada = false,
}: {
  children: ReactNode;
  className?: string;
  destacada?: boolean;
}) {
  return (
    <div
      className={`rounded-[10px] border bg-surface shadow-[var(--shadow-card)] ${
        destacada ? "border-t-[3px] border-t-accent" : ""
      } ${className}`}
    >
      {children}
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
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[12.5px] font-semibold ${TONOS[tono]}`}
    >
      {children}
    </span>
  );
}

/* ── Botones ───────────────────────────────────────────────────────── */
type Variante = "primario" | "secundario" | "fantasma" | "peligro";

const VARIANTES: Record<Variante, string> = {
  primario: "bg-[var(--azure-700)] text-white hover:brightness-110",
  secundario: "border border-line bg-surface text-ink hover:bg-bg",
  fantasma: "text-link hover:bg-[var(--azure-100)]",
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
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
        tamano === "sm" ? "px-3 py-1.5 text-[13.5px]" : "px-4 py-2.5 text-[15px]"
      } ${VARIANTES[variante]} ${className}`}
    >
      {children}
    </button>
  );
}

/* ── Estado vacío ──────────────────────────────────────────────────── */
export function Vacio({ titulo, detalle, accion }: { titulo: string; detalle: string; accion?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
      <p className="font-display text-[17px] font-bold">{titulo}</p>
      <p className="max-w-[46ch] text-[14.5px] text-muted">{detalle}</p>
      {accion ? <div className="mt-2">{accion}</div> : null}
    </div>
  );
}

/* ── Encabezado de página ──────────────────────────────────────────── */
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
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
      <div className="grid gap-2">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="text-[clamp(26px,4vw,34px)] font-extrabold leading-tight">{titulo}</h1>
        {lede ? <p className="max-w-[62ch] text-[16.5px] text-muted">{lede}</p> : null}
      </div>
      {acciones ? <div className="flex flex-wrap gap-2">{acciones}</div> : null}
    </header>
  );
}
