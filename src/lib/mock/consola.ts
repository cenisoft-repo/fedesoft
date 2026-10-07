/**
 * Datos simulados de los módulos de la consola que no tienen contraparte en
 * el portal: comunicaciones, cuentas estratégicas, indicadores y auditoría.
 * Las empresas son las mismas del padrón simulado (cartera y fichas).
 */
import type { Area } from "../acceso";

/* ── Contenidos · Comunicaciones ─────────────────────────────────── */

export interface Campana {
  id: string;
  titulo: string;
  canal: "Correo" | "Portal" | "Correo y portal";
  audiencia: string;
  estado: "borrador" | "programada" | "enviada";
  fecha: string;
  apertura?: number; // % de apertura, solo si ya se envió
}

export const CAMPANAS: Campana[] = [
  { id: "cp1", titulo: "Recordatorio de renovación · cuota 2026", canal: "Correo y portal", audiencia: "Afiliadas con cuota por vencer (14)", estado: "programada", fecha: "2026-10-01" },
  { id: "cp2", titulo: "Convocatoria TrainingLAB · octubre", canal: "Correo", audiencia: "Líderes de talento humano (312)", estado: "enviada", fecha: "2026-09-15", apertura: 46 },
  { id: "cp3", titulo: "International Soft Route 2026 · inscripciones abiertas", canal: "Correo y portal", audiencia: "Gerentes de empresas con producto exportable (128)", estado: "enviada", fecha: "2026-09-09", apertura: 38 },
  { id: "cp4", titulo: "Boletín normativo · septiembre", canal: "Portal", audiencia: "Todas las afiliadas (518)", estado: "borrador", fecha: "2026-09-26" },
];

/** Publicaciones de afiliados en #AfiliadosFedesoft que esperan moderación. */
export const MODERACION = [
  { id: "md1", empresa: "Datalabs Andina S.A.S.", titulo: "Automatización de procesos con IA para back office", categoria: "Desarrollo a la medida / apps", enviada: "2026-09-19" },
  { id: "md2", empresa: "Puerto Byte S.A.S.", titulo: "Mesa de ayuda 24/7 para comercio electrónico", categoria: "Servicios gestionados", enviada: "2026-09-21" },
  { id: "md3", empresa: "Cauce Tecnología S.A.S.", titulo: "Pruebas de carga y rendimiento para fintech", categoria: "Calidad de software", enviada: "2026-09-22" },
];

/* ── Cuentas estratégicas ─────────────────────────────────────────── */

export interface CuentaEstrategica {
  nit: string;
  empresa: string;
  ciudad: string;
  gestorId: string;
  gestor: string;
  salud: "estable" | "atencion" | "riesgo";
  ultimaInteraccion: string;
  plan: string[];
}

export const CUENTAS_ESTRATEGICAS: CuentaEstrategica[] = [
  {
    nit: "900.315.882-1", empresa: "Sistemas Vértice S.A.", ciudad: "Medellín", gestorId: "u-marcela-o", gestor: "Marcela Ospina",
    salud: "estable", ultimaInteraccion: "2026-09-18",
    plan: ["Postulación a Modernización de plataformas misionales", "Programa de práctica dual: 6 cupos", "Mesa Financiera: presentar caso de core bancario"],
  },
  {
    nit: "900.226.419-0", empresa: "Grupo Meridiano Software S.A.", ciudad: "Bogotá D.C.", gestorId: "u-felipe", gestor: "Felipe Cárdenas",
    salud: "atencion", ultimaInteraccion: "2026-08-27",
    plan: ["Renovar convenio de formación 2027", "Invitar a la misión International Soft Route"],
  },
  {
    nit: "900.503.771-2", empresa: "Andes Integración S.A.", ciudad: "Medellín", gestorId: "u-felipe", gestor: "Felipe Cárdenas",
    salud: "riesgo", ultimaInteraccion: "2026-07-30",
    plan: ["Reunión con presidencia: baja participación en 2026", "Revisar beneficios no usados"],
  },
];

export const INTERACCIONES = [
  { nit: "900.315.882-1", fecha: "2026-09-18", tipo: "Reunión", resumen: "Revisión trimestral con la vicepresidencia de operaciones: interés en la convocatoria de modernización.", autor: "Marcela Ospina" },
  { nit: "900.315.882-1", fecha: "2026-09-02", tipo: "Correo", resumen: "Envío de la agenda de la Mesa Financiera de octubre.", autor: "Marcela Ospina" },
  { nit: "900.226.419-0", fecha: "2026-08-27", tipo: "Llamada", resumen: "Seguimiento al uso de cupos de formación: 40 % usado.", autor: "Felipe Cárdenas" },
  { nit: "900.503.771-2", fecha: "2026-07-30", tipo: "Reunión", resumen: "Presentación del portafolio 2026; quedó pendiente agenda con presidencia.", autor: "Felipe Cárdenas" },
];

