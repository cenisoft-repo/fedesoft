"use client";

import { useState } from "react";
import { CalendarDays, Network } from "lucide-react";
import { OPORTUNIDADES, VERTICALES } from "@/lib/mock/catalogo";
import { VERTICE } from "@/lib/mock/empresas";
import { fecha } from "@/lib/format";
import { useAccesoConsola } from "@/lib/useAcceso";
import { AvisoEnfocado, AvisoNivel } from "@/components/admin/AvisoNivel";
import { Boton, Card, Chip, PageHeader, Seccion } from "@/components/ui/primitivos";

/** Postulaciones recibidas por convocatoria (simulado). */
const POSTULACIONES: Record<string, number> = { o1: 17, o2: 12, o3: 8, o4: 4 };

const ESTADO = {
  abierta: { tono: "info" as const, texto: "Abierta" },
  postulada: { tono: "info" as const, texto: "Abierta" },
  "en-evaluacion": { tono: "aviso" as const, texto: "En evaluación" },
  cerrada: { tono: "neutro" as const, texto: "Cerrada" },
};

export default function RelacionamientoConsola() {
  const { nivel } = useAccesoConsola("relacionamiento");
  const gestiona = nivel === "gestiona";
  const asignadas = nivel === "asignadas";
  const [cerradas, setCerradas] = useState<string[]>([]);
  const [aviso, setAviso] = useState<string | null>(null);

  /* El gestor de cuenta ve lo que toca a sus empresas: las verticales donde
     participan y las convocatorias abiertas a su segmento. */
  const verticales = asignadas ? VERTICALES.filter((v) => VERTICE.verticales.includes(v.nombre)) : VERTICALES;
  const oportunidades = asignadas ? OPORTUNIDADES.filter((o) => o.aplicaA.includes("grande")) : OPORTUNIDADES;

  const cerrar = (id: string, titulo: string) => {
    setCerradas((c) => [...c, id]);
    setAviso(`«${titulo}» pasó a evaluación. Las empresas postuladas reciben el aviso y el cambio queda en auditoría.`);
  };

  return (
    <div className="grid gap-8">
      <PageHeader
        eyebrow="Relacionamiento · Verticales y Cenisoft"
        titulo="Verticales y oportunidades"
        lede="Las mesas de cada vertical y las convocatorias que Fedesoft y Cenisoft abren para las empresas afiliadas."
      />

      <AvisoNivel
        nivel={nivel}
        detalle={asignadas
          ? "Ves las verticales y convocatorias que tocan a tus empresas asignadas."
          : "Publicar y cerrar convocatorias le corresponde a Relacionamiento."}
      />
      <AvisoEnfocado mensaje={aviso} />

      <section className="grid gap-3">
        <Seccion titulo="Verticales" extra={<span className="num text-[14px] text-muted">{verticales.length}</span>} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {verticales.map((v) => (
            <Card key={v.nombre} className="grid gap-2 p-5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display text-[17px] font-bold">Vertical {v.nombre}</h3>
                <Network size={18} className="shrink-0 text-accent" aria-hidden />
              </div>
              <p className="num text-[13.5px] text-muted">
                <span className="font-semibold text-ink">{v.participantes}</span> empresas · {v.mesas} mesas en 2026
              </p>
              <p className="flex items-start gap-1.5 text-[13.5px] text-muted">
                <CalendarDays size={14} className="mt-0.5 shrink-0" aria-hidden />
                <span>{fecha(v.proxima)} · {v.temaProxima}</span>
              </p>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-3">
        <Seccion titulo="Convocatorias" />
        <Card className="divide-y divide-line">
          {oportunidades.map((o) => {
            const estado = cerradas.includes(o.id) ? ESTADO["en-evaluacion"] : ESTADO[o.estado];
            const abierta = !cerradas.includes(o.id) && (o.estado === "abierta" || o.estado === "postulada");
            return (
              <div key={o.id} className="grid gap-2 p-4 md:grid-cols-[1fr_auto] md:items-center">
                <div className="min-w-0">
                  <p className="text-[15px] font-semibold">{o.titulo}</p>
                  <p className="mt-1 text-[13px] text-muted">
                    {o.entidad} · {o.tipo} · cierra el {fecha(o.cierra)} ·{" "}
                    <span className="num font-semibold text-ink">{POSTULACIONES[o.id] ?? 0}</span> postulaciones
                  </p>
                </div>
                <div className="flex items-center gap-2 md:justify-end">
                  <Chip tono={estado.tono}>{estado.texto}</Chip>
                  {gestiona && abierta && (
                    <Boton variante="secundario" tamano="sm" onClick={() => cerrar(o.id, o.titulo)}>
                      Pasar a evaluación
                    </Boton>
                  )}
                </div>
              </div>
            );
          })}
        </Card>
      </section>
    </div>
  );
}
