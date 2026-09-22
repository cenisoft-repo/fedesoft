/**
 * La landing pinta su propio lienzo: el fondo del documento se iguala al navy
 * profundo para que ni el rebote del scroll ni un viewport alto dejen ver el
 * fondo claro del portal.
 */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`html,body{background:#071429;color-scheme:dark}`}</style>
      {children}
    </>
  );
}
