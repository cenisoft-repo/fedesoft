"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Building2, Inbox, Moon, Receipt, Sun } from "lucide-react";
import { Firma, Logo } from "./Logo";
import { useTema } from "@/lib/demo";
import { Chip } from "./ui/primitivos";
import { SOLICITUDES } from "@/lib/mock/admin";

/**
 * La consola es otra superficie, no otra pestaña del portal: banda oscura,
 * navegación propia y la identidad de quien opera —no la del afiliado—.
 * Corresponde a la separación de ADR-005 (apps/web vs. apps/admin).
 */

const NAV = [
  { href: "/admin", etiqueta: "Afiliados", icono: Building2, exacto: true },
  { href: "/admin/solicitudes", etiqueta: "Solicitudes", icono: Inbox },
  { href: "/admin/cartera", etiqueta: "Cartera", icono: Receipt },
];

/** Operadora de la consola. En la plataforma real viene de la sesión interna. */
const OPERADORA = { nombre: "Lorena Mejía", rol: "Operaciones", iniciales: "LM" };

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { tema, alternar } = useTema();
  const pathname = usePathname();

  const pendientes = SOLICITUDES.filter((s) => s.estado === "nueva" || s.estado === "en-revision").length;

  return (
    <div className="min-h-dvh bg-bg">
      <header className="sticky top-0 z-30">
        <div className="bg-navy text-white">
          <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
            <Link href="/admin" className="shrink-0 rounded">
              <Logo tema="oscuro" compacto />
            </Link>
            <span aria-hidden className="hidden h-5 w-px bg-white/25 sm:block" />
            <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-azure-200">
              Consola interna
            </p>

            <div className="ml-auto flex items-center gap-2">
              <Link
                href="/portal"
                title="Volver al portal del afiliado"
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[13px] font-semibold text-azure-200 transition hover:bg-white/10 hover:text-white sm:px-3"
              >
                <ArrowLeft size={14} aria-hidden />
                <span className="hidden sm:inline">Portal del afiliado</span>
                <span className="sr-only sm:hidden">Volver al portal del afiliado</span>
              </Link>
              <button
                type="button"
                onClick={alternar}
                className="rounded-lg p-2 text-azure-200 transition hover:bg-white/10 hover:text-white"
                aria-label={tema === "oscuro" ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
              >
                {tema === "oscuro" ? <Sun size={18} aria-hidden /> : <Moon size={18} aria-hidden />}
              </button>
              <div className="flex items-center gap-2.5 border-l border-white/20 pl-3">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-azure text-[12px] font-bold text-white">
                  {OPERADORA.iniciales}
                </div>
                <div className="hidden leading-tight md:block">
                  <p className="text-[13.5px] font-semibold">{OPERADORA.nombre}</p>
                  <p className="text-[12px] text-azure-200">{OPERADORA.rol}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <nav aria-label="Secciones de la consola" className="border-b border-line bg-surface/90 backdrop-blur">
          <div className="mx-auto flex max-w-[1200px] gap-1 overflow-x-auto px-2 sm:px-4">
            {NAV.map((e) => {
              const activo = e.exacto ? pathname === e.href : pathname?.startsWith(e.href);
              const Icono = e.icono;
              return (
                <Link
                  key={e.href}
                  href={e.href}
                  aria-current={activo ? "page" : undefined}
                  className={`relative flex shrink-0 items-center gap-2 px-3 py-3 text-[14px] font-semibold transition ${
                    activo ? "text-ink" : "text-muted hover:text-ink"
                  }`}
                >
                  <Icono size={16} aria-hidden />
                  {e.etiqueta}
                  {e.href === "/admin/solicitudes" && pendientes > 0 && (
                    <span className="num rounded-full bg-info-bg px-1.5 py-0.5 text-[11.5px] font-bold text-info">
                      {pendientes}
                    </span>
                  )}
                  {activo && (
                    <span aria-hidden className="absolute inset-x-2 bottom-0 h-[3px] rounded-t-full bg-accent" />
                  )}
                </Link>
              );
            })}
            <span className="ml-auto hidden items-center py-3 pr-2 sm:flex">
              <Chip tono="neutro">Rol: Operaciones · permisos limitados</Chip>
            </span>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-[1200px] px-4 pb-24 pt-8 sm:px-6">{children}</main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-x-5 gap-y-3 px-4 py-7 text-[13px] text-muted sm:px-6">
          <Firma alto={22} />
          <span aria-hidden className="hidden h-4 w-px bg-line sm:block" />
          <span>Consola interna · toda acción queda en el registro de auditoría</span>
          <span className="sm:ml-auto">Prototipo de demostración · datos simulados</span>
        </div>
      </footer>
    </div>
  );
}
