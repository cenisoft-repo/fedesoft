import type { ReactNode } from "react";
import { TransicionVista } from "./TransicionVista";

/**
 * Raíz de las páginas del lienzo (landing, afiliación, verificación). Pinta el
 * fondo y la tinta de la vista elegida —oscura por defecto, clara si la persona
 * la eligió— y, por la clase `.lienzo`, hace que el documento entero (también el
 * rebote del scroll y las barras nativas) tome el mismo fondo y esquema de color.
 */
export function Lienzo({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`lienzo min-h-dvh bg-lienzo text-lienzo-tinta ${className}`}>
      <TransicionVista />
      {children}
    </div>
  );
}
