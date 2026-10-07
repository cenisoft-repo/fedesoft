"use client";

import Link from "next/link";
import { destinoSeguro } from "@/lib/acceso";
import { Logo } from "@/components/Logo";
import { MarcaAcceso } from "@/components/acceso/MarcaAcceso";
import { SelectorVista } from "@/components/acceso/SelectorVista";
import { Acceso } from "@/components/acceso/Acceso";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  ArrowLeft, ArrowRight, Ban, Building2, KeyRound, Loader2, LockKeyhole, Mail, ShieldCheck, UserX,
} from "lucide-react";
import { ESCENARIOS, useDemo } from "@/lib/demo";
import { useIdentidad } from "@/lib/identidad";
import { EMPRESAS_POR_NIT, nombreRolEmpresa } from "@/lib/mock/usuarios";
import { fecha, HOY } from "@/lib/format";
import { Boton } from "@/components/ui/primitivos";
import { MODO_API } from "@/lib/api/cliente";
import { EntrarApi } from "./EntrarApi";

/**
 * Puerta única del afiliado (P-01).
 *
 * Reproduce el flujo real de ADR-008: el portal pide el correo, el proveedor
 * de identidad valida la contraseña (el portal nunca la ve) y solo después el
 * servidor decide si hay acceso, a qué empresa y con qué rol. Los rechazos se
 * explican después de autenticarse, no antes: así un tercero no puede tantear
 * qué correos existen.
 */

type Paso =
  | { id: "correo" }
  | { id: "clave"; correo: string }
  | { id: "invitaciones"; usuarioId: string }
  | { id: "verificado"; usuarioId: string }
  | { id: "rechazo"; motivo: "sin-acceso" | "bloqueada" | "interno" | "desactivado"; correo: string; empresa?: string };

/* Una cuenta por rol y segmento, y los casos que el acceso debe rechazar o desviar. */
const DEMO_ROLES = [
  { correo: "camilo.restrepo@datalabsandina.co", etiqueta: "Gerente · MIPYME", detalle: "Camilo Restrepo" },
  { correo: "diana.salazar@datalabsandina.co", etiqueta: "Talento humano · MIPYME", detalle: "Diana Salazar" },
  { correo: "julian.ospina@datalabsandina.co", etiqueta: "Contacto · MIPYME", detalle: "Julián Ospina" },
  { correo: "marcela.betancur@sistemasvertice.com.co", etiqueta: "Gerente · grande", detalle: "Marcela Betancur" },
  { correo: "ricardo.penaloza@sistemasvertice.com.co", etiqueta: "Talento humano · grande", detalle: "Ricardo Peñaloza" },
  { correo: "sandra.quintero@sistemasvertice.com.co", etiqueta: "Contacto · grande", detalle: "Sandra Quintero" },
];

const DEMO_CASOS = [
  { correo: "laura.gomez@datalabsandina.co", etiqueta: "Invitación pendiente", detalle: "Laura Gómez" },
  { correo: "andres.mora@datalabsandina.co", etiqueta: "Acceso desactivado", detalle: "Andrés Mora" },
  { correo: "mauricio.lara@sistemasvertice.com.co", etiqueta: "Cuenta bloqueada", detalle: "Mauricio Lara" },
];

/* El destino de regreso se valida contra las rutas del portal (acceso.ts): nada de la URL se sigue tal cual. */
function destinoPortal(): string {
  try {
    return destinoSeguro(new URLSearchParams(window.location.search).get("destino"));
  } catch {
    return "/portal";
  }
}

const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function Entrar() {
  /* Constante de compilación: con API real, el acceso es el login OIDC. */
  return MODO_API ? <EntrarApi /> : <EntrarSimulado />;
}

