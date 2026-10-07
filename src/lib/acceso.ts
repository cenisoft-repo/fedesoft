/**
 * Quién ve qué. Única fuente de la separación por rol del prototipo: la
 * navegación muestra solo lo que el rol alcanza y cada página pregunta aquí
 * antes de pintar. Entrar por la URL a un módulo ajeno da una pantalla de
 * "sin permiso" explícita, no un menú que esconde botones.
 *
 * Transcribe dos matrices del repo rector:
 *  - Portal: docs/03-arquitectura-de-informacion.md §4 "Qué ve cada rol".
 *  - Consola: docs/01-consola-administracion.md §2.1 y §2.2.
 * En producción esto lo decide el servidor (guard global, ADR-008); aquí solo
 * se simula para que la demostración se comporte igual.
 */
import type { RolEmpresa, RolInterno } from "./mock/usuarios";

/**
 * gestiona: ve y cambia. consulta: solo lectura. asignadas: solo las empresas
 * a su cargo (ABAC del KAM). propia: solo lo de su área.
 */
export type Nivel = "gestiona" | "consulta" | "asignadas" | "propia";

/* ── Portal del afiliado ──────────────────────────────────────────── */

export type SeccionPortal =
  | "inicio"
  | "empresa"
  | "contactos"
  | "afiliacion"
  | "facturacion"
  | "formacion"
  | "comunidades"
  | "verticales"
  | "directorio"
  | "visibilidad"
  | "oportunidades"
  | "cuenta-estrategica";

type MatrizPortal = Record<SeccionPortal, Record<RolEmpresa, Nivel | null>>;

const PORTAL: MatrizPortal = {
  inicio: { gerente: "gestiona", talento: "gestiona", contacto: "gestiona" },
  empresa: { gerente: "gestiona", talento: "consulta", contacto: "consulta" },
  contactos: { gerente: "gestiona", talento: null, contacto: null },
  afiliacion: { gerente: "gestiona", talento: "consulta", contacto: null },
  facturacion: { gerente: "gestiona", talento: null, contacto: null },
  /* El talento inscribe al equipo; el contacto, solo a sí mismo. */
  formacion: { gerente: "gestiona", talento: "gestiona", contacto: "propia" },
  comunidades: { gerente: "gestiona", talento: "gestiona", contacto: "consulta" },
  verticales: { gerente: "gestiona", talento: "gestiona", contacto: "consulta" },
  directorio: { gerente: "gestiona", talento: "consulta", contacto: "consulta" },
  visibilidad: { gerente: "gestiona", talento: "consulta", contacto: "consulta" },
  oportunidades: { gerente: "gestiona", talento: null, contacto: null },
  "cuenta-estrategica": { gerente: "gestiona", talento: "gestiona", contacto: null },
};

/** Lo que el rol alcanza en la sección, sin mirar el segmento. */
export function nivelPortal(rol: RolEmpresa, seccion: SeccionPortal): Nivel | null {
  return PORTAL[seccion][rol];
}

/** Quién sí tiene la sección, para explicarlo en la pantalla de "sin permiso". */
export function rolesConSeccion(seccion: SeccionPortal): RolEmpresa[] {
  return (Object.keys(PORTAL[seccion]) as RolEmpresa[]).filter((r) => PORTAL[seccion][r] !== null);
}

/* ── Consola interna ──────────────────────────────────────────────── */

export type ModuloConsola =
  | "afiliados"
  | "solicitudes"
  | "cartera"
  | "formacion"
  | "contenidos"
  | "relacionamiento"
  | "cuentas"
  | "resultados"
  | "usuarios"
  | "auditoria";

export type Area = "afiliacion" | "cartera" | "formacion" | "contenidos" | "relacionamiento" | "cuentas" | "usuarios";

export interface DefModulo {
  id: ModuloConsola;
  href: string;
  /** Etiqueta corta del menú; `nombre` es la completa, si difiere. */
  etiqueta: string;
  nombre?: string;
  resumen: string;
  /** Área a la que pertenece el módulo: filtra auditoría y resultados. */
  area: Area | null;
  /** En modo API: permiso de lectura y de escritura en el servidor. */
  permisoLectura: string;
  permisoEscritura: string;
  acceso: Record<RolInterno, Nivel | null>;
}

const R = (
  sa: Nivel | null, ops: Nivel | null, fin: Nivel | null, tal: Nivel | null, com: Nivel | null,
  rel: Nivel | null, kam: Nivel | null, dir: Nivel | null, aud: Nivel | null,
): Record<RolInterno, Nivel | null> => ({
  "super-admin": sa, operaciones: ops, cartera: fin, formacion: tal, comunicaciones: com,
  relacionamiento: rel, kam, direccion: dir, auditor: aud,
});

