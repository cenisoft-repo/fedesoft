/**
 * Las páginas públicas no comparten lienzo: la landing, /afiliarme y /verificar
 * pintan el suyo con <Lienzo> (oscuro por defecto, claro si la persona lo elige; ver
 * lienzo.css), que además iguala el fondo y el esquema de color del documento para
 * que ni el rebote del scroll ni las barras nativas delaten el otro tema. /entrar y
 * /acceso pintan con los tokens del portal y siguen al equipo hasta que se elige.
 */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
