"use client";

import Link from "next/link";
import { MarcaAcceso } from "@/components/acceso/MarcaAcceso";
import { ArrowRight, KeyRound, ShieldCheck } from "lucide-react";
import { urlLogin } from "@/lib/api/cliente";
import { useSesionApi } from "@/lib/api/sesion";

/**
 * Acceso con el API real: el portal no pide ni ve la contraseña. El botón
 * lleva al API, que redirige al proveedor de identidad (Keycloak en local) y,
 * al volver, fija la cookie de sesión y devuelve al portal.
 */
export function EntrarApi() {
  const { actual } = useSesionApi("portal");
  const conSesion = actual.estado === "lista";

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_1.1fr]">
      <MarcaAcceso pie="Modo API · identidad real, resto de datos simulados" />

      <main className="flex items-center bg-surface px-6 py-14 sm:px-12">
        <div className="mx-auto w-full max-w-[460px]">
          <h2 className="font-display text-[30px] font-light leading-tight">Ingresa al portal</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-muted">
            Con tu Cuenta Fedesoft. Te llevaremos al proveedor de identidad y volverás aquí con tu sesión.
          </p>

          {conSesion ? (
            <Link
              href="/portal"
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-[var(--navy-700)] px-5 py-3 text-[15px] font-semibold text-white hover:brightness-115"
            >
              Continuar como {actual.vista.user.name ?? actual.vista.user.email} <ArrowRight size={16} aria-hidden />
            </Link>
          ) : (
            <a
              href={urlLogin("portal", "/portal")}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-[var(--navy-700)] px-5 py-3 text-[15px] font-semibold text-white hover:brightness-115"
            >
              <KeyRound size={16} aria-hidden /> Ingresar con Cuenta Fedesoft
            </a>
          )}

          <div className="mt-8 grid gap-3 border-t border-line pt-6 text-[13.5px] text-muted">
            <p className="flex items-start gap-2">
              <ShieldCheck size={15} className="mt-0.5 shrink-0 text-accent" aria-hidden />
              La contraseña y el segundo factor los valida el proveedor de identidad. El portal nunca los ve: solo
              recibe quién eres, y el servidor decide qué puedes hacer.
            </p>
            <p className="flex items-start gap-2">
              <KeyRound size={15} className="mt-0.5 shrink-0 text-muted" aria-hidden />
              <span>
                ¿Olvidaste tu contraseña? Recupérala desde la pantalla del proveedor. ¿Eres del equipo de Fedesoft?{" "}
                <Link href="/admin/entrar" className="font-semibold text-link hover:underline">Entra a la consola</Link>
              </span>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
