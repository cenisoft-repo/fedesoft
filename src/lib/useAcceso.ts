"use client";

import { useDemo } from "./demo";
import { useIdentidad } from "./identidad";
import { MODO_API } from "./api/cliente";
import { tienePermiso, useSesionApi } from "./api/sesion";
import { moduloConsola, nivelConsola, nivelPortal, type ModuloConsola, type Nivel, type SeccionPortal } from "./acceso";
import type { RolEmpresa, RolInterno } from "./mock/usuarios";

const ROLES_EMPRESA: readonly RolEmpresa[] = ["gerente", "talento", "contacto"];

/** Rol de la persona en la empresa activa: el de la sesión real o el del escenario. */
export function useRolPortal(): RolEmpresa {
  const { escenario } = useDemo();
  const { actual } = useSesionApi("portal");
  if (MODO_API) {
    /* Mientras la sesión real carga (o no hay), el menú no promete lo que el servidor negaría. */
    if (actual.estado !== "lista") return "contacto";
    const clave = actual.vista.activeOrganization?.role.key;
    return ROLES_EMPRESA.find((r) => r === clave) ?? "contacto";
  }
  return escenario.rol;
}

export function useNivelPortal(seccion: SeccionPortal): Nivel | null {
  return nivelPortal(useRolPortal(), seccion);
}

export interface AccesoConsola {
  nivel: Nivel | null;
  /** Roles del operador simulado; en modo API el servidor no los expone así. */
  roles: RolInterno[];
  operadorId: string | null;
}

/**
 * Nivel de quien opera en un módulo de la consola. Simulado: por sus roles
 * internos. Modo API: por los permisos que devuelve la sesión real.
 */
export function useAccesoConsola(modulo: ModuloConsola): AccesoConsola {
  const { sesionConsola, porId } = useIdentidad();
  const { actual } = useSesionApi("consola");

  if (MODO_API) {
    if (actual.estado !== "lista") return { nivel: null, roles: [], operadorId: null };
    const permisos = actual.vista.permissions;
    const def = moduloConsola(modulo);
    const nivel = tienePermiso(permisos, def.permisoEscritura)
      ? "gestiona"
      : tienePermiso(permisos, def.permisoLectura)
        ? "consulta"
        : null;
    return { nivel, roles: [], operadorId: actual.vista.user.id };
  }

  const operador = sesionConsola ? porId(sesionConsola) : undefined;
  const roles = operador?.rolesInternos ?? [];
  return { nivel: nivelConsola(roles, modulo), roles, operadorId: operador?.id ?? null };
}
