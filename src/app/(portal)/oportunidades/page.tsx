"use client";

import Link from "next/link";
import { Briefcase, CalendarClock, Lock } from "lucide-react";
import { useDemo } from "@/lib/demo";
import { OPORTUNIDADES } from "@/lib/mock/catalogo";
import { fecha } from "@/lib/format";
import { Boton, Card, Chip, PageHeader, Vacio } from "@/components/ui/primitivos";

const ESTADOS = {
  abierta: { tono: "info" as const, texto: "Abierta" },
  postulada: { tono: "exito" as const, texto: "Postulada" },
  "en-evaluacion": { tono: "aviso" as const, texto: "En evaluación" },
  cerrada: { tono: "neutro" as const, texto: "Cerrada" },
};

export default function Oportunidades() {
  const { escenario } = useDemo();
  const { empresa, rol } = escenario;

  if (rol !== "gerente") {
    return (
      <Card className="mx-auto max-w-[520px]">
        <div className="grid justify-items-center gap-3 px-6 py-14 text-center">
          <Lock size={22} className="text-muted" aria-hidden />
          <h1 className="font-display text-[20px] font-bold">Sección del rol de gerencia</h1>
          <p className="text-[15px] text-muted">Las postulaciones a oportunidades las gestiona el gerente registrado.</p>
          <Link href="/"><Boton variante="secundario">Volver al inicio</Boton></Link>
        </div>
      </Card>
    );
  }

  const aplican = OPORTUNIDADES.filter((o) => o.aplicaA.includes(empresa.segmento));

  return (
    <div className="grid gap-7">
      <PageHeader
        eyebrow="Oportunidades"
        titulo="Proyectos e internacionalización"
        lede={`Convocatorias gestionadas con Cenisoft, filtradas por el perfil de ${empresa.razonSocial}. Solo ves lo que te aplica.`}
      />

      {aplican.length === 0 ? (
        <Card>
          <Vacio
            titulo="No hay oportunidades abiertas para tu perfil"
            detalle="Te avisaremos cuando se publique una convocatoria que corresponda a tu sector y tamaño de empresa."
          />
        </Card>
      ) : (
        <div className="grid gap-4">
          {aplican.map((o) => {
            const estado = ESTADOS[o.estado];
            return (
              <Card key={o.id} className="p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[var(--info-bg)] text-info">
                      <Briefcase size={19} aria-hidden />
                    </div>
                    <div className="max-w-[62ch]">
                      <div className="flex flex-wrap items-center gap-2">
                        <Chip tono="neutro">{o.tipo}</Chip>
                        <Chip tono={estado.tono}>{estado.texto}</Chip>
                      </div>
                      <h2 className="mt-2 font-display text-[17px] font-bold">{o.titulo}</h2>
                      <p className="mt-1 text-[14px] text-muted">{o.entidad}</p>
                      <p className="mt-2 text-[14.5px] text-muted">{o.descripcion}</p>
                      <p className="mt-3 flex items-center gap-1.5 text-[13.5px] text-muted">
                        <CalendarClock size={13} aria-hidden /> Cierra el {fecha(o.cierra)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {o.estado === "abierta" ? (
                      <Boton>Postularme</Boton>
                    ) : (
                      <Boton variante="secundario">Ver seguimiento</Boton>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
