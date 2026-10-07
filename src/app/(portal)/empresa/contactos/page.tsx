"use client";

import Link from "next/link";
import { useNivelPortal } from "@/lib/useAcceso";
import { SinPermisoPortal } from "@/components/SinPermisoRol";
import { useMemo, useState, type FormEvent } from "react";
import { ArrowLeft, History, Mail, RotateCcw, Send, ShieldCheck, UserMinus, UserPlus, UserRoundCog } from "lucide-react";
import { useDemo } from "@/lib/demo";
import { DIAS_INVITACION, iniciales, useIdentidad, type Resultado } from "@/lib/identidad";
import { ROLES_EMPRESA, nombreRolEmpresa, type RolEmpresa } from "@/lib/mock/usuarios";
import { fecha, HOY } from "@/lib/format";
import { Boton, Card, Chip, Eyebrow, PageHeader } from "@/components/ui/primitivos";
import { Aviso, Dialogo } from "@/components/ui/Dialogo";
import { MODO_API } from "@/lib/api/cliente";
import { ContactosApi } from "./ContactosApi";

/**
 * Contactos y accesos (P-07, RF-IDE-006, RF-AFI-005).
 *
 * El gerente administra quién de su empresa entra al portal y con qué rol.
 * La empresa sale de la sesión: aquí no hay forma de tocar otra. Las reglas
 * son las del servidor y se explican cuando impiden algo.
 */

interface Fila {
  usuarioId: string | null;
  nombre: string | null;
  correo: string;
  cargo?: string;
  rol: RolEmpresa | null;
  estado: "activo" | "invitado" | "vencida" | "desactivado" | "sin-acceso";
  vence?: string;
  ultimoAcceso?: string | null;
}

type Accion =
  | { tipo: "invitar"; correo?: string }
  | { tipo: "rol"; fila: Fila }
  | { tipo: "desactivar"; fila: Fila };

export default function Contactos() {
  return MODO_API ? <ContactosApi /> : <ContactosSimulado />;
}

