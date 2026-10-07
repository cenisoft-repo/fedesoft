"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  Ban, Building2, History, Laptop, Lock, LogOut, Plus, Search, ShieldCheck, Unlock, UserPlus, X,
} from "lucide-react";
import { iniciales, MIN_SUPER_ADMINS, useIdentidad, type Resultado } from "@/lib/identidad";
import {
  EMPRESAS_POR_NIT, ROLES_INTERNOS, nombreRolEmpresa, nombreRolInterno, type RolInterno, type Usuario,
} from "@/lib/mock/usuarios";
import { Boton, Card, Chip, Eyebrow } from "@/components/ui/primitivos";
import { Aviso, Dialogo } from "@/components/ui/Dialogo";
import { MODO_API } from "@/lib/api/cliente";
import { UsuariosApi } from "./UsuariosApi";

/**
 * Usuarios y roles de la consola (dominio Identity, docs/01-consola-administracion.md).
 *
 * Operaciones ve todo y puede bloquear o cerrar sesiones; asignar roles
 * internos o dar de alta usuarios internos exige `role:assign`, que solo tiene
 * Super Admin. Las acciones que no le corresponden se ven deshabilitadas y
 * explicadas, no escondidas.
 */

type Filtro = "todos" | "internos" | "afiliados" | "bloqueados";

const FILTROS: { id: Filtro; etiqueta: string }[] = [
  { id: "todos", etiqueta: "Todos" },
  { id: "internos", etiqueta: "Equipo Fedesoft" },
  { id: "afiliados", etiqueta: "Afiliados" },
  { id: "bloqueados", etiqueta: "Bloqueados" },
];

export default function UsuariosConsola() {
  return MODO_API ? <UsuariosApi /> : <UsuariosSimulado />;
}