function EntrarSimulado() {
  const { cambiarEscenario } = useDemo();
  const id = useIdentidad();
  const router = useRouter();
  const [paso, setPaso] = useState<Paso>({ id: "correo" });
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const sesionAbierta = id.sesionLista && id.sesionPortal ? id.porId(id.sesionPortal) : undefined;

  const irAClave = (valor: string) => {
    setError(null);
    setClave("");
    setPaso({ id: "clave", correo: valor });
  };

  const continuarCorreo = (e: FormEvent) => {
    e.preventDefault();
    const valor = correo.trim().toLowerCase();
    if (!CORREO_VALIDO.test(valor)) {
      setError("Escribe tu correo corporativo completo.");
      return;
    }
    irAClave(valor);
  };

  const entrarAlPortal = (usuarioId: string) => {
    const u = id.porId(usuarioId);
    const escenario = ESCENARIOS.find(
      (e) => e.empresa.contactos.find((c) => c.id === e.contactoId)?.correo === u?.correo,
    );
    id.iniciarPortal(usuarioId);
    if (!escenario) {
      setPaso({ id: "verificado", usuarioId });
      return;
    }
    cambiarEscenario(escenario.id);
    router.push(destinoPortal());
  };

  /** Lo que decide el servidor después de que el proveedor autentica. */
  const decidir = (correoValido: string) => {
    const u = id.porCorreo(correoValido);
    if (!u) return setPaso({ id: "rechazo", motivo: "sin-acceso", correo: correoValido });
    if (u.estado === "bloqueado") return setPaso({ id: "rechazo", motivo: "bloqueada", correo: correoValido });

    const propios = id.vinculos.filter((v) => v.usuarioId === u.id);
    const activos = propios.filter((v) => v.estado === "activo");
    const pendientes = propios.filter((v) => v.estado === "invitado" && (v.invitacionVence ?? HOY) >= HOY);

    if (activos.length === 0 && pendientes.length === 0) {
      if (u.rolesInternos.length > 0) return setPaso({ id: "rechazo", motivo: "interno", correo: correoValido });
      const desactivado = propios.find((v) => v.estado === "desactivado");
      return setPaso({
        id: "rechazo",
        motivo: desactivado ? "desactivado" : "sin-acceso",
        correo: correoValido,
        empresa: desactivado ? EMPRESAS_POR_NIT[desactivado.empresa] : undefined,
      });
    }
    if (pendientes.length > 0) return setPaso({ id: "invitaciones", usuarioId: u.id });
    entrarAlPortal(u.id);
  };

  const enviarClave = (e: FormEvent) => {
    e.preventDefault();
    if (paso.id !== "clave") return;
    if (clave.length === 0) {
      setError("Escribe tu contraseña.");
      return;
    }
    setError(null);
    setCargando(true);
    setTimeout(() => {
      setCargando(false);
      decidir(paso.correo);
    }, 650);
  };

  const reiniciar = () => {
    setPaso({ id: "correo" });
    setError(null);
    setClave("");
  };

  return (
    <Acceso className="grid min-h-dvh lg:grid-cols-[1fr_1.1fr]">
      <MarcaAcceso pie="Prototipo de demostración · datos simulados" />

      {/* Columna de acceso */}
      <main className="relative flex items-center bg-surface px-6 py-14 sm:px-12">
        <SelectorVista />
        <div className="mx-auto w-full max-w-[460px]" aria-live="polite">
          <div className="mb-8 flex items-center justify-between gap-4 lg:hidden">
            <Link href="/" aria-label="Fedesoft · ir al inicio" className="rounded">
              <Logo alto={24} />
            </Link>
            <Link href="/" className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-muted transition hover:text-ink">
              <ArrowLeft size={14} aria-hidden /> Volver
            </Link>
          </div>

          {paso.id === "correo" && (
            <>
              {sesionAbierta && (
                <div className="mb-8 rounded-xl border border-line bg-bg p-4">
                  <p className="text-[14.5px]">
                    Ya tienes una sesión abierta como <span className="font-semibold">{sesionAbierta.nombre ?? sesionAbierta.correo}</span>.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Boton tamano="sm" onClick={() => router.push(destinoPortal())}>
                      Continuar al portal <ArrowRight size={14} aria-hidden />
                    </Boton>
                    <Boton tamano="sm" variante="secundario" onClick={() => id.cerrarPortal()}>
                      Usar otra cuenta
                    </Boton>
                  </div>
                </div>
              )}
              <h1 className="font-display text-[30px] font-light leading-tight">Ingresa al portal</h1>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">
                Con tu correo corporativo. Cada contacto de una empresa afiliada ve lo que le corresponde según su rol.
              </p>

              <form onSubmit={continuarCorreo} className="mt-8 grid gap-3" noValidate>
                <label htmlFor="correo" className="text-[13.5px] font-semibold">Correo corporativo</label>
                <div className="relative">
                  <Mail size={16} aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    id="correo"
                    type="email"
                    autoComplete="username"
                    inputMode="email"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? "correo-error" : undefined}
                    placeholder="nombre@tuempresa.co"
                    className="w-full rounded-xl border border-line bg-surface py-3 pl-10 pr-3 text-[15px]"
                  />
                </div>
                {error && <p id="correo-error" role="alert" className="text-[13.5px] text-danger">{error}</p>}
                <Boton type="submit" className="mt-1 w-full">
                  Continuar <ArrowRight size={16} aria-hidden />
                </Boton>
              </form>

              <div className="mt-8 grid gap-5">
                {[
                  { titulo: "Cuentas de demostración por rol", cuentas: DEMO_ROLES },
                  { titulo: "Casos de acceso", cuentas: DEMO_CASOS },
                ].map((g) => (
                  <section key={g.titulo} aria-label={g.titulo}>
                    <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-muted">{g.titulo}</p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {g.cuentas.map((d) => (
                        <button
                          key={d.correo}
                          type="button"
                          onClick={() => {
                            setCorreo(d.correo);
                            irAClave(d.correo);
                          }}
                          className="rounded-lg border border-line px-3 py-2.5 text-left transition hover:border-accent"
                        >
                          <span className="block text-[13.5px] font-semibold">{d.etiqueta}</span>
                          <span className="block truncate text-[12.5px] text-muted">{d.detalle}</span>
                        </button>
                      ))}
                    </div>
                  </section>
                ))}
              </div>

              <Pie />
            </>
          )}

          {paso.id === "clave" && (
            <>
              <button
                type="button"
                onClick={reiniciar}
                className="mb-6 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-muted transition hover:text-ink"
              >
                <ArrowLeft size={14} aria-hidden /> Usar otro correo
              </button>
              {/* Pantalla del proveedor de identidad: el portal no ve la contraseña. */}
              <div className="overflow-hidden rounded-2xl border border-line">
                <div className="flex items-center gap-2.5 border-b border-line bg-surface-2 px-5 py-3.5">
                  <KeyRound size={16} className="text-accent" aria-hidden />
                  <p className="text-[13px] font-semibold">Cuenta Fedesoft · proveedor de identidad</p>
                </div>
                <form onSubmit={enviarClave} className="grid gap-3 p-5" noValidate>
                  <p className="text-[14px] text-muted">
                    Entrando como <span className="font-semibold text-ink">{paso.correo}</span>
                  </p>
                  <label htmlFor="clave" className="text-[13.5px] font-semibold">Contraseña</label>
                  <div className="relative">
                    <LockKeyhole size={16} aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                    <input
                      id="clave"
                      type="password"
                      autoComplete="current-password"
                      autoFocus
                      value={clave}
                      onChange={(e) => setClave(e.target.value)}
                      aria-invalid={error ? true : undefined}
                      aria-describedby="clave-ayuda"
                      className="w-full rounded-xl border border-line bg-surface py-3 pl-10 pr-3 text-[15px]"
                    />
                  </div>
                  <p id="clave-ayuda" className="text-[12.5px] text-muted">En la demostración sirve cualquier contraseña.</p>
                  {error && <p role="alert" className="text-[13.5px] text-danger">{error}</p>}
                  <Boton type="submit" disabled={cargando} className="mt-1 w-full">
                    {cargando ? <><Loader2 size={16} className="animate-spin" aria-hidden /> Verificando…</> : "Entrar"}
                  </Boton>
                  <Link href="/entrar/recuperar" className="justify-self-center text-[13.5px] font-semibold text-link hover:underline">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </form>
              </div>
              <p className="mt-4 flex items-start gap-2 text-[13px] text-muted">
                <ShieldCheck size={15} className="mt-0.5 shrink-0 text-accent" aria-hidden />
                La contraseña y el segundo factor los valida el proveedor de identidad. El portal nunca los ve ni los
                guarda: solo recibe quién eres.
              </p>
            </>
          )}

          {paso.id === "invitaciones" && (
            <Invitaciones
              usuarioId={paso.usuarioId}
              onContinuar={() => {
                const activos = id.vinculos.filter((v) => v.usuarioId === paso.usuarioId && v.estado === "activo");
                if (activos.length === 0) {
                  setPaso({ id: "rechazo", motivo: "sin-acceso", correo: id.porId(paso.usuarioId)?.correo ?? "" });
                } else entrarAlPortal(paso.usuarioId);
              }}
            />
          )}

          {paso.id === "verificado" && <Verificado usuarioId={paso.usuarioId} />}

          {paso.id === "rechazo" && <Rechazo paso={paso} onReintentar={reiniciar} />}
        </div>
      </main>
    </Acceso>
  );
}

