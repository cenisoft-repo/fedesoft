/**
 * Velo del color del lienzo con la opacidad dada (0 a 1), para degradados sobre el metraje.
 * Con la vista oscura da el navy de siempre; con la clara, el fondo claro.
 */
export const velo = (alfa: number) => `color-mix(in srgb, var(--lienzo-fondo) ${Math.round(alfa * 100)}%, transparent)`;