/* ── Resultados ───────────────────────────────────────────────────── */

export interface Indicador {
  area: Area;
  nombre: string;
  valor: string;
  meta?: string;
  tendencia: "sube" | "baja" | "estable";
  nota: string;
}

export const INDICADORES: Indicador[] = [
  { area: "afiliacion", nombre: "Empresas afiliadas", valor: "518", meta: "540", tendencia: "sube", nota: "+23 en lo corrido de 2026" },
  { area: "afiliacion", nombre: "Tasa de renovación", valor: "91 %", meta: "93 %", tendencia: "estable", nota: "Igual que 2025" },
  { area: "afiliacion", nombre: "Solicitudes en curso", valor: "7", tendencia: "sube", nota: "Tiempo medio de aprobación: 9 días" },
  { area: "cartera", nombre: "Recaudo de la cuota 2026", valor: "78 %", meta: "95 %", tendencia: "sube", nota: "$ 1.284 millones recaudados" },
  { area: "cartera", nombre: "Cartera vencida", valor: "$ 11,6 M", tendencia: "baja", nota: "5 empresas en mora" },
  { area: "formacion", nombre: "Inscritos en formación", valor: "387", tendencia: "sube", nota: "8 sesiones en el trimestre" },
  { area: "formacion", nombre: "Asistencia efectiva", valor: "72 %", meta: "80 %", tendencia: "estable", nota: "Inscritos que asistieron" },
  { area: "contenidos", nombre: "Apertura de comunicaciones", valor: "42 %", tendencia: "sube", nota: "Promedio de las últimas 4 campañas" },
  { area: "relacionamiento", nombre: "Empresas en verticales", valor: "164", tendencia: "sube", nota: "6 verticales activas" },
  { area: "relacionamiento", nombre: "Postulaciones a oportunidades", valor: "41", tendencia: "sube", nota: "4 convocatorias abiertas" },
  { area: "cuentas", nombre: "Cuentas estratégicas", valor: "3", tendencia: "estable", nota: "1 en riesgo" },
];

/* ── Auditoría ────────────────────────────────────────────────────── */

export interface EventoConsola {
  id: string;
  area: Area;
  cuando: string;
  actor: string;
  accion: string;
  /** NIT de la empresa afectada, si la hay: el KAM solo ve las suyas. */
  empresa?: string;
  ip: string;
}

export const AUDITORIA_CONSOLA: EventoConsola[] = [
  { id: "ev1", area: "afiliacion", cuando: "2026-09-22 08:12", actor: "Lorena Mejía", accion: "Solicitó información adicional en el radicado AF-2026-0414", ip: "200.69.103.11" },
  { id: "ev2", area: "cartera", cuando: "2026-09-22 07:45", actor: "Andrea Villamil", accion: "Concilió el pago de Grupo Meridiano Software S.A.", empresa: "900.226.419-0", ip: "200.69.103.17" },
  { id: "ev3", area: "contenidos", cuando: "2026-09-22 09:03", actor: "Valentina Duarte", accion: "Programó la campaña «Recordatorio de renovación · cuota 2026»", ip: "200.69.103.22" },
  { id: "ev4", area: "formacion", cuando: "2026-09-21 16:15", actor: "Paula Andrade", accion: "Abrió inscripciones de «Arquitecturas resilientes y recuperación sin drama en AWS»", ip: "200.69.103.9" },
  { id: "ev5", area: "usuarios", cuando: "2026-09-21 18:31", actor: "Natalia Rincón", accion: "Asignó el rol Gestor de cuenta a Marcela Ospina · motivo: nueva cartera de cuentas", ip: "200.69.103.4" },
  { id: "ev6", area: "cuentas", cuando: "2026-09-18 15:02", actor: "Marcela Ospina", accion: "Registró reunión trimestral con Sistemas Vértice S.A.", empresa: "900.315.882-1", ip: "190.248.7.40" },
  { id: "ev7", area: "relacionamiento", cuando: "2026-09-19 14:27", actor: "Germán Castaño", accion: "Publicó la convocatoria «Modernización de plataformas misionales»", ip: "200.69.103.30" },
  { id: "ev8", area: "cartera", cuando: "2026-09-08 10:40", actor: "Andrea Villamil", accion: "Escaló a Dirección la mora de Altamira Consultoría TI S.A.S.", empresa: "900.781.340-6", ip: "200.69.103.17" },
  { id: "ev9", area: "afiliacion", cuando: "2026-09-18 09:07", actor: "Sistema", accion: "Emitió el certificado FS-2026-00184 a Datalabs Andina S.A.S.", empresa: "901.487.203-6", ip: "—" },
  { id: "ev10", area: "cuentas", cuando: "2026-08-27 11:20", actor: "Felipe Cárdenas", accion: "Registró llamada de seguimiento con Grupo Meridiano Software S.A.", empresa: "900.226.419-0", ip: "200.69.103.6" },
];