function Invitaciones({ usuarioId, onContinuar }: { usuarioId: string; onContinuar: () => void }) {
  const id = useIdentidad();
  const pendientes = id.vinculos.filter(
    (v) => v.usuarioId === usuarioId && v.estado === "invitado" && (v.invitacionVence ?? HOY) >= HOY,
  );

  return (
    <>
      <h1 className="font-display text-[28px] font-light leading-tight">
        {pendientes.length > 0 ? "Tienes una invitación" : "Listo"}
      </h1>
      <p className="mt-2 text-[15px] leading-relaxed text-muted">
        {pendientes.length > 0
          ? "Entrar no la acepta por ti: decide si quieres unirte. Hasta que aceptes, la empresa no registra tus datos."
          : "Respondiste todas tus invitaciones."}
      </p>
      <div className="mt-6 grid gap-3">
        {pendientes.map((v) => (
          <div key={v.empresa} className="rounded-xl border border-line p-4">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-bg text-muted">
                <Building2 size={18} aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{EMPRESAS_POR_NIT[v.empresa] ?? v.empresa}</p>
                <p className="text-[13.5px] text-muted">
                  Como {nombreRolEmpresa(v.rol)}
                  {v.invitadoPor ? ` · te invitó ${v.invitadoPor}` : ""}
                  {v.invitacionVence ? ` · vence el ${fecha(v.invitacionVence)}` : ""}
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Boton tamano="sm" onClick={() => id.aceptarInvitacion(usuarioId, v.empresa)}>Aceptar</Boton>
              <Boton tamano="sm" variante="secundario" onClick={() => id.rechazarInvitacion(usuarioId, v.empresa)}>
                Rechazar
              </Boton>
            </div>
          </div>
        ))}
      </div>
      {pendientes.length === 0 && (
        <Boton className="mt-6 w-full" onClick={onContinuar}>
          Continuar <ArrowRight size={16} aria-hidden />
        </Boton>
      )}
    </>
  );
}

