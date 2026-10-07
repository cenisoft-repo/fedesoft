"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, Loader2, Lock, Mail, RotateCcw, Send, ShieldCheck, UserMinus, UserPlus, UserRoundCog } from "lucide-react";
import { api, ErrorApi } from "@/lib/api/cliente";
import { useSesionApi } from "@/lib/api/sesion";
import { ROLES_EMPRESA } from "@/lib/mock/usuarios";
import { fecha } from "@/lib/format";
import { Boton, Card, Chip, Eyebrow, PageHeader } from "@/components/ui/primitivos";
import { Aviso, Dialogo } from "@/components/ui/Dialogo";

/**
 * Contactos y accesos contra el API real (GET/POST /v1/organization/users…).
 *
 * La empresa la pone la sesión en el servidor: aquí no se envía ningún
 * identificador de empresa. Si el servidor responde 403, la pantalla lo
 * explica; no se decide en el navegador quién puede ver esto.
 */

interface FilaApi {
  userId: string;
  email: string;
  name: string | null;
  jobTitle: string | null;
  role: { key: string; name: string };
  status: "ACTIVO" | "INVITADO" | "DESACTIVADO";
  invitationExpired: boolean;
  inviteExpiresAt: string | null;
  lastLoginAt: string | null;
}

interface Rol {
  key: string;
  name: string;
}

type Carga = { estado: "cargando" } | { estado: "sin-permiso" } | { estado: "error"; mensaje: string } | { estado: "lista"; filas: FilaApi[]; roles: Rol[] };

type Accion = { tipo: "invitar" } | { tipo: "rol"; fila: FilaApi } | { tipo: "desactivar"; fila: FilaApi };

const ORDEN = { ACTIVO: 0, INVITADO: 1, DESACTIVADO: 2 };

