import type { Empresa } from "./tipos";

/** Empresa MIPYME al día — escenario base. */
export const DATALABS: Empresa = {
  razonSocial: "Datalabs Andina S.A.S.",
  nit: "901.487.203-6",
  segmento: "mipyme",
  tipoAfiliacion: "Activo",
  estado: "al-dia",
  vigenciaHasta: "2026-12-31",
  afiliadaDesde: "2021-03-15",
  empleados: 24,
  ciudad: "Bogotá D.C.",
  sector: "Desarrollo a la medida / apps",
  sitioWeb: "datalabsandina.co",
  descripcion:
    "Desarrollo de plataformas de analítica de datos y automatización para los sectores financiero y salud.",
  contactos: [
    { id: "c1", nombre: "Camilo Restrepo", cargo: "Gerente General", correo: "camilo.restrepo@datalabsandina.co", telefono: "+57 310 555 1420", rol: "gerente", conAcceso: true },
    { id: "c2", nombre: "Diana Salazar", cargo: "Líder de Talento Humano", correo: "diana.salazar@datalabsandina.co", telefono: "+57 320 555 8891", rol: "talento", conAcceso: true },
    { id: "c3", nombre: "Julián Ospina", cargo: "Director de Tecnología", correo: "julian.ospina@datalabsandina.co", telefono: "+57 311 555 3067", rol: "contacto", conAcceso: true },
    { id: "c4", nombre: "Paola Cifuentes", cargo: "Analista Administrativa", correo: "paola.cifuentes@datalabsandina.co", telefono: "+57 315 555 7712", rol: "contacto", conAcceso: false },
  ],
  cargos: [
    { id: "g1", concepto: "Cuota de afiliación anual", periodo: "2026", monto: 2_450_000, vence: "2026-10-15", estado: "pendiente" },
  ],
  facturas: [
    { numero: "FES-8841", fecha: "2025-10-08", monto: 2_310_000, cufe: "a9f3c2e18b7d4056a1c93f7e2d80b64c5178ae39", estado: "emitida" },
    { numero: "FES-7126", fecha: "2024-10-11", monto: 2_180_000, cufe: "3d81be40c7a92f16d58e0b3ca7942f16d0e5b872", estado: "emitida" },
  ],
  verticales: ["Financiera", "Salud"],
};

/** La misma empresa con la cuota vencida — escenario de reglas de negocio. */
export const DATALABS_VENCIDA: Empresa = {
  ...DATALABS,
  estado: "vencida",
  vigenciaHasta: "2026-08-31",
  cargos: [
    { id: "g1", concepto: "Cuota de afiliación anual", periodo: "2026", monto: 2_450_000, vence: "2026-08-15", estado: "vencido" },
  ],
};

/** Empresa grande con gestor de cuenta asignado — Eje 2. */
export const VERTICE: Empresa = {
  razonSocial: "Sistemas Vértice S.A.",
  nit: "900.315.882-1",
  segmento: "grande",
  tipoAfiliacion: "Activo",
  estado: "al-dia",
  vigenciaHasta: "2026-12-31",
  afiliadaDesde: "2014-06-02",
  empleados: 486,
  ciudad: "Medellín",
  sector: "Software empresarial / ERP",
  sitioWeb: "sistemasvertice.com.co",
  descripcion:
    "Plataformas de gestión empresarial y servicios de modernización tecnológica para grandes superficies y banca.",
  contactos: [
    { id: "v1", nombre: "Marcela Betancur", cargo: "Vicepresidenta de Operaciones", correo: "marcela.betancur@sistemasvertice.com.co", telefono: "+57 314 555 2048", rol: "gerente", conAcceso: true },
    { id: "v2", nombre: "Ricardo Peñaloza", cargo: "Director de Talento", correo: "ricardo.penaloza@sistemasvertice.com.co", telefono: "+57 318 555 9930", rol: "talento", conAcceso: true },
    { id: "v3", nombre: "Sandra Quintero", cargo: "Gerente Financiera", correo: "sandra.quintero@sistemasvertice.com.co", telefono: "+57 312 555 4471", rol: "contacto", conAcceso: true },
  ],
  cargos: [
    { id: "gv1", concepto: "Cuota de afiliación anual", periodo: "2026", monto: 8_900_000, vence: "2026-10-15", estado: "pendiente" },
  ],
  facturas: [
    { numero: "FES-8790", fecha: "2025-10-03", monto: 8_450_000, cufe: "77c1a4e90b3d26f8ac51e7930d2b46e5c8f01a3d", estado: "emitida" },
  ],
  verticales: ["Financiera", "Educación", "Seguridad Digital"],
  kam: {
    nombre: "Marcela Ospina",
    cargo: "Gestora de Cuenta Estratégica",
    correo: "cuentas.estrategicas@fedesoft.org",
    telefono: "+57 317 371 1286",
    iniciales: "MO",
  },
};
