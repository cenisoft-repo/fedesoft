"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import {
  ArrowUpRight, BadgeCheck, CalendarDays, ChevronRight, Code2, GraduationCap, KeyRound, MessageCircle, Receipt,
  RotateCcw, Search, SendHorizontal, Sparkles, ThumbsDown, ThumbsUp, Trophy, UserRound, UsersRound, X,
  type LucideIcon,
} from "lucide-react";
import { useDemo } from "@/lib/demo";
import { useIdentidad } from "@/lib/identidad";
import { useRolPortal } from "@/lib/useAcceso";
import { esRutaPortal } from "@/lib/acceso";
import { MODO_API } from "@/lib/api/cliente";
import { useSesionApi } from "@/lib/api/sesion";
import { BotonTema } from "@/components/BotonTema";
import { useTema } from "@/lib/tema";
import { RobotSofi, type EscenaSofi, type EstadoSofi } from "./RobotSofi";
import {
  autocompletar, avisoContextual, bienvenida, responder,
  type Accion, type Aviso, type Bloque, type Contexto, type Respuesta,
} from "./motor";

type Mensaje =
  | { id: number; de: "persona"; texto: string; hora: string }
  | { id: number; de: "sofi"; respuesta: Respuesta; hora: string; util?: boolean };

const MAX_CARACTERES = 300;
const ID_PANEL = "sofi-panel";
const ID_SUGERIDAS = "sofi-sugeridas";
const CLAVE_AVISOS = "fedesoft-sofi-avisos";

/** Escenas de cuerpo entero que Sofi muestra de vez en cuando, en este orden. */
const ESCENAS: EscenaSofi[] = ["laptop", "mando", "cuerpo"];
/* Escena del avatar: la primera a los 12 s, luego cada 30 s, a lo sumo seis por visita. */
const ESCENA_PRIMERA = 12_000;
const ESCENA_CADA = 30_000;
const ESCENA_DURA = 5600;
const ESCENA_TOPE = 6;
/** La misma curva que usa el robot para pasar de la cara a la escena. */
const MORFO_LANZADOR = "650ms cubic-bezier(0.34, 1.2, 0.64, 1)";

const hora = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

const textoDe = (b: Bloque): string => {
  switch (b.tipo) {
    case "texto":
      return b.texto;
    case "lista":
      return b.items.join(". ");
    case "tarjetas":
      return b.items.map((t) => `${t.titulo}, ${t.meta ?? t.detalle}`).join(". ");
    case "dato":
      return `${b.etiqueta}: ${b.valor}${b.detalle ? `, ${b.detalle}` : ""}`;
  }
};
const textoCompleto = (r: Respuesta) => r.bloques.map(textoDe).join(" ");

const sinMovimiento = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Ícono de cada tema sugerido: la bienvenida se lee de un vistazo. */
function iconoDe(s: string): LucideIcon {
  const t = s.toLowerCase();
  if (/gestora|persona/.test(t)) return UserRound;
  if (/pag|cuota|factur|cuenta/.test(t)) return Receipt;
  if (/certificad/.test(t)) return BadgeCheck;
  if (/afili/.test(t)) return BadgeCheck;
  if (/inscrib|inscripci|curso|formaci/.test(t)) return GraduationCap;
  if (/acceso|equipo/.test(t)) return UsersRound;
  if (/concurso|program/.test(t)) return Code2;
  if (/premio|ingenio/.test(t)) return Trophy;
  if (/softic|evento/.test(t)) return CalendarDays;
  if (/contrase|entrar/.test(t)) return KeyRound;
  if (/datos|empresa/.test(t)) return Sparkles;
  return MessageCircle;
}

