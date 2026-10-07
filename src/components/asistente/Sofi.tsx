"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { ArrowUpRight, RotateCcw, SendHorizontal, ThumbsDown, ThumbsUp, X } from "lucide-react";
import { useDemo } from "@/lib/demo";
import { useIdentidad } from "@/lib/identidad";
import { useRolPortal } from "@/lib/useAcceso";
import { Mascota, type EstadoMascota } from "./Mascota";
import { bienvenida, responder, type Accion, type Contexto, type Respuesta } from "./motor";

type Mensaje =
  | { id: number; de: "persona"; texto: string; hora: string }
  | { id: number; de: "sofi"; respuesta: Respuesta; hora: string; util?: boolean };

const PREFIJOS_PORTAL = ["/portal", "/empresa", "/facturacion", "/formacion", "/comunidades", "/verticales", "/directorio", "/visibilidad", "/oportunidades", "/cuenta-estrategica"];
const MAX_CARACTERES = 300;

const hora = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

/**
 * Sofi, la asistente virtual de Fedesoft: una mascota que vive en la esquina,
 * mira el puntero y abre un chat con respuestas oficiales. En el portal sabe
 * quién pregunta y responde según su rol; fuera de él orienta y lleva al login.
 * No aparece en la consola interna.
 */
export function Sofi() {
  const pathname = usePathname() ?? "/";
  const { escenario } = useDemo();
  const { sesionPortal } = useIdentidad();
  const rol = useRolPortal();

  const enPortal = PREFIJOS_PORTAL.some((p) => pathname === p || pathname.startsWith(`${p}/`)) && Boolean(sesionPortal);
  const contacto = escenario.empresa.contactos.find((c) => c.id === escenario.contactoId);
  const ctx = useMemo<Contexto>(
    () => (enPortal ? { superficie: "portal", nombre: contacto?.nombre, rol, empresa: escenario.empresa } : { superficie: "publico" }),
    [enPortal, contacto?.nombre, rol, escenario.empresa],
  );

  const [abierto, setAbiertoEstado] = useState(false);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [entrada, setEntrada] = useState("");
  const [escribiendo, setEscribiendo] = useState(false);
  const [estado, setEstado] = useState<EstadoMascota>("reposo");
  const [saludo, setSaludo] = useState(false);
  const siguienteId = useRef(1);
  const lanzador = useRef<HTMLButtonElement>(null);
  const campo = useRef<HTMLInputElement>(null);
  const lista = useRef<HTMLDivElement>(null);
  const temporizador = useRef<number | undefined>(undefined);
  const ultimaActividad = useRef(Date.now());

  /* Al cambiar de superficie (entrar al portal, cambiar de escenario), la conversación empieza de nuevo con contexto. */
  const claveContexto = `${ctx.superficie}-${ctx.rol ?? ""}-${ctx.empresa?.nit ?? ""}-${ctx.empresa?.estado ?? ""}`;
  const abiertoRef = useRef(false);
  const ctxRef = useRef(ctx);
  ctxRef.current = ctx;
  useEffect(() => {
    /* Abierta, saluda de nuevo con el contexto nuevo; cerrada, espera a que la abran. */
    setMensajes(abiertoRef.current ? [{ id: siguienteId.current++, de: "sofi", respuesta: bienvenida(ctxRef.current), hora: hora() }] : []);
  }, [claveContexto]);

  const setAbierto = useCallback((v: boolean) => {
    abiertoRef.current = v;
    setAbiertoEstado(v);
  }, []);


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

  /* Se duerme tras un rato sin actividad y despierta con el puntero. */
  useEffect(() => {
    const despertar = () => {
      ultimaActividad.current = Date.now();
      setEstado((e) => (e === "durmiendo" ? "reposo" : e));
    };
    const revisar = window.setInterval(() => {
      if (!abierto && Date.now() - ultimaActividad.current > 45_000) setEstado((e) => (e === "reposo" ? "durmiendo" : e));
    }, 5000);
    window.addEventListener("pointermove", despertar, { passive: true });
    window.addEventListener("keydown", despertar);
    return () => {
      window.clearInterval(revisar);
      window.removeEventListener("pointermove", despertar);
      window.removeEventListener("keydown", despertar);
    };
  }, [abierto]);

  const gesto = useCallback((e: EstadoMascota, ms: number) => {
    setEstado(e);
    window.clearTimeout(temporizador.current);
    temporizador.current = window.setTimeout(() => setEstado("reposo"), ms);
  }, []);

  useEffect(() => () => window.clearTimeout(temporizador.current), []);

  const agregarSofi = useCallback((respuesta: Respuesta) => {
    setMensajes((m) => [...m, { id: siguienteId.current++, de: "sofi", respuesta, hora: hora() }]);
  }, []);

  const abrir = () => {
    cerrarSaludo();
    setAbierto(true);
    gesto("feliz", 1100);
    if (mensajes.length === 0) agregarSofi(bienvenida(ctx));
  };

  const cerrar = useCallback(() => {
    setAbierto(false);
    lanzador.current?.focus();
  }, []);

  /* Foco al campo al abrir; Escape cierra y devuelve el foco al lanzador. */
  useEffect(() => {
    if (!abierto) return;
    campo.current?.focus();
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") cerrar();
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [abierto, cerrar]);

  /* La conversación siempre muestra lo último. */
  useEffect(() => {
    lista.current?.scrollTo({ top: lista.current.scrollHeight, behavior: "smooth" });
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
    window.setTimeout(() => {
      setEscribiendo(false);
      agregarSofi(respuesta);
      gesto("hablando", 1400);
    }, 550 + Math.min(700, texto.length * 12));
  };

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    preguntar(entrada);
  };

  const valorar = (id: number, util: boolean) => {
    setMensajes((m) => m.map((x) => (x.id === id && x.de === "sofi" ? { ...x, util } : x)));
    if (util) gesto("feliz", 1500);
  };

  const reiniciar = () => {
    setMensajes([{ id: siguienteId.current++, de: "sofi", respuesta: bienvenida(ctx), hora: hora() }]);
    campo.current?.focus();
  };

  if (pathname.startsWith("/admin")) return null;

  const ultimaSofi = [...mensajes].reverse().find((m) => m.de === "sofi");

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 print:hidden sm:bottom-5 sm:right-5">
      {abierto && (
        <section
          role="dialog"
          aria-label="Sofi, asistente virtual de Fedesoft"
          className="sofi-entra flex h-[min(640px,calc(100dvh-7rem))] w-[min(400px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-[var(--shadow-pop)]"
        >
          {/* Encabezado: la mascota viva, con el mismo estado que el lanzador */}
          <header className="flex items-center gap-3 bg-navy px-4 py-3 text-white">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/10">
              <Mascota estado={estado} tamano={40} flotar={false} />
            </div>
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
              className="rounded-lg p-2 text-azure-200 transition hover:bg-white/10 hover:text-white"
              aria-label="Empezar de nuevo la conversación"
              title="Empezar de nuevo"
            >
              <RotateCcw size={17} aria-hidden />
            </button>
            <button
              type="button"
              onClick={cerrar}
              className="rounded-lg p-2 text-azure-200 transition hover:bg-white/10 hover:text-white"
              aria-label="Cerrar el asistente"
            >
              <X size={18} aria-hidden />
            </button>
          </header>

          {/* Conversación */}
          <div ref={lista} className="flex-1 space-y-4 overflow-y-auto bg-bg px-4 py-4" aria-live="polite" aria-relevant="additions">
            {mensajes.map((m) =>
              m.de === "persona" ? (
                <div key={m.id} className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-br-md bg-[var(--navy-700)] px-3.5 py-2.5 text-[14.5px] text-white">
                    <p className="whitespace-pre-wrap break-words">{m.texto}</p>
                    <p className="mt-1 text-right text-[11px] text-white/70">{m.hora}</p>
                  </div>
                </div>
              ) : (
                <MensajeSofi
                  key={m.id}
                  m={m}
                  esUltimo={m.id === ultimaSofi?.id && !escribiendo}
                  onSugerencia={preguntar}
                  onValorar={(util) => valorar(m.id, util)}
                />
              ),
            )}
            {escribiendo && (
              <div className="flex items-end gap-2" role="status" aria-label="Sofi está escribiendo">
                <AvatarSofi />
                <div className="flex gap-1 rounded-2xl rounded-bl-md bg-surface px-4 py-3 shadow-sm">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="sofi-escribe h-2 w-2 rounded-full bg-accent" style={{ animationDelay: `${i * 0.16}s` }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Entrada */}
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
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--navy-700)] text-white transition hover:brightness-110 disabled:opacity-40"
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

      {/* Saludo inicial, una vez por pestaña */}
      {saludo && !abierto && (
        <div className="sofi-entra relative mr-2 flex max-w-[240px] items-start gap-2 rounded-2xl rounded-br-md border border-line bg-surface px-3.5 py-2.5 text-[13.5px] shadow-[var(--shadow-pop)]">
          <button type="button" onClick={abrir} className="text-left">
            <span className="block font-semibold">¡Hola! Soy Sofi</span>
            <span className="block text-muted">{ctx.superficie === "portal" ? "¿Te ayudo con algo del portal?" : "¿En qué te ayudo hoy?"}</span>
          </button>
          <button type="button" onClick={cerrarSaludo} className="-mr-1 rounded p-0.5 text-muted hover:text-ink" aria-label="Cerrar saludo">
            <X size={14} aria-hidden />
          </button>
        </div>
      )}

      {/* La mascota es el lanzador */}
      <button
        ref={lanzador}
        type="button"
        onClick={abierto ? cerrar : abrir}
        onPointerEnter={() => !abierto && estado !== "pensando" && setEstado("atento")}
        onPointerLeave={() => !abierto && setEstado((e) => (e === "atento" ? "reposo" : e))}
        onFocus={() => !abierto && setEstado("atento")}
        onBlur={() => setEstado((e) => (e === "atento" ? "reposo" : e))}
        aria-expanded={abierto}
        aria-label={abierto ? "Cerrar a Sofi, asistente virtual" : "Abrir a Sofi, asistente virtual de Fedesoft"}
        className="group relative grid h-[76px] w-[76px] place-items-center rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      >
        <span aria-hidden className="absolute inset-1.5 rounded-full bg-surface/80 shadow-[var(--shadow-pop)] ring-1 ring-line backdrop-blur transition group-hover:ring-accent" />
        <span className="relative">
          <Mascota estado={estado} tamano={58} />
        </span>
      </button>
    </div>
  );
}

function AvatarSofi() {
  return (
    <span aria-hidden className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-navy">
      <Mascota tamano={24} seguirPuntero={false} flotar={false} />
    </span>
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
      <AvatarSofi />
      <div className="min-w-0 max-w-[88%]">
        <div className="rounded-2xl rounded-tl-md bg-surface px-3.5 py-2.5 text-[14.5px] leading-relaxed shadow-sm">
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
              </a>
            </p>
          )}
          <p className="mt-1.5 text-[11px] text-muted">{m.hora}</p>
        </div>

        {!esBienvenida && (
          <div className="mt-1.5 flex items-center gap-1 pl-1 text-muted">
            {m.util === undefined ? (
              <>
                <button type="button" onClick={() => onValorar(true)} className="rounded p-1 transition hover:text-ink" aria-label="Esta respuesta me fue útil">
                  <ThumbsUp size={14} aria-hidden />
                </button>
                <button type="button" onClick={() => onValorar(false)} className="rounded p-1 transition hover:text-ink" aria-label="Esta respuesta no me fue útil">
                  <ThumbsDown size={14} aria-hidden />
                </button>
              </>
            ) : (
              <span className="text-[12px]" role="status">
                {m.util ? "¡Gracias! Me alegra haberte ayudado." : "Gracias, lo tendremos en cuenta para mejorar."}
              </span>
            )}
          </div>
        )}

        {esUltimo && respuesta.sugerencias && respuesta.sugerencias.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5" role="group" aria-label="Respuestas sugeridas">
            {respuesta.sugerencias.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onSugerencia(s)}
                className="rounded-full border border-line bg-surface px-3 py-1.5 text-left text-[13px] font-semibold text-link transition hover:border-accent"
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
    "inline-flex items-center gap-1 rounded-full bg-[var(--info-bg)] px-3 py-1.5 text-[13px] font-semibold text-link transition hover:brightness-95";
  if (a.externo) {
    return (
      <a href={a.href} target="_blank" rel="noopener noreferrer" className={clase}>
        {a.etiqueta} <ArrowUpRight size={13} aria-hidden />
        <span className="sr-only">(se abre en otra pestaña)</span>
      </a>
    );
  }
  return (
    <Link href={a.href} className={clase}>
      {a.etiqueta}
    </Link>
  );
}