export function ContactosApi() {
  const { actual } = useSesionApi("portal");
  const yo = actual.estado === "lista" ? actual.vista.user.id : null;
  const empresa = actual.estado === "lista" ? actual.vista.activeOrganization?.legalName : undefined;
  const [carga, setCarga] = useState<Carga>({ estado: "cargando" });
  const [accion, setAccion] = useState<Accion | null>(null);
  const [aviso, setAviso] = useState<{ ok: boolean; mensaje: string } | null>(null);
  const [ocupado, setOcupado] = useState<string | null>(null);

  const recargar = useCallback(async () => {
    try {
      const [filas, roles] = await Promise.all([
        api<FilaApi[]>("portal", "/organization/users"),
        api<Rol[]>("portal", "/organization/users/roles"),
      ]);
      filas.sort((a, b) => ORDEN[a.status] - ORDEN[b.status]);
      setCarga({ estado: "lista", filas, roles });
    } catch (e) {
      if (e instanceof ErrorApi && e.status === 403) setCarga({ estado: "sin-permiso" });
      else setCarga({ estado: "error", mensaje: (e as Error).message });
    }
  }, []);

  useEffect(() => {
    void recargar();
  }, [recargar]);

  /** Ejecuta una acción, muestra el resultado y vuelve a leer la lista del servidor. */
  const ejecutar = async (clave: string, llamada: () => Promise<unknown>, exito: string): Promise<string | null> => {
    setOcupado(clave);
    setAviso(null);
    try {
      await llamada();
      setAviso({ ok: true, mensaje: exito });
      setAccion(null);
      await recargar();
      return null;
    } catch (e) {
      const mensaje = e instanceof ErrorApi ? e.message : "No pudimos completar la acción.";
      if (!accion) setAviso({ ok: false, mensaje });
      return mensaje;
    } finally {
      setOcupado(null);
    }
  };

  if (carga.estado === "cargando") {
    return (
      <div className="grid min-h-[40vh] place-items-center text-[14px] text-muted" role="status">
        <span className="inline-flex items-center gap-2"><Loader2 size={16} className="animate-spin" aria-hidden /> Cargando los accesos de tu empresa…</span>
      </div>
    );
  }
  if (carga.estado === "sin-permiso") return <SinPermiso />;
  if (carga.estado === "error") {
    return (
      <Card className="mx-auto max-w-[520px]">
        <div className="grid justify-items-center gap-3 px-6 py-12 text-center">
          <h1 className="font-display text-[20px] font-bold">No pudimos cargar los accesos</h1>
          <p className="max-w-[44ch] text-[15px] text-muted">{carga.mensaje}</p>
          <Boton variante="secundario" onClick={() => { setCarga({ estado: "cargando" }); void recargar(); }}>
            <RotateCcw size={15} aria-hidden /> Reintentar
          </Boton>
        </div>
      </Card>
    );
  }

  const { filas, roles } = carga;
  const cuenta = (s: FilaApi["status"]) => filas.filter((f) => f.status === s).length;

  return (
    <div className="grid gap-7">
      <Link href="/empresa" className="inline-flex w-fit items-center gap-1.5 text-[13.5px] font-semibold text-muted hover:text-ink">
        <ArrowLeft size={14} aria-hidden /> Mi empresa
      </Link>

      <PageHeader
        eyebrow="Mi empresa"
        titulo="Contactos y accesos"
        lede={`Decide quién de ${empresa ?? "tu empresa"} entra al portal y qué ve. Los cambios rigen de inmediato: quitar un acceso o cambiar un rol cierra las sesiones abiertas de esa persona.`}
        acciones={
          <Boton onClick={() => { setAviso(null); setAccion({ tipo: "invitar" }); }}>
            <UserPlus size={16} aria-hidden /> Invitar persona
          </Boton>
        }
      />

      {aviso && !accion && <Aviso ok={aviso.ok}>{aviso.mensaje}</Aviso>}

      <div className="grid items-start gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center gap-2 border-b border-line px-5 py-4">
            <h2 className="mr-auto font-display text-[18px] font-bold">Personas</h2>
            <Chip tono="exito"><span className="num">{cuenta("ACTIVO")}</span> con acceso</Chip>
            {cuenta("INVITADO") > 0 && <Chip tono="info"><span className="num">{cuenta("INVITADO")}</span> por aceptar</Chip>}
            {cuenta("DESACTIVADO") > 0 && <Chip tono="neutro"><span className="num">{cuenta("DESACTIVADO")}</span> desactivados</Chip>}
          </div>
          <ul className="divide-y divide-line">
            {filas.map((f) => {
              const quien = f.name ?? f.email;
              const esYo = f.userId === yo;
              return (
                <li key={f.userId} className="flex flex-wrap items-start gap-3 px-5 py-4">
                  <div
                    aria-hidden
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-[12px] font-bold ${f.status === "ACTIVO" ? "bg-[var(--navy-700)] text-white" : "bg-bg text-muted"}`}
                  >
                    {(f.name ?? f.email).split(/[\s.@]+/).filter(Boolean).map((p) => p[0]?.toUpperCase()).slice(0, 2).join("")}
                  </div>
                  <div className="min-w-[200px] flex-1">
                    <p className="font-semibold">
                      {f.name ?? <span className="text-muted">Pendiente de aceptar</span>}
                      {esYo && <span className="ml-2 text-[12.5px] font-semibold text-muted">(tú)</span>}
                    </p>
                    <p className="flex items-center gap-1.5 text-[13px] text-muted"><Mail size={12} aria-hidden /> <span className="truncate">{f.email}</span></p>
                    <p className="mt-0.5 text-[12.5px] text-muted">{detalle(f)}</p>
                  </div>
                  <div className="flex w-full flex-col items-start gap-2 sm:w-auto sm:items-end">
                    <div className="flex flex-wrap items-center gap-2">
                      <Chip tono={f.role.key === "gerente" ? "info" : f.role.key === "talento" ? "exito" : "neutro"}>{f.role.name}</Chip>
                      <EstadoChip f={f} />
                    </div>
                    {!esYo && (
                      <div className="flex flex-wrap gap-1.5">
                        {f.status === "ACTIVO" && (
                          <>
                            <Boton variante="secundario" tamano="sm" onClick={() => { setAviso(null); setAccion({ tipo: "rol", fila: f }); }} aria-label={`Cambiar rol de ${quien}`}>
                              <UserRoundCog size={14} aria-hidden /> Rol
                            </Boton>
                            <Boton variante="secundario" tamano="sm" onClick={() => { setAviso(null); setAccion({ tipo: "desactivar", fila: f }); }} aria-label={`Desactivar acceso de ${quien}`}>
                              <UserMinus size={14} aria-hidden /> Desactivar
                            </Boton>
                          </>
                        )}
                        {f.status === "INVITADO" && (
                          <>
                            <Boton
                              variante="secundario"
                              tamano="sm"
                              disabled={ocupado !== null}
                              aria-label={`Reenviar invitación a ${quien}`}
                              onClick={() => void ejecutar(`r-${f.userId}`, () => api("portal", "/organization/users/invitations", { method: "POST", body: { email: f.email, roleKey: f.role.key } }), "Invitación reenviada.")}
                            >
                              <Send size={14} aria-hidden /> Reenviar
                            </Boton>
                            <Boton
                              variante="fantasma"
                              tamano="sm"
                              disabled={ocupado !== null}
                              aria-label={`Retirar invitación a ${quien}`}
                              onClick={() => void ejecutar(`x-${f.userId}`, () => api("portal", `/organization/users/${f.userId}/deactivate`, { method: "POST" }), "Invitación retirada.")}
                            >
                              Retirar
                            </Boton>
                          </>
                        )}
                        {f.status === "DESACTIVADO" && (
                          <Boton
                            variante="secundario"
                            tamano="sm"
                            disabled={ocupado !== null}
                            aria-label={`Reactivar acceso de ${quien}`}
                            onClick={() => void ejecutar(`a-${f.userId}`, () => api("portal", `/organization/users/${f.userId}/reactivate`, { method: "POST" }), "Acceso reactivado.")}
                          >
                            <RotateCcw size={14} aria-hidden /> Reactivar
                          </Boton>
                        )}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>

        <aside className="grid h-fit gap-5">
          <Card className="p-5">
            <Eyebrow>Qué ve cada rol</Eyebrow>
            <dl className="mt-3 grid gap-3.5">
              {roles.map((r) => (
                <div key={r.key}>
                  <dt className="text-[14.5px] font-semibold">{r.name}</dt>
                  <dd className="text-[13.5px] leading-relaxed text-muted">{resumenRol(r.key)}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 flex items-start gap-2 border-t border-line pt-3.5 text-[13px] text-muted">
              <ShieldCheck size={14} className="mt-0.5 shrink-0 text-accent" aria-hidden />
              Datos del servidor. Cada acción la autoriza el API; esta pantalla solo la refleja.
            </p>
          </Card>
        </aside>
      </div>

      {accion?.tipo === "invitar" && (
        <DialogoInvitar
          roles={roles}
          onCerrar={() => setAccion(null)}
          onInvitar={(email, roleKey) =>
            ejecutar("invitar", () => api("portal", "/organization/users/invitations", { method: "POST", body: { email, roleKey } }), `Invitación enviada a ${email.trim().toLowerCase()}.`)
          }
        />
      )}
      {accion?.tipo === "rol" && (
        <DialogoRol
          fila={accion.fila}
          roles={roles}
          onCerrar={() => setAccion(null)}
          onCambiar={(roleKey) =>
            ejecutar("rol", () => api("portal", `/organization/users/${accion.fila.userId}/role`, { method: "PATCH", body: { roleKey } }), "Rol actualizado. Sus sesiones abiertas se cerraron.")
          }
        />
      )}
      {accion?.tipo === "desactivar" && (
        <DialogoDesactivar
          fila={accion.fila}
          onCerrar={() => setAccion(null)}
          onConfirmar={() =>
            ejecutar("desactivar", () => api("portal", `/organization/users/${accion.fila.userId}/deactivate`, { method: "POST" }), "Acceso desactivado. Sus sesiones en la empresa se cerraron.")
          }
        />
      )}
    </div>
  );
}

function detalle(f: FilaApi): string {
  if (f.status === "INVITADO") {
    const vence = f.inviteExpiresAt ? fecha(f.inviteExpiresAt.slice(0, 10)) : "";
    return f.invitationExpired ? `La invitación venció el ${vence}: reenvíala para que pueda entrar` : `Invitación enviada · vence el ${vence}`;
  }
  if (f.status === "DESACTIVADO") return [f.jobTitle, "sin acceso al portal desde que se desactivó"].filter(Boolean).join(" · ");
  return [f.jobTitle, f.lastLoginAt ? `último ingreso ${fecha(f.lastLoginAt.slice(0, 10))}` : "aún no ha entrado"].filter(Boolean).join(" · ");
}

function EstadoChip({ f }: { f: FilaApi }) {
  if (f.status === "ACTIVO") return <Chip tono="exito">Activo</Chip>;
  if (f.status === "DESACTIVADO") return <Chip tono="neutro">Desactivado</Chip>;
  return f.invitationExpired ? <Chip tono="aviso">Invitación vencida</Chip> : <Chip tono="info">Invitado</Chip>;
}

function resumenRol(key: string): string {
  return ROLES_EMPRESA.find((r) => r.id === key)?.resumen ?? "";
}

function SelectorRol({ roles, valor, onCambio, nombre }: { roles: Rol[]; valor: string; onCambio: (k: string) => void; nombre: string }) {
  return (
    <fieldset className="grid gap-2">
      <legend className="mb-1 text-[13.5px] font-semibold">Rol</legend>
      {roles.map((r) => (
        <label key={r.key} className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 transition ${valor === r.key ? "border-accent bg-[var(--info-bg)]" : "border-line hover:border-accent"}`}>
          <input type="radio" name={nombre} value={r.key} checked={valor === r.key} onChange={() => onCambio(r.key)} className="mt-1 accent-[var(--navy-700)]" />
          <span>
            <span className="block text-[14px] font-semibold">{r.name}</span>
            <span className="block text-[12.5px] leading-relaxed text-muted">{resumenRol(r.key)}</span>
          </span>
        </label>
      ))}
    </fieldset>
  );
}

