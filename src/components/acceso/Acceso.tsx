import type { ReactNode } from "react";
import { TransicionVista } from "@/components/landing/TransicionVista";

/**
 * Raíz de las pantallas de acceso (portal, consola, recuperar, errores). Usan los
 * tokens del portal: siguen al equipo hasta que la persona elige una vista. La clase
 * `.acceso` (lienzo.css) iguala el fondo del documento y funde el cambio de vista.
 */
export function Acceso({
  children,
  className = "",
  as: Etiqueta = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "main";
}) {
  return (
    <Etiqueta className={`acceso ${className}`}>
      <TransicionVista />
      {children}
    </Etiqueta>
  );
}
