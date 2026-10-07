"use client";

/**
 * Identidad y accesos de la demostración.
 *
 * Todo vive en memoria y se pierde al recargar: el prototipo no guarda nada.
 * Las reglas son las del API real (ADR-008 del repo rector), para que lo que
 * se muestra en la presentación sea lo que el sistema hará:
 *  - nadie se desactiva ni cambia su propio rol, y la empresa conserva al
 *    menos un gerente activo;
 *  - una invitación vence y la persona la acepta de forma explícita;
 *  - cambiar privilegios o desactivar cierra las sesiones del afectado;
 *  - siempre hay al menos dos Super Admin, y nadie se asigna roles a sí mismo;
 *  - la consola exige segundo factor.
 */

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { HOY } from "./format";
import { useDemo } from "./demo";
import { nivelConsola } from "./acceso";
import {
  USUARIOS_INICIALES,
  VINCULOS_INICIALES,
  nombreRolEmpresa,
  nombreRolInterno,
  type RolEmpresa,
  type RolInterno,
  type Sesion,
  type Usuario,
  type Vinculo,
} from "./mock/usuarios";

export type Resultado = { ok: true; mensaje: string } | { ok: false; mensaje: string };

export interface EventoAuditoria {
  id: number;
  cuando: string;
  actor: string;
  accion: string;
  /** NIT si el evento pertenece a una empresa; nulo si es de la consola. */
  empresa: string | null;
}

/** Vigencia de una invitación. En el sistema real es el parámetro `identidad.invitacion`. */
export const DIAS_INVITACION = 3;
/** Siempre hay al menos este número de Super Admin activos (RA-ACC-008). */
export const MIN_SUPER_ADMINS = 2;

