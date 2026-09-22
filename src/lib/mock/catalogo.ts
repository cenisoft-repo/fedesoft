import type { Actividad, EmpresaDirectorio, Oportunidad } from "./tipos";

/** Oferta real de formación de Fedesoft: TrainingLAB, TIC Talks y Series C+I. */
export const ACTIVIDADES: Actividad[] = [
  { id: "a1", titulo: "BigQuery: el oráculo de datos para la era de la IA", programa: "TrainingLAB", fecha: "2026-10-01", modalidad: "Virtual", exclusivo: true, conCosto: false, cupos: 60, inscritos: 41, contacto: "coordinaciontalentoti@fedesoft.org", estado: "abierto" },
  { id: "a2", titulo: "Identidad digital: el nuevo perímetro del negocio", programa: "TrainingLAB", fecha: "2026-10-08", modalidad: "Virtual", exclusivo: true, conCosto: false, cupos: 60, inscritos: 58, contacto: "coordinaciontalentoti@fedesoft.org", estado: "abierto" },
  { id: "a3", titulo: "El VAR de los negocios: métricas y decisiones detrás de las empresas que juegan para ganar", programa: "Series C+I", fecha: "2026-10-15", modalidad: "Presencial", exclusivo: true, conCosto: true, cupos: 40, inscritos: 40, contacto: "coord.competitividad@fedesoft.org", estado: "abierto" },
  { id: "a4", titulo: "Agentes de IA y talento humano en acción", programa: "TIC Talk", fecha: "2026-10-22", modalidad: "Virtual", exclusivo: false, conCosto: false, cupos: 200, inscritos: 96, contacto: "coordinaciontalentoti@fedesoft.org", estado: "abierto" },
  { id: "a5", titulo: "Arquitecturas resilientes y recuperación sin drama en AWS", programa: "TrainingLAB", fecha: "2026-11-05", modalidad: "Virtual", exclusivo: true, conCosto: false, cupos: 60, inscritos: 12, contacto: "coordinaciontalentoti@fedesoft.org", estado: "abierto" },
  { id: "a6", titulo: "Meet and Challenge · Tech + Seguridad", programa: "Encuentro", fecha: "2026-11-12", modalidad: "Presencial", exclusivo: true, conCosto: false, cupos: 80, inscritos: 33, contacto: "coord.competitividad@fedesoft.org", estado: "abierto" },
  { id: "a7", titulo: "AI Workspace: potencia tu productividad con IA", programa: "TrainingLAB", fecha: "2026-09-17", modalidad: "Virtual", exclusivo: true, conCosto: false, cupos: 60, inscritos: 60, contacto: "coordinaciontalentoti@fedesoft.org", estado: "finalizado" },
  { id: "a8", titulo: "El costo de decir adiós", programa: "TrainingLAB", fecha: "2026-09-03", modalidad: "Virtual", exclusivo: true, conCosto: false, cupos: 60, inscritos: 47, contacto: "coordinaciontalentoti@fedesoft.org", estado: "finalizado" },
];

/** Participación del equipo de la empresa — lo que hoy no existe. */
export const HISTORIAL_EQUIPO = [
  { contacto: "Diana Salazar", actividad: "AI Workspace: potencia tu productividad con IA", fecha: "2026-09-17", asistio: true },
  { contacto: "Julián Ospina", actividad: "AI Workspace: potencia tu productividad con IA", fecha: "2026-09-17", asistio: true },
  { contacto: "Julián Ospina", actividad: "El costo de decir adiós", fecha: "2026-09-03", asistio: false },
  { contacto: "Camilo Restrepo", actividad: "FinTech Radar 2026 · Vertical Financiera", fecha: "2026-08-20", asistio: true },
  { contacto: "Diana Salazar", actividad: "Tendencias Talento Tech", fecha: "2026-07-30", asistio: true },
];

