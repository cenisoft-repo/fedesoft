/**
 * Datos simulados de la consola interna.
 *
 * Regla deliberada: toda empresa con un estado financiero o una solicitud en
 * curso lleva un nombre ficticio. El directorio usa nombres reales del gremio
 * porque es información pública y favorable; una cartera no lo es — atribuir
 * mora o un trámite a una empresa identificable sería inventar un hecho sobre
 * ella. Datalabs Andina y Sistemas Vértice ya son ficticias en el prototipo.
 */
import type { Segmento } from "./tipos";

/* ── Parametrización de la cuota ──────────────────────────────────────
   La cuota no se digita por solicitud: sale de un parámetro con alcance,
   vigencia y versión, como exige el dominio Config. La consola muestra la
   regla, no solo su resultado.                                          */

export interface TarifaCuota {
  id: string;
  rango: string;
  desde: number;
  hasta: number | null;
  segmento: Segmento;
  valor: number;
}

export const PARAMETRO_CUOTA = {
  clave: "afiliacion.cuota_anual",
  version: 4,
  vigenteDesde: "2026-01-01",
  vigenteHasta: "2026-12-31",
  aprobadoPor: "Junta Directiva · acta JD-2025-11",
  tarifas: [
    { id: "t1", rango: "1 a 10 empleados", desde: 1, hasta: 10, segmento: "mipyme", valor: 1_150_000 },
    { id: "t2", rango: "11 a 50 empleados", desde: 11, hasta: 50, segmento: "mipyme", valor: 2_450_000 },
    { id: "t3", rango: "51 a 200 empleados", desde: 51, hasta: 200, segmento: "mipyme", valor: 4_800_000 },
    { id: "t4", rango: "201 empleados o más", desde: 201, hasta: null, segmento: "grande", valor: 8_900_000 },
  ] as TarifaCuota[],
};

/** La misma función que usaría el dominio: empleados → tarifa. */
export function tarifaPara(empleados: number): TarifaCuota {
  return (
    PARAMETRO_CUOTA.tarifas.find((t) => empleados >= t.desde && (t.hasta === null || empleados <= t.hasta)) ??
    PARAMETRO_CUOTA.tarifas[PARAMETRO_CUOTA.tarifas.length - 1]
  );
}

/* ── Bandeja de solicitudes de afiliación ─────────────────────────── */

export type EstadoSolicitud = "nueva" | "en-revision" | "info-solicitada" | "aprobada" | "rechazada";

export interface DocumentoSolicitud {
  nombre: string;
  estado: "recibido" | "faltante" | "ilegible";
}

export interface Solicitud {
  radicado: string;
  razonSocial: string;
  nit: string;
  ciudad: string;
  sector: string;
  empleados: number;
  segmento: Segmento;
  sitioWeb: string;
  contacto: { nombre: string; cargo: string; correo: string; telefono: string };
  recibida: string;
  estado: EstadoSolicitud;
  documentos: DocumentoSolicitud[];
  nota?: string;
}

