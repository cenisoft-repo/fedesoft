/**
 * Usuarios, accesos y sesiones simulados.
 *
 * Reflejan el modelo del API real (ADR-008 del repo rector): una persona es un
 * `Usuario` global; su acceso a cada empresa es un `Vinculo` con rol y estado
 * propios; los roles internos de Fedesoft no pertenecen a ninguna empresa.
 * Contraseñas y segundo factor los gestiona el proveedor de identidad: aquí no
 * aparecen.
 *
 * Las personas de las empresas salen de los contactos de `empresas.ts`, para
 * que no existan dos versiones de la misma persona.
 */
import { DATALABS, VERTICE } from "./empresas";
import type { Empresa } from "./tipos";

export type RolEmpresa = "gerente" | "talento" | "contacto";
/* Los nueve roles internos de docs/01-consola-administracion.md §2.1. */
export type RolInterno =
  | "super-admin"
  | "operaciones"
  | "cartera"
  | "formacion"
  | "comunicaciones"
  | "relacionamiento"
  | "kam"
  | "direccion"
  | "auditor";
export type EstadoUsuario = "activo" | "invitado" | "bloqueado";
export type EstadoVinculo = "activo" | "invitado" | "desactivado";

export interface Sesion {
  id: string;
  superficie: "portal" | "consola";
  dispositivo: string;
  lugar: string;
  ip: string;
  ultimoUso: string; // "2026-09-22 08:41"
}

export interface Usuario {
  id: string;
  /** Lo trae el proveedor en el primer ingreso; antes de eso es nulo. */
  nombre: string | null;
  correo: string;
  estado: EstadoUsuario;
  rolesInternos: RolInterno[];
  ultimoAcceso: string | null;
  sesiones: Sesion[];
}

export interface Vinculo {
  usuarioId: string;
  /** NIT de la empresa: la frontera de seguridad. */
  empresa: string;
  rol: RolEmpresa;
  estado: EstadoVinculo;
  contactoId?: string;
  /** Solo en estado invitado: una invitación sin vencimiento no existe. */
  invitacionVence?: string;
  invitadoPor?: string;
}

export const ROLES_EMPRESA: { id: RolEmpresa; nombre: string; resumen: string; administra: boolean }[] = [
  {
    id: "gerente",
    nombre: "Gerente",
    resumen: "Todo: datos de la empresa, estado de cuenta y pagos, certificado, oportunidades y gestión de accesos.",
    administra: true,
  },
  {
    id: "talento",
    nombre: "Talento humano",
    resumen: "Formación del equipo, comunidades y la ficha de la empresa. Sin facturación ni oportunidades.",
    administra: false,
  },
  {
    id: "contacto",
    nombre: "Contacto",
    resumen: "Consulta la ficha de la empresa y la oferta de formación.",
    administra: false,
  },
];

export const ROLES_INTERNOS: { id: RolInterno; nombre: string; resumen: string }[] = [
  { id: "super-admin", nombre: "Super Admin", resumen: "Configuración y emergencia. Asigna roles internos. Siempre hay al menos dos." },
  { id: "operaciones", nombre: "Operaciones · Afiliación", resumen: "Padrón, solicitudes y estados de afiliación, certificados." },
  { id: "cartera", nombre: "Cartera · Financiera", resumen: "Cargos, pagos, conciliación y facturas electrónicas." },
  { id: "formacion", nombre: "Formación y comunidades", resumen: "Cursos, sesiones, cupos, inscripciones y comunidades." },
  { id: "comunicaciones", nombre: "Comunicaciones · Contenido", resumen: "Comunicaciones, insights y moderación del directorio." },
  { id: "relacionamiento", nombre: "Relacionamiento · Verticales", resumen: "Verticales, mesas, oportunidades y postulaciones." },
  { id: "kam", nombre: "Gestor de cuenta", resumen: "Solo las empresas que tiene asignadas." },
  { id: "direccion", nombre: "Dirección", resumen: "Resultados y reportes; lectura de todo el padrón." },
  { id: "auditor", nombre: "Auditor", resumen: "Lectura y exportación de todo, sin cambiar nada." },
];

