"use client";

import { useState } from "react";
import { Check, Info, Mail, Phone, UserPlus } from "lucide-react";
import { useDemo } from "@/lib/demo";
import { fecha } from "@/lib/format";
import { Boton, Card, Chip, Eyebrow, PageHeader } from "@/components/ui/primitivos";

export default function Empresa() {
  const { escenario } = useDemo();
  const { empresa, rol } = escenario;
  const puedeEditar = rol === "gerente";
  const [guardado, setGuardado] = useState(false);

  return (
    <div className="grid gap-7">
      <PageHeader
        imagen="visibilidad"
        eyebrow="Mi empresa"
        titulo={empresa.razonSocial}
        lede={
          puedeEditar
            ? "Edita aquí y el cambio se refleja de inmediato en tu ficha del directorio. Sin formularios, sin esperas, sin doble digitación."
            : "Consulta los datos de tu empresa. La edición está a cargo del gerente registrado."
        }
        acciones={
          puedeEditar ? (
            <Boton onClick={() => { setGuardado(true); setTimeout(() => setGuardado(false), 2600); }}>
              {guardado ? <><Check size={16} aria-hidden /> Cambios guardados</> : "Guardar cambios"}
            </Boton>
          ) : undefined
        }
      />

      {guardado && (
        <div className="flex items-start gap-2 rounded-lg border border-line bg-success-bg px-4 py-3 text-[14px] text-success">
          <Check size={16} className="mt-0.5 shrink-0" aria-hidden />
          <p>Datos actualizados. Tu ficha del directorio ya muestra la nueva información.</p>
        </div>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-[1.5fr_1fr]">
        <section className="grid gap-5">
          <Card className="p-5 sm:p-6">
            <h2 className="font-display text-[18px] font-bold">Datos de la empresa</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Campo etiqueta="Razón social" valor={empresa.razonSocial} editable={puedeEditar} />
              <Campo etiqueta="NIT" valor={empresa.nit} editable={false} mono nota="Solo Operaciones puede modificarlo" />
              <Campo etiqueta="Ciudad" valor={empresa.ciudad} editable={puedeEditar} />
              <Campo etiqueta="Número de empleados" valor={String(empresa.empleados)} editable={puedeEditar} />
              <Campo etiqueta="Sitio web" valor={empresa.sitioWeb} editable={puedeEditar} />
              <Campo etiqueta="Categoría" valor={empresa.sector} editable={puedeEditar} />
              <div className="sm:col-span-2">
                <Campo etiqueta="Descripción para el directorio" valor={empresa.descripcion} editable={puedeEditar} area />
              </div>
            </div>
            <div className="mt-4 flex items-start gap-2 rounded-lg bg-[var(--info-bg)] px-3.5 py-3 text-[13.5px] text-info">
              <Info size={15} className="mt-0.5 shrink-0" aria-hidden />
              <p>Estos datos alimentan tu ficha del directorio público. No tienes que cargarlos dos veces.</p>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
              <h2 className="font-display text-[18px] font-bold">Contactos autorizados</h2>
              {puedeEditar && (
                <Boton variante="secundario" tamano="sm">
                  <UserPlus size={14} aria-hidden /> Invitar contacto
                </Boton>
              )}
            </div>
            <div className="divide-y divide-line">
              {empresa.contactos.map((c) => (
                <div key={c.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-bg text-[12px] font-bold text-muted">
                    {c.nombre.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                  </div>
                  <div className="min-w-[190px] flex-1">
                    <p className="font-semibold">{c.nombre}</p>
                    <p className="text-[13px] text-muted">{c.cargo}</p>
                  </div>
                  <div className="hidden min-w-[200px] text-[13px] text-muted sm:block">
                    <p className="flex items-center gap-1.5"><Mail size={12} aria-hidden /> {c.correo}</p>
                    <p className="flex items-center gap-1.5"><Phone size={12} aria-hidden /> {c.telefono}</p>
                  </div>
                  <Chip tono={c.rol === "gerente" ? "info" : c.rol === "talento" ? "exito" : "neutro"}>
                    {c.rol === "gerente" ? "Gerente" : c.rol === "talento" ? "Talento humano" : "Contacto"}
                  </Chip>
                  {!c.conAcceso && <Chip tono="neutro">Sin acceso</Chip>}
                </div>
              ))}
            </div>
          </Card>
        </section>

        <aside className="grid h-fit gap-5">
          <Card className="p-5">
            <Eyebrow>Tu afiliación</Eyebrow>
            <dl className="mt-3 grid gap-3 text-[14.5px]">
              <Dato termino="Tipo" valor={`Afiliado ${empresa.tipoAfiliacion}`} />
              <Dato termino="Segmento" valor={empresa.segmento === "grande" ? "Empresa grande" : "MIPYME"} />
              <Dato termino="Afiliada desde" valor={fecha(empresa.afiliadaDesde)} />
              <Dato termino="Vigente hasta" valor={fecha(empresa.vigenciaHasta)} />
              <Dato termino="Verticales" valor={empresa.verticales.join(", ") || "Ninguna"} />
            </dl>
          </Card>

          <Card className="p-5">
            <Eyebrow>Historial</Eyebrow>
            <ol className="mt-3 grid gap-3 text-[14px]">
              {[
                { f: "2026-01-12", t: "Renovación de afiliación 2026" },
                { f: "2025-04-03", t: "Actualización de contactos" },
                { f: "2021-03-15", t: "Activación de la afiliación" },
              ].map((h) => (
                <li key={h.f} className="flex gap-3">
                  <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <div>
                    <p className="font-semibold">{h.t}</p>
                    <p className="text-[13px] text-muted">{fecha(h.f)}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function Campo({
  etiqueta, valor, editable, mono = false, area = false, nota,
}: { etiqueta: string; valor: string; editable: boolean; mono?: boolean; area?: boolean; nota?: string }) {
  const id = etiqueta.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const clase = `w-full rounded-lg border px-3 py-2.5 text-[14.5px] ${mono ? "font-mono" : ""} ${
    editable ? "border-line bg-surface" : "border-line bg-surface-2 text-muted"
  }`;
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-[13px] font-semibold text-muted">{etiqueta}</label>
      {area ? (
        <textarea id={id} defaultValue={valor} readOnly={!editable} rows={3} className={clase} />
      ) : (
        <input id={id} defaultValue={valor} readOnly={!editable} className={clase} />
      )}
      {nota && <p className="text-[12.5px] text-muted">{nota}</p>}
    </div>
  );
}

function Dato({ termino, valor }: { termino: string; valor: string }) {
  return (
    <div className="flex flex-wrap justify-between gap-2 border-b border-line pb-2.5 last:border-0 last:pb-0">
      <dt className="text-muted">{termino}</dt>
      <dd className="font-semibold">{valor}</dd>
    </div>
  );
}
