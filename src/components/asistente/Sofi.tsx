"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { ArrowUpRight, RotateCcw, SendHorizontal, ThumbsDown, ThumbsUp, X } from "lucide-react";
import { useDemo } from "@/lib/demo";
import { useIdentidad } from "@/lib/identidad";
import { useRolPortal } from "@/lib/useAcceso";
import { esRutaPortal } from "@/lib/acceso";
import { MODO_API } from "@/lib/api/cliente";
import { useSesionApi } from "@/lib/api/sesion";
import { RobotSofi, type EstadoSofi } from "./RobotSofi";
import { bienvenida, responder, type Accion, type Bloque, type Contexto, type Respuesta } from "./motor";

type Mensaje =
  | { id: number; de: "persona"; texto: string; hora: string }
  | { id: number; de: "sofi"; respuesta: Respuesta; hora: string; util?: boolean };

const MAX_CARACTERES = 300;
const ID_PANEL = "sofi-panel";

const hora = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

const textoDe = (b?: Bloque) => (b ? (b.tipo === "texto" ? b.texto : b.items.join(". ")) : "");

/**
 * Sofi, la asistente virtual de Fedesoft: el robot de la federación vive en la
 * esquina, se inclina hacia el puntero y cambia de pose según la conversación
 * (saluda, escribe mientras piensa, presenta al responder, celebra).
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
  const [estado, setEstado] = useState<EstadoSofi>("reposo");
  const [saludo, setSaludo] = useState(false);
  /* Lo que oye un lector de pantalla: solo la respuesta nueva, no el historial entero. */
  const [anuncio, setAnuncio] = useState("");
  const siguienteId = useRef(1);
  const lanzador = useRef<HTMLButtonElement>(null);
  const campo = useRef<HTMLInputElement>(null);
  const lista = useRef<HTMLDivElement>(null);
  const temporizadorGesto = useRef<number | undefined>(undefined);
  const temporizadorRespuesta = useRef<number | undefined>(undefined);
  const ultimaActividad = useRef(Date.now());
  const abiertoRef = useRef(false);
  const ctxRef = useRef(ctx);
  useEffect(() => {
    ctxRef.current = ctx;
  }, [ctx]);

  const setAbierto = useCallback((v: boolean) => {
    abiertoRef.current = v;
    setAbiertoEstado(v);
  }, []);

  const agregarSofi = useCallback((respuesta: Respuesta) => {
    setMensajes((m) => [...m, { id: siguienteId.current++, de: "sofi", respuesta, hora: hora() }]);
    setAnuncio(`Sofi: ${textoDe(respuesta.bloques[0])}`);
  }, []);

  /* Cambiar de superficie, de empresa o de rol empieza una conversación con el contexto nuevo.
     Pagar o cambiar el estado de la cuenta no la borra. */
  const claveContexto = `${ctx.superficie}-${ctx.rol ?? ""}-${ctx.empresa?.nit ?? ""}`;
  useEffect(() => {
    window.clearTimeout(temporizadorRespuesta.current);
    setEscribiendo(false);
    setMensajes([]);
    if (abiertoRef.current) agregarSofi(bienvenida(ctxRef.current));
  }, [claveContexto, agregarSofi]);

  /* Un saludo breve la primera vez en la pestaña; luego no insiste. */
  useEffect(() => {
    let visto = false;
    try {
      visto = window.sessionStorage.getItem("fedesoft-sofi-saludo") === "1";
    } catch {
      /* sin almacenamiento: se saluda una vez por página */
    }
    if (visto) return;
    const t = window.setTimeout(() => setSaludo(true), 1800);
    return () => window.clearTimeout(t);
  }, []);

  const cerrarSaludo = () => {
    setSaludo(false);
    try {
      window.sessionStorage.setItem("fedesoft-sofi-saludo", "1");
    } catch {
      /* sin almacenamiento */
    }
  };

  /* Se duerme tras un rato sin actividad y despierta con el puntero o el teclado. */
  useEffect(() => {
    const despertar = () => {
      ultimaActividad.current = Date.now();
      setEstado((e) => (e === "durmiendo" ? "reposo" : e));
    };
    const revisar = window.setInterval(() => {
      if (!abiertoRef.current && Date.now() - ultimaActividad.current > 45_000) {
        setEstado((e) => (e === "reposo" ? "durmiendo" : e));
      }
    }, 5000);
    window.addEventListener("pointermove", despertar, { passive: true });
    window.addEventListener("keydown", despertar);
    return () => {
      window.clearInterval(revisar);
      window.removeEventListener("pointermove", despertar);
      window.removeEventListener("keydown", despertar);
    };
  }, []);

  const gesto = useCallback((e: EstadoSofi, ms: number) => {
    setEstado(e);
    window.clearTimeout(temporizadorGesto.current);
    temporizadorGesto.current = window.setTimeout(() => setEstado("reposo"), ms);
  }, []);

  useEffect(
    () => () => {
      window.clearTimeout(temporizadorGesto.current);
      window.clearTimeout(temporizadorRespuesta.current);
    },
    [],
  );

  const abrir = () => {
    cerrarSaludo();
    setAbierto(true);
    gesto("feliz", 1100);
    if (mensajes.length === 0) agregarSofi(bienvenida(ctx));
  };

  const cerrar = useCallback(() => {
    setAbierto(false);
    lanzador.current?.focus();
  }, [setAbierto]);

  useEffect(() => {
    if (abierto) campo.current?.focus();
  }, [abierto]);

  /* Escape solo cuando el foco está en Sofi: no le roba el Escape a un diálogo o a un menú. */
  const alTeclear = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      cerrar();
    }
  };

  /* Con solo el saludo, se ve a Sofi de cuerpo entero; después, siempre lo último. */
  useEffect(() => {
    const el = lista.current;
    if (!el) return;
    const soloSaludo = mensajes.length <= 1 && !escribiendo;
    el.scrollTo({ top: soloSaludo ? 0 : el.scrollHeight, behavior: soloSaludo ? "auto" : "smooth" });
  }, [mensajes, escribiendo]);

  const preguntar = (textoCrudo: string) => {
    const texto = textoCrudo.trim().slice(0, MAX_CARACTERES);
    if (!texto || escribiendo) return;
    setMensajes((m) => [...m, { id: siguienteId.current++, de: "persona", texto, hora: hora() }]);
    setEntrada("");
    setEscribiendo(true);
    setEstado("pensando");
    const respuesta = responder(texto, ctx);
    /* Una pausa breve y proporcional: se lee como alguien que responde, no como un volcado. */
    temporizadorRespuesta.current = window.setTimeout(() => {
      setEscribiendo(false);
      agregarSofi(respuesta);
      gesto("hablando", 1600);
    }, 650 + Math.min(700, texto.length * 12));
  };

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    preguntar(entrada);
  };

  /* Al usar una sugerencia, el chip desaparece: el foco vuelve al campo, no se pierde. */
  const sugerir = (s: string) => {
    preguntar(s);
    campo.current?.focus();
  };

  const valorar = (id: number, util: boolean) => {
    setMensajes((m) => m.map((x) => (x.id === id && x.de === "sofi" ? { ...x, util } : x)));
    setAnuncio(util ? "¡Gracias! Me alegra haberte ayudado." : "Gracias, lo tendremos en cuenta para mejorar.");
    if (util) gesto("feliz", 1800);
  };

  const reiniciar = () => {
    window.clearTimeout(temporizadorRespuesta.current);
    setEscribiendo(false);
    setMensajes([]);
    agregarSofi(bienvenida(ctx));
    setEstado("reposo");
    campo.current?.focus();
  };

  if (pathname.startsWith("/admin")) return null;

  const ultimaSofi = [...mensajes].reverse().find((m) => m.de === "sofi");

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3 print:hidden sm:bottom-5 sm:right-5">
      <p className="sr-only" aria-live="polite">{anuncio}</p>

      {abierto && (
        <section
          id={ID_PANEL}
          role="dialog"
          aria-label="Sofi, asistente virtual de Fedesoft"
          onKeyDown={alTeclear}
          className="sofi-entra flex h-[min(660px,calc(100dvh-7rem))] w-[min(400px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-[var(--shadow-pop)]"
        >
          <header className="flex items-center gap-3 bg-navy px-4 py-3 text-white">
            <RobotSofi estado={estado} tamano={44} />
            <div className="min-w-0 flex-1">
              <p className="font-display text-[15.5px] font-bold leading-tight">Sofi de Fedesoft</p>
              <p className="flex items-center gap-1.5 text-[12px] text-azure-200">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[#4ade80]" />
                {escribiendo ? "Escribiendo…" : "Asistente virtual · en línea"}
              </p>
            </div>
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
            <div className="flex flex-col items-center gap-2 pb-1 pt-1 text-center">
              <RobotSofi estado={estado} modo="cuerpo" tamano={148} />
              <p className="text-[12.5px] text-muted">
                {ctx.superficie === "portal" ? `Asistente del portal · ${ctx.empresa?.razonSocial ?? ""}` : "Asistente virtual de Fedesoft"}
              </p>
            </div>

            {mensajes.map((m) =>
              m.de === "persona" ? (
                <div key={m.id} className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-br-md bg-[var(--navy-700)] px-3.5 py-2.5 text-[14.5px] text-white">
                    <p className="whitespace-pre-wrap break-words">{m.texto}</p>
                    <p className="mt-1 text-right text-[11px] text-white/75">{m.hora}</p>
                  </div>
                </div>
              ) : (
                <MensajeSofi
                  key={m.id}
                  m={m}
                  esUltimo={m.id === ultimaSofi?.id && !escribiendo}
                  onSugerencia={sugerir}
                  onValorar={(util) => valorar(m.id, util)}
                />
              ),
            )}
            {escribiendo && (
              <div className="flex items-end gap-2" data-sofi-escribiendo>
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

          <form onSubmit={enviar} className="border-t border-line bg-surface p-3">
            <div className="flex items-center gap-2 rounded-full border border-line bg-bg pl-4 pr-1.5 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/40">
              <label htmlFor="sofi-entrada" className="sr-only">Escribe tu pregunta a Sofi</label>
              <input
                ref={campo}
                id="sofi-entrada"
                value={entrada}
                onChange={(e) => setEntrada(e.target.value)}
                maxLength={MAX_CARACTERES}
                autoComplete="off"
                placeholder="Escribe tu pregunta…"
                className="sofi-campo min-w-0 flex-1 bg-transparent py-2.5 text-[14.5px] outline-none placeholder:text-muted"
              />
              <button
                type="submit"
                disabled={!entrada.trim() || escribiendo}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--navy-700)] text-white transition hover:brightness-110 disabled:opacity-40"
                aria-label="Enviar"
              >
                <SendHorizontal size={16} aria-hidden />
              </button>
            </div>
            <p className="mt-2 text-center text-[11.5px] leading-snug text-muted">
              Asistente de demostración con respuestas predefinidas a partir de información oficial de Fedesoft. No
              compartas contraseñas ni datos sensibles.
            </p>
          </form>
        </section>
      )}

      {/* Saludo inicial, una vez por pestaña: Sofi de cuerpo entero, saludando */}
      {saludo && !abierto && (
        <div className="sofi-entra relative mr-1 flex max-w-[280px] items-center gap-3 rounded-2xl rounded-br-md border border-line bg-surface p-2.5 pr-1 shadow-[var(--shadow-pop)]">
          <button type="button" onClick={abrir} className="flex items-center gap-3 text-left">
            <RobotSofi estado="reposo" modo="cuerpo" tamano={64} />
            <span className="text-[13.5px]">
              <span className="block font-semibold">¡Hola! Soy Sofi</span>
              <span className="block text-muted">{ctx.superficie === "portal" ? "¿Te ayudo con algo del portal?" : "¿En qué te ayudo hoy?"}</span>
            </span>
          </button>
          <button type="button" onClick={cerrarSaludo} className="self-start rounded p-2 text-muted hover:text-ink" aria-label="Cerrar saludo">
            <X size={14} aria-hidden />
          </button>
        </div>
      )}

      {/* Sofi es el lanzador */}
      <button
        ref={lanzador}
        type="button"
        onClick={abierto ? cerrar : abrir}
        onPointerEnter={() => !abierto && estado !== "pensando" && setEstado("atento")}
        onPointerLeave={() => setEstado((e) => (e === "atento" ? "reposo" : e))}
        onFocus={() => !abierto && setEstado("atento")}
        onBlur={() => setEstado((e) => (e === "atento" ? "reposo" : e))}
        aria-expanded={abierto}
        aria-controls={ID_PANEL}
        aria-label="Sofi, asistente virtual de Fedesoft"
        className="group relative grid h-[76px] w-[76px] place-items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      >
        <span aria-hidden className="absolute inset-0.5 rounded-full shadow-[var(--shadow-pop)]" />
        <RobotSofi estado={estado} tamano={66} interactivo />
      </button>
    </div>
  );
}

