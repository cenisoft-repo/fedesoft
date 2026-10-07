"use client";

import { Moon, Sun } from "lucide-react";
import { useTema, type Tema } from "@/lib/tema";

/**
 * Vista clara u oscura. El ícono anuncia la vista a la que se pasa; la
 * elección vale para todo el sitio y se recuerda en este navegador.
 *
 * `predeterminado`: la vista de la superficie cuando nadie ha elegido.
 */
export function BotonTema({ predeterminado, className }: { predeterminado?: Tema; className?: string }) {
  const { tema, alternar } = useTema(predeterminado);
  const siguiente = tema === "oscuro" ? "clara" : "oscura";
  return (
    <button
      type="button"
      onClick={alternar}
      aria-label={`Cambiar a vista ${siguiente}`}
      title={`Vista ${siguiente}`}
      className={
        className ?? "rounded-lg p-2 text-muted transition hover:bg-bg hover:text-ink"
      }
    >
      {/* key: el ícono entra girando cada vez que cambia */}
      <span key={tema} className="tema-entra block">
        {tema === "oscuro" ? <Sun size={18} aria-hidden /> : <Moon size={18} aria-hidden />}
      </span>
    </button>
  );
}
