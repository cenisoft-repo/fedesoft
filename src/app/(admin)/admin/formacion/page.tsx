"use client";

import { useState } from "react";
import { MapPin, UsersRound, Video } from "lucide-react";
import { ACTIVIDADES, COMUNIDADES } from "@/lib/mock/catalogo";
import { fecha } from "@/lib/format";
import { useAccesoConsola } from "@/lib/useAcceso";
import { AvisoEnfocado, AvisoNivel, Ocupacion } from "@/components/admin/AvisoNivel";
import { Boton, Card, Chip, Cifra, PageHeader, Seccion } from "@/components/ui/primitivos";

export default function FormacionConsola() {
  const { nivel } = useAccesoConsola("formacion");
  const gestiona = nivel === "gestiona";
  /* Inscripciones cerradas en esta sesión de la demostración. */
  const [cerradas, setCerradas] = useState<string[]>([]);
  const [aviso, setAviso] = useState<string | null>(null);

  const abiertas = ACTIVIDADES.filter((a) => a.estado === "abierto" && !cerradas.includes(a.id));
  const inscritos = ACTIVIDADES.filter((a) => a.estado === "abierto").reduce((s, a) => s + a.inscritos, 0);
  const cupos = ACTIVIDADES.filter((a) => a.estado === "abierto").reduce((s, a) => s + a.cupos, 0);

  const cerrar = (id: string, titulo: string) => {
    setCerradas((c) => [...c, id]);
    setAviso(`Inscripciones cerradas en «${titulo}». Los inscritos reciben la confirmación y el cambio queda en auditoría.`);
  };

  return (
    <div className="grid gap-8">
      <PageHeader
        eyebrow="Formación y comunidades"
        titulo="Programación de formación"
        lede="TrainingLAB, TIC Talks y Series C+I en un solo tablero: cupos, inscripciones y asistencia de las empresas afiliadas."
      />

      <AvisoNivel
        nivel={nivel}
        detalle={nivel === "asignadas"
          ? "Ves la oferta; la participación de tus empresas está en su ficha 360."
          : "Programar sesiones y cerrar inscripciones le corresponde al equipo de Formación."}
      />
      <AvisoEnfocado mensaje={aviso} />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5"><Cifra etiqueta="Sesiones abiertas" valor={String(abiertas.length)} tamano="sm" /></Card>
        <Card className="p-5"><Cifra etiqueta="Inscritos" valor={String(inscritos)} tamano="sm" detalle="En las sesiones abiertas" /></Card>
        <Card className="p-5"><Cifra etiqueta="Ocupación" valor={`${Math.round((inscritos / cupos) * 100)}%`} tamano="sm" detalle={`${cupos} cupos ofrecidos`} /></Card>
        <Card className="p-5"><Cifra etiqueta="Asistencia efectiva" valor="72%" tamano="sm" detalle="Meta: 80%" /></Card>
      </div>

      <section className="grid gap-3">
        <Seccion titulo="Sesiones" />
        <Card className="divide-y divide-line">
          {ACTIVIDADES.map((a) => {
            const cerrada = a.estado === "finalizado" || cerradas.includes(a.id);
            const llena = a.inscritos >= a.cupos;
            return (
              <div key={a.id} className="grid gap-3 p-4 md:grid-cols-[1fr_180px_auto] md:items-center">
                <div className="min-w-0">
                  <p className="text-[15px] font-semibold leading-snug">{a.titulo}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-muted">
                    <Chip tono="neutro">{a.programa}</Chip>
                    <span>{fecha(a.fecha)}</span>
                    <span className="inline-flex items-center gap-1">
                      {a.modalidad === "Virtual" ? <Video size={13} aria-hidden /> : <MapPin size={13} aria-hidden />}
                      {a.modalidad}
                    </span>
                    {a.exclusivo && <span>· Exclusivo afiliados</span>}
                  </p>
                </div>
                <Ocupacion usados={a.inscritos} total={a.cupos} />
                <div className="flex items-center gap-2 md:justify-end">
                  {a.estado === "finalizado" ? (
                    <Chip tono="neutro">Finalizada</Chip>
                  ) : cerrada ? (
                    <Chip tono="aviso">Inscripciones cerradas</Chip>
                  ) : llena ? (
                    <Chip tono="aviso">Cupo lleno</Chip>
                  ) : (
                    <Chip tono="exito">Abierta</Chip>
                  )}
                  {gestiona && !cerrada && (
                    <Boton variante="secundario" tamano="sm" onClick={() => cerrar(a.id, a.titulo)}>
                      Cerrar inscripciones
                    </Boton>
                  )}
                </div>
              </div>
            );
          })}
        </Card>
      </section>

      <section className="grid gap-3">
        <Seccion titulo="Comunidades" />
        <div className="grid gap-4 md:grid-cols-3">
          {COMUNIDADES.map((c) => (
            <Card key={c.id} className="grid gap-3 p-5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display text-[16px] font-bold leading-snug">{c.nombre}</h3>
                <UsersRound size={18} className="shrink-0 text-accent" aria-hidden />
              </div>
              <Ocupacion usados={c.miembros} total={c.cupos} />
              <p className="text-[13.5px] text-muted">
                Próxima sesión: <span className="font-semibold text-ink">{fecha(c.proxima)}</span> · {c.temaProxima}
              </p>
              <p className="text-[13px] text-muted">
                {c.requiereAprobacion ? "El ingreso requiere aprobación del equipo de Formación." : "Ingreso libre para el rol elegible."}
              </p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