function MensajeSofi({
  m,
  esUltimo,
  onSugerencia,
  onValorar,
}: {
  m: Extract<Mensaje, { de: "sofi" }>;
  esUltimo: boolean;
  onSugerencia: (t: string) => void;
  onValorar: (util: boolean) => void;
}) {
  const { respuesta } = m;
  const esBienvenida = respuesta.tema === "bienvenida";
  return (
    <div className="flex items-start gap-2">
      <RobotSofi tamano={30} />
      <div className="min-w-0 max-w-[88%]">
        <div className="rounded-2xl rounded-tl-md bg-surface px-3.5 py-2.5 text-[14.5px] leading-relaxed shadow-sm" data-sofi-respuesta>
          {respuesta.bloques.map((b, i) =>
            b.tipo === "texto" ? (
              <p key={i} className={i > 0 ? "mt-2" : undefined}>{b.texto}</p>
            ) : b.ordenada ? (
              <ol key={i} className="mt-2 list-decimal space-y-1 pl-5">{b.items.map((it) => <li key={it}>{it}</li>)}</ol>
            ) : (
              <ul key={i} className="mt-2 list-disc space-y-1 pl-5">{b.items.map((it) => <li key={it}>{it}</li>)}</ul>
            ),
          )}
          {respuesta.acciones && respuesta.acciones.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {respuesta.acciones.map((a) => <BotonAccion key={a.href + a.etiqueta} a={a} />)}
            </div>
          )}
          {respuesta.fuente && (
            <p className="mt-2.5 text-[12px] text-muted">
              Fuente:{" "}
              <a href={respuesta.fuente.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-link hover:underline">
                {respuesta.fuente.titulo}
                <span className="sr-only"> (se abre en otra pestaña)</span>
              </a>
            </p>
          )}
          <p className="mt-1.5 text-[11px] text-muted">{m.hora}</p>
        </div>

        {!esBienvenida && (
          <div className="mt-1 flex items-center gap-0.5 text-muted">
            {m.util === undefined ? (
              <>
                <button type="button" onClick={() => onValorar(true)} className="rounded-lg p-2.5 transition hover:bg-surface hover:text-ink" aria-label="Esta respuesta me fue útil">
                  <ThumbsUp size={15} aria-hidden />
                </button>
                <button type="button" onClick={() => onValorar(false)} className="rounded-lg p-2.5 transition hover:bg-surface hover:text-ink" aria-label="Esta respuesta no me fue útil">
                  <ThumbsDown size={15} aria-hidden />
                </button>
              </>
            ) : (
              <span className="px-1 py-2 text-[12px]">
                {m.util ? "¡Gracias! Me alegra haberte ayudado." : "Gracias, lo tendremos en cuenta para mejorar."}
              </span>
            )}
          </div>
        )}

        {esUltimo && respuesta.sugerencias && respuesta.sugerencias.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label="Respuestas sugeridas">
            {respuesta.sugerencias.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onSugerencia(s)}
                className="rounded-full border border-line bg-surface px-3 py-2 text-left text-[13px] font-semibold text-link transition hover:border-accent"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BotonAccion({ a }: { a: Accion }) {
  const clase =
    "inline-flex items-center gap-1 rounded-full bg-[var(--info-bg)] px-3 py-2 text-[13px] font-semibold text-link transition hover:brightness-95";
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
    <Link href={a.href} className={clase}>
      {a.etiqueta}
    </Link>
  );
}