export const nombreRolEmpresa = (r: RolEmpresa) => ROLES_EMPRESA.find((x) => x.id === r)?.nombre ?? r;
export const nombreRolInterno = (r: RolInterno) => ROLES_INTERNOS.find((x) => x.id === r)?.nombre ?? r;

/* ── Personas de las empresas ─────────────────────────────────────── */

const SESIONES: Record<string, Sesion[]> = {
  c1: [
    { id: "s-c1-a", superficie: "portal", dispositivo: "Chrome · Windows", lugar: "Bogotá", ip: "181.49.12.7", ultimoUso: "2026-09-22 08:41" },
    { id: "s-c1-b", superficie: "portal", dispositivo: "Safari · iPhone", lugar: "Bogotá", ip: "191.95.33.140", ultimoUso: "2026-09-21 19:05" },
  ],
  c2: [{ id: "s-c2-a", superficie: "portal", dispositivo: "Edge · Windows", lugar: "Bogotá", ip: "181.49.12.9", ultimoUso: "2026-09-22 07:58" }],
  v1: [{ id: "s-v1-a", superficie: "portal", dispositivo: "Chrome · macOS", lugar: "Medellín", ip: "190.248.7.21", ultimoUso: "2026-09-22 09:12" }],
};

const ULTIMO_ACCESO: Record<string, string> = {
  c1: "2026-09-22 08:41",
  c2: "2026-09-22 07:58",
  c3: "2026-09-15 16:20",
  v1: "2026-09-22 09:12",
  v2: "2026-09-19 11:03",
  v3: "2026-09-10 10:47",
};

function deEmpresa(e: Empresa): { usuarios: Usuario[]; vinculos: Vinculo[] } {
  const conAcceso = e.contactos.filter((c) => c.conAcceso);
  return {
    usuarios: conAcceso.map((c) => ({
      id: `u-${c.id}`,
      nombre: c.nombre,
      correo: c.correo,
      estado: "activo",
      rolesInternos: [],
      ultimoAcceso: ULTIMO_ACCESO[c.id] ?? null,
      sesiones: SESIONES[c.id] ?? [],
    })),
    vinculos: conAcceso.map((c) => ({
      usuarioId: `u-${c.id}`,
      empresa: e.nit,
      rol: c.rol,
      estado: "activo",
      contactoId: c.id,
    })),
  };
}

const datalabs = deEmpresa(DATALABS);
const vertice = deEmpresa(VERTICE);

/* ── Casos que muestran los estados ───────────────────────────────── */

const EXTRA_USUARIOS: Usuario[] = [
  // Invitación pendiente: aún no ha entrado, así que no hay nombre.
  { id: "u-laura", nombre: null, correo: "laura.gomez@datalabsandina.co", estado: "invitado", rolesInternos: [], ultimoAcceso: null, sesiones: [] },
  // Exempleado: el gerente le desactivó el acceso a la empresa.
  { id: "u-andres", nombre: "Andrés Mora", correo: "andres.mora@datalabsandina.co", estado: "activo", rolesInternos: [], ultimoAcceso: "2026-06-30 17:22", sesiones: [] },
  // Cuenta bloqueada por Fedesoft: no entra a ninguna parte.
  { id: "u-mauricio", nombre: "Mauricio Lara", correo: "mauricio.lara@sistemasvertice.com.co", estado: "bloqueado", rolesInternos: [], ultimoAcceso: "2026-08-02 13:10", sesiones: [] },
];

const EXTRA_VINCULOS: Vinculo[] = [
  { usuarioId: "u-laura", empresa: DATALABS.nit, rol: "contacto", estado: "invitado", invitacionVence: "2026-09-24", invitadoPor: "Camilo Restrepo" },
  { usuarioId: "u-andres", empresa: DATALABS.nit, rol: "contacto", estado: "desactivado" },
  { usuarioId: "u-mauricio", empresa: VERTICE.nit, rol: "contacto", estado: "activo" },
];

/* ── Equipo interno de Fedesoft ───────────────────────────────────── */

