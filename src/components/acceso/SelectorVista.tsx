import { BotonTema } from "@/components/BotonTema";

/**
 * Selector de vista clara/oscura para las pantallas de acceso que pintan con los
 * tokens del portal: sin elección siguen al equipo, igual que el resto del portal,
 * y la elección se recuerda para todo el sitio. Va en la esquina superior derecha
 * de la columna de contenido, que debe ser `relative`.
 */
export function SelectorVista() {
  return (
    <div className="absolute right-3 top-3 z-10 sm:right-5 sm:top-5">
      <BotonTema className="rounded-full p-2 text-muted transition hover:bg-bg hover:text-ink" />
    </div>
  );
}