const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function ahora(): string {
  const d = new Date();
  return `${HOY} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function sumarDias(iso: string, dias: number): string {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + dias);
  return d.toISOString().slice(0, 10);
}

/** El proveedor de identidad entrega el nombre en el primer ingreso; aquí se simula con el correo. */
function nombreDelProveedor(correo: string): string {
  return (correo.split("@")[0] ?? correo)
    .split(/[._-]+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

export const iniciales = (nombre: string | null, correo: string) =>
  (nombre ?? correo)
    .split(/[\s.@]+/)
    .filter(Boolean)
    .map((p) => p[0]?.toUpperCase())
    .slice(0, 2)
    .join("");

interface IdentidadState {
  usuarios: Usuario[];
  vinculos: Vinculo[];
  auditoria: EventoAuditoria[];
  porCorreo: (correo: string) => Usuario | undefined;
  porId: (id: string) => Usuario | undefined;

  /* Sesiones de esta demostración */
  sesionPortal: string | null;
  sesionConsola: string | null;
  iniciarPortal: (usuarioId: string) => void;
  iniciarConsola: (usuarioId: string) => void;
  cerrarPortal: () => void;
  cerrarConsola: () => void;
  /** Adónde volver tras entrar a la consola (la ruta que pidió sin sesión). */
  destinoConsola: string;
  recordarDestinoConsola: (ruta: string) => void;

  /* Invitaciones propias */
  aceptarInvitacion: (usuarioId: string, empresa: string) => Resultado;
  rechazarInvitacion: (usuarioId: string, empresa: string) => Resultado;

  /* Gerente: accesos de su empresa (la empresa sale de la sesión) */
  invitar: (correo: string, rol: RolEmpresa) => Resultado;
  reenviarInvitacion: (usuarioId: string) => Resultado;
  retirarInvitacion: (usuarioId: string) => Resultado;
  desactivar: (usuarioId: string) => Resultado;
  reactivar: (usuarioId: string) => Resultado;
  cambiarRol: (usuarioId: string, rol: RolEmpresa) => Resultado;

  /* Consola */
  bloquear: (usuarioId: string, motivo: string) => Resultado;
  desbloquear: (usuarioId: string, motivo: string) => Resultado;
  cerrarSesiones: (usuarioId: string) => Resultado;
  asignarRolInterno: (usuarioId: string, rol: RolInterno) => Resultado;
  quitarRolInterno: (usuarioId: string, rol: RolInterno) => Resultado;
  altaInterna: (correo: string, rol: RolInterno) => Resultado;
}

const Ctx = createContext<IdentidadState | null>(null);

export function IdentidadProvider({ children }: { children: ReactNode }) {
  const { escenario } = useDemo();
  const [usuarios, setUsuarios] = useState<Usuario[]>(USUARIOS_INICIALES);
  const [vinculos, setVinculos] = useState<Vinculo[]>(VINCULOS_INICIALES);
  const [auditoria, setAuditoria] = useState<EventoAuditoria[]>([]);
  const [sesionPortal, setSesionPortal] = useState<string | null>(null);
  const [sesionConsola, setSesionConsola] = useState<string | null>(null);
  const [destinoConsola, setDestinoConsola] = useState("/admin");

  const porId = useCallback((id: string) => usuarios.find((u) => u.id === id), [usuarios]);
  const porCorreo = useCallback(
    (correo: string) => usuarios.find((u) => u.correo === correo.trim().toLowerCase()),
    [usuarios],
  );
  const nombreDe = useCallback((id: string) => {
    const u = usuarios.find((x) => x.id === id);
    return u?.nombre ?? u?.correo ?? "Usuario";
  }, [usuarios]);

  const registrar = useCallback((actor: string, accion: string, empresa: string | null) => {
    setAuditoria((prev) => [{ id: Date.now() + prev.length, cuando: ahora(), actor, accion, empresa }, ...prev]);
  }, []);

  /** Cierra sesiones de un usuario, todas o de una superficie. Devuelve cuántas. */
  const cerrar = useCallback((usuarioId: string, superficie?: Sesion["superficie"]) => {
    const u = usuarios.find((x) => x.id === usuarioId);
    const n = (u?.sesiones ?? []).filter((s) => !superficie || s.superficie === superficie).length;
    setUsuarios((prev) =>
      prev.map((x) =>
        x.id === usuarioId
          ? { ...x, sesiones: x.sesiones.filter((s) => superficie !== undefined && s.superficie !== superficie) }
          : x,
      ),
    );
    return n;
  }, [usuarios]);

  const sesionesTexto = (n: number) =>
    n === 0 ? "No tenía sesiones abiertas." : n === 1 ? "Se cerró su sesión abierta." : `Se cerraron sus ${n} sesiones abiertas.`;

  const valor = useMemo<IdentidadState>(() => {
    /* Actor del portal: la persona del escenario, en la empresa del escenario. */
    const actorPortalId = `u-${escenario.contactoId}`;
    const empresa = escenario.empresa.nit;
    const actorPortal = escenario.empresa.contactos.find((c) => c.id === escenario.contactoId)?.nombre ?? "Gerente";
    const esGerente = escenario.rol === "gerente";

    /* Actor de la consola: quien inició sesión con segundo factor. */
    const operador = sesionConsola ? usuarios.find((u) => u.id === sesionConsola) : undefined;
    const esSuperAdmin = operador?.rolesInternos.includes("super-admin") ?? false;
    /* Bloquear y cerrar sesiones es gestionar usuarios: Dirección y Auditoría solo consultan. */
    const gestionaUsuarios = operador ? nivelConsola(operador.rolesInternos, "usuarios") === "gestiona" : false;
    const soloConsulta: Resultado = { ok: false, mensaje: "Tu rol consulta usuarios; bloquear o cerrar sesiones le corresponde a un Super Admin." };

    const vinculoDe = (usuarioId: string, nit = empresa) =>
      vinculos.find((v) => v.usuarioId === usuarioId && v.empresa === nit);
    const actualizarVinculo = (usuarioId: string, cambio: Partial<Vinculo>) =>
      setVinculos((prev) => prev.map((v) => (v.usuarioId === usuarioId && v.empresa === empresa ? { ...v, ...cambio } : v)));

    const noGerente: Resultado = { ok: false, mensaje: "Solo el rol de gerencia administra los accesos de la empresa." };

    /** ¿Queda otro gerente activo si `usuarioId` deja de serlo? */
    const quedaOtroGerente = (usuarioId: string) =>
      vinculos.some((v) => v.empresa === empresa && v.usuarioId !== usuarioId && v.estado === "activo" && v.rol === "gerente");

    /** Super Admin que pueden operar: activos y que ya entraron alguna vez. */
    const superAdminsSin = (usuarioId: string) =>
      usuarios.filter(
        (u) => u.id !== usuarioId && u.estado === "activo" && u.ultimoAcceso !== null && u.rolesInternos.includes("super-admin"),
      ).length;

    const soloSuperAdmin: Resultado = {
      ok: false,
      mensaje: "Asignar roles internos requiere el permiso role:assign, que solo tiene Super Admin.",
    };

    return {
      usuarios,
      vinculos,
      auditoria,
      porCorreo,
      porId,
      sesionPortal,
      sesionConsola,

      iniciarPortal: (usuarioId) => {
        setSesionPortal(usuarioId);
        setUsuarios((prev) =>
          prev.map((u) =>
            u.id === usuarioId
              ? {
                  ...u,
                  nombre: u.nombre ?? nombreDelProveedor(u.correo),
                  estado: "activo",
                  ultimoAcceso: ahora(),
                  sesiones: [
                    { id: `s-${Date.now()}`, superficie: "portal", dispositivo: "Este navegador", lugar: "Demostración", ip: "—", ultimoUso: ahora() },
                    ...u.sesiones.filter((s) => s.dispositivo !== "Este navegador" || s.superficie !== "portal"),
                  ],
                }
              : u,
          ),
        );
      },
      iniciarConsola: (usuarioId) => {
        setSesionConsola(usuarioId);
        setUsuarios((prev) =>
          prev.map((u) =>
            u.id === usuarioId
              ? {
                  ...u,
                  nombre: u.nombre ?? nombreDelProveedor(u.correo),
                  estado: "activo",
                  ultimoAcceso: ahora(),
                  sesiones: [
                    { id: `s-${Date.now()}`, superficie: "consola", dispositivo: "Este navegador", lugar: "Demostración", ip: "—", ultimoUso: ahora() },
                    ...u.sesiones.filter((s) => s.dispositivo !== "Este navegador" || s.superficie !== "consola"),
                  ],
                }
              : u,
          ),
        );
        const u = usuarios.find((x) => x.id === usuarioId);
        registrar(u?.nombre ?? "Operador", "Inició sesión en la consola con segundo factor", null);
      },
      cerrarPortal: () => setSesionPortal(null),
      cerrarConsola: () => setSesionConsola(null),
      destinoConsola,
      /* Solo rutas de la consola: nunca un destino arbitrario. */
      recordarDestinoConsola: (ruta) => setDestinoConsola(ruta.startsWith("/admin") && !ruta.startsWith("/admin/entrar") ? ruta : "/admin"),

      aceptarInvitacion: (usuarioId, nit) => {
        const v = vinculoDe(usuarioId, nit);
        if (!v || v.estado !== "invitado" || (v.invitacionVence ?? HOY) < HOY) {
          return { ok: false, mensaje: "Esta invitación ya no está vigente. Pide al gerente que la reenvíe." };
        }
        setVinculos((prev) =>
          prev.map((x) => (x === v ? { ...x, estado: "activo", invitacionVence: undefined } : x)),
        );
        registrar(nombreDe(usuarioId), "Aceptó la invitación a la empresa", nit);
        return { ok: true, mensaje: "Invitación aceptada." };
      },
      rechazarInvitacion: (usuarioId, nit) => {
        setVinculos((prev) => prev.filter((x) => !(x.usuarioId === usuarioId && x.empresa === nit && x.estado === "invitado")));
        registrar(nombreDe(usuarioId), "Rechazó la invitación a la empresa", nit);
        return { ok: true, mensaje: "Invitación rechazada." };
      },

      invitar: (correoCrudo, rol) => {
        if (!esGerente) return noGerente;
        const correo = correoCrudo.trim().toLowerCase();
        if (!CORREO.test(correo)) return { ok: false, mensaje: "Escribe un correo válido." };
        const existente = usuarios.find((u) => u.correo === correo);
        const v = existente ? vinculoDe(existente.id) : undefined;
        if (v?.estado === "activo") return { ok: false, mensaje: "Esa persona ya tiene acceso activo a la empresa." };
        if (v?.estado === "desactivado") {
          return { ok: false, mensaje: "Esa persona tiene el acceso desactivado. Reactívalo en lugar de invitarla." };
        }
        const vence = sumarDias(HOY, DIAS_INVITACION);
        const id = existente?.id ?? `u-${Date.now()}`;
        if (!existente) {
          setUsuarios((prev) => [...prev, { id, nombre: null, correo, estado: "invitado", rolesInternos: [], ultimoAcceso: null, sesiones: [] }]);
        }
        const contactoId = escenario.empresa.contactos.find((c) => c.correo === correo)?.id;
        setVinculos((prev) => [
          ...prev.filter((x) => !(x.usuarioId === id && x.empresa === empresa)),
          { usuarioId: id, empresa, rol, estado: "invitado", invitacionVence: vence, invitadoPor: actorPortal, contactoId },
        ]);
        registrar(actorPortal, `${v ? "Reenvió" : "Envió"} invitación a ${correo} como ${nombreRolEmpresa(rol)}`, empresa);
        return { ok: true, mensaje: `Invitación enviada a ${correo}. Vence en ${DIAS_INVITACION} días.` };
      },
      reenviarInvitacion: (usuarioId) => {
        if (!esGerente) return noGerente;
        const v = vinculoDe(usuarioId);
        if (v?.estado !== "invitado") return { ok: false, mensaje: "Solo se reenvía una invitación pendiente." };
        actualizarVinculo(usuarioId, { invitacionVence: sumarDias(HOY, DIAS_INVITACION) });
        registrar(actorPortal, `Reenvió la invitación a ${nombreDe(usuarioId)}`, empresa);
        return { ok: true, mensaje: `Invitación reenviada. Vence en ${DIAS_INVITACION} días.` };
      },
      retirarInvitacion: (usuarioId) => {
        if (!esGerente) return noGerente;
        if (vinculoDe(usuarioId)?.estado !== "invitado") return { ok: false, mensaje: "No hay invitación pendiente." };
        /* Se borra: si quedara desactivada, "reactivar" daría acceso a quien nunca aceptó. */
        setVinculos((prev) => prev.filter((x) => !(x.usuarioId === usuarioId && x.empresa === empresa)));
        registrar(actorPortal, `Retiró la invitación a ${nombreDe(usuarioId)}`, empresa);
        return { ok: true, mensaje: "Invitación retirada." };
      },
      desactivar: (usuarioId) => {
        if (!esGerente) return noGerente;
        if (usuarioId === actorPortalId) return { ok: false, mensaje: "No puedes desactivar tu propio acceso." };
        const v = vinculoDe(usuarioId);
        if (!v || v.estado !== "activo") return { ok: false, mensaje: "Ese acceso no está activo." };
        if (v.rol === "gerente" && !quedaOtroGerente(usuarioId)) {
          return { ok: false, mensaje: "La empresa debe conservar al menos un gerente activo." };
        }
        actualizarVinculo(usuarioId, { estado: "desactivado" });
        const n = cerrar(usuarioId, "portal");
        registrar(actorPortal, `Desactivó el acceso de ${nombreDe(usuarioId)}`, empresa);
        return { ok: true, mensaje: `Acceso desactivado. ${sesionesTexto(n)}` };
      },
      reactivar: (usuarioId) => {
        if (!esGerente) return noGerente;
        if (vinculoDe(usuarioId)?.estado !== "desactivado") return { ok: false, mensaje: "Solo se reactiva un acceso desactivado." };
        actualizarVinculo(usuarioId, { estado: "activo" });
        registrar(actorPortal, `Reactivó el acceso de ${nombreDe(usuarioId)}`, empresa);
        return { ok: true, mensaje: "Acceso reactivado." };
      },
      cambiarRol: (usuarioId, rol) => {
        if (!esGerente) return noGerente;
        if (usuarioId === actorPortalId) return { ok: false, mensaje: "No puedes cambiar tu propio rol." };
        const v = vinculoDe(usuarioId);
        if (!v) return { ok: false, mensaje: "Usuario no encontrado en tu empresa." };
        if (v.rol === rol) return { ok: true, mensaje: "Sin cambios." };
        if (v.estado === "activo" && v.rol === "gerente" && !quedaOtroGerente(usuarioId)) {
          return { ok: false, mensaje: "La empresa debe conservar al menos un gerente activo." };
        }
        actualizarVinculo(usuarioId, { rol });
        const n = v.estado === "activo" ? cerrar(usuarioId, "portal") : 0;
        registrar(actorPortal, `Cambió el rol de ${nombreDe(usuarioId)}: ${nombreRolEmpresa(v.rol)} → ${nombreRolEmpresa(rol)}`, empresa);
        return { ok: true, mensaje: `Rol actualizado a ${nombreRolEmpresa(rol)}. ${sesionesTexto(n)}` };
      },

      bloquear: (usuarioId, motivo) => {
        if (!operador) return { ok: false, mensaje: "Sin sesión de consola." };
        if (!gestionaUsuarios) return soloConsulta;
        if (motivo.trim().length < 5) return { ok: false, mensaje: "Escribe el motivo (al menos 5 caracteres)." };
        if (usuarioId === operador.id) return { ok: false, mensaje: "No puedes bloquear tu propia cuenta." };
        const u = usuarios.find((x) => x.id === usuarioId);
        if (!u || u.estado === "bloqueado") return { ok: false, mensaje: "La cuenta ya está bloqueada." };
        if (u.rolesInternos.includes("super-admin") && superAdminsSin(usuarioId) < MIN_SUPER_ADMINS) {
          return { ok: false, mensaje: `Deben quedar al menos ${MIN_SUPER_ADMINS} Super Admin activos.` };
        }
        const n = u.sesiones.length;
        setUsuarios((prev) => prev.map((x) => (x.id === usuarioId ? { ...x, estado: "bloqueado", sesiones: [] } : x)));
        registrar(operador.nombre ?? operador.correo, `Bloqueó la cuenta de ${nombreDe(usuarioId)} · motivo: ${motivo.trim()}`, null);
        return { ok: true, mensaje: `Cuenta bloqueada en todo el sistema. ${sesionesTexto(n)}` };
      },
      desbloquear: (usuarioId, motivo) => {
        if (!operador) return { ok: false, mensaje: "Sin sesión de consola." };
        if (!gestionaUsuarios) return soloConsulta;
        if (motivo.trim().length < 5) return { ok: false, mensaje: "Escribe el motivo (al menos 5 caracteres)." };
        const u = usuarios.find((x) => x.id === usuarioId);
        if (u?.estado !== "bloqueado") return { ok: false, mensaje: "La cuenta no está bloqueada." };
        /* Quien nunca entró vuelve a "invitado", no a "activo". */
        setUsuarios((prev) =>
          prev.map((x) => (x.id === usuarioId ? { ...x, estado: x.ultimoAcceso ? "activo" : "invitado" } : x)),
        );
        registrar(operador.nombre ?? operador.correo, `Desbloqueó la cuenta de ${nombreDe(usuarioId)} · motivo: ${motivo.trim()}`, null);
        return { ok: true, mensaje: "Cuenta desbloqueada." };
      },
      cerrarSesiones: (usuarioId) => {
        if (!operador) return { ok: false, mensaje: "Sin sesión de consola." };
        if (!gestionaUsuarios) return soloConsulta;
        const n = cerrar(usuarioId);
        registrar(operador.nombre ?? operador.correo, `Cerró todas las sesiones de ${nombreDe(usuarioId)}`, null);
        if (usuarioId === sesionConsola) setSesionConsola(null);
        return { ok: true, mensaje: sesionesTexto(n) };
      },
      asignarRolInterno: (usuarioId, rol) => {
        if (!operador) return { ok: false, mensaje: "Sin sesión de consola." };
        if (!esSuperAdmin) return soloSuperAdmin;
        if (usuarioId === operador.id) return { ok: false, mensaje: "Nadie se asigna roles a sí mismo." };
        const u = usuarios.find((x) => x.id === usuarioId);
        if (!u) return { ok: false, mensaje: "Usuario no encontrado." };
        if (u.estado === "bloqueado") return { ok: false, mensaje: "Desbloquea la cuenta antes de asignarle un rol." };
        if (u.rolesInternos.includes(rol)) return { ok: false, mensaje: "Ya tiene ese rol." };
        const n = u.sesiones.filter((s) => s.superficie === "consola").length;
        setUsuarios((prev) =>
          prev.map((x) =>
            x.id === usuarioId
              ? { ...x, rolesInternos: [...x.rolesInternos, rol], sesiones: x.sesiones.filter((s) => s.superficie !== "consola") }
              : x,
          ),
        );
        registrar(operador.nombre ?? operador.correo, `Asignó el rol ${nombreRolInterno(rol)} a ${nombreDe(usuarioId)}`, null);
        return { ok: true, mensaje: `Rol ${nombreRolInterno(rol)} asignado. ${n > 0 ? "Sus sesiones de consola se cerraron." : ""}`.trim() };
      },
      quitarRolInterno: (usuarioId, rol) => {
        if (!operador) return { ok: false, mensaje: "Sin sesión de consola." };
        if (!esSuperAdmin) return soloSuperAdmin;
        if (rol === "super-admin") {
          if (usuarioId === operador.id) return { ok: false, mensaje: "Un Super Admin no puede quitarse su propio rol." };
          if (superAdminsSin(usuarioId) < MIN_SUPER_ADMINS) {
            return { ok: false, mensaje: `Deben quedar al menos ${MIN_SUPER_ADMINS} Super Admin activos.` };
          }
        }
        setUsuarios((prev) =>
          prev.map((x) =>
            x.id === usuarioId
              ? { ...x, rolesInternos: x.rolesInternos.filter((r) => r !== rol), sesiones: x.sesiones.filter((s) => s.superficie !== "consola") }
              : x,
          ),
        );
        registrar(operador.nombre ?? operador.correo, `Quitó el rol ${nombreRolInterno(rol)} a ${nombreDe(usuarioId)}`, null);
        return { ok: true, mensaje: `Rol ${nombreRolInterno(rol)} retirado. Sus sesiones de consola se cerraron.` };
      },
      altaInterna: (correoCrudo, rol) => {
        if (!operador) return { ok: false, mensaje: "Sin sesión de consola." };
        if (!esSuperAdmin) return soloSuperAdmin;
        const correo = correoCrudo.trim().toLowerCase();
        if (!CORREO.test(correo)) return { ok: false, mensaje: "Escribe un correo válido." };
        if (usuarios.some((u) => u.correo === correo)) {
          return { ok: false, mensaje: "Ya existe una cuenta con ese correo: asígnale el rol desde su ficha." };
        }
        setUsuarios((prev) => [
          ...prev,
          { id: `u-${Date.now()}`, nombre: null, correo, estado: "invitado", rolesInternos: [rol], ultimoAcceso: null, sesiones: [] },
        ]);
        registrar(operador.nombre ?? operador.correo, `Dio de alta a ${correo} como ${nombreRolInterno(rol)}`, null);
        return { ok: true, mensaje: `Cuenta creada. Entrará con su correo y deberá configurar el segundo factor.` };
      },
    };
  }, [usuarios, vinculos, auditoria, sesionPortal, sesionConsola, destinoConsola, escenario, porCorreo, porId, nombreDe, registrar, cerrar]);

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export function useIdentidad(): IdentidadState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useIdentidad debe usarse dentro de IdentidadProvider");
  return ctx;
}