/** Empresas afiliadas visibles en el directorio público. */
export const DIRECTORIO: EmpresaDirectorio[] = [
  { nombre: "Choucair Testing", ciudad: "Medellín", categoria: "Pruebas de software", empleados: "500+", verificada: true, servicios: ["Testing", "Automatización", "QA"] },
  { nombre: "Comforce", ciudad: "Bogotá D.C.", categoria: "Desarrollo a la medida / apps", empleados: "100-500", verificada: true, servicios: ["Desarrollo", "Cloud", "Integración"] },
  { nombre: "OlimpIA", ciudad: "Bogotá D.C.", categoria: "Identidad digital", empleados: "100-500", verificada: true, servicios: ["Biometría", "Firma electrónica"] },
  { nombre: "Optima Consultores", ciudad: "Cali", categoria: "Consultoría TI", empleados: "50-100", verificada: true, servicios: ["Consultoría", "Arquitectura"] },
  { nombre: "NovaIP", ciudad: "Bogotá D.C.", categoria: "Infraestructura y redes", empleados: "50-100", verificada: true, servicios: ["Redes", "Telefonía IP"] },
  { nombre: "Cuántico", ciudad: "Medellín", categoria: "Desarrollo a la medida / apps", empleados: "10-50", verificada: true, servicios: ["Producto digital", "UX"] },
  { nombre: "Firefly Software Consulting", ciudad: "Barranquilla", categoria: "Consultoría TI", empleados: "10-50", verificada: false, servicios: ["Consultoría", "Datos"] },
  { nombre: "Datalabs Andina S.A.S.", ciudad: "Bogotá D.C.", categoria: "Desarrollo a la medida / apps", empleados: "10-50", verificada: true, servicios: ["Analítica", "Automatización", "IA"] },
];

export const CATEGORIAS = [
  "Todas las categorías",
  "Desarrollo a la medida / apps",
  "Consultoría TI",
  "Pruebas de software",
  "Identidad digital",
  "Infraestructura y redes",
];

/** Convocatorias y proyectos gestionados con Cenisoft. */
export const OPORTUNIDADES: Oportunidad[] = [
  { id: "o1", titulo: "Modernización de plataformas misionales", entidad: "Entidad pública · Nivel nacional", tipo: "Proyecto Cenisoft", cierra: "2026-10-30", estado: "abierta", aplicaA: ["mipyme", "grande"], descripcion: "Convocatoria para conformar el banco de proveedores de modernización de sistemas misionales. Requiere experiencia certificada en migración de plataformas legadas." },
  { id: "o2", titulo: "International Soft Route 2026 · Misión comercial", entidad: "Internacionalización", tipo: "Programa", cierra: "2026-11-15", estado: "abierta", aplicaA: ["mipyme", "grande"], descripcion: "Misión comercial a México y Chile para empresas con producto exportable. Incluye agenda de citas de negocio y acompañamiento." },
  { id: "o3", titulo: "Encadenamiento productivo · Sector salud", entidad: "Vertical Salud", tipo: "Encadenamiento", cierra: "2026-10-10", estado: "postulada", aplicaA: ["mipyme"], descripcion: "Articulación de proveedores de software para interoperabilidad de historia clínica electrónica." },
  { id: "o4", titulo: "Banco de talento TI · Programa de práctica dual", entidad: "Talento TI", tipo: "Programa", cierra: "2026-09-30", estado: "en-evaluacion", aplicaA: ["grande"], descripcion: "Vinculación de practicantes en formación dual con universidades aliadas." },
];

export const VERTICALES = [
  { nombre: "Salud", mesas: 6, participantes: 34, proxima: "2026-10-09", descripcion: "Interoperabilidad, historia clínica electrónica y regulación sectorial." },
  { nombre: "Financiera", mesas: 8, participantes: 47, proxima: "2026-10-02", descripcion: "FinTech Radar, open finance y ciberseguridad en servicios financieros." },
  { nombre: "Educación", mesas: 4, participantes: 21, proxima: "2026-10-23", descripcion: "Tecnología educativa, formación dual y pertinencia curricular." },
  { nombre: "Seguridad Digital", mesas: 5, participantes: 29, proxima: "2026-10-16", descripcion: "Marco de ciberseguridad, protección de datos y respuesta a incidentes." },
];

export const COMUNIDADES = [
  { nombre: "Comunidad de Gerentes", miembros: 118, rol: "gerente", proxima: "2026-10-07" },
  { nombre: "Líderes de Talento Humano", miembros: 96, rol: "talento", proxima: "2026-10-14" },
];

export const INSIGHTS = [
  { titulo: "Revenue por empleado 2026", tipo: "Estudio sectorial", actualizado: "2026-08-30", exclusivo: true },
  { titulo: "Cifras del sector software y TI", tipo: "Indicadores", actualizado: "2026-09-10", exclusivo: false },
  { titulo: "Entérate de regulaciones · boletín normativo", tipo: "Normativa", actualizado: "2026-09-18", exclusivo: true },
];