const INTERNOS: Usuario[] = [
  {
    id: "u-natalia", nombre: "Natalia Rincón", correo: "natalia.rincon@fedesoft.org", estado: "activo",
    rolesInternos: ["super-admin"], ultimoAcceso: "2026-09-21 18:30",
    sesiones: [{ id: "s-nat-a", superficie: "consola", dispositivo: "Firefox · Ubuntu", lugar: "Bogotá", ip: "200.69.103.4", ultimoUso: "2026-09-21 18:30" }],
  },
  { id: "u-felipe", nombre: "Felipe Cárdenas", correo: "felipe.cardenas@fedesoft.org", estado: "activo", rolesInternos: ["super-admin"], ultimoAcceso: "2026-09-12 10:02", sesiones: [] },
  {
    id: "u-lorena", nombre: "Lorena Mejía", correo: "lorena.mejia@fedesoft.org", estado: "activo",
    rolesInternos: ["operaciones"], ultimoAcceso: "2026-09-22 08:05",
    sesiones: [{ id: "s-lor-a", superficie: "consola", dispositivo: "Edge · Windows", lugar: "Bogotá", ip: "200.69.103.11", ultimoUso: "2026-09-22 08:05" }],
  },
  { id: "u-marcela-o", nombre: "Marcela Ospina", correo: "cuentas.estrategicas@fedesoft.org", estado: "activo", rolesInternos: ["kam"], ultimoAcceso: "2026-09-20 15:44", sesiones: [] },
  { id: "u-jorge", nombre: "Jorge Prieto", correo: "jorge.prieto@fedesoft.org", estado: "activo", rolesInternos: ["auditor"], ultimoAcceso: "2026-09-01 09:30", sesiones: [] },
  { id: "u-andrea", nombre: "Andrea Villamil", correo: "andrea.villamil@fedesoft.org", estado: "activo", rolesInternos: ["cartera"], ultimoAcceso: "2026-09-22 07:40", sesiones: [] },
  { id: "u-paula", nombre: "Paula Andrade", correo: "paula.andrade@fedesoft.org", estado: "activo", rolesInternos: ["formacion"], ultimoAcceso: "2026-09-21 16:12", sesiones: [] },
  { id: "u-valentina", nombre: "Valentina Duarte", correo: "valentina.duarte@fedesoft.org", estado: "activo", rolesInternos: ["comunicaciones"], ultimoAcceso: "2026-09-22 09:01", sesiones: [] },
  { id: "u-german", nombre: "Germán Castaño", correo: "german.castano@fedesoft.org", estado: "activo", rolesInternos: ["relacionamiento"], ultimoAcceso: "2026-09-19 14:25", sesiones: [] },
  { id: "u-carolina", nombre: "Carolina Vélez", correo: "carolina.velez@fedesoft.org", estado: "activo", rolesInternos: ["direccion"], ultimoAcceso: "2026-09-20 08:15", sesiones: [] },
];

export const USUARIOS_INICIALES: Usuario[] = [...INTERNOS, ...datalabs.usuarios, ...vertice.usuarios, ...EXTRA_USUARIOS];
export const VINCULOS_INICIALES: Vinculo[] = [...datalabs.vinculos, ...vertice.vinculos, ...EXTRA_VINCULOS];

/** Nombres de las empresas por NIT, para la consola. */
export const EMPRESAS_POR_NIT: Record<string, string> = {
  [DATALABS.nit]: DATALABS.razonSocial,
  [VERTICE.nit]: VERTICE.razonSocial,
};

/** Cuentas de la consola del acceso de demostración: una por rol interno, en el orden de ROLES_INTERNOS. */
export const OPERADORES_DEMO = [
  "natalia.rincon@fedesoft.org",
  "lorena.mejia@fedesoft.org",
  "andrea.villamil@fedesoft.org",
  "paula.andrade@fedesoft.org",
  "valentina.duarte@fedesoft.org",
  "german.castano@fedesoft.org",
  "cuentas.estrategicas@fedesoft.org",
  "carolina.velez@fedesoft.org",
  "jorge.prieto@fedesoft.org",
];

/** Empresas a cargo de cada gestor de cuenta (ABAC: el KAM solo ve estas). */
export const ASIGNACIONES_KAM: Record<string, string[]> = {
  "u-marcela-o": [VERTICE.nit],
};