function ContactosSimulado() {
  const { escenario } = useDemo();
  const nivel = useNivelPortal("contactos");
  const id = useIdentidad();
  const [accion, setAccion] = useState<Accion | null>(null);
  const [aviso, setAviso] = useState<Resultado | null>(null);

  const empresa = escenario.empresa;
  const yo = `u-${escenario.contactoId}`;

  const filas = useMemo<Fila[]>(() => {
    const conVinculo: Fila[] = id.vinculos
      .filter((v) => v.empresa === empresa.nit)
      .map((v) => {
        const u = id.porId(v.usuarioId);
        const contacto = empresa.contactos.find((c) => c.correo === u?.correo);
        const vencida = v.estado === "invitado" && (v.invitacionVence ?? HOY) < HOY;
        return {
          usuarioId: v.usuarioId,
          nombre: contacto?.nombre ?? u?.nombre ?? null,
          correo: u?.correo ?? "",
          cargo: contacto?.cargo,
          rol: v.rol,
          estado: vencida ? "vencida" : v.estado,
          vence: v.invitacionVence,
          ultimoAcceso: u?.ultimoAcceso,
        };
      });
    const correos = new Set(conVinculo.map((f) => f.correo));
    /* Un contacto puede existir sin usuario: está en la ficha pero no entra al portal. */
    const sinAcceso: Fila[] = empresa.contactos
      .filter((c) => !correos.has(c.correo))
      .map((c) => ({ usuarioId: null, nombre: c.nombre, correo: c.correo, cargo: c.cargo, rol: null, estado: "sin-acceso" }));
    const orden = { activo: 0, invitado: 1, vencida: 2, "sin-acceso": 3, desactivado: 4 };
    return [...conVinculo, ...sinAcceso].sort((a, b) => orden[a.estado] - orden[b.estado]);
  }, [id, empresa]);

  if (nivel !== "gestiona") return <SinPermisoPortal seccion="contactos" />;

  const ejecutar = (r: Resultado) => {
    setAviso(r);
    if (r.ok) setAccion(null);
    return r;
  };

  const cuenta = (e: Fila["estado"]) => filas.filter((f) => f.estado === e).length;
  const eventos = id.auditoria.filter((e) => e.empresa === empresa.nit).slice(0, 6);

  return (
    <div className="grid gap-7">
      <Link href="/empresa" className="inline-flex w-fit items-center gap-1.5 text-[13.5px] font-semibold text-muted hover:text-ink">
        <ArrowLeft size={14} aria-hidden /> Mi empresa
      </Link>

      <PageHeader
        eyebrow="Mi empresa"
        titulo="Contactos y accesos"
        lede={`Decide quién de ${empresa.razonSocial} entra al portal y qué ve. Los cambios rigen de inmediato: quitar un acceso o cambiar un rol cierra las sesiones abiertas de esa persona.`}
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
            <Chip tono="exito"><span className="num">{cuenta("activo")}</span> con acceso</Chip>
            {cuenta("invitado") + cuenta("vencida") > 0 && (
              <Chip tono="info"><span className="num">{cuenta("invitado") + cuenta("vencida")}</span> por aceptar</Chip>
            )}
            {cuenta("desactivado") > 0 && <Chip tono="neutro"><span className="num">{cuenta("desactivado")}</span> desactivados</Chip>}
          </div>
          <ul className="divide-y divide-line">
            {filas.map((f) => (
              <li key={f.correo} className="flex flex-wrap items-start gap-3 px-5 py-4">
                <div
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-[12px] font-bold ${
                    f.estado === "activo" ? "bg-[var(--navy-700)] text-white" : "bg-bg text-muted"
                  }`}
                  aria-hidden
                >
                  {iniciales(f.nombre, f.correo)}
                </div>
                <div className="min-w-[200px] flex-1">
                  <p className="font-semibold">
                    {f.nombre ?? <span className="text-muted">Pendiente de aceptar</span>}
                    {f.usuarioId === yo && <span className="ml-2 text-[12.5px] font-semibold text-muted">(tú)</span>}
                  </p>
                  <p className="flex items-center gap-1.5 text-[13px] text-muted">
                    <Mail size={12} aria-hidden /> <span className="truncate">{f.correo}</span>
                  </p>
                  <p className="mt-0.5 text-[12.5px] text-muted">{detalle(f)}</p>
                </div>
                {/* Estado arriba y acciones abajo, siempre alineados a la derecha:
                    la lista se lee igual sin importar el largo de cada nombre. */}
                <div className="flex w-full flex-col items-start gap-2 sm:w-auto sm:items-end">
                  <div className="flex flex-wrap items-center gap-2">
                    {f.rol && <Chip tono={f.rol === "gerente" ? "info" : f.rol === "talento" ? "exito" : "neutro"}>{nombreRolEmpresa(f.rol)}</Chip>}
                    <EstadoChip f={f} />
                  </div>
                  {f.usuarioId !== yo && (
                    <div className="flex flex-wrap gap-1.5">
                      <Acciones
                        f={f}
                        onRol={() => { setAviso(null); setAccion({ tipo: "rol", fila: f }); }}
                        onDesactivar={() => { setAviso(null); setAccion({ tipo: "desactivar", fila: f }); }}
                        onInvitar={() => { setAviso(null); setAccion({ tipo: "invitar", correo: f.correo }); }}
                        onDirecta={(r) => ejecutar(r)}
                      />
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <aside className="grid h-fit gap-5">
          <Card className="p-5">
            <Eyebrow>Qué ve cada rol</Eyebrow>
            <dl className="mt-3 grid gap-3.5">
              {ROLES_EMPRESA.map((r) => (
                <div key={r.id}>
                  <dt className="text-[14.5px] font-semibold">{r.nombre}</dt>
                  <dd className="text-[13.5px] leading-relaxed text-muted">{r.resumen}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 flex items-start gap-2 border-t border-line pt-3.5 text-[13px] text-muted">
              <ShieldCheck size={14} className="mt-0.5 shrink-0 text-accent" aria-hidden />
              Los permisos los aplica el servidor en cada acción. Ocultar un botón no es lo que protege tus datos.
            </p>
          </Card>

          <Card className="p-5">
            <Eyebrow>Cambios recientes</Eyebrow>
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
              <p className="mt-3 text-[13.5px] leading-relaxed text-muted">
                Cada invitación, cambio de rol o desactivación queda registrada con quién la hizo y cuándo. Prueba
                invitar a alguien y aparecerá aquí.
              </p>
            )}
          </Card>
        </aside>
      </div>

      <DialogoInvitar
        abierto={accion?.tipo === "invitar"}
        correoInicial={accion?.tipo === "invitar" ? accion.correo : undefined}
        onCerrar={() => setAccion(null)}
        onInvitar={(correo, rol) => ejecutar(id.invitar(correo, rol))}
      />

      {accion?.tipo === "rol" && (
        <DialogoRol
          fila={accion.fila}
          onCerrar={() => setAccion(null)}
          onCambiar={(rol) => ejecutar(id.cambiarRol(accion.fila.usuarioId ?? "", rol))}
        />
      )}

      {accion?.tipo === "desactivar" && (
        <DialogoDesactivar
          fila={accion.fila}
          onCerrar={() => setAccion(null)}
          onConfirmar={() => ejecutar(id.desactivar(accion.fila.usuarioId ?? ""))}
        />
      )}
    </div>
  );
}

function detalle(f: Fila): string {
  switch (f.estado) {
    case "activo":
      return [f.cargo, f.ultimoAcceso ? `último ingreso ${fecha(f.ultimoAcceso.slice(0, 10))}` : "aún no ha entrado"].filter(Boolean).join(" · ");
    case "invitado":
      return `Invitación enviada · vence el ${fecha(f.vence ?? HOY)}`;
    case "vencida":
      return `La invitación venció el ${fecha(f.vence ?? HOY)}: reenvíala para que pueda entrar`;
    case "desactivado":
      return [f.cargo, "sin acceso al portal desde que se desactivó"].filter(Boolean).join(" · ");
    case "sin-acceso":
      return [f.cargo, "está en la ficha de la empresa, pero no entra al portal"].filter(Boolean).join(" · ");
  }
}

function EstadoChip({ f }: { f: Fila }) {
  switch (f.estado) {
    case "activo":
      return <Chip tono="exito">Activo</Chip>;
    case "invitado":
      return <Chip tono="info">Invitado</Chip>;
    case "vencida":
      return <Chip tono="aviso">Invitación vencida</Chip>;
    case "desactivado":
      return <Chip tono="neutro">Desactivado</Chip>;
    case "sin-acceso":
      return <Chip tono="neutro">Sin acceso</Chip>;
  }
}

function Acciones({
  f, onRol, onDesactivar, onInvitar, onDirecta,
}: {
  f: Fila;
  onRol: () => void;
  onDesactivar: () => void;
  onInvitar: () => void;
  onDirecta: (r: Resultado) => void;
}) {
  const id = useIdentidad();
  const uid = f.usuarioId ?? "";
  const quien = f.nombre ?? f.correo;
  switch (f.estado) {
    case "activo":
      return (
        <>
          <Boton variante="secundario" tamano="sm" onClick={onRol} aria-label={`Cambiar rol de ${quien}`}>
            <UserRoundCog size={14} aria-hidden /> Rol
          </Boton>
          <Boton variante="secundario" tamano="sm" onClick={onDesactivar} aria-label={`Desactivar acceso de ${quien}`}>
            <UserMinus size={14} aria-hidden /> Desactivar
          </Boton>
        </>
      );
    case "invitado":
    case "vencida":
      return (
        <>
          <Boton variante="secundario" tamano="sm" onClick={() => onDirecta(id.reenviarInvitacion(uid))} aria-label={`Reenviar invitación a ${quien}`}>
            <Send size={14} aria-hidden /> Reenviar
          </Boton>
          <Boton variante="fantasma" tamano="sm" onClick={() => onDirecta(id.retirarInvitacion(uid))} aria-label={`Retirar invitación a ${quien}`}>
            Retirar
          </Boton>
        </>
      );
    case "desactivado":
      return (
        <Boton variante="secundario" tamano="sm" onClick={() => onDirecta(id.reactivar(uid))} aria-label={`Reactivar acceso de ${quien}`}>
          <RotateCcw size={14} aria-hidden /> Reactivar
        </Boton>
      );
    case "sin-acceso":
      return (
        <Boton variante="secundario" tamano="sm" onClick={onInvitar} aria-label={`Dar acceso a ${quien}`}>
          <UserPlus size={14} aria-hidden /> Dar acceso
        </Boton>
      );
  }
}

function SelectorRol({ valor, onCambio, nombre }: { valor: RolEmpresa; onCambio: (r: RolEmpresa) => void; nombre: string }) {
  return (
    <fieldset className="grid gap-2">
      <legend className="mb-1 text-[13.5px] font-semibold">Rol</legend>
      {ROLES_EMPRESA.map((r) => (
        <label
          key={r.id}
          className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 transition ${
            valor === r.id ? "border-accent bg-[var(--info-bg)]" : "border-line hover:border-accent"
          }`}
        >
          <input
            type="radio"
            name={nombre}
            value={r.id}
            checked={valor === r.id}
            onChange={() => onCambio(r.id)}
            className="mt-1 accent-[var(--navy-700)]"
          />
          <span>
            <span className="block text-[14px] font-semibold">{r.nombre}</span>
            <span className="block text-[12.5px] leading-relaxed text-muted">{r.resumen}</span>
          </span>
        </label>
      ))}
    </fieldset>
  );
}