/** Avisos ya mostrados en esta pestaña: Sofi se ofrece una vez por sitio, no insiste. */
function avisosVistos(): string[] {
  try {
    const v = JSON.parse(window.sessionStorage.getItem(CLAVE_AVISOS) ?? "[]");
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}
function marcarAviso(clave: string) {
  try {
    window.sessionStorage.setItem(CLAVE_AVISOS, JSON.stringify([...new Set([...avisosVistos(), clave])]));
  } catch {
    /* sin almacenamiento: se ofrece una vez por página */
  }
}

/**
 * Sofi, la asistente virtual de Fedesoft: el robot de la federación vive en la
 * esquina, se inclina hacia el puntero y cambia de pose según la conversación.
 *
 * - Se ofrece según dónde está la persona (un aviso por sitio y pestaña).
 * - Responde escribiendo en vivo, con tarjetas y cifras cuando ayudan.
 * - Autocompleta las preguntas que sabe responder mientras se escribe.
 *
 * En el portal sabe quién pregunta y responde según su rol; fuera de él orienta
 * y lleva al login. No aparece en la consola interna.
 */
export function Sofi() {
  const pathname = usePathname() ?? "/";
  const { escenario } = useDemo();
  const { sesionPortal } = useIdentidad();
  const { actual } = useSesionApi("portal");
  const rol = useRolPortal();
  const { elegido } = useTema();
  /* En el lienzo oscuro de la landing, Sofi también es oscura mientras nadie elija otra vista. */
  const enLienzo = pathname === "/" || pathname.startsWith("/afiliarme") || pathname.startsWith("/verificar");
  const temaPropio = enLienzo && !elegido ? "dark" : undefined;

  /* Dentro del portal y con sesión (la simulada o la real del API), responde con contexto. */
  const vista = MODO_API && actual.estado === "lista" ? actual.vista : null;
  const conSesion = MODO_API ? Boolean(vista) : Boolean(sesionPortal);
  const enPortal = esRutaPortal(pathname) && conSesion;
  const contacto = escenario.empresa.contactos.find((c) => c.id === escenario.contactoId);
  const nombre = vista ? (vista.user.name ?? undefined) : contacto?.nombre;
  const razonSocial = vista?.activeOrganization?.legalName ?? escenario.empresa.razonSocial;
  const ctx = useMemo<Contexto>(
    () =>
      enPortal
        ? { superficie: "portal", nombre, rol, empresa: { ...escenario.empresa, razonSocial } }
        : { superficie: "publico" },
    [enPortal, nombre, rol, escenario.empresa, razonSocial],
  );

  const [abierto, setAbiertoEstado] = useState(false);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [entrada, setEntrada] = useState("");
  const [escribiendo, setEscribiendo] = useState(false);
  /* La respuesta que se está escribiendo en vivo. */
  const [animando, setAnimando] = useState<number | null>(null);
  const [estado, setEstado] = useState<EstadoSofi>("reposo");
  const [aviso, setAviso] = useState<Aviso | null>(null);
  /* Escena de cuerpo entero sobre el lanzador, y la del escenario del panel. */
  const [escena, setEscena] = useState<EscenaSofi | null>(null);
  const [escenaPanel, setEscenaPanel] = useState<EscenaSofi | null>(null);
  const cajaAviso = useRef<HTMLDivElement>(null);
  const avisoVisible = useRef(false);
  const [activa, setActiva] = useState(-1);
  const [listaCerrada, setListaCerrada] = useState(false);
  /* Lo que oye un lector de pantalla: solo la respuesta nueva, no el historial entero. */
  const [anuncio, setAnuncio] = useState("");
  /* Lo que dice Sofi cuando la saludas tocándola. */
  const [dicho, setDicho] = useState<{ n: number; texto: string } | null>(null);
  const temaEnCurso = useRef<string | null>(null);
  const siguienteId = useRef(1);
  const lanzador = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLElement>(null);
  const temporizadorAnuncio = useRef<number | undefined>(undefined);
  const campo = useRef<HTMLInputElement>(null);
  const lista = useRef<HTMLDivElement>(null);
  const temporizadorGesto = useRef<number | undefined>(undefined);
  const temporizadorRespuesta = useRef<number | undefined>(undefined);
  const ultimaActividad = useRef(Date.now());
  const abiertoRef = useRef(false);
  const ctxRef = useRef(ctx);
  const estadoRef = useRef(estado);
  useEffect(() => {
    ctxRef.current = ctx;
  }, [ctx]);
  useEffect(() => {
    estadoRef.current = estado;
    /* Si Sofi deja el reposo (escuchas, preguntas), la escena del panel termina. */
    if (estado !== "reposo") setEscenaPanel(null);
  }, [estado]);

  const setAbierto = useCallback((v: boolean) => {
    abiertoRef.current = v;
    setAbiertoEstado(v);
  }, []);

  const gesto = useCallback((e: EstadoSofi, ms: number) => {
    setEstado(e);
    window.clearTimeout(temporizadorGesto.current);
    temporizadorGesto.current = window.setTimeout(() => setEstado("reposo"), ms);
  }, []);

  /* Vaciar y volver a escribir: el lector de pantalla anuncia aunque el texto se repita. */
  const anunciar = useCallback((t: string) => {
    setAnuncio("");
    window.clearTimeout(temporizadorAnuncio.current);
    temporizadorAnuncio.current = window.setTimeout(() => setAnuncio(t), 80);
  }, []);

  const agregarSofi = useCallback(
    (respuesta: Respuesta) => {
      const id = siguienteId.current++;
      setMensajes((m) => [...m, { id, de: "sofi", respuesta, hora: hora() }]);
      /* Con el panel cerrado (se cerró mientras pensaba) queda en el historial, sin anunciarse. */
      if (!abiertoRef.current) {
        setEstado("reposo");
        return;
      }
      anunciar(`Sofi: ${textoCompleto(respuesta)}`);
      if (sinMovimiento()) {
        gesto("hablando", 1200);
      } else {
        /* Habla mientras escribe; al terminar vuelve al reposo (con tope por si acaso). */
        setAnimando(id);
        temaEnCurso.current = respuesta.tema;
        gesto("hablando", 4000);
      }
    },
    [gesto, anunciar],
  );

  /* Al terminar de escribir, reacciona: duda si no entendió, guiña al saludar. */
  const alTerminarRespuesta = useCallback(() => {
    setAnimando(null);
    const tema = temaEnCurso.current;
    temaEnCurso.current = null;
    if (tema === "desconocido") gesto("confundido", 1600);
    else if (tema === "bienvenida" || tema === "gracias") gesto("guino", 900);
    else gesto("hablando", 350);
  }, [gesto]);

  /* Cambiar de superficie, de empresa o de rol empieza una conversación con el contexto nuevo.
     Pagar o cambiar el estado de la cuenta no la borra. */
  const claveContexto = `${ctx.superficie}-${ctx.rol ?? ""}-${ctx.empresa?.nit ?? ""}`;
  useEffect(() => {
    window.clearTimeout(temporizadorRespuesta.current);
    setEscribiendo(false);
    setAnimando(null);
    setMensajes([]);
    if (abiertoRef.current) agregarSofi(bienvenida(ctxRef.current));
  }, [claveContexto, agregarSofi]);

  /* Un aviso oportuno según el sitio, una vez por pestaña: Sofi se ofrece sin estorbar. */
  const avisoActual = useMemo(() => avisoContextual(pathname, ctx), [pathname, ctx]);
  const claveAviso = avisoActual ? `${ctx.superficie}:${avisoActual.clave}` : null;
  useEffect(() => {
    setAviso(null);
    if (!avisoActual || !claveAviso || avisosVistos().includes(claveAviso)) return;
    let retirar = 0;
    const t = window.setTimeout(() => {
      if (abiertoRef.current) return;
      /* Mostrado cuenta como visto: si se ignora, no reaparece en esta pestaña. */
      marcarAviso(claveAviso);
      setAviso({ ...avisoActual, clave: claveAviso });
      gesto("atento", 1100);
      /* Se ofrece sin quedarse: a los 14 s se retira solo (y el foco, si estaba ahí, pasa a Sofi). */
      retirar = window.setTimeout(() => {
        if (cajaAviso.current?.contains(document.activeElement)) lanzador.current?.focus();
        setAviso(null);
      }, 14_000);
    }, 1800);
    return () => {
      window.clearTimeout(t);
      window.clearTimeout(retirar);
    };
  }, [avisoActual, claveAviso, gesto]);
  useEffect(() => {
    avisoVisible.current = Boolean(aviso);
  }, [aviso]);

  /* De vez en cuando, el avatar se transforma: la cámara se aleja de la cara y Sofi aparece
     de cuerpo entero, en su laptop o en su centro de mando; luego vuelve a ser un círculo.
     Solo en reposo, sin aviso, con el panel cerrado y con pantalla suficiente. */
  useEffect(() => {
    if (sinMovimiento()) return;
    let n = 0;
    let volver = 0;
    const mostrar = () => {
      if (n >= ESCENA_TOPE || abiertoRef.current || document.hidden || avisoVisible.current) return;
      if (estadoRef.current !== "reposo" || window.innerHeight < 560) return;
      setEscena(ESCENAS[n % ESCENAS.length]);
      n++;
      window.clearTimeout(volver);
      volver = window.setTimeout(() => setEscena(null), ESCENA_DURA);
    };
    const primera = window.setTimeout(mostrar, ESCENA_PRIMERA);
    const cada = window.setInterval(mostrar, ESCENA_CADA);
    return () => {
      window.clearTimeout(primera);
      window.clearInterval(cada);
      window.clearTimeout(volver);
    };
  }, []);

  /* Con el panel abierto y en calma, el escenario también cambia de escena. */
  useEffect(() => {
    if (!abierto || sinMovimiento()) return;
    let n = 0;
    let fin = 0;
    const cada = window.setInterval(() => {
      if (estadoRef.current !== "reposo" || document.hidden) return;
      setEscenaPanel(ESCENAS[n++ % ESCENAS.length]);
      window.clearTimeout(fin);
      fin = window.setTimeout(() => setEscenaPanel(null), 5000);
    }, 16_000);
    return () => {
      window.clearInterval(cada);
      window.clearTimeout(fin);
      setEscenaPanel(null);
    };
  }, [abierto]);

  const cerrarAviso = (devolverFoco = false) => {
    if (aviso) marcarAviso(aviso.clave);
    setAviso(null);
    /* El botón que tenía el foco desaparece: el foco pasa a Sofi, no se pierde. */
    if (devolverFoco) lanzador.current?.focus();
  };

  /* Se duerme tras un rato sin actividad y despierta con el puntero o el teclado.
     Antes de dormirse, de vez en cuando saluda para recordar que está ahí. */
  useEffect(() => {
    const despertar = () => {
      ultimaActividad.current = Date.now();
      setEstado((e) => (e === "durmiendo" ? "reposo" : e));
    };
    const revisar = window.setInterval(() => {
      if (abiertoRef.current) return;
      const quieto = Date.now() - ultimaActividad.current;
      if (quieto > 45_000) setEstado((e) => (e === "reposo" ? "durmiendo" : e));
    }, 5000);
    const llamar = window.setInterval(() => {
      if (abiertoRef.current || document.hidden || sinMovimiento() || estadoRef.current !== "reposo") return;
      gesto("atento", 1100);
    }, 19_000);
    window.addEventListener("pointermove", despertar, { passive: true });
    window.addEventListener("keydown", despertar);
    return () => {
      window.clearInterval(revisar);
      window.clearInterval(llamar);
      window.removeEventListener("pointermove", despertar);
      window.removeEventListener("keydown", despertar);
    };
  }, [gesto]);

  /* Al llegar, el lanzador aparece con un rebote y guiña. */
  useEffect(() => {
    if (sinMovimiento()) return;
    const t = window.setTimeout(() => {
      if (estadoRef.current === "reposo") gesto("guino", 900);
    }, 900);
    return () => window.clearTimeout(t);
  }, [gesto]);

  useEffect(
    () => () => {
      window.clearTimeout(temporizadorGesto.current);
      window.clearTimeout(temporizadorRespuesta.current);
      window.clearTimeout(temporizadorAnuncio.current);
    },
    [],
  );

  const preguntar = (textoCrudo: string) => {
    const texto = textoCrudo.trim().slice(0, MAX_CARACTERES);
    if (!texto || escribiendo) return;
    setAnimando(null);
    setMensajes((m) => [...m, { id: siguienteId.current++, de: "persona", texto, hora: hora() }]);
    setEntrada("");
    setActiva(-1);
    setEscribiendo(true);
    setEstado("pensando");
    window.clearTimeout(temporizadorGesto.current);
    const respuesta = responder(texto, ctx);
    /* Una pausa breve y proporcional: se lee como alguien que responde, no como un volcado. */
    temporizadorRespuesta.current = window.setTimeout(() => {
      setEscribiendo(false);
      agregarSofi(respuesta);
    }, 600 + Math.min(600, texto.length * 10));
  };

  const abrir = (pregunta?: string) => {
    if (aviso) cerrarAviso();
    setEscena(null);
    setAbierto(true);
    if (pregunta) {
      preguntar(pregunta);
    } else {
      gesto("feliz", 1100);
      if (mensajes.length === 0) agregarSofi(bienvenida(ctx));
    }
  };

  const cerrar = useCallback(() => {
    setAbierto(false);
    setAnimando(null);
    lanzador.current?.focus();
  }, [setAbierto]);

  useEffect(() => {
    if (!abierto) return;
    /* En pantallas táctiles el foco va al panel: el teclado en pantalla no tapa la bienvenida. */
    if (window.matchMedia("(pointer: coarse)").matches) panel.current?.focus();
    else campo.current?.focus();
  }, [abierto]);

  /* En pantallas angostas el panel tapa la página: al seguir un atajo interno, se cierra. */
  const alNavegar = useCallback(() => {
    if (window.matchMedia("(max-width: 639px)").matches) cerrar();
  }, [cerrar]);

  /* Escape solo cuando el foco está en Sofi: no le roba el Escape a un diálogo o a un menú. */
  const alTeclear = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      cerrar();
    }
  };

  /* Con solo el saludo, se ve a Sofi de cuerpo entero; después, siempre lo último. */
  const ultimo = mensajes[mensajes.length - 1];
  useEffect(() => {
    const el = lista.current;
    if (!el) return;
    const soloSaludo = mensajes.length <= 1 && !escribiendo;
    el.scrollTo({ top: soloSaludo ? 0 : el.scrollHeight, behavior: soloSaludo || sinMovimiento() ? "auto" : "smooth" });
  }, [mensajes.length, escribiendo]);

  /* Mientras se escribe la respuesta, la lista acompaña el texto que crece. */
  const seguirTexto = useCallback(() => {
    const el = lista.current;
    /* Solo si ya estaba al fondo: si la persona subió a leer, no se la arrastra. */
    if (el && mensajes.length > 1 && el.scrollHeight - el.scrollTop - el.clientHeight < 96) el.scrollTop = el.scrollHeight;
  }, [mensajes.length]);

  /* Autocompletar: las preguntas que Sofi sabe responder y encajan con lo escrito. */
  const opciones = useMemo(
    () => (listaCerrada ? [] : autocompletar(entrada, ctx).filter((o) => o.toLowerCase() !== entrada.trim().toLowerCase())),
    [entrada, ctx, listaCerrada],
  );
  const hayOpciones = opciones.length > 0 && !escribiendo;

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    preguntar(hayOpciones && activa >= 0 ? opciones[activa] : entrada);
  };

  const alTeclearCampo = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!hayOpciones) {
      /* Tras cerrar la lista con Escape, flecha abajo la vuelve a abrir. */
      if (e.key === "ArrowDown" && listaCerrada) {
        e.preventDefault();
        setListaCerrada(false);
      }
      return;
    }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const n = opciones.length;
      const abajo = e.key === "ArrowDown";
      setActiva((i) => (abajo ? (i + 1) % n : i <= 0 ? n - 1 : i - 1));
    } else if (e.key === "Escape") {
      /* El primer Escape cierra la lista; el segundo, a Sofi. */
      e.stopPropagation();
      setListaCerrada(true);
      setActiva(-1);
    }
  };

  /* Al usar una sugerencia, el chip desaparece: el foco vuelve al campo, no se pierde. */
  const sugerir = (s: string) => {
    preguntar(s);
    campo.current?.focus();
  };

  const valorar = (id: number, util: boolean) => {
    setMensajes((m) => m.map((x) => (x.id === id && x.de === "sofi" ? { ...x, util } : x)));
    anunciar(util ? "¡Gracias! Me alegra haberte ayudado." : "Gracias, lo tendremos en cuenta para mejorar.");
    gesto(util ? "feliz" : "triste", util ? 1800 : 1600);
  };

  /* Tocar a Sofi: saluda, guiña o celebra, y lo dice en una burbuja. */
  const mimar = () => {
    const reacciones: [EstadoSofi, string][] = [
      ["feliz", "¡Hola! 👋"],
      ["guino", "¡Aquí estoy!"],
      ["atento", "¿Te ayudo?"],
      ["feliz", "¡Vamos!"],
    ];
    const [e, texto] = reacciones[Math.floor(Math.random() * reacciones.length)];
    gesto(e, e === "feliz" ? 1400 : 1000);
    setDicho((d) => ({ n: (d?.n ?? 0) + 1, texto }));
    anunciar(`Sofi: ${texto}`);
  };

  const reiniciar = () => {
    window.clearTimeout(temporizadorRespuesta.current);
    setEscribiendo(false);
    setMensajes([]);
    agregarSofi(bienvenida(ctx));
    campo.current?.focus();
  };

  if (pathname.startsWith("/admin")) return null;

  const ultimaSofi = [...mensajes].reverse().find((m) => m.de === "sofi");
  const ocupada = escribiendo || animando !== null;

  return (
    <div
      data-theme={temaPropio}
      className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3 print:hidden sm:bottom-5 sm:right-5"
    >
      <p className="sr-only" aria-live="polite">{anuncio}</p>

      {abierto && (
        <section
          id={ID_PANEL}
          role="dialog"
          aria-label="Sofi, asistente virtual de Fedesoft"
          ref={panel}
          tabIndex={-1}
          onKeyDown={alTeclear}
          className="sofi-entra flex h-[min(680px,calc(100dvh-7rem))] w-[min(400px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-[var(--shadow-pop)] focus:outline-none [@media(max-height:560px)]:h-[calc(100dvh-1.5rem)]"
        >
          <header className="relative flex items-center gap-3 overflow-hidden bg-navy px-4 py-3 text-white">
            {/* La barra del manual: un énfasis por vista */}
            <span aria-hidden className="absolute inset-x-0 bottom-0 h-[3px] bg-[var(--brand-azure)]" />
            <RobotSofi estado={estado} tamano={40} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-[15.5px] font-bold leading-tight">Sofi de Fedesoft</p>
              <p className="flex items-center gap-1.5 truncate text-[12px] text-azure-200">
                <span aria-hidden className={`h-1.5 w-1.5 rounded-full bg-[#4ade80] ${ocupada ? "sofi-pulso" : ""}`} />
                {ocupada ? "Escribiendo…" : "Asistente virtual · en línea"}
              </p>
            </div>
            <BotonTema
              predeterminado={enLienzo ? "oscuro" : undefined}
              className="rounded-lg p-2.5 text-azure-200 transition hover:bg-white/10 hover:text-white"
            />
            <button
              type="button"
              onClick={reiniciar}
              className="rounded-lg p-2.5 text-azure-200 transition hover:bg-white/10 hover:text-white"
              aria-label="Empezar de nuevo la conversación"
              title="Empezar de nuevo"
            >
              <RotateCcw size={17} aria-hidden />
            </button>
            <button
              type="button"
              onClick={cerrar}
              className="rounded-lg p-2.5 text-azure-200 transition hover:bg-white/10 hover:text-white"
              aria-label="Cerrar el asistente"
            >
              <X size={18} aria-hidden />
            </button>
          </header>

          <div ref={lista} className="flex-1 space-y-4 overflow-y-auto bg-bg px-4 py-4">
            {/* Escenario: Sofi de cuerpo entero, viva, al comienzo de la conversación */}
            <div className="flex flex-col items-center gap-2 pb-1 pt-1 text-center [@media(max-height:560px)]:hidden">
              <div className="relative">
                <button
                  type="button"
                  onClick={mimar}
                  aria-label="Saludar a Sofi"
                  className="rounded-2xl transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                >
                  <RobotSofi estado={estado} modo="cuerpo" tamano={148} escena={escenaPanel ?? undefined} />
                </button>
                {dicho && (
                  <span
                    key={dicho.n}
                    aria-hidden
                    onAnimationEnd={() => setDicho(null)}
                    className="sofi-dicho pointer-events-none absolute left-[calc(100%-16px)] top-3 whitespace-nowrap rounded-2xl rounded-bl-md bg-[var(--navy-700)] px-3 py-1.5 text-[12.5px] font-semibold text-white shadow-[var(--shadow-pop)]"
                  >
                    {dicho.texto}
                  </span>
                )}
              </div>
              <p className="text-[12.5px] text-muted">
                {ctx.superficie === "portal" ? `Asistente del portal · ${ctx.empresa?.razonSocial ?? ""}` : "Asistente virtual de Fedesoft"}
              </p>
            </div>

            {mensajes.map((m) =>
              m.de === "persona" ? (
                <div key={m.id} className="sofi-burbuja-der flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-br-md bg-[var(--navy-700)] px-3.5 py-2.5 text-[14.5px] text-white">
                    <p className="whitespace-pre-wrap break-words">{m.texto}</p>
                    <p className="mt-1 text-right text-[11px] text-white/75">{m.hora}</p>
                  </div>
                </div>
              ) : (
                <MensajeSofi
                  key={m.id}
                  m={m}
                  animar={m.id === animando}
                  esUltimo={m.id === ultimaSofi?.id && m.id === ultimo?.id && !escribiendo}
                  onCrece={seguirTexto}
                  onNavegar={alNavegar}
                  onTerminado={alTerminarRespuesta}
                  onSugerencia={sugerir}
                  onValorar={(util) => valorar(m.id, util)}
                />
              ),
            )}
            {escribiendo && (
              <div className="sofi-burbuja-izq flex items-end gap-2" data-sofi-escribiendo>
                <RobotSofi estado="pensando" tamano={30} />
                <div className="flex gap-1 rounded-2xl rounded-bl-md bg-surface px-4 py-3 shadow-sm">
                  <span className="sr-only">Sofi está escribiendo</span>
                  {[0, 1, 2].map((i) => (
                    <span key={i} aria-hidden className="sofi-escribe h-2 w-2 rounded-full bg-accent" style={{ animationDelay: `${i * 0.16}s` }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <form onSubmit={enviar} className="relative border-t border-line bg-surface p-3">
            {/* Autocompletar: flota sobre la conversación, encima del campo */}
            {hayOpciones && (
              <ul
                id={ID_SUGERIDAS}
                role="listbox"
                aria-label="Preguntas sugeridas"
                className="sofi-entra absolute inset-x-3 bottom-full mb-2 overflow-hidden rounded-xl border border-line bg-surface py-1 shadow-[var(--shadow-pop)]"
              >
                {opciones.map((o, i) => (
                  <li
                    key={o}
                    id={`${ID_SUGERIDAS}-${i}`}
                    role="option"
                    aria-selected={i === activa}
                    onPointerDown={(e) => e.preventDefault()}
                    onClick={() => sugerir(o)}
                    className={`flex cursor-pointer items-center gap-2.5 px-3 py-2.5 text-[14px] ${
                      i === activa ? "bg-[var(--info-bg)] text-link" : "text-ink hover:bg-[var(--info-bg)]"
                    }`}
                  >
                    <Search size={14} aria-hidden className="shrink-0 text-muted" />
                    <span className="min-w-0 flex-1 truncate">{o}</span>
                    {i === activa && <ChevronRight size={14} aria-hidden className="shrink-0" />}
                  </li>
                ))}
              </ul>
            )}
            <div className="flex items-center gap-2 rounded-full border border-line bg-bg pl-4 pr-1.5 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/40">
              <label htmlFor="sofi-entrada" className="sr-only">Escribe tu pregunta a Sofi</label>
              <input
                ref={campo}
                id="sofi-entrada"
                role="combobox"
                aria-autocomplete="list"
                aria-expanded={hayOpciones}
                aria-controls={hayOpciones ? ID_SUGERIDAS : undefined}
                aria-activedescendant={hayOpciones && activa >= 0 ? `${ID_SUGERIDAS}-${activa}` : undefined}
                value={entrada}
                onChange={(e) => {
                  setEntrada(e.target.value);
                  setActiva(-1);
                  setListaCerrada(false);
                  /* Mientras escribes, Sofi te escucha: mira hacia el campo. */
                  const hay = e.target.value.trim().length > 0;
                  setEstado((x) => (hay && (x === "reposo" || x === "durmiendo") ? "escuchando" : !hay && x === "escuchando" ? "reposo" : x));
                }}
                onKeyDown={alTeclearCampo}
                onBlur={() => {
                  setListaCerrada(true);
                  setActiva(-1);
                  setEstado((x) => (x === "escuchando" ? "reposo" : x));
                }}
                maxLength={MAX_CARACTERES}
                autoComplete="off"
                placeholder="Escribe tu pregunta…"
                className="sofi-campo min-w-0 flex-1 bg-transparent py-2.5 text-[14.5px] outline-none placeholder:text-muted"
              />
              <button
                type="submit"
                disabled={!entrada.trim() || escribiendo}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--navy-700)] text-white transition hover:brightness-110 active:scale-90 disabled:opacity-40"
                aria-label="Enviar"
              >
                <SendHorizontal size={16} aria-hidden />
              </button>
            </div>
            <p className="mt-2 text-center text-[11.5px] leading-snug text-muted [@media(max-height:560px)]:hidden">
              Asistente de demostración con respuestas predefinidas a partir de información oficial de Fedesoft. No
              compartas contraseñas ni datos sensibles.
            </p>
          </form>
        </section>
      )}

      {/* Aviso oportuno, una vez por sitio y pestaña: Sofi de cuerpo entero se ofrece */}
      {aviso && !abierto && (
        <div ref={cajaAviso} className="sofi-entra relative mr-1 flex max-w-[300px] items-center gap-3 rounded-2xl rounded-br-md border border-line bg-surface p-2.5 pr-1 shadow-[var(--shadow-pop)]">
          <button type="button" onClick={() => abrir(aviso.pregunta)} className="group flex items-center gap-3 text-left">
            <RobotSofi estado="reposo" modo="cuerpo" tamano={64} />
            <span className="text-[13.5px]">
              <span className="block font-semibold">{aviso.texto}</span>
              <span className="mt-0.5 inline-flex items-center gap-1 text-[12.5px] font-semibold text-link group-hover:underline">
                {aviso.pregunta} <ChevronRight size={13} aria-hidden />
              </span>
            </span>
          </button>
          <button type="button" onClick={() => cerrarAviso(true)} className="self-start rounded p-2 text-muted hover:text-ink" aria-label="Cerrar aviso">
            <X size={14} aria-hidden />
          </button>
        </div>
      )}

      {/* Sofi es el lanzador */}
      <button
        ref={lanzador}
        type="button"
        onClick={abierto ? cerrar : () => abrir()}
        onPointerEnter={() => !abierto && estado !== "pensando" && setEstado("atento")}
        onPointerLeave={() => setEstado((e) => (e === "atento" ? "reposo" : e))}
        onFocus={() => !abierto && setEstado("atento")}
        onBlur={() => setEstado((e) => (e === "atento" ? "reposo" : e))}
        aria-expanded={abierto}
        aria-controls={ID_PANEL}
        aria-label={aviso && !abierto ? "Sofi, asistente virtual de Fedesoft (tiene un aviso)" : "Sofi, asistente virtual de Fedesoft"}
        data-sofi-escena={escena ?? undefined}
        className={`group relative grid place-items-center active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${
          abierto ? "[@media(max-height:560px)]:hidden" : ""
        }`}
        style={{
          /* El avatar se transforma en la escena y vuelve: mismo botón, mismo nombre, mismo clic. */
          width: escena ? 186 : 76,
          height: escena ? 186 : 76,
          borderRadius: escena ? "30%" : "50%",
          transition: `width ${MORFO_LANZADOR}, height ${MORFO_LANZADOR}, border-radius ${MORFO_LANZADOR}, transform 150ms`,
        }}
      >
        <span
          aria-hidden
          className="absolute inset-0.5 shadow-[var(--shadow-pop)]"
          style={{ borderRadius: escena ? "30%" : "50%", transition: `border-radius ${MORFO_LANZADOR}` }}
        />
        <RobotSofi estado={estado} tamano={escena ? 176 : 66} interactivo escena={escena ?? undefined} />
        {escena === "mando" && (
          <span
            aria-hidden
            className="sofi-chip absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-[var(--navy-700)] px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-white"
            style={{ animationDelay: "350ms" }}
          >
            <span className="sofi-pulso h-1.5 w-1.5 rounded-full bg-[#4ade80]" /> En vivo
          </span>
        )}
        {aviso && !abierto && (
          <span aria-hidden className="absolute right-1 top-1 grid h-4 w-4 place-items-center">
            <span className="sofi-ping absolute h-full w-full rounded-full bg-[var(--brand-azure)]" />
            <span className="relative h-3 w-3 rounded-full border-2 border-white bg-[var(--brand-azure)]" />
          </span>
        )}
      </button>
    </div>
  );
}

/* ── Mensaje de Sofi: se escribe en vivo ─────────────────────────── */

/** Cuánto "pesa" un bloque que no es texto: aparece cuando la escritura lo alcanza. */
const PESO_FICHA = 24;
const pesoDe = (b: Bloque) =>
  b.tipo === "texto" ? b.texto.length : b.tipo === "lista" ? b.items.reduce((s, i) => s + i.length, 0) : PESO_FICHA;

function MensajeSofi({
  m,
  animar,
  esUltimo,
  onCrece,
  onNavegar,
  onTerminado,
  onSugerencia,
  onValorar,
}: {
  m: Extract<Mensaje, { de: "sofi" }>;
  animar: boolean;
  esUltimo: boolean;
  onCrece: () => void;
  onNavegar: () => void;
  onTerminado: () => void;
  onSugerencia: (t: string) => void;
  onValorar: (util: boolean) => void;
}) {
  const { respuesta } = m;
  const esBienvenida = respuesta.tema === "bienvenida";
  const total = useMemo(() => respuesta.bloques.reduce((s, b) => s + pesoDe(b), 0), [respuesta]);
  const [avance, setAvance] = useState(animar ? 0 : Number.POSITIVE_INFINITY);
  const listo = !animar || avance >= total;
  const opcionesRef = useRef<HTMLDivElement>(null);
  const conOpciones = listo && esUltimo && Boolean(respuesta.sugerencias?.length);

  /* Las opciones que aparecen al terminar quedan a la vista, sin buscarlas. */
  useEffect(() => {
    if (conOpciones) opcionesRef.current?.scrollIntoView({ block: "nearest", behavior: sinMovimiento() ? "auto" : "smooth" });
  }, [conOpciones]);

  /* Escribe por tiempo, no por tics: ~1 s sin importar el largo, y en una pestaña
     oculta (sin cuadros) termina al volver en vez de arrastrarse. */
  useEffect(() => {
    if (!animar) return;
    const duracion = Math.min(1100, Math.max(350, total * 8));
    const inicio = performance.now();
    let cuadro = requestAnimationFrame(function escribir(ahora) {
      const n = Math.max(0, Math.ceil((total * (ahora - inicio)) / duracion));
      setAvance(n);
      if (n < total) cuadro = requestAnimationFrame(escribir);
    });
    return () => cancelAnimationFrame(cuadro);
  }, [animar, total]);

  /* Si deja de animarse a mitad (llegó otra pregunta), se muestra completo. */
  useEffect(() => {
    if (!animar) setAvance(Number.POSITIVE_INFINITY);
  }, [animar]);

  useEffect(() => {
    if (animar && avance >= total) onTerminado();
  }, [animar, avance, total, onTerminado]);

  useEffect(() => {
    if (animar) onCrece();
  }, [animar, avance, onCrece]);

  /* Reparte el avance entre los bloques, en orden. */
  let resto = avance;
  const bloques = respuesta.bloques.map((b, i) => {
    const peso = pesoDe(b);
    const visible = Math.max(0, Math.min(peso, resto));
    resto -= peso;
    const actual = !listo && visible > 0 && visible < peso;
    if (visible <= 0) return null;
    return <BloqueSofi key={i} b={b} primero={i === 0} hasta={listo ? undefined : visible} cursor={actual} onNavegar={onNavegar} />;
  });

  return (
    <div className="sofi-burbuja-izq flex items-start gap-2">
      <RobotSofi tamano={30} />
      <div className="min-w-0 max-w-[88%] flex-1">
        <div
          className="rounded-2xl rounded-tl-md bg-surface px-3.5 py-2.5 text-[14.5px] leading-relaxed shadow-sm"
          data-sofi-respuesta
          data-sofi-listo={listo || undefined}
        >
          {/* Mientras se escribe, el lector de pantalla lee el texto completo (y el anuncio ya lo dijo). */}
          {!listo && <p className="sr-only">{textoCompleto(respuesta)}</p>}
          <div aria-hidden={!listo || undefined} inert={!listo || undefined}>
            {bloques}
          </div>

          {listo && respuesta.acciones && respuesta.acciones.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {respuesta.acciones.map((a, i) => (
                <span key={a.href + a.etiqueta} className="sofi-chip inline-block" style={{ animationDelay: `${i * 60}ms` }}>
                  <BotonAccion a={a} onNavegar={onNavegar} />
                </span>
              ))}
            </div>
          )}
          {listo && respuesta.fuente && (
            <p className="sofi-chip mt-2.5 text-[12px] text-muted">
              Fuente:{" "}
              <a href={respuesta.fuente.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-link hover:underline">
                {respuesta.fuente.titulo}
                <span className="sr-only"> (se abre en otra pestaña)</span>
              </a>
            </p>
          )}
          <p className="mt-1.5 text-[11px] text-muted">{m.hora}</p>
        </div>

        {listo && !esBienvenida && (
          <div className="mt-1 flex items-center gap-0.5 text-muted">
            {m.util === undefined ? (
              <>
                <button type="button" onClick={() => onValorar(true)} className="rounded-lg p-2.5 transition hover:bg-surface hover:text-ink active:scale-90" aria-label="Esta respuesta me fue útil">
                  <ThumbsUp size={15} aria-hidden />
                </button>
                <button type="button" onClick={() => onValorar(false)} className="rounded-lg p-2.5 transition hover:bg-surface hover:text-ink active:scale-90" aria-label="Esta respuesta no me fue útil">
                  <ThumbsDown size={15} aria-hidden />
                </button>
              </>
            ) : (
              <span className="sofi-pop relative inline-block px-1 py-2 text-[12px]">
                {m.util && <Confeti />}
                {m.util ? "¡Gracias! Me alegra haberte ayudado." : "Gracias, lo tendremos en cuenta para mejorar."}
              </span>
            )}
          </div>
        )}

        {conOpciones && respuesta.sugerencias && (
          esBienvenida ? (
            /* La bienvenida abre con temas visuales: se elige de un vistazo. */
            <div ref={opcionesRef} className="mt-2.5 grid scroll-mb-3 grid-cols-2 gap-2" role="group" aria-label="Temas sugeridos">
              {respuesta.sugerencias.map((s, i) => {
                const Icono = iconoDe(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => onSugerencia(s)}
                    style={{ animationDelay: `${i * 55}ms` }}
                    className={`sofi-chip group flex items-center gap-2.5 rounded-xl border border-line bg-surface px-2.5 py-2 text-left text-[12.5px] font-semibold text-ink transition hover:-translate-y-0.5 hover:border-accent hover:shadow-[var(--shadow-pop)] ${
                      respuesta.sugerencias!.length % 2 === 1 && i === respuesta.sugerencias!.length - 1 ? "col-span-2" : ""
                    }`}
                  >
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[var(--info-bg)] text-link transition group-hover:scale-110">
                      <Icono size={15} aria-hidden />
                    </span>
                    <span className="min-w-0 leading-snug">{s}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div ref={opcionesRef} className="mt-2 flex scroll-mb-3 flex-wrap gap-1.5" role="group" aria-label="Respuestas sugeridas">
              {respuesta.sugerencias.map((s, i) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onSugerencia(s)}
                  style={{ animationDelay: `${i * 55}ms` }}
                  className="sofi-chip rounded-full border border-line bg-surface px-3 py-2 text-left text-[13px] font-semibold text-link transition hover:-translate-y-0.5 hover:border-accent"
                >
                  {s}
                </button>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}

/** Un bloque de la respuesta; `hasta` recorta el texto mientras se escribe. */
function BloqueSofi({
  b,
  primero,
  hasta,
  cursor,
  onNavegar,
}: {
  b: Bloque;
  primero: boolean;
  hasta?: number;
  cursor: boolean;
  onNavegar: () => void;
}) {
  const margen = primero ? undefined : "mt-2";
  const marca = cursor ? <span aria-hidden className="sofi-cursor" /> : null;
  switch (b.tipo) {
    case "texto":
      return (
        <p className={margen}>
          {hasta === undefined ? b.texto : b.texto.slice(0, hasta)}
          {marca}
        </p>
      );
    case "lista": {
      let resto = hasta ?? Number.POSITIVE_INFINITY;
      const items = b.items
        .map((it) => {
          const parte = it.slice(0, Math.max(0, resto));
          resto -= it.length;
          return parte;
        })
        .filter(Boolean);
      const Lista = b.ordenada ? "ol" : "ul";
      return (
        <Lista className={`mt-2 space-y-1 pl-5 ${b.ordenada ? "list-decimal" : "list-disc"}`}>
          {items.map((it, i) => (
            <li key={i}>
              {it}
              {i === items.length - 1 && marca}
            </li>
          ))}
        </Lista>
      );
    }
    case "tarjetas":
      return (
        <ul className="mt-2.5 space-y-2">
          {b.items.map((t, i) => {
            const contenido = (
              <>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13.5px] font-semibold leading-snug text-ink">{t.titulo}</span>
                  <span className="block text-[12.5px] text-muted">{t.detalle}</span>
                  {t.meta && <span className="mt-1 block font-mono text-[11.5px] tabular-nums text-link">{t.meta}</span>}
                </span>
                {t.href && <ChevronRight size={16} aria-hidden className="shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-link" />}
              </>
            );
            const clase =
              "group flex items-center gap-3 rounded-xl border border-line bg-bg px-3 py-2.5 transition hover:border-accent";
            return (
              <li key={t.titulo} className="sofi-chip" style={{ animationDelay: `${i * 70}ms` }}>
                {t.href ? (
                  <Link href={t.href} className={clase} onClick={onNavegar}>
                    {contenido}
                  </Link>
                ) : (
                  <div className={clase}>{contenido}</div>
                )}
              </li>
            );
          })}
        </ul>
      );
    case "dato":
      return (
        <div
          className={`sofi-chip mt-2.5 rounded-xl border px-3.5 py-3 ${
            b.alerta ? "border-[var(--danger)]/30 bg-[var(--danger-bg)]" : "border-line bg-bg"
          }`}
        >
          <p className={`text-[11.5px] font-bold uppercase tracking-[0.12em] ${b.alerta ? "text-[var(--danger)]" : "text-muted"}`}>
            {b.etiqueta}
          </p>
          <p className="font-mono text-[22px] font-medium leading-tight tabular-nums text-ink">{b.valor}</p>
          {/* Sobre el fondo de alerta, el gris secundario no alcanza 4,5:1: va en tinta. */}
          {b.detalle && <p className={`mt-0.5 text-[12.5px] ${b.alerta ? "text-ink" : "text-muted"}`}>{b.detalle}</p>}
        </div>
      );
  }
}

/** Confeti con la paleta del manual: sale del agradecimiento y cae. */
const CONFETI = Array.from({ length: 14 }, (_, i) => {
  const a = (-160 + (i * 140) / 13) * (Math.PI / 180);
  const dist = 34 + (i % 4) * 9;
  return {
    dx: Math.cos(a) * dist,
    dy: Math.sin(a) * dist + 26,
    giro: (i % 2 ? 1 : -1) * (180 + i * 25),
    color: ["#008BED", "#EABC12", "#3CACC8", "#2EA0F9", "#11428a"][i % 5],
    retraso: (i % 3) * 35,
  };
});

function Confeti() {
  return (
    <span aria-hidden className="pointer-events-none absolute left-3 top-1/2">
      {CONFETI.map((c, i) => (
        <span
          key={i}
          className={`sofi-confeti absolute h-1.5 ${i % 3 ? "w-1.5 rounded-full" : "w-2.5 rounded-sm"}`}
          style={
            {
              background: c.color,
              "--dx": `${c.dx}px`,
              "--dy": `${c.dy}px`,
              "--giro": `${c.giro}deg`,
              animationDelay: `${c.retraso}ms`,
            } as React.CSSProperties
          }
        />
      ))}
    </span>
  );
}

function BotonAccion({ a, onNavegar }: { a: Accion; onNavegar: () => void }) {
  const clase =
    "inline-flex items-center gap-1 rounded-full bg-[var(--info-bg)] px-3 py-2 text-[13px] font-semibold text-link transition hover:brightness-95 active:scale-95";
  if (a.externo) {
    /* Solo lo web abre otra pestaña; correo y teléfono los atiende su propia app. */
    const web = /^https?:\/\//.test(a.href);
    return (
      <a href={a.href} {...(web ? { target: "_blank", rel: "noopener noreferrer" } : {})} className={clase}>
        {a.etiqueta} {web && <ArrowUpRight size={13} aria-hidden />}
        {web && <span className="sr-only"> (se abre en otra pestaña)</span>}
      </a>
    );
  }
  return (
    <Link href={a.href} className={clase} onClick={onNavegar}>
      {a.etiqueta}
    </Link>
  );
}
