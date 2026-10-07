"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, Ban, KeyRound, Loader2, LockKeyhole, Mail, ShieldCheck, Smartphone, UserX } from "lucide-react";
import { useIdentidad } from "@/lib/identidad";
import { OPERADORES_DEMO, nombreRolInterno } from "@/lib/mock/usuarios";
import { Logo } from "@/components/Logo";
import { Boton } from "@/components/ui/primitivos";
import { MODO_API } from "@/lib/api/cliente";
import { EntrarConsolaApi } from "./EntrarConsolaApi";

/**
 * Acceso a la consola interna (ADR-005, ADR-008).
 *
 * Exige rol interno y segundo factor siempre (RA-ACC-002): sin código no hay
 * sesión, aunque la contraseña sea correcta. El código aquí es simulado; en el
 * sistema real lo valida el proveedor de identidad.
 */

const MAX_INTENTOS = 5;
const ESPERA_S = 60;

/** Código TOTP simulado: cambia cada 30 s, como en una app autenticadora. */
function codigoDemo(t = Date.now()): string {
  const ventana = Math.floor(t / 30_000);
  return String((ventana * 7_919 + 482_913) % 1_000_000).padStart(6, "0");
}

type Paso =
  | { id: "correo" }
  | { id: "clave"; correo: string }
  | { id: "codigo"; usuarioId: string }
  | { id: "rechazo"; motivo: "sin-rol" | "bloqueada"; correo: string };

export default function EntrarConsola() {
  return MODO_API ? <EntrarConsolaApi /> : <EntrarConsolaSimulada />;
}