function DialogoInvitar({ roles, onCerrar, onInvitar }: { roles: Rol[]; onCerrar: () => void; onInvitar: (email: string, roleKey: string) => Promise<string | null> }) {
  const [email, setEmail] = useState("");
  const [rol, setRol] = useState(roles.find((r) => r.key === "contacto")?.key ?? roles[0]?.key ?? "");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) return setError("Escribe un correo válido.");
    setEnviando(true);
    const r = await onInvitar(email, rol);
    setEnviando(false);
    if (r) setError(r);
  };
  return (
    <Dialogo
      abierto
      titulo="Invitar a una persona"
      descripcion="Le llegará un correo para entrar. La invitación vence y la persona decide si la acepta."
      onCerrar={onCerrar}
      pie={
        <>
          <Boton variante="secundario" onClick={onCerrar}>Cancelar</Boton>
          <Boton type="submit" form="form-invitar-api" disabled={enviando}>
            {enviando ? <Loader2 size={15} className="animate-spin" aria-hidden /> : <Send size={15} aria-hidden />} Enviar invitación
          </Boton>
        </>
      }
    >
      <form id="form-invitar-api" onSubmit={enviar} className="grid gap-4" noValidate>
        <div className="grid gap-1.5">
          <label htmlFor="correo-invitado-api" className="text-[13.5px] font-semibold">Correo corporativo</label>
          <input
            id="correo-invitado-api"
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(null); }}
            aria-invalid={error ? true : undefined}
            placeholder="nombre@empresa.co"
            className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-[14.5px]"
          />
          <p className="text-[12.5px] text-muted">No pedimos el nombre: lo trae la cuenta de la persona cuando entra.</p>
        </div>
        <SelectorRol roles={roles} valor={rol} onCambio={setRol} nombre="rol-invitacion-api" />
        {error && <Aviso ok={false}>{error}</Aviso>}
      </form>
    </Dialogo>
  );
}

