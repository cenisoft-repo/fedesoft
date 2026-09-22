"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertOctagon, AlertTriangle, ArrowUpRight, CheckCircle2, Clock,
  Info, Lock, Search,
} from "lucide-react";
import { CARTERA, TRAMOS_MORA, type CuentaCartera, type EstadoCartera } from "@/lib/mock/admin";
import { cop, fecha } from "@/lib/format";
import { Card, Chip, Cifra, Eyebrow, PageHeader, Vacio } from "@/components/ui/primitivos";

/* Los tres estados se leen por ícono, etiqueta y cifra, no por color: el rojo y
   el ámbar de la marca son casi indistinguibles con deuteranopia (ΔE 3,8) e
   incluso con visión normal (ΔE 14,3). El color acompaña; nunca informa solo. */
const ESTADO: Record<EstadoCartera, {
  etiqueta: string;
  icono: typeof CheckCircle2;
  chip: "exito" | "aviso" | "error";
  barra: string;
}> = {
  "al-dia": { etiqueta: "Al día", icono: CheckCircle2, chip: "exito", barra: "var(--success)" },
  "por-vencer": { etiqueta: "Por vencer", icono: Clock, chip: "aviso", barra: "var(--warning)" },
  vencida: { etiqueta: "Vencida", icono: AlertOctagon, chip: "error", barra: "var(--danger)" },
};

const ORDEN: EstadoCartera[] = ["al-dia", "por-vencer", "vencida"];