function EntrarConsolaSimulada() {
  const id = useIdentidad();
  const router = useRouter();
  const [paso, setPaso] = useState<Paso>({ id: "correo" });
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [intentos, setIntentos] = useState(0);
  const [bloqueoHasta, setBloqueoHasta] = useState<number | null>(null);
  const [reloj, setReloj] = useState(() => Date.now());

  /* Reloj para la cuenta regresiva del código y del bloqueo por intentos. */
  useEffect(() => {
    if (paso.id !== "codigo") return;
    const t = setInterval(() => setReloj(Date.now()), 1000);
    return () => clearInterval(t);
  }, [paso.id]);

  const restante = 30 - Math.floor((reloj / 1000) % 30);
  const esperaRestante = bloqueoHasta ? Math.max(0, Math.ceil((bloqueoHasta - reloj) / 1000)) : 0;
  const bloqueadoPorIntentos = esperaRestante > 0;

  const continuarCorreo = (e: FormEvent) => {
    e.preventDefault();
    const valor = correo.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor)) return setError("Escribe tu correo institucional.");
    setError(null);
    setClave("");
    setPaso({ id: "clave", correo: valor });
  };

  const enviarClave = (e: FormEvent) => {
    e.preventDefault();
    if (paso.id !== "clave") return;
    if (clave.length === 0) return setError("Escribe tu contraseña.");
    setError(null);
    setCargando(true);
    setTimeout(() => {
      setCargando(false);
      const u = id.porCorreo(paso.correo);
      if (u?.estado === "bloqueado") return setPaso({ id: "rechazo", motivo: "bloqueada", correo: paso.correo });
      if (!u || u.rolesInternos.length === 0) return setPaso({ id: "rechazo", motivo: "sin-rol", correo: paso.correo });
      setCodigo("");
      setIntentos(0);
      setReloj(Date.now());
      setPaso({ id: "codigo", usuarioId: u.id });
    }, 600);
  };

  const enviarCodigo = (e: FormEvent) => {
    e.preventDefault();
    if (paso.id !== "codigo" || bloqueadoPorIntentos) return;
    const limpio = codigo.replace(/\s/g, "");
    /* Se acepta el código vigente y el inmediatamente anterior, como hace un
       proveedor real para tolerar el desfase de reloj del teléfono. */
    if (limpio === codigoDemo() || limpio === codigoDemo(Date.now() - 30_000)) {
      id.iniciarConsola(paso.usuarioId);
      router.push(id.destinoConsola);
      return;
    }
    const n = intentos + 1;
    setIntentos(n);
    setCodigo("");
    if (n >= MAX_INTENTOS) {
      setBloqueoHasta(Date.now() + ESPERA_S * 1000);
      setIntentos(0);
      setError(`Demasiados intentos. Espera ${ESPERA_S} segundos antes de volver a intentar.`);
    } else {
      setError(`Código incorrecto. Te quedan ${MAX_INTENTOS - n} intentos.`);
    }
  };

  const reiniciar = () => {
    setPaso({ id: "correo" });
    setError(null);
    setClave("");
    setCodigo("");
  };

  const operador = paso.id === "codigo" ? id.porId(paso.usuarioId) : undefined;

  return (
    <div className="grid min-h-dvh grid-rows-[auto_1fr] bg-bg">
      <header className="bg-navy text-white">
        <div className="mx-auto flex max-w-[1200px] items-center gap-4 px-4 py-3 sm:px-6">
          <Logo tema="oscuro" compacto />
          <span aria-hidden className="hidden h-5 w-px bg-white/25 sm:block" />
          <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-azure-200">Consola interna</p>
          <Link
            href="/portal"
            className="ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-semibold text-azure-200 transition hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft size={14} aria-hidden /> Portal del afiliado
          </Link>
        </div>
      </header>

      <main className="grid place-items-center px-4 py-12">
        <div className="w-full max-w-[440px] overflow-hidden rounded-2xl border border-line bg-surface shadow-[var(--shadow-pop)]" aria-live="polite">
          <div className="border-t-[3px] border-t-accent px-6 pb-6 pt-7">
            {paso.id === "correo" && (
              <>
                <h1 className="font-display text-[26px] font-light leading-tight">Entra a la consola</h1>
                <p className="mt-2 text-[14.5px] leading-relaxed text-muted">
                  Solo para el equipo de Fedesoft. El segundo factor es obligatorio.
                </p>
                <form onSubmit={continuarCorreo} className="mt-6 grid gap-3" noValidate>
                  <label htmlFor="correo-interno" className="text-[13.5px] font-semibold">Correo institucional</label>
                  <div className="relative">
                    <Mail size={16} aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                    <input
                      id="correo-interno"
                      type="email"
                      autoComplete="username"
                      value={correo}
                      onChange={(e) => setCorreo(e.target.value)}
                      aria-invalid={error ? true : undefined}
                      aria-describedby={error ? "error-interno" : undefined}
                      placeholder="nombre@fedesoft.org"
                      className="w-full rounded-xl border border-line bg-surface py-3 pl-10 pr-3 text-[15px]"
                    />
                  </div>
                  {error && <p id="error-interno" role="alert" className="text-[13.5px] text-danger">{error}</p>}
                  <Boton type="submit" className="mt-1 w-full">Continuar <ArrowRight size={16} aria-hidden /></Boton>
                </form>
                <p className="mt-6 text-[12px] font-semibold uppercase tracking-[0.14em] text-muted">Cuentas de demostración · una por rol</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {OPERADORES_DEMO.map((c) => {
                    const u = id.porCorreo(c);
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          setCorreo(c);
                          setError(null);
                          setClave("");
                          setPaso({ id: "clave", correo: c });
                        }}
                        className="flex min-w-0 items-center justify-between gap-2 rounded-lg border border-line px-3 py-2.5 text-left transition hover:border-accent"
                      >
                        <span className="min-w-0">
                          <span className="block text-[13.5px] font-semibold leading-snug">{u?.rolesInternos.map(nombreRolInterno).join(", ")}</span>
                          <span className="block truncate text-[12.5px] text-muted">{u?.nombre}</span>
                        </span>
                        <ArrowRight size={15} className="shrink-0 text-muted" aria-hidden />
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {paso.id === "clave" && (
              <>
                <button type="button" onClick={reiniciar} className="mb-5 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-muted hover:text-ink">
                  <ArrowLeft size={14} aria-hidden /> Usar otro correo
                </button>
                <p className="flex items-center gap-2 text-[13px] font-semibold text-muted">
                  <KeyRound size={15} className="text-accent" aria-hidden /> Cuenta Fedesoft · proveedor de identidad
                </p>
                <form onSubmit={enviarClave} className="mt-4 grid gap-3" noValidate>
                  <p className="text-[14px] text-muted">Entrando como <span className="font-semibold text-ink">{paso.correo}</span></p>
                  <label htmlFor="clave-interna" className="text-[13.5px] font-semibold">Contraseña</label>
                  <div className="relative">
                    <LockKeyhole size={16} aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                    <input
                      id="clave-interna"
                      type="password"
                      autoComplete="current-password"
                      autoFocus
                      value={clave}
                      onChange={(e) => setClave(e.target.value)}
                      aria-describedby="clave-interna-ayuda"
                      className="w-full rounded-xl border border-line bg-surface py-3 pl-10 pr-3 text-[15px]"
                    />
                  </div>
                  <p id="clave-interna-ayuda" className="text-[12.5px] text-muted">En la demostración sirve cualquier contraseña.</p>
                  {error && <p role="alert" className="text-[13.5px] text-danger">{error}</p>}
                  <Boton type="submit" disabled={cargando} className="mt-1 w-full">
                    {cargando ? <><Loader2 size={16} className="animate-spin" aria-hidden /> Verificando…</> : "Continuar"}
                  </Boton>
                </form>
              </>
            )}

            {paso.id === "codigo" && (
              <>
                <span className="grid h-11 w-11 place-items-center rounded-full bg-info-bg text-info">
                  <Smartphone size={20} aria-hidden />
                </span>
                <h1 className="mt-4 font-display text-[24px] font-light leading-tight">Segundo factor</h1>
                <p className="mt-2 text-[14.5px] leading-relaxed text-muted">
                  {operador?.nombre}, escribe el código de 6 dígitos de tu app autenticadora.
                </p>
                <form onSubmit={enviarCodigo} className="mt-5 grid gap-3" noValidate>
                  <label htmlFor="codigo" className="text-[13.5px] font-semibold">Código de verificación</label>
                  <input
                    id="codigo"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    autoFocus
                    maxLength={7}
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value.replace(/[^\d\s]/g, ""))}
                    disabled={bloqueadoPorIntentos}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? "codigo-error" : undefined}
                    className="num w-full rounded-xl border border-line bg-surface px-3 py-3 text-center font-mono text-[24px] tracking-[0.4em]"
                  />
                  {error && <p id="codigo-error" role="alert" className="text-[13.5px] text-danger">{bloqueadoPorIntentos ? `Demasiados intentos. Espera ${esperaRestante} s.` : error}</p>}
                  <Boton type="submit" disabled={bloqueadoPorIntentos || codigo.replace(/\s/g, "").length !== 6} className="mt-1 w-full">
                    Verificar y entrar
                  </Boton>
                </form>
                <div className="mt-5 flex items-center justify-between gap-3 rounded-lg bg-surface-2 px-3.5 py-3 text-[13px]">
                  <span className="text-muted">
                    Código de demostración: <span className="num font-mono font-semibold text-ink">{codigoDemo(reloj)}</span>{" "}
                    <span className="num">· {restante} s</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setCodigo(codigoDemo())}
                    disabled={bloqueadoPorIntentos}
                    className="font-semibold text-link hover:underline disabled:opacity-50"
                  >
                    Usarlo
                  </button>
                </div>
              </>
            )}

            {paso.id === "rechazo" && (
              <>
                <span className="grid h-11 w-11 place-items-center rounded-full bg-bg text-muted">
                  {paso.motivo === "bloqueada" ? <Ban size={20} aria-hidden /> : <UserX size={20} aria-hidden />}
                </span>
                <h1 className="mt-4 font-display text-[24px] font-light leading-tight">
                  {paso.motivo === "bloqueada" ? "Tu cuenta está bloqueada" : "Tu cuenta no tiene rol interno"}
                </h1>
                <p className="mt-1 font-mono text-[13px] text-muted">{paso.correo}</p>
                <p className="mt-3 text-[14.5px] leading-relaxed text-muted">
                  {paso.motivo === "bloqueada"
                    ? "Un Super Admin bloqueó esta cuenta. Todas sus sesiones se cerraron."
                    : "La consola es solo para el equipo de Fedesoft. Si eres afiliado, entra por el portal."}
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  <Boton variante="secundario" onClick={reiniciar}>Usar otro correo</Boton>
                  {paso.motivo === "sin-rol" && (
                    <Link href="/entrar" className="inline-flex items-center rounded-full bg-[var(--navy-700)] px-5 py-2.5 text-[15px] font-semibold text-white hover:brightness-115">
                      Ir al portal
                    </Link>
                  )}
                </div>
              </>
            )}
          </div>
          <p className="flex items-start gap-2 border-t border-line bg-surface-2 px-6 py-3.5 text-[12.5px] text-muted">
            <ShieldCheck size={14} className="mt-0.5 shrink-0 text-accent" aria-hidden />
            Sesión corta: 8 horas como máximo y cierre a los 30 minutos sin actividad. Todo lo que hagas queda en el
            registro de auditoría.
          </p>
        </div>
      </main>
    </div>
  );
}