/* El orden es el de la navegación. Columnas: SA · OPS · FIN · TAL · COM · REL · KAM · DIR · AUD. */
export const MODULOS_CONSOLA: DefModulo[] = [
  {
    id: "afiliados", href: "/admin", etiqueta: "Afiliados", area: "afiliacion",
    resumen: "Padrón de empresas y contactos.",
    permisoLectura: "organization:read", permisoEscritura: "organization:update",
    acceso: R("gestiona", "gestiona", "consulta", "consulta", "consulta", "consulta", "asignadas", "consulta", "consulta"),
  },
  {
    id: "solicitudes", href: "/admin/solicitudes", etiqueta: "Solicitudes", area: "afiliacion",
    resumen: "Solicitudes de afiliación y su estado.",
    permisoLectura: "affiliation:read", permisoEscritura: "affiliation:update",
    acceso: R("gestiona", "gestiona", "consulta", null, null, null, "asignadas", "consulta", "consulta"),
  },
  {
    id: "cartera", href: "/admin/cartera", etiqueta: "Cartera", area: "cartera",
    resumen: "Cargos, pagos, conciliación y facturas electrónicas.",
    permisoLectura: "billing:read", permisoEscritura: "billing:reconcile",
    acceso: R("gestiona", "consulta", "gestiona", null, null, null, "asignadas", "consulta", "consulta"),
  },
  {
    id: "formacion", href: "/admin/formacion", etiqueta: "Formación", area: "formacion",
    resumen: "Cursos, sesiones, cupos e inscripciones; comunidades.",
    permisoLectura: "training:read", permisoEscritura: "training:update",
    acceso: R("gestiona", "consulta", null, "gestiona", "consulta", null, "asignadas", "consulta", "consulta"),
  },
  {
    id: "contenidos", href: "/admin/contenidos", etiqueta: "Contenidos", area: "contenidos",
    resumen: "Comunicaciones, insights y moderación del directorio.",
    permisoLectura: "content:read", permisoEscritura: "content:update",
    acceso: R("gestiona", "consulta", "consulta", "consulta", "gestiona", "consulta", null, "consulta", "consulta"),
  },
  {
    id: "relacionamiento", href: "/admin/relacionamiento", etiqueta: "Relacionamiento", area: "relacionamiento",
    resumen: "Verticales, mesas, oportunidades y postulaciones.",
    permisoLectura: "opportunity:read", permisoEscritura: "opportunity:update",
    acceso: R("gestiona", null, null, null, "consulta", "gestiona", "asignadas", "consulta", "consulta"),
  },
  {
    id: "cuentas", href: "/admin/cuentas", etiqueta: "Cuentas", nombre: "Cuentas estratégicas", area: "cuentas",
    resumen: "Empresas grandes con gestor asignado: interacciones y plan de acción.",
    permisoLectura: "interaction:read", permisoEscritura: "interaction:create",
    acceso: R("gestiona", "consulta", null, null, null, "consulta", "asignadas", "consulta", "consulta"),
  },
  {
    id: "resultados", href: "/admin/resultados", etiqueta: "Resultados", area: null,
    resumen: "Indicadores del gremio y de cada área.",
    permisoLectura: "analytics:read", permisoEscritura: "analytics:export",
    acceso: R("consulta", "propia", "propia", "propia", "propia", "propia", "asignadas", "gestiona", "gestiona"),
  },
  {
    id: "usuarios", href: "/admin/usuarios", etiqueta: "Usuarios", area: "usuarios",
    resumen: "Cuentas, accesos por empresa y roles internos.",
    permisoLectura: "user:read", permisoEscritura: "role:assign",
    acceso: R("gestiona", null, null, null, null, null, null, "consulta", "consulta"),
  },
  {
    id: "auditoria", href: "/admin/auditoria", etiqueta: "Auditoría", area: null,
    resumen: "Quién hizo qué, cuándo y desde dónde.",
    permisoLectura: "audit:read", permisoEscritura: "audit:export",
    acceso: R("gestiona", "propia", "propia", "propia", "propia", "propia", "asignadas", "consulta", "gestiona"),
  },
];

export const moduloConsola = (id: ModuloConsola): DefModulo => MODULOS_CONSOLA.find((m) => m.id === id)!;

/** Del más amplio al más estrecho: con varios roles, gana el más amplio. */
const ORDEN: Nivel[] = ["gestiona", "consulta", "propia", "asignadas"];

export function nivelConsola(roles: readonly RolInterno[], modulo: ModuloConsola): Nivel | null {
  const acceso = moduloConsola(modulo).acceso;
  const niveles = roles.map((r) => acceso[r]).filter((n): n is Nivel => n !== null);
  return ORDEN.find((n) => niveles.includes(n)) ?? null;
}

/** Área de trabajo de cada rol: lo que ve en auditoría y resultados con nivel "propia". */
export const AREA_DE_ROL: Record<RolInterno, Area | null> = {
  "super-admin": null,
  operaciones: "afiliacion",
  cartera: "cartera",
  formacion: "formacion",
  comunicaciones: "contenidos",
  relacionamiento: "relacionamiento",
  kam: "cuentas",
  direccion: null,
  auditor: null,
};

export const NOMBRE_AREA: Record<Area, string> = {
  afiliacion: "Afiliación",
  cartera: "Cartera",
  formacion: "Formación",
  contenidos: "Contenidos",
  relacionamiento: "Relacionamiento",
  cuentas: "Cuentas estratégicas",
  usuarios: "Usuarios y roles",
};

/** Áreas que un operador alcanza con nivel "propia"; nulo = todas. */
export function areasPropias(roles: readonly RolInterno[]): Area[] | null {
  const areas = roles.map((r) => AREA_DE_ROL[r]);
  if (areas.includes(null)) return null;
  return [...new Set(areas.filter((a): a is Area => a !== null))];
}

export const TEXTO_NIVEL: Record<Nivel, string> = {
  gestiona: "Gestiona",
  consulta: "Solo lectura",
  asignadas: "Solo tus empresas asignadas",
  propia: "Solo tu área",
};