export const SOLICITUDES: Solicitud[] = [
  {
    /* El mismo radicado que entrega /afiliarme: el portal y la consola
       son dos extremos del mismo trámite, no dos demostraciones sueltas. */
    radicado: "AF-2026-0417",
    razonSocial: "Nodo Sur Tecnologías S.A.S.",
    nit: "901.772.418-3",
    ciudad: "Pereira",
    sector: "Desarrollo a la medida / apps",
    empleados: 18,
    segmento: "mipyme",
    sitioWeb: "nodosur.co",
    contacto: { nombre: "Laura Villegas", cargo: "Gerente General", correo: "laura.villegas@nodosur.co", telefono: "+57 316 555 2280" },
    recibida: "2026-09-22",
    estado: "nueva",
    documentos: [
      { nombre: "Cámara de Comercio (< 30 días)", estado: "recibido" },
      { nombre: "RUT actualizado", estado: "recibido" },
      { nombre: "Cédula del representante legal", estado: "recibido" },
    ],
  },
  {
    radicado: "AF-2026-0416",
    razonSocial: "Ágora Datos y Analítica S.A.S.",
    nit: "901.655.902-7",
    ciudad: "Bucaramanga",
    sector: "Analítica e inteligencia artificial",
    empleados: 41,
    segmento: "mipyme",
    sitioWeb: "agoradatos.com.co",
    contacto: { nombre: "Esteban Quintero", cargo: "Director de Operaciones", correo: "equintero@agoradatos.com.co", telefono: "+57 300 555 6641" },
    recibida: "2026-09-19",
    estado: "en-revision",
    documentos: [
      { nombre: "Cámara de Comercio (< 30 días)", estado: "recibido" },
      { nombre: "RUT actualizado", estado: "recibido" },
      { nombre: "Cédula del representante legal", estado: "recibido" },
    ],
    nota: "Verificar que el objeto social incluya desarrollo de software. Consultado con jurídica el 19 sep.",
  },
  {
    radicado: "AF-2026-0414",
    razonSocial: "Cordillera Cloud S.A.S.",
    nit: "901.803.117-2",
    ciudad: "Manizales",
    sector: "Infraestructura y nube",
    empleados: 9,
    segmento: "mipyme",
    sitioWeb: "cordilleracloud.co",
    contacto: { nombre: "Andrés Tobón", cargo: "Fundador", correo: "andres@cordilleracloud.co", telefono: "+57 321 555 9012" },
    recibida: "2026-09-15",
    estado: "info-solicitada",
    documentos: [
      { nombre: "Cámara de Comercio (< 30 días)", estado: "ilegible" },
      { nombre: "RUT actualizado", estado: "recibido" },
      { nombre: "Cédula del representante legal", estado: "faltante" },
    ],
    nota: "Se pidió el certificado legible y la cédula el 16 sep. Sin respuesta.",
  },
  {
    radicado: "AF-2026-0411",
    razonSocial: "Marlin Software Group S.A.",
    nit: "900.448.076-5",
    ciudad: "Barranquilla",
    sector: "Software empresarial / ERP",
    empleados: 312,
    segmento: "grande",
    sitioWeb: "marlinsg.com",
    contacto: { nombre: "Claudia Hernández", cargo: "Vicepresidenta Jurídica", correo: "chernandez@marlinsg.com", telefono: "+57 318 555 4407" },
    recibida: "2026-09-10",
    estado: "aprobada",
    documentos: [
      { nombre: "Cámara de Comercio (< 30 días)", estado: "recibido" },
      { nombre: "RUT actualizado", estado: "recibido" },
      { nombre: "Cédula del representante legal", estado: "recibido" },
    ],
    nota: "Aprobada en comité del 18 sep. Cuota facturada, pendiente de pago.",
  },
  {
    radicado: "AF-2026-0408",
    razonSocial: "Inversiones Delta Comercial S.A.S.",
    nit: "900.912.554-8",
    ciudad: "Cali",
    sector: "Comercio al por mayor",
    empleados: 27,
    segmento: "mipyme",
    sitioWeb: "deltacomercial.co",
    contacto: { nombre: "Óscar Peña", cargo: "Gerente Administrativo", correo: "opena@deltacomercial.co", telefono: "+57 312 555 1178" },
    recibida: "2026-09-04",
    estado: "rechazada",
    documentos: [
      { nombre: "Cámara de Comercio (< 30 días)", estado: "recibido" },
      { nombre: "RUT actualizado", estado: "recibido" },
      { nombre: "Cédula del representante legal", estado: "recibido" },
    ],
    nota: "La actividad económica no corresponde a la industria de software y TI. Notificada el 8 sep.",
  },
];

/* ── Tablero de cartera ────────────────────────────────────────────── */

export type EstadoCartera = "al-dia" | "por-vencer" | "vencida";

export interface CuentaCartera {
  empresa: string;
  nit: string;
  segmento: Segmento;
  ciudad: string;
  concepto: string;
  monto: number;
  vence: string;
  estado: EstadoCartera;
  /** Días vencidos. 0 si aún no vence. */
  mora: number;
  ultimaGestion?: string;
}

