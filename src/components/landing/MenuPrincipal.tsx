"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronDown, Menu as Hamburguesa, X } from "lucide-react";
import { Logo } from "@/components/Logo";
import { SECCIONES, type Pieza, type Seccion } from "./menu-datos";

/* ── Mosaico de una iniciativa o evento, con su logo oficial ───────── */
function Mosaico({ pieza }: { pieza: Pieza }) {
  const arte = (
    <Image
      src={`/recursos/logos/iniciativas/${pieza.logo}.webp`}
      alt={pieza.nombre}
      width={160}
      height={160}
      className="h-full w-full object-cover"
    />
  );

  const base =
    "block aspect-square overflow-hidden rounded-2xl border border-white/10 transition duration-300";

  return pieza.href ? (
    <Link
      href={pieza.href}
      className={`${base} hover:-translate-y-1 hover:border-[var(--azure-400)] hover:shadow-[0_18px_40px_-16px_var(--brand-azure)]`}
    >
      {arte}
    </Link>
  ) : (
    <div className={`${base} opacity-90 hover:opacity-100`}>{arte}</div>
  );
}

/* ── Contenido de un panel ─────────────────────────────────────────── */
function Contenido({ seccion }: { seccion: Seccion }) {
  return (
    <div className="relative">
      {seccion.piezas && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {seccion.piezas.map((p) => (
            <Mosaico key={p.logo} pieza={p} />
          ))}
        </div>
      )}

      {seccion.columnas && (
        <div className="grid gap-8 sm:grid-cols-2">
          {seccion.columnas.map((c) => (
            <div key={c.titulo}>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--azure-400)]">
                {c.titulo}
              </p>
              <ul className="mt-4 grid gap-1">
                {c.enlaces.map((e) =>
                  e.href ? (
                    <li key={e.nombre}>
                      <Link
                        href={e.href}
                        className="flex items-center justify-between gap-3 rounded-full px-4 py-2.5 text-[14.5px] text-white/80 transition hover:bg-white/10 hover:text-white"
                      >
                        {e.nombre}
                        <ArrowRight size={14} aria-hidden className="text-[var(--azure-400)]" />
                      </Link>
                    </li>
                  ) : (
                    <li
                      key={e.nombre}
                      className="rounded-full px-4 py-2.5 text-[14.5px] text-white/45"
                    >
                      {e.nombre}
                    </li>
                  ),
                )}
              </ul>
            </div>
          ))}
        </div>
      )}

      {seccion.pie && (
        <p className="mt-6 border-t border-white/10 pt-4 text-[13px] font-light text-white/40">
          {seccion.pie}
        </p>
      )}
    </div>
  );
}

/**
 * Barra flotante de vidrio con sus paneles, en el lenguaje del material de
 * referencia: superficie navy translúcida, filo tenue, halo azure y retícula
 * apenas insinuada. Los paneles traen los logos oficiales de cada evento e
 * iniciativa, tal como los publica el sitio de la federación.
 */
export function MenuPrincipal() {
  const [abierta, setAbierta] = useState<string | null>(null);
  const [movil, setMovil] = useState(false);
  const contenedor = useRef<HTMLDivElement>(null);

  // Escape cierra; un clic fuera también.
  useEffect(() => {
    const alTeclado = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAbierta(null);
        setMovil(false);
      }
    };
    const alClic = (e: MouseEvent) => {
      if (!contenedor.current?.contains(e.target as Node)) setAbierta(null);
    };
    document.addEventListener("keydown", alTeclado);
    document.addEventListener("pointerdown", alClic);
    return () => {
      document.removeEventListener("keydown", alTeclado);
      document.removeEventListener("pointerdown", alClic);
    };
  }, []);

  // Con el panel móvil abierto la página no se desplaza detrás.
  useEffect(() => {
    document.body.style.overflow = movil ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [movil]);

  const seccionActiva = SECCIONES.find((s) => s.id === abierta);

  return (
    <header className="fixed inset-x-0 top-0 z-40 px-4 pt-4 sm:px-6 sm:pt-5">
      <div ref={contenedor} className="mx-auto max-w-[1240px]" onPointerLeave={() => setAbierta(null)}>
        {/* ── La píldora ───────────────────────────────────────────── */}
        <div className="vidrio-menu flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 sm:px-4">
          <Link href="/" className="shrink-0 rounded-full px-1.5" aria-label="Fedesoft, inicio">
            <Logo tema="oscuro" compacto alto={20} />
          </Link>

          <nav aria-label="Secciones de la federación" className="ml-3 hidden items-center gap-0.5 lg:flex">
            {SECCIONES.map((s) => {
              const activa = abierta === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  aria-expanded={activa}
                  aria-controls={`panel-${s.id}`}
                  onPointerEnter={() => setAbierta(s.id)}
                  onFocus={() => setAbierta(s.id)}
                  onClick={() => {
                    // Con puntero fino el hover ya abrió el panel: el clic no debe cerrarlo.
                    // Sin hover —táctil— el mismo botón abre y cierra.
                    const conHover = window.matchMedia("(hover: hover)").matches;
                    setAbierta(conHover ? s.id : activa ? null : s.id);
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13.5px] font-semibold transition ${
                    activa ? "bg-white/12 text-white" : "text-white/65 hover:bg-white/8 hover:text-white"
                  }`}
                >
                  {s.etiqueta}
                  <ChevronDown
                    size={13}
                    aria-hidden
                    className={`transition-transform duration-300 ${activa ? "rotate-180" : ""}`}
                  />
                </button>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/portal"
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[13.5px] font-semibold text-[var(--navy-abismo)] transition hover:bg-white/90"
            >
              Ingresar al portal <ArrowRight size={14} aria-hidden />
            </Link>
            <button
              type="button"
              onClick={() => setMovil((v) => !v)}
              aria-expanded={movil}
              aria-label={movil ? "Cerrar menú" : "Abrir menú"}
              className="rounded-full p-2 text-white/70 transition hover:bg-white/10 hover:text-white lg:hidden"
            >
              {movil ? <X size={18} aria-hidden /> : <Hamburguesa size={18} aria-hidden />}
            </button>
          </div>
        </div>

        {/* ── Panel de escritorio ──────────────────────────────────── */}
        {seccionActiva && (
          <div
            id={`panel-${seccionActiva.id}`}
            className="vidrio-menu relative mt-2 hidden overflow-hidden rounded-3xl border border-white/10 p-7 lg:block"
            style={{ animation: "menu-entra 260ms cubic-bezier(0.22, 1, 0.36, 1)" }}
          >
            <div aria-hidden className="reticula pointer-events-none absolute inset-0 opacity-70" />
            <div className="relative mx-auto max-w-[820px]">
              <Contenido seccion={seccionActiva} />
            </div>
          </div>
        )}
      </div>

      {/* ── Panel móvil ────────────────────────────────────────────── */}
      {movil && (
        <div
          className="fixed inset-0 top-[76px] z-30 overflow-y-auto bg-[rgba(7,20,41,0.94)] px-4 pb-10 backdrop-blur-xl lg:hidden"
          style={{ animation: "menu-entra 240ms ease-out" }}
        >
          <div className="vidrio-menu relative overflow-hidden rounded-3xl border border-white/10 p-5">
            <div aria-hidden className="reticula pointer-events-none absolute inset-0 opacity-70" />
            <div className="relative grid gap-7">
              {SECCIONES.map((s) => (
                <section key={s.id}>
                  <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/45">
                    {s.etiqueta}
                  </h2>
                  <div className="mt-4">
                    <Contenido seccion={s} />
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