export default function Cartera() {
  const [filtro, setFiltro] = useState<EstadoCartera | "todas">("todas");
  const [busqueda, setBusqueda] = useState("");

  const t = useMemo(() => {
    const suma = (f: (c: CuentaCartera) => boolean) =>
      CARTERA.filter(f).reduce((a, c) => a + c.monto, 0);
    const cuenta = (f: (c: CuentaCartera) => boolean) => CARTERA.filter(f).length;
    return {
      facturado: suma(() => true),
      recaudado: suma((c) => c.estado === "al-dia"),
      porVencer: suma((c) => c.estado === "por-vencer"),
      vencido: suma((c) => c.estado === "vencida"),
      bloqueadas: cuenta((c) => c.estado === "vencida"),
      porEstado: ORDEN.map((e) => ({
        estado: e,
        monto: suma((c) => c.estado === e),
        n: cuenta((c) => c.estado === e),
      })),
      tramos: TRAMOS_MORA.map((tr) => ({
        ...tr,
        monto: suma((c) => c.mora >= tr.desde && c.mora <= tr.hasta),
        n: cuenta((c) => c.mora >= tr.desde && c.mora <= tr.hasta),
      })),
    };
  }, []);

  const lista = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return CARTERA.filter((c) => filtro === "todas" || c.estado === filtro)
      .filter((c) => !q || c.empresa.toLowerCase().includes(q) || c.nit.includes(q))
      .sort((a, b) => b.mora - a.mora || b.monto - a.monto);
  }, [filtro, busqueda]);

  const maxEstado = Math.max(...t.porEstado.map((e) => e.monto));
  const maxTramo = Math.max(...t.tramos.map((e) => e.monto), 1);

  return (
    <div className="grid gap-7">
      <PageHeader
        eyebrow="Analítica y resultados"
        titulo="Tablero de cartera"
        lede="Dónde está el dinero de la federación y qué tan viejo es lo que no ha entrado. Es el mismo estado que el afiliado ve en su portal, leído desde el otro lado."
      />

      {/* Cifras protagonistas */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5"><Cifra etiqueta="Facturado 2026" valor={cop(t.facturado)} tamano="sm" /></Card>
        <Card className="p-5"><Cifra etiqueta="Recaudado" valor={cop(t.recaudado)} tamano="sm" detalle={`${pct(t.recaudado, t.facturado)} de lo facturado`} /></Card>
        <Card className="p-5"><Cifra etiqueta="Por vencer" valor={cop(t.porVencer)} tamano="sm" detalle="Aún dentro de plazo" /></Card>
        <Card destacada className="p-5"><Cifra etiqueta="Vencido" valor={cop(t.vencido)} tamano="sm" detalle={`${pct(t.vencido, t.facturado)} de lo facturado`} /></Card>
      </div>

      <p className="flex items-start gap-2 text-[13.5px] leading-relaxed text-muted">
        <Info size={15} className="mt-0.5 shrink-0" aria-hidden />
        Muestra de <span className="num font-semibold text-ink">{CARTERA.length}</span> cuentas para la demostración,
        no la cartera completa de las 518 afiliadas. Las cifras son simuladas y coherentes entre sí.
      </p>

      <div className="grid items-start gap-5 lg:grid-cols-2">
        {/* Composición: una fila por estado, con ícono y cifra propios */}
        <section className="grid gap-3">
          <Eyebrow>Composición de la cartera</Eyebrow>
          <Card className="grid gap-4 p-5">
            {t.porEstado.map(({ estado, monto, n }) => {
              const cfg = ESTADO[estado];
              const Icono = cfg.icono;
              return (
                <div key={estado} className="grid gap-1.5">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <Icono size={15} style={{ color: cfg.barra }} aria-hidden />
                    <span className="text-[14.5px] font-semibold">{cfg.etiqueta}</span>
                    <span className="num text-[13px] text-muted">
                      {n} {n === 1 ? "cuenta" : "cuentas"}
                    </span>
                    <span className="num ml-auto text-[15px] font-semibold">{cop(monto)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-bg">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${(monto / maxEstado) * 100}%`, background: cfg.barra }}
                    />
                  </div>
                </div>
              );
            })}
          </Card>
        </section>

        {/* Antigüedad: un solo tono, de claro a oscuro */}
        <section className="grid gap-3">
          <Eyebrow>Antigüedad de la mora</Eyebrow>
          <Card className="grid gap-4 p-5">
            {t.tramos.map((tr, i) => (
              <div key={tr.etiqueta} className="grid gap-1.5">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span className="text-[14.5px] font-semibold">{tr.etiqueta}</span>
                  <span className="num text-[13px] text-muted">
                    {tr.n} {tr.n === 1 ? "cuenta" : "cuentas"}
                  </span>
                  <span className="num ml-auto text-[15px] font-semibold">
                    {tr.monto > 0 ? cop(tr.monto) : "—"}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-bg">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(tr.monto / maxTramo) * 100}%`,
                      background: "var(--danger)",
                      opacity: 0.4 + i * 0.2,
                    }}
                  />
                </div>
              </div>
            ))}
            <p className="text-[13px] leading-relaxed text-muted">
              Cuanto más intenso el color, más vieja la deuda. Después de 90 días la recuperación cae y la conversación deja de
              ser de cobro.
            </p>
          </Card>
        </section>
      </div>

      {/* La consecuencia: donde la regla se vuelve dinero */}
      <Card destacada className="grid gap-3 p-5 sm:p-6">
        <Eyebrow>
          <Lock size={13} aria-hidden /> Efecto en el portal
        </Eyebrow>
        <p className="max-w-[78ch] text-[15.5px] leading-relaxed">
          <span className="num font-semibold">{t.bloqueadas}</span> empresas tienen hoy el certificado y los insights
          del sector bloqueados por mora. Es el mismo dato que ellas ven al entrar: no hay dos verdades.
        </p>
        <p className="max-w-[78ch] text-[14px] leading-relaxed text-muted">
          <AlertTriangle size={14} className="mr-1.5 inline align-[-2px] text-warning" aria-hidden />
          El corte depende de los días de gracia, y esa regla sigue sin decidirse. Moverla cambia a la vez cuánto se
          recauda y a cuántos afiliados se les cierra la puerta — por eso es decisión de Fedesoft, no del sistema.
          Está en el Anexo A del catálogo de requerimientos.
        </p>
      </Card>

      {/* Detalle */}
      <section className="grid gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrar por estado">
            {(["todas", ...ORDEN] as const).map((e) => {
              const activo = filtro === e;
              const n = e === "todas" ? CARTERA.length : CARTERA.filter((c) => c.estado === e).length;
              return (
                <button
                  key={e}
                  type="button"
                  onClick={() => setFiltro(e)}
                  aria-pressed={activo}
                  className={`rounded-full px-3.5 py-1.5 text-[13.5px] font-semibold transition ${
                    activo ? "bg-[var(--navy-700)] text-white" : "border border-line text-muted hover:border-accent hover:text-ink"
                  }`}
                >
                  {e === "todas" ? "Todas" : ESTADO[e].etiqueta} <span className="num opacity-70">{n}</span>
                </button>
              );
            })}
          </div>
          <label className="relative ml-auto">
            <span className="sr-only">Buscar empresa o NIT</span>
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
            <input
              type="search"
              value={busqueda}
              onChange={(ev) => setBusqueda(ev.target.value)}
              placeholder="Empresa o NIT"
              className="w-[220px] rounded-full border border-line bg-surface py-2 pl-9 pr-3.5 text-[14px] outline-none transition placeholder:text-muted focus:border-accent"
            />
          </label>
        </div>

        <Card className="overflow-x-auto">
          {lista.length === 0 ? (
            <Vacio titulo="Sin cuentas que mostrar" detalle="Ajusta el filtro o la búsqueda para ver otras cuentas de la cartera." />
          ) : (
            <table className="w-full min-w-[760px] text-[14px]">
              <caption className="sr-only">Cuentas por cobrar, de la más vencida a la más reciente</caption>
              <thead>
                <tr className="border-b border-line text-left text-[12px] uppercase tracking-[0.1em] text-muted">
                  <th scope="col" className="px-4 py-3 font-semibold">Empresa</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Estado</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">Monto</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Vence</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">Mora</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Última gestión</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {lista.map((c) => {
                  const cfg = ESTADO[c.estado];
                  const Icono = cfg.icono;
                  return (
                    <tr key={c.nit} className="transition hover:bg-bg">
                      <th scope="row" className="px-4 py-3 text-left font-semibold">
                        {c.empresa}
                        <span className="block font-mono text-[12.5px] font-normal text-muted">
                          {c.nit} · {c.ciudad} · {c.segmento === "grande" ? "Grande" : "MIPYME"}
                        </span>
                      </th>
                      <td className="px-4 py-3">
                        <Chip tono={cfg.chip}>
                          <Icono size={12} aria-hidden /> {cfg.etiqueta}
                        </Chip>
                      </td>
                      <td className="num px-4 py-3 text-right font-semibold">{cop(c.monto)}</td>
                      <td className="px-4 py-3 text-muted">{fecha(c.vence)}</td>
                      <td className="num px-4 py-3 text-right">
                        {c.mora > 0 ? <span className="font-semibold text-danger">{c.mora} d</span> : <span className="text-muted">—</span>}
                      </td>
                      <td className="px-4 py-3 text-[13.5px] text-muted">{c.ultimaGestion ?? "Sin gestión registrada"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Card>

        <p className="text-[13.5px] text-muted">
          <Link href="/admin" className="inline-flex items-center gap-1 font-semibold text-link hover:underline">
            Abrir la ficha 360 de una empresa <ArrowUpRight size={14} aria-hidden />
          </Link>{" "}
          para ver su historial completo antes de gestionar el cobro.
        </p>
      </section>
    </div>
  );
}

function pct(parte: number, total: number): string {
  return `${Math.round((parte / total) * 100)}%`;
}
