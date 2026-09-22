export type EstadoAfiliacion = "al-dia" | "pendiente" | "vencida";
export type Rol = "gerente" | "talento";
export type Segmento = "mipyme" | "grande";

export interface Contacto {
  id: string;
  nombre: string;
  cargo: string;
  correo: string;
  telefono: string;
  rol: Rol | "contacto";
  conAcceso: boolean;
}

export interface Cargo {
  id: string;
  concepto: string;
  periodo: string;
  monto: number;
  vence: string;
  estado: "pendiente" | "pagado" | "vencido";
}

export interface Factura {
  numero: string;
  fecha: string;
  monto: number;
  cufe: string;
  estado: "emitida" | "en-proceso";
}

export interface Empresa {
  razonSocial: string;
  nit: string;
  segmento: Segmento;
  tipoAfiliacion: "Activo" | "Adherente";
  estado: EstadoAfiliacion;
  vigenciaHasta: string;
  afiliadaDesde: string;
  empleados: number;
  ciudad: string;
  sector: string;
  sitioWeb: string;
  descripcion: string;
  contactos: Contacto[];
  cargos: Cargo[];
  facturas: Factura[];
  verticales: string[];
  kam?: { nombre: string; cargo: string; correo: string; telefono: string; iniciales: string };
}

export interface Actividad {
  id: string;
  titulo: string;
  programa: string;
  fecha: string;
  modalidad: "Virtual" | "Presencial";
  exclusivo: boolean;
  conCosto: boolean;
  cupos: number;
  inscritos: number;
  contacto: string;
  estado: "abierto" | "finalizado";
}

export interface EmpresaDirectorio {
  nombre: string;
  ciudad: string;
  categoria: string;
  empleados: string;
  verificada: boolean;
  servicios: string[];
}

export interface Oportunidad {
  id: string;
  titulo: string;
  entidad: string;
  tipo: string;
  cierra: string;
  estado: "abierta" | "postulada" | "en-evaluacion" | "cerrada";
  aplicaA: Segmento[];
  descripcion: string;
}
