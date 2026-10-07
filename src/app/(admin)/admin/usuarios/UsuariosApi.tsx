"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Ban, Building2, Laptop, Loader2, Lock, LogOut, Plus, RotateCcw, Search, ShieldCheck, Unlock, UserPlus, X } from "lucide-react";
import { api, ErrorApi } from "@/lib/api/cliente";
import { tienePermiso, useSesionApi } from "@/lib/api/sesion";
import { Boton, Card, Chip, Eyebrow } from "@/components/ui/primitivos";
import { Aviso, Dialogo } from "@/components/ui/Dialogo";

/**
 * Usuarios y roles contra el API real (/admin/v1/users…).
 *
 * Lo que el rol de quien opera no permite se muestra deshabilitado y explicado;
 * aun así, quien decide es el servidor, que responde 403 si se intenta.
 */

interface UsuarioLista {
  id: string;
  email: string;
  name: string | null;
  status: "ACTIVO" | "INVITADO" | "BLOQUEADO";
  lastLoginAt: string | null;
  internalRoles: string[];
  organizations: number;
}

interface UsuarioDetalle {
  id: string;
  email: string;
  name: string | null;
  status: UsuarioLista["status"];
  lastLoginAt: string | null;
  linked: boolean;
  internalRoles: { role: { key: string; name: string } }[];
  organizationUsers: { status: string; role: { key: string; name: string }; organization: { id: string; legalName: string; nit: string } }[];
  sessions: { id: string; channel: "PORTAL" | "CONSOLA"; lastSeenAt: string; ipAddress: string | null; userAgent: string | null }[];
}

interface RolInterno {
  key: string;
  name: string;
}

type Filtro = "todos" | "internos" | "afiliados" | "bloqueados";
const FILTROS: { id: Filtro; etiqueta: string }[] = [
  { id: "todos", etiqueta: "Todos" },
  { id: "internos", etiqueta: "Equipo Fedesoft" },
  { id: "afiliados", etiqueta: "Afiliados" },
  { id: "bloqueados", etiqueta: "Bloqueados" },
];