function DialogoInvitar({
  abierto, correoInicial, onCerrar, onInvitar,
}: {
  abierto: boolean;
  correoInicial?: string;
  onCerrar: () => void;
  onInvitar: (correo: string, rol: RolEmpresa) => Resultado;
}) {
  return abierto ? <FormularioInvitar key={correoInicial ?? "nuevo"} correoInicial={correoInicial} onCerrar={onCerrar} onInvitar={onInvitar} /> : null;
}

function FormularioInvitar({
  correoInicial, onCerrar, onInvitar,
}: {
  correoInicial?: string;
  onCerrar: () => void;
  onInvitar: (correo: string, rol: RolEmpresa) => Resultado;
}) {
  const [correo, setCorreo] = useState(correoInicial ?? "");
  const [rol, setRol] = useState<RolEmpresa>("contacto");
  const [error, setError] = useState<string | null>(null);

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    const r = onInvitar(correo, rol);
    if (!r.ok) setError(r.mensaje);
  };

  return (
    <Dialogo
      abierto
      titulo="Invitar a una persona"
      descripcion={`Le llegará un correo para entrar. La invitación vence en ${DIAS_INVITACION} días y la persona decide si la acepta.`}
      onCerrar={onCerrar}
      pie={
        <>
          <Boton variante="secundario" onClick={onCerrar}>Cancelar</Boton>
          <Boton type="submit" form="form-invitar"><Send size={15} aria-hidden /> Enviar invitación</Boton>
        </>
      }
    >
      <form id="form-invitar" onSubmit={enviar} className="grid gap-4" noValidate>
        <div className="grid gap-1.5">
          <label htmlFor="correo-invitado" className="text-[13.5px] font-semibold">Correo corporativo</label>
          <input
            id="correo-invitado"
            type="email"
            value={correo}
            onChange={(e) => { setCorreo(e.target.value); setError(null); }}
            aria-invalid={error ? true : undefined}
            aria-describedby="correo-invitado-nota"
            placeholder="nombre@empresa.co"
            className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-[14.5px]"
          />
          <p id="correo-invitado-nota" className="text-[12.5px] text-muted">
            No pedimos el nombre: lo trae la cuenta de la persona cuando entra.
          </p>
        </div>
        <SelectorRol valor={rol} onCambio={setRol} nombre="rol-invitacion" />
        {error && <Aviso ok={false}>{error}</Aviso>}
      </form>
    </Dialogo>
  );
}

