/**
 * Lo que Sofi sabe responder. Sin servicios detrás: intenciones por palabras
 * clave y respuestas escritas con la información oficial del asistente actual
 * de Fedesoft (afiliación, Softic, Premios Ingenio, servicios gremiales y sus
 * canales de contacto).
 *
 * Dentro del portal responde con contexto: sabe el rol y la empresa de quien
 * pregunta y pregunta a la matriz de acceso antes de ofrecer un atajo, así que
 * nunca manda a nadie a una sección que su rol no alcanza.
 */
import { nivelPortal, type SeccionPortal } from "@/lib/acceso";
import { ACTIVIDADES } from "@/lib/mock/catalogo";
import type { Empresa } from "@/lib/mock/tipos";
import type { RolEmpresa } from "@/lib/mock/usuarios";
import { cop, fecha, HOY } from "@/lib/format";

export interface Contexto {
  superficie: "publico" | "portal";
  nombre?: string;
  rol?: RolEmpresa;
  empresa?: Empresa;
}

export type Bloque =
  | { tipo: "texto"; texto: string }
  | { tipo: "lista"; items: string[]; ordenada?: boolean };

export interface Accion {
  etiqueta: string;
  href: string;
  externo?: boolean;
}

export interface Respuesta {
  tema: string;
  bloques: Bloque[];
  acciones?: Accion[];
  sugerencias?: string[];
  fuente?: { titulo: string; url: string };
}

/* ── Canales oficiales (del asistente actual de Fedesoft) ─────────── */

const CANAL = {
  afiliaciones: { area: "Afiliaciones", whatsapp: "+57 316 465 5878", wa: "573164655878", correo: "expansion@fedesoft.org" },
  servicios: { area: "Eventos y servicios", whatsapp: "+57 301 852 8662", wa: "573018528662", correo: "gestorservicios@cenisoft.org" },
  competitividad: { area: "Competitividad", whatsapp: "+57 315 928 9284", wa: "573159289284", correo: "competitividad@fedesoft.org" },
} as const;

type Canal = (typeof CANAL)[keyof typeof CANAL];

const accionesCanal = (c: Canal): Accion[] => [
  { etiqueta: `WhatsApp ${c.whatsapp}`, href: `https://wa.me/${c.wa}`, externo: true },
  { etiqueta: c.correo, href: `mailto:${c.correo}`, externo: true },
];

const MENU = [
  "Soy afiliado y necesito ayuda",
  "Quiero afiliarme a Fedesoft",
  "Concurso Nacional de Programación",
  "Softic 2026",
  "Premios Ingenio 2026",
];

/* ── Utilidades ───────────────────────────────────────────────────── */