function DialogoRol({ fila, roles, onCerrar, onCambiar }: { fila: FilaApi; roles: Rol[]; onCerrar: () => void; onCambiar: (k: string) => Promise<string | null> }) {
  const [rol, setRol] = useState(fila.role.key);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  return (
    <Dialogo
      abierto
      titulo={`Rol de ${fila.name ?? fila.email}`}
      descripcion="Al cambiarlo, sus sesiones abiertas se cierran y entra de nuevo con los permisos nuevos."
      onCerrar={onCerrar}
      pie={
        <>
          <Boton variante="secundario" onClick={onCerrar}>Cancelar</Boton>
          <Boton
            disabled={rol === fila.role.key || enviando}
            onClick={async () => {
              setEnviando(true);
              const r = await onCambiar(rol);
              setEnviando(false);
              if (r) setError(r);
            }}
          >
            Guardar rol
          </Boton>
        </>
      }
    >
      <div className="grid gap-4">
        <SelectorRol roles={roles} valor={rol} onCambio={(k) => { setRol(k); setError(null); }} nombre="rol-cambio-api" />
        {error && <Aviso ok={false}>{error}</Aviso>}
      </div>
    </Dialogo>
  );
}

function DialogoDesactivar({ fila, onCerrar, onConfirmar }: { fila: FilaApi; onCerrar: () => void; onConfirmar: () => Promise<string | null> }) {
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  return (
    <Dialogo
      abierto
      titulo={`¿Desactivar el acceso de ${fila.name ?? fila.email}?`}
      descripcion="Pierde el acceso al portal de inmediato y sus sesiones abiertas se cierran. Puedes reactivarlo cuando quieras."
      onCerrar={onCerrar}
      pie={
        <>
          <Boton variante="secundario" onClick={onCerrar}>Cancelar</Boton>
          <Boton
            variante="peligro"
            disabled={enviando}
            onClick={async () => {
              setEnviando(true);
              const r = await onConfirmar();
              setEnviando(false);
              if (r) setError(r);
            }}
          >
            <UserMinus size={15} aria-hidden /> Desactivar
          </Boton>
        </>
      }
    >
      {error ? <Aviso ok={false}>{error}</Aviso> : undefined}
    </Dialogo>
  );
}

function SinPermiso() {
  return (
    <Card className="mx-auto max-w-[520px]">
      <div className="grid justify-items-center gap-3 px-6 py-14 text-center">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-bg text-muted"><Lock size={22} aria-hidden /></div>
        <h1 className="font-display text-[20px] font-bold">Los accesos los administra la gerencia</h1>
        <p className="max-w-[44ch] text-[15px] text-muted">
          El servidor no te permite ver ni cambiar los accesos de tu empresa. Si alguien de tu equipo necesita entrar,
          pídeselo al gerente registrado.
        </p>
        <Link href="/empresa" className="mt-1"><Boton variante="secundario">Volver a Mi empresa</Boton></Link>
      </div>
    </Card>
  );
}