const fechaHora = (iso: string | null) => (iso ? new Date(iso).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" }) : "—");
const siglas = (nombre: string | null, correo: string) =>
  (nombre ?? correo).split(/[\s.@]+/).filter(Boolean).map((p) => p[0]?.toUpperCase()).slice(0, 2).join("");

export function UsuariosApi() {
  const { actual } = useSesionApi("consola");
  const vista = actual.estado === "lista" ? actual.vista : null;
  const permisos = vista?.permissions ?? [];
  const puede = {
    asignar: tienePermiso(permisos, "role:assign"),
    bloquear: tienePermiso(permisos, "user:block"),
    cerrarSesiones: tienePermiso(permisos, "session:revoke"),
  };
  const yo = vista?.user.id;

  const [q, setQ] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [lista, setLista] = useState<{ estado: "cargando" } | { estado: "error"; mensaje: string } | { estado: "lista"; items: UsuarioLista[]; total: number }>({ estado: "cargando" });
  const [roles, setRoles] = useState<RolInterno[]>([]);
  const [seleccion, setSeleccion] = useState<string | null>(null);
  const [detalle, setDetalle] = useState<UsuarioDetalle | null>(null);
  const [aviso, setAviso] = useState<{ ok: boolean; mensaje: string } | null>(null);
  const [dialogo, setDialogo] = useState<null | { tipo: "bloquear" | "desbloquear" } | { tipo: "alta" }>(null);

  const buscar = useCallback(async (texto: string) => {
    try {
      const r = await api<{ total: number; items: UsuarioLista[] }>("consola", `/users?take=100${texto ? `&q=${encodeURIComponent(texto)}` : ""}`);
      setLista({ estado: "lista", ...r });
    } catch (e) {
      setLista({ estado: "error", mensaje: (e as Error).message });
    }
  }, []);

  const verDetalle = useCallback(async (id: string) => {
    try {
      setDetalle(await api<UsuarioDetalle>("consola", `/users/${id}`));
    } catch (e) {
      setAviso({ ok: false, mensaje: (e as Error).message });
    }
  }, []);

  /* La búsqueda espera a que se deje de escribir: una petición por pausa, no por tecla. */
  useEffect(() => {
    const t = setTimeout(() => void buscar(q.trim()), 300);
    return () => clearTimeout(t);
  }, [q, buscar]);

  useEffect(() => {
    api<RolInterno[]>("consola", "/users/roles").then(setRoles).catch(() => setRoles([]));
  }, []);

  useEffect(() => {
    setDetalle(null);
    if (seleccion) void verDetalle(seleccion);
  }, [seleccion, verDetalle]);

  const visibles = useMemo(() => {
    if (lista.estado !== "lista") return [];
    return lista.items.filter((u) => {
      if (filtro === "internos") return u.internalRoles.length > 0;
      if (filtro === "afiliados") return u.organizations > 0;
      if (filtro === "bloqueados") return u.status === "BLOQUEADO";
      return true;
    });
  }, [lista, filtro]);

  /** Acción sobre el usuario elegido: resultado visible y datos releídos del servidor. */
  const ejecutar = async (llamada: () => Promise<unknown>, exito: string): Promise<string | null> => {
    setAviso(null);
    try {
      await llamada();
      setAviso({ ok: true, mensaje: exito });
      setDialogo(null);
      await Promise.all([buscar(q.trim()), seleccion ? verDetalle(seleccion) : Promise.resolve()]);
      return null;
    } catch (e) {
      const mensaje = e instanceof ErrorApi ? e.message : "No pudimos completar la acción.";
      if (!dialogo) setAviso({ ok: false, mensaje });
      return mensaje;
    }
  };

  return (
    <div className="grid gap-6">
      <header className="grid gap-3 border-b border-line pb-6">
        <Eyebrow>Identidad y accesos · datos del servidor</Eyebrow>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-display text-[clamp(26px,3.8vw,38px)] font-light leading-[1.1]">Usuarios y roles</h1>
          <div className="grid justify-items-end gap-1">
            <Boton onClick={() => { setAviso(null); setDialogo({ tipo: "alta" }); }} disabled={!puede.asignar}>
              <UserPlus size={16} aria-hidden /> Nuevo usuario interno
            </Boton>
            {!puede.asignar && <p className="text-[12.5px] text-muted">Requiere el permiso role:assign (Super Admin)</p>}
          </div>
        </div>
      </header>

      {aviso && !dialogo && <Aviso ok={aviso.ok}>{aviso.mensaje}</Aviso>}

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_1.15fr]">
        <Card className="overflow-hidden">
          <div className="grid gap-3 border-b border-line p-4">
            <div className="relative">
              <Search size={16} aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <label htmlFor="buscar-usuario-api" className="sr-only">Buscar por correo</label>
              <input
                id="buscar-usuario-api"
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar por correo"
                className="w-full rounded-lg border border-line bg-surface py-2.5 pl-9 pr-3 text-[14.5px]"
              />
            </div>
            <div role="group" aria-label="Filtrar usuarios" className="flex flex-wrap gap-1.5">
              {FILTROS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={filtro === f.id}
                  onClick={() => setFiltro(f.id)}
                  className={`rounded-full px-3 py-1.5 text-[13px] font-semibold transition ${filtro === f.id ? "bg-[var(--navy-700)] text-white" : "border border-line text-muted hover:text-ink"}`}
                >
                  {f.etiqueta}
                </button>
              ))}
            </div>
          </div>
          {lista.estado === "cargando" && (
            <p className="flex items-center justify-center gap-2 px-5 py-10 text-[14px] text-muted" role="status">
              <Loader2 size={16} className="animate-spin" aria-hidden /> Cargando cuentas…
            </p>
          )}
          {lista.estado === "error" && (
            <div className="grid justify-items-center gap-2 px-5 py-10 text-center text-[14px]">
              <p className="text-muted">{lista.mensaje}</p>
              <Boton variante="secundario" tamano="sm" onClick={() => void buscar(q.trim())}><RotateCcw size={14} aria-hidden /> Reintentar</Boton>
            </div>
          )}
          {lista.estado === "lista" && visibles.length === 0 && (
            <div className="px-5 py-10 text-center">
              <p className="font-semibold">Ninguna cuenta coincide</p>
              <button type="button" onClick={() => { setQ(""); setFiltro("todos"); }} className="mt-2 text-[14px] font-semibold text-link hover:underline">
                Limpiar la búsqueda
              </button>
            </div>
          )}
          {lista.estado === "lista" && visibles.length > 0 && (
            <ul className="max-h-[640px] divide-y divide-line overflow-y-auto">
              {visibles.map((u) => (
                <li key={u.id}>
                  <button
                    type="button"
                    onClick={() => { setSeleccion(u.id); setAviso(null); }}
                    aria-current={u.id === seleccion ? "true" : undefined}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${u.id === seleccion ? "bg-[var(--info-bg)]" : "hover:bg-bg"}`}
                  >
                    <span aria-hidden className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-[12px] font-bold ${u.internalRoles.length > 0 ? "bg-[var(--navy-700)] text-white" : "bg-bg text-muted"}`}>
                      {siglas(u.name, u.email)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14.5px] font-semibold">{u.name ?? u.email}</span>
                      <span className="block truncate text-[12.5px] text-muted">
                        {u.internalRoles.length > 0
                          ? u.internalRoles.map((k) => roles.find((r) => r.key === k)?.name ?? k).join(", ")
                          : `${u.organizations} ${u.organizations === 1 ? "empresa" : "empresas"} · ${u.email}`}
                      </span>
                    </span>
                    <EstadoChip status={u.status} />
                  </button>
                </li>
              ))}
            </ul>
          )}
          {lista.estado === "lista" && lista.total > lista.items.length && (
            <p className="border-t border-line px-4 py-2.5 text-[12.5px] text-muted">
              Mostrando {lista.items.length} de {lista.total}. Afina la búsqueda para encontrar el resto.
            </p>
          )}
        </Card>

        {!seleccion ? (
          <Card className="px-6 py-14 text-center text-[14.5px] text-muted">Elige una cuenta para ver su detalle.</Card>
        ) : !detalle ? (
          <Card className="flex items-center justify-center gap-2 px-6 py-14 text-[14px] text-muted"><Loader2 size={16} className="animate-spin" aria-hidden /> Cargando…</Card>
        ) : (
          <Ficha
            key={detalle.id}
            u={detalle}
            roles={roles}
            esYo={detalle.id === yo}
            puede={puede}
            onAsignar={(key) => ejecutar(() => api("consola", `/users/${detalle.id}/internal-roles`, { method: "POST", body: { roleKey: key } }), "Rol asignado. Sus sesiones de consola se cerraron.")}
            onQuitar={(key) => ejecutar(() => api("consola", `/users/${detalle.id}/internal-roles/${encodeURIComponent(key)}`, { method: "DELETE" }), "Rol retirado. Sus sesiones de consola se cerraron.")}
            onCerrarSesiones={() => ejecutar(() => api("consola", `/users/${detalle.id}/sessions/revoke`, { method: "POST" }), "Sesiones cerradas.")}
            onBloqueo={() => { setAviso(null); setDialogo({ tipo: detalle.status === "BLOQUEADO" ? "desbloquear" : "bloquear" }); }}
          />
        )}
      </div>

      {dialogo && dialogo.tipo !== "alta" && detalle && (
        <DialogoBloqueo
          tipo={dialogo.tipo}
          nombre={detalle.name ?? detalle.email}
          onCerrar={() => setDialogo(null)}
          onConfirmar={(reason) =>
            ejecutar(
              () => api("consola", `/users/${detalle.id}/${dialogo.tipo === "bloquear" ? "block" : "unblock"}`, { method: "POST", body: { reason } }),
              dialogo.tipo === "bloquear" ? "Cuenta bloqueada en todo el sistema. Sus sesiones se cerraron." : "Cuenta desbloqueada.",
            )
          }
        />
      )}
      {dialogo?.tipo === "alta" && (
        <DialogoAlta
          roles={roles}
          onCerrar={() => setDialogo(null)}
          onCrear={(email, name, roleKey) =>
            ejecutar(() => api("consola", "/users", { method: "POST", body: { email, name, roleKey } }), "Cuenta creada. Entrará con su correo y configurará el segundo factor.")
          }
        />
      )}
    </div>
  );
}