export function normalizar(t: string): string {
  return t
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9ñ\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const tiene = (t: string, ...patrones: RegExp[]) => patrones.some((p) => p.test(t));
const primerNombre = (n?: string) => n?.split(" ")[0];
const puede = (ctx: Contexto, s: SeccionPortal) => (ctx.rol ? nivelPortal(ctx.rol, s) : null);
const gerenteDe = (e?: Empresa) => e?.contactos.find((c) => c.rol === "gerente")?.nombre ?? "el gerente registrado";
const NOMBRE_ROL: Record<RolEmpresa, string> = { gerente: "gerente", talento: "talento humano", contacto: "contacto" };

/** Fuera del portal, un atajo a una sección pasa primero por el login. */
function enlace(ctx: Contexto, etiqueta: string, href: string): Accion {
  return ctx.superficie === "portal" ? { etiqueta, href } : { etiqueta, href: `/entrar?destino=${encodeURIComponent(href)}` };
}

const texto = (t: string): Bloque => ({ tipo: "texto", texto: t });
/** "Datalabs Andina S.A.S." al final de una frase no lleva un segundo punto. */
const sinPunto = (t: string) => t.replace(/\.$/, "");

/* ── Respuestas ───────────────────────────────────────────────────── */

function sugerenciasPortal(ctx: Contexto): string[] {
  const s: string[] = [];
  if (puede(ctx, "facturacion")) s.push("Descargar mi certificado", "Pagar la cuota");
  if (puede(ctx, "formacion") === "gestiona") s.push("Inscribir a mi equipo");
  else if (puede(ctx, "formacion")) s.push("Mis inscripciones");
  if (puede(ctx, "contactos")) s.push("Gestionar accesos");
  if (ctx.empresa?.segmento === "grande" && puede(ctx, "cuenta-estrategica")) s.push("Mi gestora de cuenta");
  if (!puede(ctx, "facturacion")) s.push("Datos de la empresa");
  s.push("Eventos de Fedesoft");
  return s.slice(0, 5);
}

export function bienvenida(ctx: Contexto): Respuesta {
  if (ctx.superficie === "portal" && ctx.empresa) {
    return {
      tema: "bienvenida",
      bloques: [
        texto(`¡Hola, ${primerNombre(ctx.nombre) ?? "bienvenido"}! Soy Sofi, la asistente virtual de Fedesoft.`),
        texto(`Estás en el portal de ${sinPunto(ctx.empresa.razonSocial)}. ¿En qué te ayudo?`),
      ],
      sugerencias: sugerenciasPortal(ctx),
    };
  }
  return {
    tema: "bienvenida",
    bloques: [
      texto("¡Hola! Soy Sofi, la asistente virtual de Fedesoft, la Federación Colombiana de la Industria de Software y TI."),
      texto("¿En qué puedo ayudarte hoy?"),
    ],
    sugerencias: MENU,
  };
}

function afiliarse(ctx: Contexto): Respuesta {
  return {
    tema: "afiliacion",
    bloques: [
      texto(ctx.superficie === "portal" ? "Tu empresa ya está afiliada. Si quieres afiliar otra empresa:" : "¡Excelente decisión! Para iniciar tu afiliación:"),
      {
        tipo: "lista",
        ordenada: true,
        items: [
          "Diligencia la solicitud de afiliación en línea.",
          "El equipo de Afiliaciones revisa los documentos y te contacta.",
          "Al aprobarse, el contacto principal recibe su acceso a este portal.",
        ],
      },
      texto("Si necesitas orientación durante el proceso, escríbele al equipo de Afiliaciones:"),
    ],
    acciones: [{ etiqueta: "Solicitar la afiliación", href: "/afiliarme" }, ...accionesCanal(CANAL.afiliaciones)],
    sugerencias: ["Servicios gremiales", "Hablar con una persona"],
    fuente: { titulo: "fedesoft.org/afiliate", url: "https://fedesoft.org/afiliate" },
  };
}

function softic(): Respuesta {
  return {
    tema: "softic",
    bloques: [
      texto(
        "Softic 2026 es el Congreso Internacional de Software y TI organizado por Fedesoft. Se realiza de forma presencial los días 14, 15 y 16 de octubre de 2026 y está abierto al público general.",
      ),
      texto("La inscripción, la agenda y los ponentes están en el sitio del evento."),
    ],
    acciones: [{ etiqueta: "Ir a softic.fedesoft.org", href: "https://softic.fedesoft.org", externo: true }, ...accionesCanal(CANAL.servicios)],
    sugerencias: ["Premios Ingenio 2026", "Servicios gremiales"],
    fuente: { titulo: "softic.fedesoft.org", url: "https://softic.fedesoft.org" },
  };
}

function ingenio(): Respuesta {
  return {
    tema: "ingenio",
    bloques: [
      texto(
        "Los Premios Ingenio 2026 reconocen a empresas e iniciativas que han contribuido al desarrollo y la innovación tecnológica en Colombia. El lanzamiento fue el 23 de julio de 2026 y la fecha de la ceremonia de premiación está pendiente de confirmación.",
      ),
      texto("Las categorías, el proceso de postulación y las novedades están en el sitio de los premios."),
    ],
    acciones: [{ etiqueta: "Ir a premiosingenio.fedesoft.org", href: "https://premiosingenio.fedesoft.org", externo: true }, ...accionesCanal(CANAL.competitividad)],
    sugerencias: ["Softic 2026", "Concurso Nacional de Programación"],
    fuente: { titulo: "premiosingenio.fedesoft.org", url: "https://premiosingenio.fedesoft.org" },
  };
}

function concurso(): Respuesta {
  return {
    tema: "concurso",
    bloques: [
      texto(
        "Las bases, las categorías y las fechas de la edición vigente del Concurso Nacional de Programación se publican en el sitio de Fedesoft. Aún no tengo la información de la edición 2026 confirmada para dártela aquí.",
      ),
    ],
    acciones: [{ etiqueta: "Ir a fedesoft.org", href: "https://fedesoft.org", externo: true }],
    sugerencias: ["Softic 2026", "Premios Ingenio 2026", "Hablar con una persona"],
  };
}

function servicios(ctx: Contexto): Respuesta {
  const acciones: Accion[] = [];
  if (ctx.superficie === "portal" && puede(ctx, "verticales")) acciones.push({ etiqueta: "Ver mis verticales", href: "/verticales" });
  if (ctx.superficie === "portal" && puede(ctx, "oportunidades")) acciones.push({ etiqueta: "Oportunidades para mi empresa", href: "/oportunidades" });
  acciones.push({ etiqueta: "Servicios gremiales", href: "https://fedesoft.org/servicios-gremiales", externo: true });
  return {
    tema: "servicios",
    bloques: [
      texto("Fedesoft ofrece servicios gremiales para fortalecer a las empresas del sector de software y TI:"),
      {
        tipo: "lista",
        items: [
          "Representatividad y participación en diálogos relevantes para la industria.",
          "Información exclusiva, networking y espacios de encadenamiento empresarial.",
          "Verticales de educación, salud, financiera y seguridad y confianza digital.",
          "Internacionalización: International Soft Route, Soft Landing y Markets Overview.",
          "Talento TI: conexión de perfiles, formación especializada y atracción de talento.",
          "Visibilidad, eventos y proyectos para generar conexiones de negocio.",
        ],
      },
    ],
    acciones,
    sugerencias: ["Formación para mi equipo", "Quiero afiliarme a Fedesoft"],
    fuente: { titulo: "fedesoft.org/servicios-gremiales", url: "https://fedesoft.org/servicios-gremiales" },
  };
}

function ayudaAfiliado(ctx: Contexto): Respuesta {
  if (ctx.superficie !== "portal") {
    return {
      tema: "afiliado",
      bloques: [
        texto("Todo lo de tu empresa está en el portal del afiliado: estado de cuenta, certificado, formación del equipo y accesos."),
        texto("Ingresa con tu correo corporativo y vuelve a escribirme: ahí te ayudo con lo tuyo."),
      ],
      acciones: [{ etiqueta: "Ingresar al portal", href: "/entrar" }],
      sugerencias: ["Hablar con una persona"],
    };
  }
  return { tema: "afiliado", bloques: [texto("Claro, ¿con qué te ayudo?")], sugerencias: sugerenciasPortal(ctx) };
}

function certificado(ctx: Contexto): Respuesta {
  const e = ctx.empresa;
  if (ctx.superficie !== "portal" || !e) {
    return {
      tema: "certificado",
      bloques: [texto("El certificado de afiliación, con folio y código QR, se descarga desde el portal del afiliado.")],
      acciones: [enlace(ctx, "Ir a mi certificado", "/facturacion/certificado")],
    };
  }
  if (!puede(ctx, "facturacion")) {
    return {
      tema: "certificado",
      bloques: [
        texto(
          `El certificado de ${e.razonSocial} lo descarga ${gerenteDe(e)}, el gerente registrado. Tu perfil de ${NOMBRE_ROL[ctx.rol!]} no tiene acceso a facturación.`,
        ),
      ],
      sugerencias: ["Datos de la empresa", "Eventos de Fedesoft"],
    };
  }
  if (e.estado !== "al-dia") {
    const pendiente = e.cargos.filter((c) => c.estado !== "pagado").reduce((s, c) => s + c.monto, 0);
    return {
      tema: "certificado",
      bloques: [
        texto(`La cuota de ${e.razonSocial} está vencida, así que el certificado está en pausa.`),
        texto(`Paga ${cop(pendiente)} en línea: la confirmación llega en minutos y el certificado se habilita solo.`),
      ],
      acciones: [enlace(ctx, "Pagar la cuota", "/facturacion/pagar"), enlace(ctx, "Ver estado de cuenta", "/facturacion")],
    };
  }
  return {
    tema: "certificado",
    bloques: [texto(`${e.razonSocial} está al día: el certificado con folio y QR se descarga al instante y cualquiera puede verificarlo.`)],
    acciones: [enlace(ctx, "Ir a mi certificado", "/facturacion/certificado")],
  };
}

function pago(ctx: Contexto): Respuesta {
  const e = ctx.empresa;
  if (ctx.superficie !== "portal" || !e) {
    return {
      tema: "pago",
      bloques: [texto("El estado de cuenta y el pago en línea de la cuota están en el portal del afiliado. Al pagar, la factura electrónica se emite sola.")],
      acciones: [enlace(ctx, "Ver mi estado de cuenta", "/facturacion")],
    };
  }
  if (!puede(ctx, "facturacion")) {
    return {
      tema: "pago",
      bloques: [texto(`La facturación de ${e.razonSocial} la gestiona ${gerenteDe(e)}. Tu perfil de ${NOMBRE_ROL[ctx.rol!]} no tiene acceso a pagos.`)],
      sugerencias: ["Datos de la empresa", "Eventos de Fedesoft"],
    };
  }
  const pendientes = e.cargos.filter((c) => c.estado !== "pagado");
  if (pendientes.length === 0) {
    return { tema: "pago", bloques: [texto(`${e.razonSocial} no tiene cargos pendientes. ¡Todo al día!`)], acciones: [enlace(ctx, "Ver facturas", "/facturacion")] };
  }
  const total = pendientes.reduce((s, c) => s + c.monto, 0);
  const vence = pendientes[0].vence;
  return {
    tema: "pago",
    bloques: [
      texto(`Tienes ${cop(total)} por pagar (${pendientes[0].concepto}), con vencimiento el ${fecha(vence)}.`),
      texto("El pago se confirma de servidor a servidor con la pasarela y la factura electrónica con CUFE se emite sola."),
    ],
    acciones: [enlace(ctx, "Pagar ahora", "/facturacion/pagar"), enlace(ctx, "Ver estado de cuenta", "/facturacion")],
  };
}

function formacion(ctx: Contexto): Respuesta {
  const proxima = ACTIVIDADES.filter((a) => a.estado === "abierto" && a.fecha >= HOY && a.inscritos < a.cupos)
    .sort((a, b) => a.fecha.localeCompare(b.fecha))[0];
  const destacada = proxima ? texto(`La próxima con cupo: «${proxima.titulo}» (${proxima.programa}), el ${fecha(proxima.fecha)}.`) : null;
  if (ctx.superficie !== "portal") {
    return {
      tema: "formacion",
      bloques: [
        texto("La oferta de formación de Fedesoft incluye TrainingLAB, TIC Talks y Series C+I. Buena parte es exclusiva para empresas afiliadas."),
        ...(destacada ? [destacada] : []),
      ],
      acciones: [enlace(ctx, "Ver el catálogo", "/formacion")],
      sugerencias: ["Quiero afiliarme a Fedesoft"],
    };
  }
  const equipo = puede(ctx, "formacion") === "gestiona";
  return {
    tema: "formacion",
    bloques: [
      texto(
        equipo
          ? "Desde Formación inscribes a tu equipo con un clic y ves quién participó en qué."
          : "Desde Formación te inscribes a las sesiones. La inscripción del equipo la hacen el gerente o el líder de talento.",
      ),
      ...(destacada ? [destacada] : []),
    ],
    acciones: [{ etiqueta: equipo ? "Inscribir a mi equipo" : "Ver el catálogo", href: "/formacion" }],
  };
}

function accesos(ctx: Contexto): Respuesta {
  if (ctx.superficie === "portal" && puede(ctx, "contactos")) {
    return {
      tema: "accesos",
      bloques: [texto("En Contactos y accesos invitas personas, cambias su rol y desactivas a quien ya no esté en la empresa. Cada cambio queda registrado.")],
      acciones: [{ etiqueta: "Gestionar accesos", href: "/empresa/contactos" }],
    };
  }
  return {
    tema: "accesos",
    bloques: [
      texto(
        ctx.superficie === "portal"
          ? `Los accesos de ${ctx.empresa?.razonSocial ?? "tu empresa"} los administra ${gerenteDe(ctx.empresa)}. Si necesitas que inviten a alguien o cambien un rol, pídeselo.`
          : "Los accesos de cada empresa los administra su gerente desde el portal.",
      ),
    ],
  };
}

function datosEmpresa(ctx: Contexto): Respuesta {
  const edita = puede(ctx, "empresa") === "gestiona";
  return {
    tema: "empresa",
    bloques: [
      texto(
        ctx.superficie !== "portal"
          ? "Los datos de tu empresa se consultan y actualizan desde el portal del afiliado; alimentan tu ficha en el directorio."
          : edita
            ? "En Mi empresa actualizas los datos de la empresa; el cambio alimenta tu ficha del directorio, sin cargarlo dos veces."
            : "En Mi empresa consultas los datos de la empresa. Los actualiza el gerente registrado.",
      ),
    ],
    acciones: [enlace(ctx, "Ir a Mi empresa", "/empresa")],
  };
}

function cuentaEstrategica(ctx: Contexto): Respuesta {
  const e = ctx.empresa;
  if (ctx.superficie !== "portal" || !e) {
    return {
      tema: "cuenta",
      bloques: [texto("Las empresas grandes afiliadas tienen una gestora o gestor de cuenta y un panel consolidado en el portal.")],
      acciones: [enlace(ctx, "Ir al portal", "/cuenta-estrategica")],
    };
  }
  if (!e.kam) {
    return { tema: "cuenta", bloques: [texto("La cuenta estratégica es para empresas grandes. Tu empresa accede a todos los servicios de autoservicio del portal.")] };
  }
  if (!puede(ctx, "cuenta-estrategica")) {
    return {
      tema: "cuenta",
      bloques: [texto(`${e.razonSocial} tiene gestora de cuenta. El panel lo consultan el gerente y el líder de talento; pídeles lo que necesites.`)],
    };
  }
  return {
    tema: "cuenta",
    bloques: [texto(`Tu gestora de cuenta es ${e.kam.nombre}, ${e.kam.cargo}. Te atiende directamente en el ${e.kam.telefono} o en ${e.kam.correo}.`)],
    acciones: [
      { etiqueta: "Ver el panel de mi cuenta", href: "/cuenta-estrategica" },
      { etiqueta: `Escribir a ${primerNombre(e.kam.nombre)}`, href: `mailto:${e.kam.correo}`, externo: true },
    ],
  };
}

function humano(ctx: Contexto): Respuesta {
  const acciones: Accion[] = [];
  if (ctx.superficie === "portal" && ctx.empresa?.kam && puede(ctx, "cuenta-estrategica")) {
    acciones.push({ etiqueta: `Tu gestora: ${ctx.empresa.kam.nombre}`, href: `mailto:${ctx.empresa.kam.correo}`, externo: true });
  }
  return {
    tema: "humano",
    bloques: [
      texto("Te conecto con el equipo de Fedesoft. Escoge el área según tu tema:"),
      {
        tipo: "lista",
        items: [
          `${CANAL.afiliaciones.area}: WhatsApp ${CANAL.afiliaciones.whatsapp} · ${CANAL.afiliaciones.correo}`,
          `${CANAL.servicios.area} (Softic): WhatsApp ${CANAL.servicios.whatsapp} · ${CANAL.servicios.correo}`,
          `${CANAL.competitividad.area} (Premios Ingenio): WhatsApp ${CANAL.competitividad.whatsapp} · ${CANAL.competitividad.correo}`,
        ],
      },
    ],
    acciones: [...acciones, { etiqueta: "WhatsApp Afiliaciones", href: `https://wa.me/${CANAL.afiliaciones.wa}`, externo: true }],
  };
}

function capacidades(ctx: Contexto): Respuesta {
  return {
    tema: "capacidades",
    bloques: [
      texto(
        "Puedo orientarte sobre afiliación, servicios gremiales, eventos e iniciativas de Fedesoft: talento TI, internacionalización, visibilidad empresarial, proyectos, el Concurso Nacional de Programación, Softic y Premios Ingenio.",
      ),
      ...(ctx.superficie === "portal" ? [texto("Y dentro del portal, te ayudo con lo de tu empresa según tu rol: certificado, pagos, formación y accesos.")] : []),
    ],
    sugerencias: ctx.superficie === "portal" ? sugerenciasPortal(ctx) : MENU,
  };
}

function eventos(): Respuesta {
  return {
    tema: "eventos",
    bloques: [texto("Estos son los eventos e iniciativas destacados de Fedesoft:")],
    sugerencias: ["Softic 2026", "Premios Ingenio 2026", "Concurso Nacional de Programación"],
  };
}

function noEntiendo(ctx: Contexto): Respuesta {
  return {
    tema: "desconocido",
    bloques: [texto("Aún no tengo una respuesta para eso. Puedo ayudarte con estos temas, o conectarte con una persona del equipo:")],
    sugerencias: [...(ctx.superficie === "portal" ? sugerenciasPortal(ctx).slice(0, 3) : MENU.slice(0, 3)), "Hablar con una persona"],
  };
}

function ingreso(ctx: Contexto): Respuesta {
  if (ctx.superficie === "portal") {
    return {
      tema: "ingreso",
      bloques: [
        texto("Ya estás dentro del portal. Tu contraseña y tu segundo factor los administra el proveedor de identidad de Fedesoft, no este portal."),
        texto("Si alguien de tu empresa no puede entrar, el gerente puede revisar su acceso en Contactos y accesos."),
      ],
      acciones: puede(ctx, "contactos") ? [{ etiqueta: "Revisar accesos", href: "/empresa/contactos" }] : undefined,
    };
  }
  return {
    tema: "ingreso",
    bloques: [
      texto("Entras con tu correo corporativo. La contraseña la administra el proveedor de identidad de Fedesoft: desde ahí la recuperas."),
      texto("Si tu cuenta está bloqueada o tu empresa desactivó tu acceso, la pantalla de ingreso te dice a quién acudir."),
    ],
    acciones: [
      { etiqueta: "Recuperar mi contraseña", href: "/entrar/recuperar" },
      { etiqueta: "Ir al ingreso", href: "/entrar" },
    ],
    sugerencias: ["Hablar con una persona"],
  };
}

/** Elige la respuesta para lo que escribió la persona. */
export function responder(entrada: string, ctx: Contexto): Respuesta {
  const t = normalizar(entrada);
  if (!t) return bienvenida(ctx);
  const corto = t.split(" ").length <= 4;

  /* Las opciones numeradas del menú, como en el asistente actual. */
  const opcion = /^[1-5]$/.test(t) ? Number(t) : null;
  if (opcion === 1) return ayudaAfiliado(ctx);
  if (opcion === 2) return afiliarse(ctx);
  if (opcion === 3) return concurso();
  if (opcion === 4) return softic();
  if (opcion === 5) return ingenio();

  /* Cortesías solo cuando son todo el mensaje: "gracias, ¿cómo pago?" es una pregunta de pago. */
  if (tiene(t, /^(muchas |mil )?gracias( sofi| por (todo|tu ayuda|la ayuda))?$/, /^muy amable$/)) {
    return { tema: "gracias", bloques: [texto("¡Con gusto! Aquí estaré si necesitas algo más.")], sugerencias: ctx.superficie === "portal" ? sugerenciasPortal(ctx).slice(0, 3) : MENU.slice(0, 3) };
  }
  if (corto && tiene(t, /^(adios|chao|hasta luego|nos vemos)\b/)) return { tema: "despedida", bloques: [texto("¡Hasta pronto! Que tengas un excelente día.")] };

  /* Primero los temas con nombre propio, después los genéricos. */
  if (tiene(t, /\bsoftic\b/, /\bcongreso\b/)) return softic();
  if (tiene(t, /\bingenio\b/, /\bpremios?\b/)) return ingenio();
  if (tiene(t, /\bconcurso\b/, /\bmaraton\b/)) return concurso();
  if (tiene(t, /\b(contrasena|clave|olvide|recuperar|no puedo (entrar|ingresar)|no me deja (entrar|ingresar)|segundo factor)\b/)) return ingreso(ctx);
  if (tiene(t, /\bcertificad/, /\bsello\b/, /\bconstancia\b/)) return certificado(ctx);
  if (tiene(t, /\b(pag(o|os|ar|ue|a|ado|ada)|cuota|cuotas|factura|facturas|facturacion|estado de cuenta|deuda|debo|cartera)\b/)) return pago(ctx);
  /* "soy afiliado" antes que "afiliar": el afiliado pide ayuda, el visitante quiere afiliarse. */
  if (tiene(t, /\b(soy afiliad[oa]|somos afiliad[oa]s|ya estoy afiliad[oa]|como afiliad[oa])\b/)) return ayudaAfiliado(ctx);
  if (tiene(t, /\bafilia/, /\bunirme\b/, /\bhacerme socio\b/, /\bser socio\b/)) return afiliarse(ctx);
  if (tiene(t, /\b(gestora|gestor|kam|cuenta estrategica)\b/)) return cuentaEstrategica(ctx);
  if (tiene(t, /\b(formacion|curso|cursos|capacitacion|traininglab|tic talks?|inscrib\w*|inscripcion\w*|taller\w*)\b/)) return formacion(ctx);
  if (tiene(t, /\b(acceso|accesos|usuario|usuarios|invitar|invitacion|permiso|permisos|agregar (un |una )?(contacto|persona|usuario))\b/)) return accesos(ctx);
  if (tiene(t, /\b(datos de (la|mi) empresa|actualizar (los |mis )?datos|mis datos|ficha|perfil de (la|mi) empresa)\b/)) return datosEmpresa(ctx);
  if (tiene(t, /\b(servicio|servicios|beneficio|beneficios|gremial\w*|internacionaliz\w*|soft route|soft landing|talento ti|verticales?)\b/)) return servicios(ctx);
  if (tiene(t, /\b(evento|eventos)\b/)) return eventos();
  /* Pedir una persona, solo cuando se pide explícitamente: "hablar con mi gerente" no es esto. */
  if (tiene(t, /\bhablar con (una |un )?(persona|asesor|asesora|humano|agente|alguien)\b/, /\basesor(a)?\b/, /\bwhatsapp\b/, /\bagente humano\b/)) return humano(ctx);
  if (tiene(t, /\b(que haces|que puedes|que sabes|quien eres|en que me ayudas)\b/) || t === "ayuda") return capacidades(ctx);
  if (tiene(t, /\b(necesito ayuda|ayudame|tengo una duda)\b/)) return ayudaAfiliado(ctx);
  if (tiene(t, /^(hola|buen[oa]s?|hey|saludos|que mas|buen dia)\b/)) return bienvenida(ctx);
  return noEntiendo(ctx);
}