function DialogoRol({ fila, onCerrar, onCambiar }: { fila: Fila; onCerrar: () => void; onCambiar: (rol: RolEmpresa) => Resultado }) {
  const [rol, setRol] = useState<RolEmpresa>(fila.rol ?? "contacto");
  const [error, setError] = useState<string | null>(null);
  return (
    <Dialogo
      abierto
      titulo={`Rol de ${fila.nombre ?? fila.correo}`}
      descripcion="Al cambiarlo, sus sesiones abiertas se cierran y entra de nuevo con los permisos nuevos."
      onCerrar={onCerrar}
      pie={
        <>
          <Boton variante="secundario" onClick={onCerrar}>Cancelar</Boton>
          <Boton
            disabled={rol === fila.rol}
            onClick={() => {
              const r = onCambiar(rol);
              if (!r.ok) setError(r.mensaje);
            }}
          >
            Guardar rol
          </Boton>
        </>
      }
    >
      <div className="grid gap-4">
        <SelectorRol valor={rol} onCambio={(r) => { setRol(r); setError(null); }} nombre="rol-cambio" />
        {error && <Aviso ok={false}>{error}</Aviso>}
      </div>
    </Dialogo>
  );
}

function DialogoDesactivar({ fila, onCerrar, onConfirmar }: { fila: Fila; onCerrar: () => void; onConfirmar: () => Resultado }) {
  const [error, setError] = useState<string | null>(null);
  return (
    <Dialogo
      abierto
      titulo={`¿Desactivar el acceso de ${fila.nombre ?? fila.correo}?`}
      descripcion="Pierde el acceso al portal de inmediato y sus sesiones abiertas se cierran. Sigue en la ficha de la empresa y puedes reactivarlo cuando quieras."
      onCerrar={onCerrar}
      pie={
        <>
          <Boton variante="secundario" onClick={onCerrar}>Cancelar</Boton>
          <Boton
            variante="peligro"
            onClick={() => {
              const r = onConfirmar();
              if (!r.ok) setError(r.mensaje);
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
