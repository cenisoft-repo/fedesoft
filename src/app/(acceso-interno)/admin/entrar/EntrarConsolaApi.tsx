"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, KeyRound, ShieldCheck, Smartphone } from "lucide-react";
import { urlLogin } from "@/lib/api/cliente";
import { Logo } from "@/components/Logo";

/**
 * Acceso a la consola con el API real. El segundo factor lo pide el proveedor
 * de identidad y el API lo exige: sin él, la sesión de consola no se crea
 * (también lo impide la base de datos).
 */
export function EntrarConsolaApi() {
  const [destino, setDestino] = useState("/admin/usuarios");

  useEffect(() => {
    /* Solo se vuelve a una ruta de la consola: nunca a un destino arbitrario. */
    const pedido = new URLSearchParams(window.location.search).get("destino");
    if (pedido && /^\/admin(\/[\w-]+)*\/?$/.test(pedido) && !pedido.startsWith("/admin/entrar")) setDestino(pedido);
  }, []);

  return (
    <div className="grid min-h-dvh grid-rows-[auto_1fr] bg-bg">
      <header className="bg-navy text-white">
        <div className="mx-auto flex max-w-[1200px] items-center gap-4 px-4 py-3 sm:px-6">
          <Logo tema="oscuro" compacto />
          <span aria-hidden className="hidden h-5 w-px bg-white/25 sm:block" />
          <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-azure-200">Consola interna</p>
          <Link
            href="/portal"
            className="ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-semibold text-azure-200 transition hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft size={14} aria-hidden /> Portal del afiliado
          </Link>
        </div>
      </header>
      <main className="grid place-items-center px-4 py-12">
        <div className="w-full max-w-[440px] overflow-hidden rounded-2xl border border-line bg-surface shadow-[var(--shadow-pop)]">
          <div className="border-t-[3px] border-t-accent px-6 pb-6 pt-7">
            <h1 className="font-display text-[26px] font-light leading-tight">Entra a la consola</h1>
            <p className="mt-2 text-[14.5px] leading-relaxed text-muted">
              Solo para el equipo de Fedesoft. Te pediremos tu contraseña y el código de tu app autenticadora.
            </p>
            <a
              href={urlLogin("consola", destino)}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[var(--navy-700)] px-5 py-3 text-[15px] font-semibold text-white hover:brightness-115"
            >
              <KeyRound size={16} aria-hidden /> Entrar con Cuenta Fedesoft
            </a>
            <p className="mt-5 flex items-start gap-2 text-[13px] text-muted">
              <Smartphone size={15} className="mt-0.5 shrink-0 text-accent" aria-hidden />
              El segundo factor es obligatorio y debe ser reciente: si tu última verificación tiene más de 15 minutos,
              te lo pediremos de nuevo.
            </p>
          </div>
          <p className="flex items-start gap-2 border-t border-line bg-surface-2 px-6 py-3.5 text-[12.5px] text-muted">
            <ShieldCheck size={14} className="mt-0.5 shrink-0 text-accent" aria-hidden />
            Sesión corta: 8 horas como máximo y cierre a los 30 minutos sin actividad. Todo lo que hagas queda en el
            registro de auditoría.
          </p>
        </div>
      </main>
    </div>
  );
}
