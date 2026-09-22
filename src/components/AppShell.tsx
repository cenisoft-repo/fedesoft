"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell, Briefcase, Building2, GraduationCap, LayoutGrid, Moon, Network, Receipt, Sparkles,
  Search, ShieldCheck, Star, Sun, Users, UsersRound,
} from "lucide-react";
import { Firma, Logo } from "./Logo";
import { DemoSwitcher } from "./DemoSwitcher";
import { useDemo, useTema } from "@/lib/demo";
import { Chip } from "./ui/primitivos";

interface Entrada {
  href: string;
  etiqueta: string;
  icono: typeof LayoutGrid;
  /** Si falta, la entrada es visible para todos los roles. */
  soloGerente?: boolean;
  soloGrande?: boolean;
}

const NAV: Entrada[] = [
  { href: "/", etiqueta: "Inicio", icono: LayoutGrid },
  { href: "/empresa", etiqueta: "Mi empresa", icono: Building2 },
  { href: "/facturacion", etiqueta: "Facturación", icono: Receipt, soloGerente: true },
  { href: "/formacion", etiqueta: "Formación", icono: GraduationCap },
  { href: "/comunidades", etiqueta: "Comunidades", icono: UsersRound },
  { href: "/verticales", etiqueta: "Verticales", icono: Network },
  { href: "/directorio", etiqueta: "Directorio", icono: Search },
  { href: "/visibilidad", etiqueta: "Visibilidad", icono: Sparkles },
  { href: "/oportunidades", etiqueta: "Oportunidades", icono: Briefcase, soloGerente: true },
  { href: "/cuenta-estrategica", etiqueta: "Cuenta estratégica", icono: Star, soloGrande: true },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { escenario } = useDemo();
  const { tema, alternar } = useTema();
  const pathname = usePathname();
  const esAdmin = pathname?.startsWith("/admin");

  const contacto = escenario.empresa.contactos.find((c) => c.id === escenario.contactoId);

  const visibles = NAV.filter((e) => {
    if (e.soloGerente && escenario.rol !== "gerente") return false;
    if (e.soloGrande && escenario.empresa.segmento !== "grande") return false;
    return true;
  });

  const estadoChip = {
    "al-dia": { tono: "exito" as const, texto: "Al día" },
    pendiente: { tono: "aviso" as const, texto: "Pendiente" },
    vencida: { tono: "error" as const, texto: "Vencida" },
  }[escenario.empresa.estado];

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1200px] items-center gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="shrink-0 rounded">
            <Logo />
          </Link>

          <div className="ml-auto flex items-center gap-2">
            {!esAdmin && (
              <div className="hidden items-center gap-2 sm:flex">
                <Chip tono={estadoChip.tono}>
                  <ShieldCheck size={13} aria-hidden /> {estadoChip.texto}
                </Chip>
              </div>
            )}
            <button
              type="button"
              className="rounded-lg p-2 text-muted transition hover:bg-bg hover:text-ink"
              aria-label="Notificaciones"
            >
              <Bell size={18} aria-hidden />
            </button>
            <button
              type="button"
              onClick={alternar}
              className="rounded-lg p-2 text-muted transition hover:bg-bg hover:text-ink"
              aria-label={tema === "oscuro" ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
            >
              {tema === "oscuro" ? <Sun size={18} aria-hidden /> : <Moon size={18} aria-hidden />}
            </button>
            <div className="hidden items-center gap-2.5 border-l border-line pl-3 md:flex">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-[var(--navy-700)] text-[12px] font-bold text-white">
                {contacto?.nombre.split(" ").map((p) => p[0]).slice(0, 2).join("")}
              </div>
              <div className="leading-tight">
                <p className="text-[13.5px] font-semibold">{contacto?.nombre}</p>
                <p className="text-[12px] text-muted">{escenario.empresa.razonSocial}</p>
              </div>
            </div>
          </div>
        </div>

        {!esAdmin && (
          <nav aria-label="Secciones del portal" className="border-t border-line">
            <div className="mx-auto flex max-w-[1200px] gap-1 overflow-x-auto px-2 sm:px-4">
              {visibles.map((e) => {
                const activo = e.href === "/" ? pathname === "/" : pathname?.startsWith(e.href);
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
                    {activo && (
                      <span aria-hidden className="absolute inset-x-2 bottom-0 h-[3px] rounded-t-full bg-accent" />
                    )}
                  </Link>
                );
              })}
              <Link
                href="/admin"
                className="ml-auto flex shrink-0 items-center gap-2 px-3 py-3 text-[13px] font-semibold text-muted transition hover:text-ink"
              >
                <Users size={15} aria-hidden />
                Vista interna
              </Link>
            </div>
          </nav>
        )}
      </header>

      <main className="mx-auto max-w-[1200px] px-4 pb-24 pt-8 sm:px-6">{children}</main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-x-5 gap-y-3 px-4 py-7 text-[13px] text-muted sm:px-6">
          <Firma alto={22} />
          <span aria-hidden className="hidden h-4 w-px bg-line sm:block" />
          <span>Federación Colombiana de la Industria de Software y TI</span>
          <span className="sm:ml-auto">Prototipo de demostración · datos simulados</span>
        </div>
      </footer>

      <DemoSwitcher />
    </div>
  );
}