function EstadoChip({ status }: { status: UsuarioLista["status"] }) {
  if (status === "BLOQUEADO") return <Chip tono="error">Bloqueado</Chip>;
  if (status === "INVITADO") return <Chip tono="info">Sin primer ingreso</Chip>;
  return <Chip tono="neutro">Activo</Chip>;
}

function Ficha({
  u, roles, esYo, puede, onAsignar, onQuitar, onCerrarSesiones, onBloqueo,
}: {
  u: UsuarioDetalle;
  roles: RolInterno[];
  esYo: boolean;
  puede: { asignar: boolean; bloquear: boolean; cerrarSesiones: boolean };
  onAsignar: (key: string) => Promise<string | null>;
  onQuitar: (key: string) => Promise<string | null>;
  onCerrarSesiones: () => Promise<string | null>;
  onBloqueo: () => void;
}) {
  const [nuevoRol, setNuevoRol] = useState("");
  const tiene = new Set(u.internalRoles.map((r) => r.role.key));
  const disponibles = roles.filter((r) => !tiene.has(r.key));

  return (
    <Card className="overflow-hidden lg:sticky lg:top-[132px]" destacada>
      <div className="flex flex-wrap items-start gap-4 border-b border-line p-5">
        <span aria-hidden className={`grid h-12 w-12 shrink-0 place-items-center rounded-full text-[14px] font-bold ${u.internalRoles.length > 0 ? "bg-[var(--navy-700)] text-white" : "bg-bg text-muted"}`}>
          {siglas(u.name, u.email)}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-[20px] font-bold">
            {u.name ?? "Aún sin nombre"}
            {esYo && <span className="ml-2 text-[13px] font-semibold text-muted">(tú)</span>}
          </h2>
          <p className="truncate font-mono text-[13px] text-muted">{u.email}</p>
          <p className="mt-1 text-[13px] text-muted">
            {u.linked ? <>Último ingreso {fechaHora(u.lastLoginAt)}</> : "Nunca ha entrado: se vinculará a su cuenta en el primer ingreso."}
          </p>
        </div>
        <EstadoChip status={u.status} />
      </div>

      <div className="grid gap-6 p-5">
        <section>
          <h3 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-muted">Empresas</h3>
          {u.organizationUsers.length > 0 ? (
            <ul className="mt-2.5 grid gap-2">
              {u.organizationUsers.map((v) => (
                <li key={v.organization.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-line px-3 py-2.5 text-[14px]">
                  <Building2 size={15} className="text-muted" aria-hidden />
                  <span className="mr-auto font-semibold">{v.organization.legalName}</span>
                  <Chip tono="neutro">{v.role.name}</Chip>
                  <Chip tono={v.status === "ACTIVO" ? "exito" : v.status === "INVITADO" ? "info" : "neutro"}>
                    {v.status === "ACTIVO" ? "Activo" : v.status === "INVITADO" ? "Invitado" : "Desactivado"}
                  </Chip>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-[13.5px] text-muted">No pertenece a ninguna empresa afiliada.</p>
          )}
        </section>

        <section>
          <h3 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-muted">Roles internos</h3>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {u.internalRoles.length === 0 && <p className="text-[13.5px] text-muted">Ninguno.</p>}
            {u.internalRoles.map(({ role }) => (
              <span key={role.key} className="inline-flex items-center gap-1 rounded-full bg-info-bg py-1 pl-3 pr-1 text-[13px] font-semibold text-info">
                {role.name}
                <button
                  type="button"
                  disabled={!puede.asignar}
                  onClick={() => void onQuitar(role.key)}
                  className="rounded-full p-1 hover:bg-white/40 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label={`Quitar rol ${role.name}`}
                >
                  <X size={13} aria-hidden />
                </button>
              </span>
            ))}
          </div>
          {puede.asignar ? (
            disponibles.length > 0 && u.status !== "BLOQUEADO" && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <label htmlFor="nuevo-rol-api" className="sr-only">Rol interno a asignar</label>
                <select id="nuevo-rol-api" value={nuevoRol} onChange={(e) => setNuevoRol(e.target.value)} className="rounded-lg border border-line bg-surface px-3 py-2 text-[14px]">
                  <option value="">Asignar rol interno…</option>
                  {disponibles.map((r) => <option key={r.key} value={r.key}>{r.name}</option>)}
                </select>
                <Boton tamano="sm" variante="secundario" disabled={!nuevoRol} onClick={async () => { if (nuevoRol && !(await onAsignar(nuevoRol))) setNuevoRol(""); }}>
                  <Plus size={14} aria-hidden /> Asignar
                </Boton>
              </div>
            )
          ) : (
            <p className="mt-3 flex items-start gap-2 text-[12.5px] text-muted">
              <Lock size={13} className="mt-0.5 shrink-0" aria-hidden />
              Asignar o quitar roles internos requiere el permiso role:assign, que solo tiene Super Admin.
            </p>
          )}
        </section>

        <section>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-muted">Sesiones abiertas</h3>
            {u.sessions.length > 0 && (
              <Boton tamano="sm" variante="secundario" disabled={!puede.cerrarSesiones} onClick={() => void onCerrarSesiones()}>
                <LogOut size={14} aria-hidden /> Cerrar todas
              </Boton>
            )}
          </div>
          {u.sessions.length > 0 ? (
            <ul className="mt-2.5 grid gap-2">
              {u.sessions.map((s) => (
                <li key={s.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg bg-surface-2 px-3 py-2.5 text-[13.5px]">
                  <Laptop size={15} className="text-muted" aria-hidden />
                  <span className="max-w-[260px] truncate font-semibold" title={s.userAgent ?? undefined}>{navegador(s.userAgent)}</span>
                  <Chip tono={s.channel === "CONSOLA" ? "info" : "neutro"}>{s.channel === "CONSOLA" ? "Consola" : "Portal"}</Chip>
                  <span className="text-muted sm:ml-auto">
                    <span className="num font-mono">{s.ipAddress ?? "—"}</span> · <span className="num">{fechaHora(s.lastSeenAt)}</span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-[13.5px] text-muted">Sin sesiones abiertas.</p>
          )}
        </section>

        <section className="flex flex-wrap items-center gap-3 border-t border-line pt-5">
          <Boton variante={u.status === "BLOQUEADO" ? "secundario" : "peligro"} onClick={onBloqueo} disabled={esYo || !puede.bloquear}>
            {u.status === "BLOQUEADO" ? <><Unlock size={15} aria-hidden /> Desbloquear cuenta</> : <><Ban size={15} aria-hidden /> Bloquear cuenta</>}
          </Boton>
          <p className="max-w-[44ch] text-[12.5px] text-muted">
            {esYo
              ? "No puedes bloquear tu propia cuenta."
              : !puede.bloquear
                ? "Bloquear cuentas requiere el permiso user:block."
                : u.status === "BLOQUEADO"
                  ? "Vuelve a poder entrar; sus accesos en cada empresa se conservan."
                  : "Pierde el acceso al portal y a la consola, y se cierran todas sus sesiones."}
          </p>
        </section>
      </div>
    </Card>
  );
}

/** Resumen legible del user-agent: suficiente para reconocer el dispositivo. */
function navegador(ua: string | null): string {
  if (!ua) return "Dispositivo desconocido";
  const nav = /Edg\//.test(ua) ? "Edge" : /Firefox\//.test(ua) ? "Firefox" : /Chrome\//.test(ua) ? "Chrome" : /Safari\//.test(ua) ? "Safari" : "Navegador";
  const so = /Windows/.test(ua) ? "Windows" : /Mac OS X/.test(ua) ? "macOS" : /Android/.test(ua) ? "Android" : /iPhone|iPad/.test(ua) ? "iOS" : /Linux/.test(ua) ? "Linux" : "";
  return so ? `${nav} · ${so}` : nav;
}

function DialogoBloqueo({ tipo, nombre, onCerrar, onConfirmar }: { tipo: "bloquear" | "desbloquear"; nombre: string; onCerrar: () => void; onConfirmar: (reason: string) => Promise<string | null> }) {
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const bloquear = tipo === "bloquear";
  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    if (motivo.trim().length < 5) return setError("Escribe el motivo (al menos 5 caracteres).");
    const r = await onConfirmar(motivo.trim());
    if (r) setError(r);
  };
  return (
    <Dialogo
      abierto
      titulo={`${bloquear ? "Bloquear" : "Desbloquear"} a ${nombre}`}
      descripcion={bloquear ? "La cuenta deja de entrar al portal y a la consola, y se cierran todas sus sesiones. El motivo queda en la auditoría." : "La cuenta podrá volver a entrar. El motivo queda en la auditoría."}
      onCerrar={onCerrar}
      pie={
        <>
          <Boton variante="secundario" onClick={onCerrar}>Cancelar</Boton>
          <Boton type="submit" form="form-bloqueo-api" variante={bloquear ? "peligro" : "primario"}>
            {bloquear ? <><Ban size={15} aria-hidden /> Bloquear</> : <><Unlock size={15} aria-hidden /> Desbloquear</>}
          </Boton>
        </>
      }
    >
      <form id="form-bloqueo-api" onSubmit={enviar} className="grid gap-2" noValidate>
        <label htmlFor="motivo-api" className="text-[13.5px] font-semibold">Motivo</label>
        <textarea id="motivo-api" rows={3} value={motivo} onChange={(e) => { setMotivo(e.target.value); setError(null); }} className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-[14.5px]" />
        {error && <Aviso ok={false}>{error}</Aviso>}
      </form>
    </Dialogo>
  );
}

function DialogoAlta({ roles, onCerrar, onCrear }: { roles: RolInterno[]; onCerrar: () => void; onCrear: (email: string, name: string, roleKey: string) => Promise<string | null> }) {
  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");
  const [rol, setRol] = useState(roles.find((r) => r.key === "operaciones")?.key ?? roles[0]?.key ?? "");
  const [error, setError] = useState<string | null>(null);
  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) return setError("Escribe un correo válido.");
    if (nombre.trim().length < 2) return setError("Escribe el nombre.");
    const r = await onCrear(email.trim(), nombre.trim(), rol);
    if (r) setError(r);
  };
  return (
    <Dialogo
      abierto
      titulo="Nuevo usuario interno"
      descripcion="Entrará con su correo institucional y tendrá que configurar el segundo factor en su primer ingreso."
      onCerrar={onCerrar}
      pie={
        <>
          <Boton variante="secundario" onClick={onCerrar}>Cancelar</Boton>
          <Boton type="submit" form="form-alta-api"><ShieldCheck size={15} aria-hidden /> Crear cuenta</Boton>
        </>
      }
    >
      <form id="form-alta-api" onSubmit={enviar} className="grid gap-4" noValidate>
        <div className="grid gap-1.5">
          <label htmlFor="correo-alta-api" className="text-[13.5px] font-semibold">Correo institucional</label>
          <input id="correo-alta-api" type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(null); }} className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-[14.5px]" />
        </div>
        <div className="grid gap-1.5">
          <label htmlFor="nombre-alta-api" className="text-[13.5px] font-semibold">Nombre</label>
          <input id="nombre-alta-api" value={nombre} onChange={(e) => { setNombre(e.target.value); setError(null); }} className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-[14.5px]" />
        </div>
        <fieldset className="grid gap-2">
          <legend className="mb-1 text-[13.5px] font-semibold">Rol interno</legend>
          {roles.map((r) => (
            <label key={r.key} className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 ${rol === r.key ? "border-accent bg-[var(--info-bg)]" : "border-line hover:border-accent"}`}>
              <input type="radio" name="rol-interno-api" checked={rol === r.key} onChange={() => setRol(r.key)} className="accent-[var(--navy-700)]" />
              <span className="text-[14px] font-semibold">{r.name}</span>
            </label>
          ))}
        </fieldset>
        {error && <Aviso ok={false}>{error}</Aviso>}
      </form>
    </Dialogo>
  );
}
