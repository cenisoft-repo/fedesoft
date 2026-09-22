"use client";

import { useState } from "react";
import { MonitorPlay, X } from "lucide-react";
import { ESCENARIOS, useDemo } from "@/lib/demo";

/** Control de presentación: cambia la persona y el estado de la empresa en vivo. */
export function DemoSwitcher() {
  const { escenario, cambiarEscenario } = useDemo();
  const [abierto, setAbierto] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-40 print:hidden">
      {abierto && (
        <div
          role="dialog"
          aria-label="Modo demostración"
          className="mb-3 w-[min(92vw,360px)] overflow-hidden rounded-xl border border-line bg-surface shadow-[var(--shadow-pop)]"
        >
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="font-display text-[14px] font-bold">Modo demostración</p>
            <button
              type="button"
              onClick={() => setAbierto(false)}
              className="rounded p-1 text-muted hover:text-ink"
              aria-label="Cerrar"
            >
              <X size={16} aria-hidden />
            </button>
          </div>
          <div className="grid gap-1 p-2">
            {ESCENARIOS.map((e) => {
              const activo = e.id === escenario.id;
              return (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => cambiarEscenario(e.id)}
                  aria-pressed={activo}
                  className={`rounded-lg border px-3 py-2.5 text-left transition ${
                    activo ? "border-accent bg-[var(--info-bg)]" : "border-transparent hover:bg-bg"
                  }`}
                >
                  <p className="text-[14px] font-semibold">{e.etiqueta}</p>
                  <p className="text-[12.5px] text-muted">{e.descripcion}</p>
                  <p className="mt-1 text-[12px] italic text-muted">{e.demuestra}</p>
                </button>
              );
            })}
          </div>
          <p className="border-t border-line px-4 py-2.5 text-[12px] text-muted">
            Prototipo visual sin sistema detrás. Todos los datos son simulados.
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        className="flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2.5 text-[13.5px] font-semibold shadow-[var(--shadow-pop)] transition hover:border-accent"
      >
        <MonitorPlay size={16} className="text-accent" aria-hidden />
        <span className="hidden sm:inline">{escenario.etiqueta}</span>
        <span className="sm:hidden">Demo</span>
      </button>
    </div>
  );
}
