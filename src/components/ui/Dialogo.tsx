"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

/**
 * Diálogo modal accesible: foco atrapado, Escape cierra, el foco vuelve al
 * elemento que lo abrió y el fondo no se desplaza mientras está abierto.
 */
export function Dialogo({
  abierto,
  titulo,
  descripcion,
  onCerrar,
  children,
  pie,
}: {
  abierto: boolean;
  titulo: string;
  descripcion?: string;
  onCerrar: () => void;
  children?: ReactNode;
  pie?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  /* En un ref: si el padre pasa la función en línea, el efecto no debe
     reejecutarse en cada tecla y robarle el foco al campo. */
  const cerrarRef = useRef(onCerrar);
  useEffect(() => {
    cerrarRef.current = onCerrar;
  });
  const tituloId = useId();
  const descId = useId();

  useEffect(() => {
    if (!abierto) return;
    const previo = document.activeElement as HTMLElement | null;
    const panel = ref.current;
    const enfocables = () =>
      Array.from(
        panel?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );
    /* Primer campo si lo hay; si no, el primer botón. */
    (panel?.querySelector<HTMLElement>("input, select, textarea") ?? enfocables()[0])?.focus();

    const alTeclado = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        cerrarRef.current();
        return;
      }
      if (e.key !== "Tab") return;
      const lista = enfocables();
      if (lista.length === 0) return;
      const primero = lista[0];
      const ultimo = lista[lista.length - 1];
      if (e.shiftKey && document.activeElement === primero) {
        e.preventDefault();
        ultimo?.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primero?.focus();
      }
    };
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", alTeclado);
    return () => {
      document.removeEventListener("keydown", alTeclado);
      document.body.style.overflow = overflow;
      previo?.focus();
    };
  }, [abierto]);

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <div aria-hidden className="absolute inset-0 bg-[rgba(7,20,41,0.55)] backdrop-blur-[2px]" onClick={onCerrar} />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        aria-describedby={descripcion ? descId : undefined}
        className="relative w-full max-w-[480px] overflow-hidden rounded-2xl border border-line bg-surface shadow-[var(--shadow-pop)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            <h2 id={tituloId} className="font-display text-[18px] font-bold">{titulo}</h2>
            {descripcion && <p id={descId} className="mt-1 text-[14px] leading-relaxed text-muted">{descripcion}</p>}
          </div>
          <button type="button" onClick={onCerrar} className="rounded p-1 text-muted hover:text-ink" aria-label="Cerrar">
            <X size={18} aria-hidden />
          </button>
        </div>
        {children && <div className="px-5 py-4">{children}</div>}
        {pie && <div className="flex flex-wrap justify-end gap-2 border-t border-line bg-surface-2 px-5 py-3.5">{pie}</div>}
      </div>
    </div>
  );
}

/** Aviso en línea tras una acción: éxito o regla que lo impidió. */
export function Aviso({ ok, children }: { ok: boolean; children: ReactNode }) {
  return (
    <div
      role={ok ? "status" : "alert"}
      className={`flex items-start gap-2 rounded-lg px-3.5 py-3 text-[14px] ${ok ? "bg-success-bg text-success" : "bg-danger-bg text-danger"}`}
    >
      <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
      <p>{children}</p>
    </div>
  );
}
