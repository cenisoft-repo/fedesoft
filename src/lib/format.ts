/** Formatos colombianos usados en todo el portal. */

export function cop(amount: number): string {
  return "$ " + new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(amount);
}

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

/** `2026-09-30` → `30 sep 2026` */
export function fecha(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MESES[m - 1]} ${y}`;
}

/** Días entre hoy (fecha de referencia del prototipo) y una fecha ISO. */
export const HOY = "2026-09-22";

export function diasHasta(iso: string): number {
  const ms = new Date(iso).getTime() - new Date(HOY).getTime();
  return Math.round(ms / 86_400_000);
}

/** Trunca un identificador largo (CUFE) conservando inicio y fin. */
export function truncar(valor: string, inicio = 12, fin = 8): string {
  if (valor.length <= inicio + fin + 1) return valor;
  return `${valor.slice(0, inicio)}…${valor.slice(-fin)}`;
}
