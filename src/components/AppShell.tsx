"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Bell, Briefcase, Building2, ChevronDown, GraduationCap, LayoutGrid, Loader2, LogOut, Network, Receipt, Sparkles,
  Search, ShieldCheck, Star, UserCog, UsersRound,
} from "lucide-react";
import { Firma, Logo } from "./Logo";
import { DemoSwitcher } from "./DemoSwitcher";
import { useDemo } from "@/lib/demo";
import { BotonTema } from "@/components/BotonTema";
import { useIdentidad } from "@/lib/identidad";
import { MODO_API } from "@/lib/api/cliente";
import { tienePermiso, useSesionApi } from "@/lib/api/sesion";
import { PuertaPortalApi } from "./api/PuertaPortalApi";
import { Chip } from "./ui/primitivos";
import { nivelPortal, type SeccionPortal } from "@/lib/acceso";
import { useRolPortal } from "@/lib/useAcceso";

interface Entrada {
  href: string;
  etiqueta: string;
  icono: typeof LayoutGrid;
  /** Qué roles la ven: lo decide la matriz de acceso (src/lib/acceso.ts). */
  seccion: SeccionPortal;
  soloGrande?: boolean;
}

const NAV: Entrada[] = [
  { href: "/portal", etiqueta: "Inicio", icono: LayoutGrid, seccion: "inicio" },
  { href: "/empresa", etiqueta: "Mi empresa", icono: Building2, seccion: "empresa" },
  { href: "/facturacion", etiqueta: "Facturación", icono: Receipt, seccion: "facturacion" },
  { href: "/formacion", etiqueta: "Formación", icono: GraduationCap, seccion: "formacion" },
  { href: "/comunidades", etiqueta: "Comunidades", icono: UsersRound, seccion: "comunidades" },
  { href: "/verticales", etiqueta: "Verticales", icono: Network, seccion: "verticales" },
  { href: "/directorio", etiqueta: "Directorio", icono: Search, seccion: "directorio" },
  { href: "/visibilidad", etiqueta: "Visibilidad", icono: Sparkles, seccion: "visibilidad" },
  { href: "/oportunidades", etiqueta: "Oportunidades", icono: Briefcase, seccion: "oportunidades" },
  { href: "/cuenta-estrategica", etiqueta: "Cuenta estratégica", icono: Star, seccion: "cuenta-estrategica", soloGrande: true },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { escenario } = useDemo();
  const pathname = usePathname();

  const contacto = escenario.empresa.contactos.find((c) => c.id === escenario.contactoId);
  /* En modo API, quién es y en qué empresa está salen de la sesión real. */
  const { actual } = useSesionApi("portal");
  const vista = MODO_API && actual.estado === "lista" ? actual.vista : null;
  const nombreVisible = MODO_API ? (vista ? (vista.user.name ?? vista.user.email) : "…") : (contacto?.nombre ?? "");
  const empresaVisible = MODO_API
    ? (vista?.activeOrganization?.legalName ?? (vista ? "Sin empresa elegida" : ""))
    : escenario.empresa.razonSocial;
  const rol = useRolPortal();
  const administraAccesos = MODO_API
    ? tienePermiso(vista?.permissions ?? [], "user:read")
    : nivelPortal(rol, "contactos") === "gestiona";

  const visibles = NAV.filter((e) => {
    if (nivelPortal(rol, e.seccion) === null) return false;
    if (e.soloGrande && escenario.empresa.segmento !== "grande") return false;
    return true;
  });

  /* Al portal se entra siempre por el login: sin sesión, se va a /entrar y se
     vuelve aquí después. En modo API lo resuelve PuertaPortalApi. */
  const { sesionPortal, sesionLista, salidaVoluntaria } = useIdentidad();
  const router = useRouter();
  const sinSesion = !MODO_API && sesionLista && !sesionPortal;
  useEffect(() => {
    if (!sinSesion) return;
    /* Quien cerró sesión vuelve al login a secas; quien llegó sin sesión, regresa después a lo que pidió. */
    router.replace(salidaVoluntaria ? "/entrar" : `/entrar?destino=${encodeURIComponent(pathname ?? "/portal")}`);
  }, [sinSesion, salidaVoluntaria, pathname, router]);

  const estadoChip = {
    "al-dia": { tono: "exito" as const, texto: "Al día" },
    pendiente: { tono: "aviso" as const, texto: "Pendiente" },
    vencida: { tono: "error" as const, texto: "Vencida" },
  }[escenario.empresa.estado];

  if (!MODO_API && (!sesionLista || !sesionPortal)) {
    return (
      <div className="grid min-h-dvh place-items-center bg-bg text-[14px] text-muted" role="status">
        <span className="inline-flex items-center gap-2">
          <Loader2 size={16} className="animate-spin" aria-hidden /> Verificando tu sesión…
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1200px] items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6">
          <Link href="/" className="shrink-0 rounded">
            <Logo />
          </Link>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            {/* Sin empresa elegida no hay estado de afiliación que mostrar. */}
            {(!MODO_API || vista?.activeOrganization) && (
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
            <BotonTema />
            <MenuUsuario nombre={nombreVisible} empresa={empresaVisible} esGerente={administraAccesos} />
          </div>
        </div>

        <nav aria-label="Secciones del portal" className="border-t border-line">
          <div className="mx-auto flex max-w-[1200px] gap-1 overflow-x-auto px-2 sm:px-4">
            {visibles.map((e) => {
              const activo = e.href === "/portal" ? pathname === "/portal" : pathname?.startsWith(e.href);
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
          </div>
        </nav>
      </header>

      {MODO_API && (
        <p className="border-b border-line bg-info-bg px-4 py-2 text-center text-[12.5px] font-semibold text-info">
          Modo API · tu identidad, empresa y accesos son reales; el resto de los datos sigue simulado.
        </p>
      )}
      <main className="mx-auto max-w-[1200px] px-4 pb-24 pt-8 sm:px-6">
        {MODO_API ? <PuertaPortalApi>{children}</PuertaPortalApi> : children}
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-x-5 gap-y-3 px-4 py-7 text-[13px] text-muted sm:px-6">
          <Firma alto={22} />
          <span aria-hidden className="hidden h-4 w-px bg-line sm:block" />
          <span>Federación Colombiana de la Industria de Software y TI</span>
          <span className="sm:ml-auto">Prototipo de demostración · datos simulados</span>
        </div>
      </footer>

      {/* Con identidad real, el escenario lo decide la sesión, no un selector. */}
      {!MODO_API && <DemoSwitcher />}
    </div>
  );
}

/**
 * Menú de usuario (P-01, navegación secundaria): accesos de la empresa para el
 * gerente y cierre de sesión. Se cierra con Escape o al hacer clic fuera.
 */
function MenuUsuario({ nombre, empresa, esGerente }: { nombre: string; empresa: string; esGerente: boolean }) {
  const [abierto, setAbierto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { cerrarPortal } = useIdentidad();
  const { salir } = useSesionApi("portal");

  useEffect(() => {
    if (!abierto) return;
    const fuera = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setAbierto(false);
    };
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierto(false);
    };
    document.addEventListener("mousedown", fuera);
    document.addEventListener("keydown", tecla);
    return () => {
      document.removeEventListener("mousedown", fuera);
      document.removeEventListener("keydown", tecla);
    };
  }, [abierto]);

  const siglas = nombre.split(" ").map((p) => p[0]).slice(0, 2).join("");

  return (
    <div ref={ref} className="relative md:border-l md:border-line md:pl-3">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        aria-haspopup="true"
        aria-label={`Menú de ${nombre}`}
        className="flex items-center gap-2.5 rounded-lg p-1 transition hover:bg-bg md:pr-2"
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--navy-700)] text-[12px] font-bold text-white">
          {siglas}
        </span>
        <span className="hidden text-left leading-tight md:block">
          <span className="block text-[13.5px] font-semibold">{nombre}</span>
          <span className="block text-[12px] text-muted">{empresa}</span>
        </span>
        <ChevronDown size={15} className="hidden text-muted md:block" aria-hidden />
      </button>
      {abierto && (
        <div className="absolute right-0 top-full z-40 mt-2 w-64 overflow-hidden rounded-xl border border-line bg-surface shadow-[var(--shadow-pop)]">
          <div className="border-b border-line px-4 py-3 md:hidden">
            <p className="text-[13.5px] font-semibold">{nombre}</p>
            <p className="text-[12px] text-muted">{empresa}</p>
          </div>
          <div className="grid p-1.5">
            {esGerente && (
              <Link
                href="/empresa/contactos"
                onClick={() => setAbierto(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[14px] font-semibold hover:bg-bg"
              >
                <UserCog size={16} className="text-muted" aria-hidden /> Contactos y accesos
              </Link>
            )}
            <button
              type="button"
              onClick={() => {
                if (MODO_API) {
                  /* Cierra en el API y, si existe, también en el proveedor:
                     en un equipo compartido, el siguiente no entra sin clave. */
                  void salir("portal")
                    .catch(() => null)
                    .then((destino) => window.location.assign(destino ?? "/entrar"));
                  return;
                }
                cerrarPortal();
                router.push("/entrar");
              }}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[14px] font-semibold hover:bg-bg"
            >
              <LogOut size={16} className="text-muted" aria-hidden /> Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
