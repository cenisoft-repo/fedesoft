"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { api, ErrorApi, fijarCsrf, MODO_API, type Superficie } from "./cliente";

/* ── Lo que devuelve GET /auth/session (ver SessionService.view en el API) ── */

export interface RolRef {
  key: string;
  name: string;
}

export interface EmpresaSesion {
  id: string;
  legalName: string;
  tradeName: string | null;
  segment: "MIPYME" | "GRANDE";
  role: RolRef;
}

export interface InvitacionPendiente {
  id: string;
  legalName: string;
  tradeName: string | null;
  role: RolRef;
  expiresAt: string | null;
}

export interface VistaSesion {
  user: { id: string; email: string; name: string | null };
  channel: "PORTAL" | "CONSOLA";
  mfa: boolean;
  expiresAt: string;
  activeOrganization: EmpresaSesion | null;
  organizations: EmpresaSesion[];
  pendingInvitations: InvitacionPendiente[];
  internalRoles?: RolRef[];
  permissions: string[];
  csrfToken: string | null;
}

export type EstadoSesion =
  | { estado: "cargando" }
  | { estado: "anonimo" }
  | { estado: "error"; mensaje: string }
  | { estado: "lista"; vista: VistaSesion };

interface SesionApiState {
  sesion: (s: Superficie) => EstadoSesion;
  cargar: (s: Superficie) => Promise<void>;
  /** Carga solo si nadie la pidió aún: encabezado y página comparten una petición. */
  asegurar: (s: Superficie) => void;
  elegirEmpresa: (organizationId: string) => Promise<void>;
  responderInvitacion: (organizationId: string, acepta: boolean) => Promise<void>;
  /** Cierra la sesión en el API y devuelve adónde ir (cierre en el proveedor, si lo hay). */
  salir: (s: Superficie) => Promise<string | null>;
}

const Ctx = createContext<SesionApiState | null>(null);

/**
 * Sesión real del API, una por superficie (portal y consola tienen cookies y
 * sesiones distintas). Sin modo API, este proveedor no hace nada.
 */
export function SesionApiProvider({ children }: { children: ReactNode }) {
  const [estados, setEstados] = useState<Record<Superficie, EstadoSesion>>({
    portal: { estado: "cargando" },
    consola: { estado: "cargando" },
  });
  const pedidas = useRef<Record<Superficie, boolean>>({ portal: false, consola: false });

  const cargar = useCallback(async (s: Superficie) => {
    pedidas.current[s] = true;
    try {
      const vista = await api<VistaSesion>(s, "/auth/session");
      fijarCsrf(s, vista.csrfToken);
      setEstados((prev) => ({ ...prev, [s]: { estado: "lista", vista } }));
    } catch (e) {
      fijarCsrf(s, null);
      const anonimo = e instanceof ErrorApi && e.status === 401;
      setEstados((prev) => ({
        ...prev,
        [s]: anonimo ? { estado: "anonimo" } : { estado: "error", mensaje: (e as Error).message },
      }));
    }
  }, []);

  const valor = useMemo<SesionApiState>(
    () => ({
      sesion: (s) => estados[s],
      cargar,
      asegurar: (s) => {
        if (!pedidas.current[s]) void cargar(s);
      },
      elegirEmpresa: async (organizationId) => {
        await api("portal", "/auth/session/organization", { method: "POST", body: { organizationId } });
        await cargar("portal");
      },
      responderInvitacion: async (organizationId, acepta) => {
        await api("portal", `/auth/invitations/${encodeURIComponent(organizationId)}/${acepta ? "accept" : "decline"}`, {
          method: "POST",
        });
        await cargar("portal");
      },
      salir: async (s) => {
        let destino: string | null = null;
        try {
          const r = await api<{ logoutUrl: string | null }>(s, "/auth/logout", { method: "POST" });
          destino = r.logoutUrl;
        } finally {
          /* El estado no cambia aquí: quien llama navega fuera de la página
             (al proveedor o a /entrar). Marcar "anónimo" antes provocaba un
             salto intermedio a /entrar justo antes de esa navegación. */
          fijarCsrf(s, null);
          pedidas.current[s] = false;
        }
        return destino;
      },
    }),
    [estados, cargar],
  );

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

/** Sesión de una superficie; la pide al API la primera vez que se usa. */
export function useSesionApi(s: Superficie) {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSesionApi debe usarse dentro de SesionApiProvider");
  const { asegurar } = ctx;
  useEffect(() => {
    if (MODO_API) asegurar(s);
  }, [asegurar, s]);
  return { ...ctx, actual: ctx.sesion(s) };
}

/** ¿Tiene el permiso? Misma regla de comodines que el servidor, solo para pintar la interfaz. */
export function tienePermiso(permisos: readonly string[], requerido: string): boolean {
  if (permisos.includes(requerido)) return true;
  const sensibles = new Set(["role:assign", "user:impersonate", "billing:refund", "billing:write-off", "billing:manual-payment", "certificate:revoke", "parameter:approve", "organization:delete"]);
  if (sensibles.has(requerido)) return false;
  if (permisos.includes("*")) return true;
  const [dominio, accion] = requerido.split(":");
  return permisos.includes(`${dominio}:*`) || permisos.includes(`*:${accion}`);
}
