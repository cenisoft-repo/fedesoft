"use client";

import Link from "next/link";
import { CalendarCheck, GraduationCap, Mail, Phone, Star, Target, TrendingUp } from "lucide-react";
import { useDemo } from "@/lib/demo";
import { OPORTUNIDADES, VERTICALES } from "@/lib/mock/catalogo";
import { cop, fecha } from "@/lib/format";
import { Boton, Card, Chip, Eyebrow, PageHeader } from "@/components/ui/primitivos";

export default function CuentaEstrategica() {
  const { escenario } = useDemo();
  const { empresa } = escenario;

  if (!empresa.kam) {
    return (
      <Card className="mx-auto max-w-[560px]">
        <div className="grid justify-items-center gap-3 px-6 py-14 text-center">
          <Star size={26} className="text-muted" aria-hidden />
          <h1 className="font-display text-[20px] font-bold">Tu empresa no es cuenta estratégica</h1>
          <p className="max-w-[46ch] text-[15px] text-muted">
            Este panel se activa para empresas grandes con gestor de cuenta asignado. Tu afiliación tiene acceso a todos
            los servicios del eje de autoservicio.
          </p>
          <Link href="/"><Boton variante="secundario">Volver al inicio</Boton></Link>
        </div>
      </Card>
    );
  }

  const { kam } = empresa;
  const proyectos = OPORTUNIDADES.filter((o) => o.aplicaA.includes("grande"));

  return (
    <div className="grid gap-7">
      <PageHeader
        eyebrow="Cuenta estratégica"
        titulo={`Tu relación con Fedesoft, en un solo panel`}
        lede="Todo lo que tu empresa tiene en curso con la federación, consolidado desde cada módulo. Sin informes que pedir."
      />

      {/* Gestor asignado */}
      <Card destacada className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[var(--navy-700)] font-display text-[17px] font-bold text-white">
              {kam.iniciales}
            </div>
            <div>
              <Eyebrow>Tu gestora de cuenta</Eyebrow>
              <p className="mt-1 font-display text-[19px] font-extrabold">{kam.nombre}</p>
              <p className="text-[14px] text-muted">{kam.cargo}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Boton variante="secundario"><Mail size={15} aria-hidden /> Escribir</Boton>
            <Boton variante="secundario"><Phone size={15} aria-hidden /> {kam.telefono}</Boton>
          </div>
        </div>
      </Card>

      {/* Resumen consolidado */}
      <section className="grid gap-3">
        <h2 className="text-[19px] font-extrabold">Resumen</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Metrica icono={TrendingUp} etiqueta="Estado financiero" valor={empresa.estado === "al-dia" ? "Al día" : "Vencida"} detalle={`Vigente hasta ${fecha(empresa.vigenciaHasta)}`} />
          <Metrica icono={Target} etiqueta="Verticales activas" valor={String(empresa.verticales.length)} detalle={empresa.verticales.join(", ")} />
          <Metrica icono={GraduationCap} etiqueta="Participación en formación" valor="12" detalle="Inscripciones del equipo en 2026" />
          <Metrica icono={CalendarCheck} etiqueta="Cuota anual" valor={cop(empresa.cargos[0]?.monto ?? 0)} detalle={`Periodo ${empresa.cargos[0]?.periodo ?? "2026"}`} />
        </div>
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        {/* Verticales */}
        <section className="grid gap-3">
          <h2 className="text-[19px] font-extrabold">Verticales en las que participas</h2>
          <Card className="divide-y divide-line">
            {empresa.verticales.map((nombre) => {
              const v = VERTICALES.find((x) => x.nombre === nombre);
              if (!v) return null;
              return (
                <div key={nombre} className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold">Vertical {v.nombre}</p>
                    <Chip tono="info">Próxima mesa: {fecha(v.proxima)}</Chip>
                  </div>
                  <p className="mt-1 text-[13.5px] text-muted">{v.descripcion}</p>
                  <p className="mt-1.5 text-[13px] text-muted">
                    <span className="num">{v.mesas}</span> mesas realizadas · <span className="num">{v.participantes}</span> empresas participantes
                  </p>
                </div>
              );
            })}
          </Card>
        </section>

        {/* Proyectos y plan de acción */}
        <section className="grid gap-3">
          <h2 className="text-[19px] font-extrabold">Proyectos y acciones</h2>
          <Card className="divide-y divide-line">
            {proyectos.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center gap-3 p-4">
                <div className="min-w-[200px] flex-1">
                  <p className="font-semibold">{p.titulo}</p>
                  <p className="text-[13px] text-muted">{p.tipo} · cierra {fecha(p.cierra)}</p>
                </div>
                <Chip tono={p.estado === "abierta" ? "info" : "aviso"}>
                  {p.estado === "abierta" ? "Abierta" : "En evaluación"}
                </Chip>
              </div>
            ))}
            <div className="p-4">
              <p className="text-[13px] font-semibold uppercase tracking-wider text-muted">Acciones acordadas</p>
              <ul className="mt-2 grid gap-2 text-[14px]">
                <li className="flex items-start gap-2">
                  <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <span>Presentar caso de éxito en el próximo encuentro de la vertical Financiera · {fecha("2026-10-02")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />
                  <span>Confirmar participación en la misión comercial International Soft Route · vence {fecha("2026-09-30")}</span>
                </li>
              </ul>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}

function Metrica({
  icono: Icono, etiqueta, valor, detalle,
}: { icono: typeof Star; etiqueta: string; valor: string; detalle: string }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-muted">
        <Icono size={15} aria-hidden />
        <p className="text-[12.5px] font-semibold uppercase tracking-wider">{etiqueta}</p>
      </div>
      <p className="num mt-2 font-display text-[24px] font-extrabold leading-none">{valor}</p>
      <p className="mt-1.5 text-[13px] text-muted">{detalle}</p>
    </Card>
  );
}