function UsuariosSimulado() {
  const id = useIdentidad();
  const operador = id.sesionConsola ? id.porId(id.sesionConsola) : undefined;
  const esSuperAdmin = operador?.rolesInternos.includes("super-admin") ?? false;
  /* Como el API (ADR-009): ver cuentas de afiliados y el detalle de sus sesiones
     (IP, dispositivo) es de Super Admin y Auditor; Dirección ve solo internos. */
  const veTodo = esSuperAdmin || (operador?.rolesInternos.includes("auditor") ?? false);

  const [q, setQ] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [seleccion, setSeleccion] = useState<string | null>("u-c1");
  const [aviso, setAviso] = useState<Resultado | null>(null);
  const [dialogo, setDialogo] = useState<null | { tipo: "bloquear" | "desbloquear"; usuario: Usuario } | { tipo: "alta" }>(null);

  const lista = useMemo(() => {
    const t = q.trim().toLowerCase();
    return id.usuarios
      .filter((u) => veTodo || u.rolesInternos.length > 0)
      .filter((u) => !t || u.correo.includes(t) || (u.nombre ?? "").toLowerCase().includes(t))
      .filter((u) => {
        if (filtro === "internos") return u.rolesInternos.length > 0;
        if (filtro === "afiliados") return id.vinculos.some((v) => v.usuarioId === u.id);
        if (filtro === "bloqueados") return u.estado === "bloqueado";
        return true;
      })
      .sort((a, b) => (a.nombre ?? a.correo).localeCompare(b.nombre ?? b.correo, "es"));
  }, [id.usuarios, id.vinculos, q, filtro, veTodo]);

  const elegido = seleccion ? lista.find((u) => u.id === seleccion) ?? (veTodo ? id.porId(seleccion) : undefined) : undefined;
  const ejecutar = (r: Resultado) => {
    setAviso(r);
    if (r.ok) setDialogo(null);
    return r;
  };
  const eventos = id.auditoria.filter((e) => e.empresa === null).slice(0, 8);

  return (
    <div className="grid gap-6">
      <header className="grid gap-3 border-b border-line pb-6">
        <Eyebrow>Identidad y accesos</Eyebrow>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-display text-[clamp(26px,3.8vw,38px)] font-light leading-[1.1]">Usuarios y roles</h1>
          <div className="grid justify-items-end gap-1">
            <Boton onClick={() => { setAviso(null); setDialogo({ tipo: "alta" }); }} disabled={!esSuperAdmin}>
              <UserPlus size={16} aria-hidden /> Nuevo usuario interno
            </Boton>
            {!esSuperAdmin && <p className="text-[12.5px] text-muted">Requiere Super Admin</p>}
          </div>
        </div>
        <p className="max-w-[72ch] text-[14.5px] text-muted">
          Todas las cuentas del sistema en un lugar: equipo de Fedesoft y contactos de las empresas afiliadas. Los
          accesos de cada empresa los gestiona su gerente; aquí se ve el panorama y se actúa ante un incidente.
        </p>
      </header>

      {aviso && !dialogo && <Aviso ok={aviso.ok}>{aviso.mensaje}</Aviso>}

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_1.15fr]">
        {/* Lista */}
        <Card className="overflow-hidden">
          <div className="grid gap-3 border-b border-line p-4">
            <div className="relative">
              <Search size={16} aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <label htmlFor="buscar-usuario" className="sr-only">Buscar por nombre o correo</label>
              <input
                id="buscar-usuario"
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar por nombre o correo"
                className="w-full rounded-lg border border-line bg-surface py-2.5 pl-9 pr-3 text-[14.5px]"
              />
            </div>
            <div role="group" aria-label="Filtrar usuarios" className="flex flex-wrap gap-1.5">
              {FILTROS.filter((f) => veTodo || f.id === "todos" || f.id === "internos").map((f) => (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={filtro === f.id}
                  onClick={() => setFiltro(f.id)}
                  className={`rounded-full px-3 py-1.5 text-[13px] font-semibold transition ${
                    filtro === f.id ? "bg-[var(--navy-700)] text-white" : "border border-line text-muted hover:text-ink"
                  }`}
                >
                  {f.etiqueta}
                </button>
              ))}
            </div>
          </div>
          {lista.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="font-semibold">Ninguna cuenta coincide</p>
              <button type="button" onClick={() => { setQ(""); setFiltro("todos"); }} className="mt-2 text-[14px] font-semibold text-link hover:underline">
                Limpiar la búsqueda
              </button>
            </div>
          ) : (
            <ul className="max-h-[640px] divide-y divide-line overflow-y-auto">
              {lista.map((u) => {
                const empresas = id.vinculos.filter((v) => v.usuarioId === u.id);
                const activo = u.id === seleccion;
                return (
                  <li key={u.id}>
                    <button
                      type="button"
                      onClick={() => { setSeleccion(u.id); setAviso(null); }}
                      aria-current={activo ? "true" : undefined}
                      className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${activo ? "bg-[var(--info-bg)]" : "hover:bg-bg"}`}
                    >
                      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-[12px] font-bold ${u.rolesInternos.length > 0 ? "bg-[var(--navy-700)] text-white" : "bg-bg text-muted"}`} aria-hidden>
                        {iniciales(u.nombre, u.correo)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14.5px] font-semibold">{u.nombre ?? u.correo}</span>
                        <span className="block truncate text-[12.5px] text-muted">
                          {u.rolesInternos.length > 0
                            ? u.rolesInternos.map(nombreRolInterno).join(", ")
                            : empresas.map((v) => EMPRESAS_POR_NIT[v.empresa]).join(", ") || u.correo}
                        </span>
                      </span>
                      <EstadoUsuario u={u} />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        {/* Ficha */}
        {elegido ? (
          <Ficha
            key={elegido.id}
            u={elegido}
            esSuperAdmin={esSuperAdmin}
            veSesiones={veTodo}
            esYo={elegido.id === operador?.id}
            onResultado={ejecutar}
            onBloquear={() => { setAviso(null); setDialogo({ tipo: elegido.estado === "bloqueado" ? "desbloquear" : "bloquear", usuario: elegido }); }}
          />
        ) : (
          <Card className="px-6 py-14 text-center text-[14.5px] text-muted">Elige una cuenta para ver su detalle.</Card>
        )}
      </div>

      <Card className="p-5">
        <Eyebrow>Registro de auditoría de la consola</Eyebrow>
        {eventos.length > 0 ? (
          <ol className="mt-3 grid gap-3 text-[14px]">
            {eventos.map((e) => (
              <li key={e.id} className="flex gap-3">
                <History size={14} className="mt-1 shrink-0 text-accent" aria-hidden />
                <div>
                  <p className="font-semibold">{e.accion}</p>
                  <p className="text-[12.5px] text-muted">{e.actor} · <span className="num">{e.cuando}</span></p>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-3 text-[13.5px] text-muted">Las acciones sobre cuentas quedan aquí, con quién las hizo, cuándo y el motivo.</p>
        )}
      </Card>

      {dialogo && dialogo.tipo !== "alta" && (
        <DialogoBloqueo
          tipo={dialogo.tipo}
          usuario={dialogo.usuario}
          onCerrar={() => setDialogo(null)}
          onConfirmar={(motivo) =>
            ejecutar(dialogo.tipo === "bloquear" ? id.bloquear(dialogo.usuario.id, motivo) : id.desbloquear(dialogo.usuario.id, motivo))
          }
        />
      )}
      {dialogo?.tipo === "alta" && (
        <DialogoAlta onCerrar={() => setDialogo(null)} onCrear={(correo, rol) => ejecutar(id.altaInterna(correo, rol))} />
      )}
    </div>
  );
}

function EstadoUsuario({ u }: { u: Usuario }) {
  if (u.estado === "bloqueado") return <Chip tono="error">Bloqueado</Chip>;
  if (u.estado === "invitado") return <Chip tono="info">Sin primer ingreso</Chip>;
  return u.sesiones.length > 0 ? <Chip tono="exito">Sesión abierta</Chip> : <Chip tono="neutro">Activo</Chip>;
}

function Ficha({
  u, esSuperAdmin, veSesiones, esYo, onResultado, onBloquear,
}: {
  u: Usuario;
  esSuperAdmin: boolean;
  /** IP y lugar de cada sesión: solo Super Admin y Auditor. */
  veSesiones: boolean;
  esYo: boolean;
  onResultado: (r: Resultado) => Resultado;
  onBloquear: () => void;
}) {
  const id = useIdentidad();
  const empresas = id.vinculos.filter((v) => v.usuarioId === u.id);
  const disponibles = ROLES_INTERNOS.filter((r) => !u.rolesInternos.includes(r.id));
  const [nuevoRol, setNuevoRol] = useState<RolInterno | "">("");

  return (
    <Card className="overflow-hidden lg:sticky lg:top-[132px]" destacada>
      <div className="flex flex-wrap items-start gap-4 border-b border-line p-5">
        <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-full text-[14px] font-bold ${u.rolesInternos.length > 0 ? "bg-[var(--navy-700)] text-white" : "bg-bg text-muted"}`} aria-hidden>
          {iniciales(u.nombre, u.correo)}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-[20px] font-bold">
            {u.nombre ?? "Aún sin nombre"}
            {esYo && <span className="ml-2 text-[13px] font-semibold text-muted">(tú)</span>}
          </h2>
          <p className="truncate font-mono text-[13px] text-muted">{u.correo}</p>
          <p className="mt-1 text-[13px] text-muted">
            {u.ultimoAcceso ? <>Último ingreso <span className="num">{u.ultimoAcceso}</span></> : "Nunca ha entrado: se vinculará a su cuenta en el primer ingreso."}
          </p>
        </div>
        <EstadoUsuario u={u} />
      </div>

      <div className="grid gap-6 p-5">
        <section>
          <h3 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-muted">Empresas</h3>
          {empresas.length > 0 ? (
            <ul className="mt-2.5 grid gap-2">
              {empresas.map((v) => (
                <li key={v.empresa} className="flex flex-wrap items-center gap-2 rounded-lg border border-line px-3 py-2.5 text-[14px]">
                  <Building2 size={15} className="text-muted" aria-hidden />
                  <span className="mr-auto font-semibold">{EMPRESAS_POR_NIT[v.empresa] ?? v.empresa}</span>
                  <Chip tono="neutro">{nombreRolEmpresa(v.rol)}</Chip>
                  <Chip tono={v.estado === "activo" ? "exito" : v.estado === "invitado" ? "info" : "neutro"}>
                    {v.estado === "activo" ? "Activo" : v.estado === "invitado" ? "Invitado" : "Desactivado"}
                  </Chip>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-[13.5px] text-muted">No pertenece a ninguna empresa afiliada.</p>
          )}
          {empresas.length > 0 && (
            <p className="mt-2 text-[12.5px] text-muted">Los roles dentro de cada empresa los decide su gerente desde el portal.</p>
          )}
        </section>

        <section>
          <h3 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-muted">Roles internos</h3>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {u.rolesInternos.length === 0 && <p className="text-[13.5px] text-muted">Ninguno.</p>}
            {u.rolesInternos.map((r) => (
              <span key={r} className="inline-flex items-center gap-1 rounded-full bg-info-bg py-1 pl-3 pr-1 text-[13px] font-semibold text-info">
                {nombreRolInterno(r)}
                <button
                  type="button"
                  disabled={!esSuperAdmin}
                  onClick={() => onResultado(id.quitarRolInterno(u.id, r))}
                  className="rounded-full p-1 hover:bg-white/40 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label={`Quitar rol ${nombreRolInterno(r)}`}
                >
                  <X size={13} aria-hidden />
                </button>
              </span>
            ))}
          </div>
          {esSuperAdmin ? (
            disponibles.length > 0 && u.estado !== "bloqueado" && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <label htmlFor="nuevo-rol" className="sr-only">Rol interno a asignar</label>
                <select
                  id="nuevo-rol"
                  value={nuevoRol}
                  onChange={(e) => setNuevoRol(e.target.value as RolInterno | "")}
                  className="rounded-lg border border-line bg-surface px-3 py-2 text-[14px]"
                >
                  <option value="">Asignar rol interno…</option>
                  {disponibles.map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                </select>
                <Boton
                  tamano="sm"
                  variante="secundario"
                  disabled={!nuevoRol}
                  onClick={() => {
                    if (!nuevoRol) return;
                    if (onResultado(id.asignarRolInterno(u.id, nuevoRol)).ok) setNuevoRol("");
                  }}
                >
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
          {u.rolesInternos.includes("super-admin") && (
            <p className="mt-2 text-[12.5px] text-muted">
              Siempre debe haber al menos {MIN_SUPER_ADMINS} Super Admin activos, y ninguno puede quitarse su propio rol.
            </p>
          )}
        </section>

        <section>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-muted">Sesiones abiertas</h3>
            {u.sesiones.length > 0 && (
              <Boton tamano="sm" variante="secundario" disabled={!esSuperAdmin} onClick={() => onResultado(id.cerrarSesiones(u.id))}>
                <LogOut size={14} aria-hidden /> Cerrar todas
              </Boton>
            )}
          </div>
          {u.sesiones.length > 0 ? (
            <ul className="mt-2.5 grid gap-2">
              {u.sesiones.map((s) => (
                <li key={s.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg bg-surface-2 px-3 py-2.5 text-[13.5px]">
                  <Laptop size={15} className="text-muted" aria-hidden />
                  <span className="font-semibold">{s.dispositivo}</span>
                  <Chip tono={s.superficie === "consola" ? "info" : "neutro"}>{s.superficie === "consola" ? "Consola" : "Portal"}</Chip>
                  <span className="text-muted sm:ml-auto">
                    {veSesiones ? <>{s.lugar} · <span className="num font-mono">{s.ip}</span> · </> : null}
                    <span className="num">{s.ultimoUso}</span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-[13.5px] text-muted">Sin sesiones abiertas.</p>
          )}
        </section>

        <section className="flex flex-wrap items-center gap-3 border-t border-line pt-5">
          <Boton
            variante={u.estado === "bloqueado" ? "secundario" : "peligro"}
            onClick={onBloquear}
            disabled={esYo || !esSuperAdmin}
          >
            {u.estado === "bloqueado" ? <><Unlock size={15} aria-hidden /> Desbloquear cuenta</> : <><Ban size={15} aria-hidden /> Bloquear cuenta</>}
          </Boton>
          <p className="max-w-[44ch] text-[12.5px] text-muted">
            {!esSuperAdmin
              ? "Solo lectura: bloquear cuentas y cerrar sesiones le corresponde a un Super Admin."
              : esYo
              ? "No puedes bloquear tu propia cuenta."
              : u.estado === "bloqueado"
                ? "Vuelve a poder entrar; sus accesos en cada empresa se conservan."
                : "Pierde el acceso al portal y a la consola, y se cierran todas sus sesiones."}
          </p>
        </section>
      </div>
    </Card>
  );
}

function DialogoBloqueo({
  tipo, usuario, onCerrar, onConfirmar,
}: {
  tipo: "bloquear" | "desbloquear";
  usuario: Usuario;
  onCerrar: () => void;
  onConfirmar: (motivo: string) => Resultado;
}) {
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const bloquear = tipo === "bloquear";
  const enviar = (e: FormEvent) => {
    e.preventDefault();
    const r = onConfirmar(motivo);
    if (!r.ok) setError(r.mensaje);
  };
  return (
    <Dialogo
      abierto
      titulo={`${bloquear ? "Bloquear" : "Desbloquear"} a ${usuario.nombre ?? usuario.correo}`}
      descripcion={
        bloquear
          ? "La cuenta deja de entrar al portal y a la consola, y se cierran todas sus sesiones. El motivo queda en la auditoría."
          : "La cuenta podrá volver a entrar. El motivo queda en la auditoría."
      }
      onCerrar={onCerrar}
      pie={
        <>
          <Boton variante="secundario" onClick={onCerrar}>Cancelar</Boton>
          <Boton type="submit" form="form-bloqueo" variante={bloquear ? "peligro" : "primario"}>
            {bloquear ? <><Ban size={15} aria-hidden /> Bloquear</> : <><Unlock size={15} aria-hidden /> Desbloquear</>}
          </Boton>
        </>
      }
    >
      <form id="form-bloqueo" onSubmit={enviar} className="grid gap-2" noValidate>
        <label htmlFor="motivo" className="text-[13.5px] font-semibold">Motivo</label>
        <textarea
          id="motivo"
          rows={3}
          value={motivo}
          onChange={(e) => { setMotivo(e.target.value); setError(null); }}
          placeholder={bloquear ? "Ej.: acceso sospechoso reportado por la empresa" : "Ej.: verificada la identidad con la empresa"}
          className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-[14.5px]"
        />
        {error && <Aviso ok={false}>{error}</Aviso>}
      </form>
    </Dialogo>
  );
}

function DialogoAlta({ onCerrar, onCrear }: { onCerrar: () => void; onCrear: (correo: string, rol: RolInterno) => Resultado }) {
  const [correo, setCorreo] = useState("");
  const [rol, setRol] = useState<RolInterno>("operaciones");
  const [error, setError] = useState<string | null>(null);
  const enviar = (e: FormEvent) => {
    e.preventDefault();
    const r = onCrear(correo, rol);
    if (!r.ok) setError(r.mensaje);
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
          <Boton type="submit" form="form-alta"><ShieldCheck size={15} aria-hidden /> Crear cuenta</Boton>
        </>
      }
    >
      <form id="form-alta" onSubmit={enviar} className="grid gap-4" noValidate>
        <div className="grid gap-1.5">
          <label htmlFor="correo-alta" className="text-[13.5px] font-semibold">Correo institucional</label>
          <input
            id="correo-alta"
            type="email"
            value={correo}
            onChange={(e) => { setCorreo(e.target.value); setError(null); }}
            placeholder="nombre@fedesoft.org"
            className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-[14.5px]"
          />
        </div>
        <fieldset className="grid gap-2">
          <legend className="mb-1 text-[13.5px] font-semibold">Rol interno</legend>
          {ROLES_INTERNOS.map((r) => (
            <label key={r.id} className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 ${rol === r.id ? "border-accent bg-[var(--info-bg)]" : "border-line hover:border-accent"}`}>
              <input type="radio" name="rol-interno" checked={rol === r.id} onChange={() => setRol(r.id)} className="mt-1 accent-[var(--navy-700)]" />
              <span>
                <span className="block text-[14px] font-semibold">{r.nombre}</span>
                <span className="block text-[12.5px] text-muted">{r.resumen}</span>
              </span>
            </label>
          ))}
        </fieldset>
        {error && <Aviso ok={false}>{error}</Aviso>}
      </form>
    </Dialogo>
  );
}