function Verificado({ usuarioId }: { usuarioId: string }) {
  const id = useIdentidad();
  const { cambiarEscenario } = useDemo();
  const router = useRouter();
  const u = id.porId(usuarioId);
  const empresas = id.vinculos
    .filter((v) => v.usuarioId === usuarioId && v.estado === "activo")
    .map((v) => `${EMPRESAS_POR_NIT[v.empresa] ?? v.empresa} (${nombreRolEmpresa(v.rol)})`);

  const verComoGerente = () => {
    const camilo = id.porCorreo("camilo.restrepo@datalabsandina.co");
    if (camilo) id.iniciarPortal(camilo.id);
    cambiarEscenario("mipyme-al-dia");
    router.push("/empresa/contactos");
  };

  return (
    <>
      <span className="grid h-11 w-11 place-items-center rounded-full bg-success-bg text-success">
        <ShieldCheck size={20} aria-hidden />
      </span>
      <h1 className="mt-4 font-display text-[28px] font-light leading-tight">Hola, {u?.nombre ?? u?.correo}</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-muted">
        Tu acceso quedó activo en {empresas.join(", ") || "tu empresa"}. En el portal real entrarías ahora con los
        permisos de tu rol.
      </p>
      <p className="mt-3 text-[14px] leading-relaxed text-muted">
        La demostración recorre el portal completo con los perfiles de ejemplo. Mira cómo ve ahora el gerente tu acceso:
      </p>
      <Boton className="mt-6 w-full" onClick={verComoGerente}>
        Ver los accesos como gerente <ArrowRight size={16} aria-hidden />
      </Boton>
    </>
  );
}

