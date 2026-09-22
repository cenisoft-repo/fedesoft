/**
 * La arquitectura de información real de fedesoft.org, con los logos oficiales
 * de cada evento e iniciativa. Las entradas con `href` llevan a una pantalla
 * del prototipo; las demás se listan para mostrar el alcance del gremio.
 */
export interface Enlace {
  nombre: string;
  href?: string;
}

export interface Pieza {
  nombre: string;
  logo: string;
  href?: string;
}

export interface Seccion {
  id: string;
  etiqueta: string;
  columnas?: { titulo: string; enlaces: Enlace[] }[];
  piezas?: Pieza[];
  pie?: string;
}

export const SECCIONES: Seccion[] = [
  {
    id: "quienes",
    etiqueta: "¿Quiénes somos?",
    columnas: [
      {
        titulo: "La federación",
        enlaces: [
          { nombre: "Nuestra historia" },
          { nombre: "Junta Directiva" },
          { nombre: "Presidencia" },
          { nombre: "Comité directivo" },
        ],
      },
      {
        titulo: "Para tu empresa",
        enlaces: [
          { nombre: "Servicios gremiales", href: "/#servicios" },
          { nombre: "Zona de afiliados", href: "/portal" },
          { nombre: "Mi empresa", href: "/empresa" },
          { nombre: "Estado de cuenta", href: "/facturacion" },
        ],
      },
    ],
    pie: "Treinta años representando a la industria colombiana de software y TI.",
  },
  {
    id: "trabajamos",
    etiqueta: "¿Cómo trabajamos?",
    columnas: [
      {
        titulo: "Frentes de acción",
        enlaces: [
          { nombre: "Competitividad Nacional" },
          { nombre: "Competitividad Internacional" },
          { nombre: "Talento TI", href: "/formacion" },
          { nombre: "Regulaciones" },
        ],
      },
      {
        titulo: "Verticales",
        enlaces: [
          { nombre: "Salud" },
          { nombre: "Educación" },
          { nombre: "Seguridad y Confianza Digital" },
          { nombre: "Financiera" },
        ],
      },
    ],
    pie: "Cuatro frentes y cuatro verticales donde el gremio construye consenso.",
  },
  {
    id: "eventos",
    etiqueta: "Eventos",
    piezas: [
      { nombre: "Softic", logo: "softic" },
      { nombre: "Premios Ingenio", logo: "premios-ingenio" },
      { nombre: "RegiónLAB", logo: "regionlab" },
      { nombre: "Maratón de Inmersión", logo: "maraton-inmersion" },
      { nombre: "Concurso Nacional de Programación", logo: "concurso-programacion" },
    ],
    pie: "El calendario gremial del año.",
  },
  {
    id: "iniciativas",
    etiqueta: "Iniciativas",
    piezas: [
      { nombre: "International Soft Route", logo: "international-soft-route" },
      { nombre: "Softlanding", logo: "softlanding" },
      { nombre: "TrainingLAB", logo: "traininglab", href: "/formacion" },
      { nombre: "Bebras Colombia", logo: "bebras" },
      { nombre: "Talentsoft", logo: "talentsoft" },
      { nombre: "Creadores TI", logo: "creadores-ti" },
    ],
    pie: "Programas propios que la federación pone en marcha cada año.",
  },
  {
    id: "recursos",
    etiqueta: "Recursos",
    piezas: [
      { nombre: "Directorio de afiliados", logo: "directorio-afiliados", href: "/directorio" },
      { nombre: "Encuesta de Salarios", logo: "encuesta-salarios" },
      { nombre: "Revenue por empleado", logo: "revenue-empleado" },
      { nombre: "TIC Talks", logo: "tictalks", href: "/formacion" },
      { nombre: "WO4TIC · Women for TIC", logo: "wo4tic" },
      { nombre: "Verticales", logo: "verticales" },
    ],
    pie: "Cifras, estudios y comunidad para decidir con datos.",
  },
];