export const CARTERA: CuentaCartera[] = [
  { empresa: "Sistemas Vértice S.A.", nit: "900.315.882-1", segmento: "grande", ciudad: "Medellín", concepto: "Cuota anual 2026", monto: 8_900_000, vence: "2026-10-15", estado: "por-vencer", mora: 0, ultimaGestion: "Recordatorio automático · 15 sep" },
  { empresa: "Datalabs Andina S.A.S.", nit: "901.487.203-6", segmento: "mipyme", ciudad: "Bogotá D.C.", concepto: "Cuota anual 2026", monto: 2_450_000, vence: "2026-10-15", estado: "por-vencer", mora: 0, ultimaGestion: "Recordatorio automático · 15 sep" },
  { empresa: "Trébol Sistemas S.A.S.", nit: "901.204.663-9", segmento: "mipyme", ciudad: "Bogotá D.C.", concepto: "Cuota anual 2026", monto: 4_800_000, vence: "2026-08-15", estado: "vencida", mora: 38, ultimaGestion: "Llamada · 11 sep · promesa de pago 30 sep" },
  { empresa: "Kanoa Digital S.A.S.", nit: "901.539.288-4", segmento: "mipyme", ciudad: "Cartagena", concepto: "Cuota anual 2026", monto: 1_150_000, vence: "2026-07-15", estado: "vencida", mora: 69, ultimaGestion: "Correo · 2 sep · sin respuesta" },
  { empresa: "Altamira Consultoría TI S.A.S.", nit: "900.781.340-6", segmento: "mipyme", ciudad: "Medellín", concepto: "Cuota anual 2026", monto: 2_450_000, vence: "2026-06-15", estado: "vencida", mora: 99, ultimaGestion: "Escalado a Dirección · 8 sep" },
  { empresa: "Puerto Byte S.A.S.", nit: "901.610.775-1", segmento: "mipyme", ciudad: "Barranquilla", concepto: "Cuota anual 2026", monto: 1_150_000, vence: "2026-09-30", estado: "por-vencer", mora: 0 },
  { empresa: "Grupo Meridiano Software S.A.", nit: "900.226.419-0", segmento: "grande", ciudad: "Bogotá D.C.", concepto: "Cuota anual 2026", monto: 8_900_000, vence: "2026-03-15", estado: "al-dia", mora: 0, ultimaGestion: "Pagada · 12 mar" },
  { empresa: "Sierra Nevada Labs S.A.S.", nit: "901.447.902-3", segmento: "mipyme", ciudad: "Santa Marta", concepto: "Cuota anual 2026", monto: 2_450_000, vence: "2026-02-28", estado: "al-dia", mora: 0, ultimaGestion: "Pagada · 26 feb" },
  { empresa: "Cauce Tecnología S.A.S.", nit: "901.318.055-7", segmento: "mipyme", ciudad: "Cali", concepto: "Cuota anual 2026", monto: 4_800_000, vence: "2026-04-15", estado: "al-dia", mora: 0, ultimaGestion: "Pagada · 14 abr" },
  { empresa: "Andes Integración S.A.", nit: "900.503.771-2", segmento: "grande", ciudad: "Medellín", concepto: "Cuota anual 2026", monto: 8_900_000, vence: "2026-01-31", estado: "al-dia", mora: 0, ultimaGestion: "Pagada · 29 ene" },
  { empresa: "Lumbre Estudio Digital S.A.S.", nit: "901.688.213-5", segmento: "mipyme", ciudad: "Pereira", concepto: "Cuota anual 2026", monto: 1_150_000, vence: "2026-05-30", estado: "al-dia", mora: 0, ultimaGestion: "Pagada · 28 may" },
  { empresa: "Orión Data Systems S.A.S.", nit: "901.092.634-8", segmento: "mipyme", ciudad: "Bogotá D.C.", concepto: "Cuota anual 2026", monto: 2_450_000, vence: "2026-05-15", estado: "vencida", mora: 130, ultimaGestion: "Sin contacto desde 20 jun" },
];

/** Los tramos de mora que usa el tablero. Fedesoft aún no fija los cortes. */
export const TRAMOS_MORA = [
  { etiqueta: "1 a 30 días", desde: 1, hasta: 30 },
  { etiqueta: "31 a 60 días", desde: 31, hasta: 60 },
  { etiqueta: "61 a 90 días", desde: 61, hasta: 90 },
  { etiqueta: "Más de 90 días", desde: 91, hasta: Infinity },
];
