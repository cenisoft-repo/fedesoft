"use client";

import { SinPermiso } from "./ui/SinPermiso";
import { moduloConsola, rolesConSeccion, MODULOS_CONSOLA, type ModuloConsola, type SeccionPortal } from "@/lib/acceso";
import { useRolPortal } from "@/lib/useAcceso";
import { nombreRolEmpresa, nombreRolInterno, ROLES_INTERNOS } from "@/lib/mock/usuarios";

const NOMBRE_SECCION: Record<SeccionPortal, string> = {
  inicio: "el inicio",
  empresa: "los datos de la empresa",
  contactos: "contactos y accesos",
  afiliacion: "la afiliación",
  facturacion: "facturación",
  formacion: "formación",
  comunidades: "comunidades",
  verticales: "verticales",
  directorio: "el directorio",
  visibilidad: "visibilidad",
  oportunidades: "oportunidades",
  "cuenta-estrategica": "la cuenta estratégica",
};

export function SinPermisoPortal({ seccion }: { seccion: SeccionPortal }) {
  const rol = useRolPortal();
  return (
    <SinPermiso
      titulo="Esta sección no es de tu perfil"
      detalle={`Tu perfil de ${nombreRolEmpresa(rol).toLowerCase()} no tiene acceso a ${NOMBRE_SECCION[seccion]}. Si lo necesitas, pídeselo al gerente registrado de tu empresa: él administra los accesos.`}
      quienes={rolesConSeccion(seccion).map(nombreRolEmpresa)}
      volverHref="/portal"
      volverTexto="Volver al inicio"
    />
  );
}

export function SinPermisoConsola({ modulo }: { modulo: ModuloConsola }) {
  const def = moduloConsola(modulo);
  const quienes = ROLES_INTERNOS.filter((r) => def.acceso[r.id] !== null).map((r) => nombreRolInterno(r.id));
  /* Vuelve al primer módulo que todos alcanzan: Afiliados. */
  const inicio = MODULOS_CONSOLA[0];
  return (
    <SinPermiso
      titulo={`${def.nombre ?? def.etiqueta} no está en tu rol`}
      detalle={`${def.resumen} Tu rol interno no incluye este módulo. Si tu trabajo lo requiere, un Super Admin puede asignarte el rol que corresponde; el cambio queda en auditoría.`}
      quienes={quienes}
      volverHref={inicio.href}
      volverTexto={`Ir a ${inicio.etiqueta}`}
    />
  );
}