function Rechazo({ paso, onReintentar }: { paso: Extract<Paso, { id: "rechazo" }>; onReintentar: () => void }) {
  const contenido = {
    "sin-acceso": {
      icono: UserX,
      titulo: "Tu cuenta no tiene acceso al portal",
      texto:
        "Al portal se entra por invitación: pídele al gerente registrado de tu empresa que te invite desde Contactos y accesos. Si tu empresa aún no está afiliada, puedes solicitarlo.",
    },
    desactivado: {
      icono: UserX,
      titulo: "Tu acceso fue desactivado",
      texto: `El gerente de ${paso.empresa ?? "tu empresa"} desactivó tu acceso. Si es un error, pídele que lo reactive.`,
    },
    bloqueada: {
      icono: Ban,
      titulo: "Tu cuenta está bloqueada",
      texto:
        "Fedesoft bloqueó esta cuenta y cerró todas sus sesiones. Si crees que es un error, escribe a soporte@fedesoft.org.",
    },
    interno: {
      icono: ShieldCheck,
      titulo: "Tu cuenta es del equipo de Fedesoft",
      texto: "Los usuarios internos entran por la consola, con segundo factor obligatorio.",
    },
  }[paso.motivo];
  const Icono = contenido.icono;

  return (
    <>
      <span className="grid h-11 w-11 place-items-center rounded-full bg-bg text-muted">
        <Icono size={20} aria-hidden />
      </span>
      <h1 className="mt-4 font-display text-[28px] font-light leading-tight">{contenido.titulo}</h1>
      <p className="mt-1 font-mono text-[13px] text-muted">{paso.correo}</p>
      <p className="mt-3 text-[15px] leading-relaxed text-muted">{contenido.texto}</p>
      <div className="mt-6 flex flex-wrap gap-2">
        <Boton variante="secundario" onClick={onReintentar}>Usar otro correo</Boton>
        {paso.motivo === "sin-acceso" && (
          <Link href="/afiliarme" className="inline-flex items-center rounded-full px-5 py-2.5 text-[15px] font-semibold text-link hover:bg-info-bg">
            Solicitar afiliación
          </Link>
        )}
        {paso.motivo === "interno" && (
          <Link href="/admin/entrar" className="inline-flex items-center rounded-full bg-[var(--navy-700)] px-5 py-2.5 text-[15px] font-semibold text-white hover:brightness-115">
            Ir a la consola
          </Link>
        )}
      </div>
    </>
  );
}

function Pie() {
  return (
    <div className="mt-8 grid gap-3 border-t border-line pt-6 text-[13.5px] text-muted">
      <p className="flex items-start gap-2">
        <KeyRound size={15} className="mt-0.5 shrink-0 text-muted" aria-hidden />
        <span>
          ¿Tu empresa aún no está afiliada?{" "}
          <Link href="/afiliarme" className="font-semibold text-link hover:underline">Solicita la afiliación</Link>
        </span>
      </p>
      <p className="flex items-start gap-2">
        <ShieldCheck size={15} className="mt-0.5 shrink-0 text-accent" aria-hidden />
        <span>
          ¿Eres del equipo de Fedesoft?{" "}
          <Link href="/admin/entrar" className="font-semibold text-link hover:underline">Entra a la consola</Link>
        </span>
      </p>
    </div>
  );
}
