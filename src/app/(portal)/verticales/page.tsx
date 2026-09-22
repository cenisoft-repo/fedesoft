"use client";

import { useState } from "react";
import { CalendarDays, FileText, MapPin, Target, Users } from "lucide-react";
import { useDemo } from "@/lib/demo";
import { VERTICALES } from "@/lib/mock/catalogo";
import { fecha } from "@/lib/format";
import { Boton, Card, Chip, PageHeader, Seccion } from "@/components/ui/primitivos";

export default function Verticales() {
  const { escenario } = useDemo();
  const mias = escenario.empresa.verticales;
  const [activa, setActiva] = useState(VERTICALES.find((v) => mias.includes(v.nombre))?.nombre ?? VERTICALES[0].nombre);
  const vertical = VERTICALES.find((v) => v.nombre === activa)!;
  const participo = mias.includes(vertical.nombre);

  return (
    <div className="grid gap-10">
      <PageHeader
        eyebrow="Verticales sectoriales"
        titulo="Las mesas donde se construye la posición del sector"
        lede="Aquí el equipo de la federación dinamiza y tu empresa aporta. El portal te da la agenda, los documentos y el registro de tu participación."
        imagen="verticales"
      />

      {/* Selector de vertical */}
      <div className="flex flex-wrap gap-2">
        {VERTICALES.map((v) => {
          const esMia = mias.includes(v.nombre);
          const sel = v.nombre === activa;
          return (
            <button
              key={v.nombre}
              onClick={() => setActiva(v.nombre)}
              aria-pressed={sel}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[14px] font-semibold transition ${
                sel ? "border-accent bg-info-bg text-info" : "border-line text-muted hover:border-accent hover:text-ink"
              }`}
            >
              {v.nombre}
              {esMia && <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent" />}
            </button>
          );
        })}
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div className="grid gap-8">
          <section className="grid gap-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-[26px] font-light">Vertical {vertical.nombre}</h2>
                <p className="mt-1.5 max-w-[56ch] text-[15px] leading-relaxed text-muted">{vertical.descripcion}</p>
              </div>
              {participo ? (
                <Chip tono="exito">Participas</Chip>
              ) : (
                <Boton variante="secundario" tamano="sm">Solicitar vinculación</Boton>
              )}
            </div>

            <div className="flex flex-wrap gap-x-8 gap-y-3 text-[14px] text-muted">
              <span className="flex items-center gap-1.5"><Target size={14} aria-hidden /><span className="num">{vertical.mesas}</span> mesas realizadas</span>
              <span className="flex items-center gap-1.5"><Users size={14} aria-hidden /><span className="num">{vertical.participantes}</span> empresas</span>
            </div>
          </section>

          {/* Documentos de trabajo */}
          <section className="grid gap-4">
            <Seccion titulo="Documentos de trabajo" />
            {participo ? (
              <Card className="divide-y divide-line">
                {vertical.documentos.map((d) => (
                  <div key={d.titulo} className="flex flex-wrap items-center gap-3 p-4">
                    <FileText size={17} className="shrink-0 text-muted" aria-hidden />
                    <div className="min-w-[220px] flex-1">
                      <p className="text-[15px] font-semibold">{d.titulo}</p>
                      <p className="text-[13px] text-muted">{d.tipo} · {fecha(d.fecha)}</p>
                    </div>
                    <Boton variante="secundario" tamano="sm">Descargar</Boton>
                  </div>
                ))}
              </Card>
            ) : (
              <Card>
                <div className="px-6 py-10 text-center">
                  <p className="font-display text-[16px] font-semibold">Documentos reservados a participantes</p>
                  <p className="mx-auto mt-1.5 max-w-[46ch] text-[14.5px] text-muted">
                    Las actas y documentos de trabajo se abren cuando tu empresa se vincula a la vertical.
                  </p>
                </div>
              </Card>
            )}
          </section>

          {/* Iniciativas en curso */}
          <section className="grid gap-4">
            <Seccion titulo="Iniciativas en curso" />
            <ul className="grid gap-3">
              {vertical.iniciativas.map((i) => (
                <li key={i} className="flex items-start gap-3 text-[15px]">
                  <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  {i}
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Próxima mesa */}
        <aside className="grid gap-5">
          <Card destacada className="p-6">
            <p className="text-[11.5px] font-semibold uppercase tracking-[0.16em] text-muted">Próxima mesa</p>
            <p className="num mt-3 font-display text-[32px] font-light leading-none">{fecha(vertical.proxima)}</p>
            <p className="mt-4 text-[15px] font-semibold leading-snug">{vertical.temaProxima}</p>
            <p className="mt-2 flex items-center gap-1.5 text-[14px] text-muted">
              <MapPin size={14} aria-hidden /> {vertical.lugar}
            </p>
            {participo && (
              <Boton className="mt-6 w-full">
                <CalendarDays size={16} aria-hidden /> Confirmar asistencia
              </Boton>
            )}
          </Card>

          <Card className="p-6">
            <p className="text-[11.5px] font-semibold uppercase tracking-[0.16em] text-muted">Tu participación</p>
            <p className="mt-3 text-[14.5px] leading-relaxed text-muted">
              {participo
                ? `${escenario.empresa.razonSocial} participa en ${mias.length} ${mias.length === 1 ? "vertical" : "verticales"}: ${mias.join(", ")}. La asistencia queda registrada en tu ficha.`
                : `${escenario.empresa.razonSocial} aún no participa en esta vertical.`}
            </p>
          </Card>
        </aside>
      </div>
    </div>
  );
}
