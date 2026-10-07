"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  ArrowLeft, Building2, ChartColumn, GraduationCap, Inbox, Loader2, LogOut, Megaphone, Network, Receipt,
  ScrollText, Star, UserCog,
} from "lucide-react";
import { Firma, Logo } from "./Logo";
import { BotonTema } from "@/components/BotonTema";
import { iniciales, useIdentidad } from "@/lib/identidad";
import { nombreRolInterno } from "@/lib/mock/usuarios";
import { SOLICITUDES } from "@/lib/mock/admin";
import { MODO_API } from "@/lib/api/cliente";
import { tienePermiso, useSesionApi } from "@/lib/api/sesion";
import { MODULOS_CONSOLA, nivelConsola, type ModuloConsola, type Nivel } from "@/lib/acceso";
import { SinPermisoConsola } from "./SinPermisoRol";

/**
 * La consola es otra superficie, no otra pestaña del portal: banda oscura,
 * navegación propia y la identidad de quien opera —no la del afiliado—.
 * Corresponde a la separación de ADR-005 (apps/web vs. apps/admin).
 */

const ICONOS: Record<ModuloConsola, typeof Building2> = {
  afiliados: Building2,
  solicitudes: Inbox,
  cartera: Receipt,
  formacion: GraduationCap,
  contenidos: Megaphone,
  relacionamiento: Network,
  cuentas: Star,
  resultados: ChartColumn,
  usuarios: UserCog,
  auditoria: ScrollText,
};

/** Módulo dueño de la ruta: el de prefijo más largo ("/admin" es solo Afiliados). */
function moduloDeRuta(pathname: string): ModuloConsola {
  const propio = MODULOS_CONSOLA.filter((m) => m.href !== "/admin" && (pathname === m.href || pathname.startsWith(`${m.href}/`)))
    .sort((a, b) => b.href.length - a.href.length)[0];
  return propio?.id ?? "afiliados";
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { sesionConsola, porId, cerrarConsola, recordarDestinoConsola } = useIdentidad();
  const { actual, salir } = useSesionApi("consola");

  /* Quien opera sale de la sesión con segundo factor: la real del API o la
     simulada de la demostración. Mismo encabezado para ambas. */
  const simulado = !MODO_API && sesionConsola ? porId(sesionConsola) : undefined;
  const vista = MODO_API && actual.estado === "lista" ? actual.vista : null;
  const operador = vista
    ? {
        nombre: vista.user.name ?? vista.user.email,
        correo: vista.user.email,
        rolesTexto: (vista.internalRoles ?? []).map((r) => r.name).join(" · ") || "Equipo interno",
        esSuperAdmin: tienePermiso(vista.permissions, "role:assign"),
        nivel: (m: ModuloConsola): Nivel | null => {
          const def = MODULOS_CONSOLA.find((x) => x.id === m)!;
          if (tienePermiso(vista.permissions, def.permisoEscritura)) return "gestiona";
          return tienePermiso(vista.permissions, def.permisoLectura) ? "consulta" : null;
        },
      }
    : simulado
      ? {
          nombre: simulado.nombre ?? simulado.correo,
          correo: simulado.correo,
          rolesTexto: simulado.rolesInternos.map(nombreRolInterno).join(" · "),
          esSuperAdmin: simulado.rolesInternos.includes("super-admin"),
          nivel: (m: ModuloConsola): Nivel | null => nivelConsola(simulado.rolesInternos, m),
        }
      : null;
  const sinSesion = MODO_API ? actual.estado === "anonimo" : !simulado;

  useEffect(() => {
    if (!sinSesion) return;
    const destino = pathname ?? "/admin";
    if (MODO_API) {
      router.replace(`/admin/entrar?destino=${encodeURIComponent(destino)}`);
      return;
    }
    recordarDestinoConsola(destino);
    router.replace("/admin/entrar");
  }, [sinSesion, pathname, recordarDestinoConsola, router]);

  if (!operador) {
    return (
      <div className="grid min-h-dvh place-items-center bg-bg text-[14px] text-muted" role="status">
        <span className="inline-flex items-center gap-2">
          {MODO_API && actual.estado === "error" ? (
            actual.mensaje
          ) : (
            <><Loader2 size={16} className="animate-spin" aria-hidden /> Verificando la sesión de consola…</>
          )}
        </span>
      </div>
    );
  }

  const { rolesTexto } = operador;
  /* Guard de la consola: como el del servidor, decide antes de pintar la página. */
  const modulo = moduloDeRuta(pathname ?? "/admin");
  const permitido = operador.nivel(modulo) !== null;
  const nav = MODULOS_CONSOLA.filter((m) => operador.nivel(m.id) !== null);

  const pendientes = SOLICITUDES.filter((s) => s.estado === "nueva" || s.estado === "en-revision").length;
  /* El gestor de cuenta no ve solicitudes ajenas: tampoco su contador. */
  const nivelSolicitudes = operador.nivel("solicitudes");
  const verPendientes = nivelSolicitudes === "gestiona" || nivelSolicitudes === "consulta";

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
                href="/entrar"
                title="Volver al portal del afiliado"
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[13px] font-semibold text-azure-200 transition hover:bg-white/10 hover:text-white sm:px-3"
              >
                <ArrowLeft size={14} aria-hidden />
                <span className="hidden sm:inline">Portal del afiliado</span>
                <span className="sr-only sm:hidden">Volver al portal del afiliado</span>
              </Link>
              <BotonTema className="rounded-lg p-2 text-azure-200 transition hover:bg-white/10 hover:text-white" />
              <div className="flex items-center gap-2.5 border-l border-white/20 pl-3">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-[var(--navy-700)] text-[12px] font-bold text-white ring-1 ring-white/40">
                  {iniciales(operador.nombre, operador.correo)}
                </div>
                <div className="hidden leading-tight md:block">
                  <p className="text-[13.5px] font-semibold">{operador.nombre}</p>
                  <p className="text-[12px] text-azure-200">{rolesTexto}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (MODO_API) {
                      void salir("consola")
                        .catch(() => null)
                        .then((destino) => window.location.assign(destino ?? "/admin/entrar"));
                      return;
                    }
                    cerrarConsola();
                    router.push("/admin/entrar");
                  }}
                  className="rounded-lg p-2 text-azure-200 transition hover:bg-white/10 hover:text-white"
                  aria-label="Cerrar sesión de consola"
                  title="Cerrar sesión"
                >
                  <LogOut size={17} aria-hidden />
                </button>
              </div>
            </div>
          </div>
        </div>

        <nav aria-label="Secciones de la consola" className="border-b border-line bg-surface/90 backdrop-blur">
          <div className="mx-auto flex max-w-[1200px] gap-0.5 overflow-x-auto px-2 sm:px-4 lg:flex-wrap lg:overflow-visible">
            {nav.map((e) => {
              const activo = modulo === e.id;
              const Icono = ICONOS[e.id];
              return (
                <Link
                  key={e.href}
                  href={e.href}
                  aria-current={activo ? "page" : undefined}
                  className={`relative flex shrink-0 items-center gap-2 px-2.5 py-3 text-[14px] font-semibold transition ${
                    activo ? "text-ink" : "text-muted hover:text-ink"
                  }`}
                >
                  <Icono size={16} aria-hidden />
                  {e.etiqueta}
                  {e.href === "/admin/solicitudes" && pendientes > 0 && verPendientes && (
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
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-[1200px] px-4 pb-24 pt-8 sm:px-6">
        {permitido ? children : <SinPermisoConsola modulo={modulo} inicio={nav[0] ?? null} />}
      </main>

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
