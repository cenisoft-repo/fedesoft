"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Ban, KeyRound, RotateCcw, ShieldAlert, UserX } from "lucide-react";
import { urlLogin, MODO_API } from "@/lib/api/cliente";
import { SelectorVista } from "@/components/acceso/SelectorVista";

/**
 * Adónde redirige el API cuando rechaza un login (ADR-008). El motivo solo
 * elige uno de estos textos: nada de la URL se pinta tal cual en la página.
 */
const MOTIVOS: Record<string, { titulo: string; texto: string; icono: typeof UserX; consola?: boolean }> = {
  "flujo-invalido": { titulo: "El ingreso se interrumpió", texto: "Pasó demasiado tiempo o el enlace ya se usó. Vuelve a intentarlo desde el principio.", icono: RotateCcw },
  cancelado: { titulo: "Cancelaste el ingreso", texto: "No pasa nada: puedes volver a intentarlo cuando quieras.", icono: RotateCcw },
  proveedor: { titulo: "No pudimos verificar tu identidad", texto: "El proveedor de identidad no respondió como esperábamos. Inténtalo de nuevo en unos minutos.", icono: ShieldAlert },
  "correo-no-verificado": { titulo: "Tu correo no está verificado", texto: "Confirma tu correo desde el mensaje que te envió el proveedor de identidad y vuelve a intentarlo.", icono: ShieldAlert },
  "identidad-en-conflicto": { titulo: "Esta cuenta ya está vinculada a otra identidad", texto: "Tu correo corresponde a un usuario vinculado a otra cuenta del proveedor. Escribe a soporte@fedesoft.org para revisarlo.", icono: ShieldAlert },
  "sin-acceso": { titulo: "Tu cuenta no tiene acceso al portal", texto: "Al portal se entra por invitación: pídele al gerente registrado de tu empresa que te invite desde Contactos y accesos.", icono: UserX },
  "sin-empresa": { titulo: "No tienes acceso activo a ninguna empresa", texto: "Tu acceso fue desactivado o tu invitación venció. Pídele al gerente de tu empresa que lo reactive o te reenvíe la invitación.", icono: UserX },
  "cuenta-bloqueada": { titulo: "Tu cuenta está bloqueada", texto: "Fedesoft bloqueó esta cuenta. Si crees que es un error, escribe a soporte@fedesoft.org.", icono: Ban },
  "sin-rol-interno": { titulo: "Tu cuenta no tiene rol interno", texto: "La consola es solo para el equipo de Fedesoft. Si eres afiliado, entra por el portal.", icono: UserX, consola: true },
  "mfa-requerida": { titulo: "La consola exige segundo factor", texto: "Configura tu app autenticadora en el proveedor de identidad y vuelve a entrar con el código.", icono: KeyRound, consola: true },
};

export default function ErrorAcceso() {
  return (
    <Suspense fallback={null}>
      <Contenido />
    </Suspense>
  );
}

function Contenido() {
  const motivo = useSearchParams().get("motivo") ?? "";
  const info = MOTIVOS[motivo] ?? MOTIVOS.proveedor;
  const Icono = info.icono;
  const reintentar = MODO_API
    ? urlLogin(info.consola ? "consola" : "portal", info.consola ? "/admin/usuarios" : "/portal")
    : info.consola ? "/admin/entrar" : "/entrar";

  return (
    <main className="relative grid min-h-dvh place-items-center bg-surface px-6 py-14">
      <SelectorVista />
      <div className="w-full max-w-[460px]">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-bg text-muted">
          <Icono size={20} aria-hidden />
        </span>
        <h1 className="mt-4 font-display text-[28px] font-light leading-tight">{info.titulo}</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">{info.texto}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          <a
            href={reintentar}
            className="inline-flex items-center rounded-full bg-[var(--navy-700)] px-5 py-2.5 text-[15px] font-semibold text-white hover:brightness-115"
          >
            Volver a intentar
          </a>
          <Link
            href={info.consola ? "/entrar" : "/"}
            className="inline-flex items-center rounded-full border border-line px-5 py-2.5 text-[15px] font-semibold transition hover:border-accent"
          >
            {info.consola ? "Ir al portal" : "Ir al inicio"}
          </Link>
        </div>
      </div>
    </main>
  );
}
