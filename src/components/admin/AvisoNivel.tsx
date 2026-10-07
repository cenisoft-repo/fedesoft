import { useEffect, useRef } from "react";
import { Eye, Lock } from "lucide-react";
import { Aviso } from "@/components/ui/Dialogo";
import { TEXTO_NIVEL, type Nivel } from "@/lib/acceso";

/**
 * Le dice a quien opera con qué alcance ve el módulo. Con "gestiona" no se
 * muestra: es el caso normal y no necesita aviso.
 */
export function AvisoNivel({ nivel, detalle }: { nivel: Nivel | null; detalle?: string }) {
  if (!nivel || nivel === "gestiona") return null;
  const Icono = nivel === "consulta" ? Eye : Lock;
  return (
    <p className="flex items-start gap-2 rounded-lg border border-line bg-surface px-3.5 py-3 text-[14px] text-muted">
      <Icono size={15} className="mt-0.5 shrink-0 text-accent" aria-hidden />
      <span>
        <span className="font-semibold text-ink">{TEXTO_NIVEL[nivel]}.</span> {detalle}
      </span>
    </p>
  );
}

/** Barra de ocupación accesible: el número se lee, la barra solo acompaña. */
export function Ocupacion({ usados, total }: { usados: number; total: number }) {
  const pct = total > 0 ? Math.min(100, Math.round((usados / total) * 100)) : 0;
  return (
    <div className="grid gap-1">
      <span className="num text-[13px] text-muted">
        <span className="font-semibold text-ink">{usados}</span> de {total} · {pct}%
      </span>
      <span aria-hidden className="h-1.5 w-full overflow-hidden rounded-full bg-bg">
        <span
          className={`block h-full rounded-full ${pct >= 100 ? "bg-[var(--warning)]" : "bg-accent"}`}
          style={{ width: `${pct}%` }}
        />
      </span>
    </div>
  );
}

/**
 * Confirmación de una acción. Recibe el foco al aparecer: el botón que la
 * disparó suele desaparecer con la acción y, sin esto, el foco se pierde.
 */
export function AvisoEnfocado({ mensaje }: { mensaje: string | null }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (mensaje) ref.current?.focus();
  }, [mensaje]);
  if (!mensaje) return null;
  return (
    <div ref={ref} tabIndex={-1} className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-accent">
      <Aviso ok>{mensaje}</Aviso>
    </div>
  );
}
