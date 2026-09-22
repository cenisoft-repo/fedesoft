"use client";

import { useState } from "react";
import { Check, Clock, MapPin, Users, Video } from "lucide-react";
import { useDemo } from "@/lib/demo";
import { ACTIVIDADES, HISTORIAL_EQUIPO } from "@/lib/mock/catalogo";
import { fecha } from "@/lib/format";
import { Boton, Card, Chip, PageHeader, Vacio } from "@/components/ui/primitivos";

type Pestana = "catalogo" | "mias" | "equipo";

export default function Formacion() {
  const { escenario, inscripciones, alternarInscripcion } = useDemo();
  const [pestana, setPestana] = useState<Pestana>("catalogo");
  const [soloAbiertas, setSoloAbiertas] = useState(true);

  const puedeVerEquipo = escenario.rol === "gerente" || escenario.rol === "talento";
  const lista = ACTIVIDADES.filter((a) => (soloAbiertas ? a.estado === "abierto" : true));
  const mias = ACTIVIDADES.filter((a) => inscripciones.includes(a.id));

  const pestanas: { id: Pestana; etiqueta: string; contador?: number }[] = [
    { id: "catalogo", etiqueta: "Catálogo", contador: lista.length },
    { id: "mias", etiqueta: "Mis inscripciones", contador: mias.length },
    ...(puedeVerEquipo ? [{ id: "equipo" as const, etiqueta: "Historial del equipo", contador: HISTORIAL_EQUIPO.length }] : []),
  ];

  return (
    <div className="grid gap-7">
      <PageHeader
        eyebrow="Formación"
        titulo="TrainingLAB, TIC Talks y Series C+I"
        lede="Toda la oferta de actualización en un solo catálogo, con inscripción de un clic y el historial de tu equipo."
      />

      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line">
        <div role="tablist" aria-label="Vistas de formación" className="flex gap-1">
          {pestanas.map((p) => {
            const activa = p.id === pestana;
            return (
              <button
                key={p.id}
                role="tab"
                aria-selected={activa}
                onClick={() => setPestana(p.id)}
                className={`relative px-3 py-3 text-[14.5px] font-semibold transition ${
                  activa ? "text-ink" : "text-muted hover:text-ink"
                }`}
              >
                {p.etiqueta}
                {typeof p.contador === "number" && (
                  <span className="ml-1.5 rounded-full bg-bg px-1.5 py-0.5 text-[11.5px] text-muted">{p.contador}</span>
                )}
                {activa && <span aria-hidden className="absolute inset-x-2 bottom-0 h-[3px] rounded-t-full bg-accent" />}
              </button>
            );
          })}
        </div>
        {pestana === "catalogo" && (
          <label className="flex cursor-pointer items-center gap-2 pb-3 text-[13.5px] text-muted">
            <input
              type="checkbox"
              checked={soloAbiertas}
              onChange={(e) => setSoloAbiertas(e.target.checked)}
              className="h-4 w-4 accent-[var(--azure-700)]"
            />
            Solo inscripciones abiertas
          </label>
        )}
      </div>

      {pestana === "catalogo" && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {lista.map((a) => {
            const inscrito = inscripciones.includes(a.id);
            const lleno = a.inscritos >= a.cupos;
            const cerrado = a.estado === "finalizado";
            return (
              <Card key={a.id} className="flex flex-col p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Chip tono="info">{a.programa}</Chip>
                  {a.exclusivo && <Chip tono="neutro">Exclusivo afiliados</Chip>}
                  {cerrado && <Chip tono="neutro">Finalizado</Chip>}
                </div>
                <h3 className="mt-3 font-display text-[16px] font-bold leading-snug">{a.titulo}</h3>
                <dl className="mt-3 grid gap-1.5 text-[13.5px] text-muted">
                  <div className="flex items-center gap-1.5">
                    <Clock size={13} aria-hidden /> {fecha(a.fecha)}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {a.modalidad === "Virtual" ? <Video size={13} aria-hidden /> : <MapPin size={13} aria-hidden />}
                    {a.modalidad} · {a.conCosto ? "Con costo" : "Sin costo"}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users size={13} aria-hidden />
                    <span className="num">{a.inscritos}</span> de <span className="num">{a.cupos}</span> cupos
                  </div>
                </dl>
                <div className="mt-4 pt-1">
                  {cerrado ? (
                    <Boton variante="secundario" tamano="sm" className="w-full" disabled>
                      Ver grabación
                    </Boton>
                  ) : inscrito ? (
                    <Boton variante="secundario" tamano="sm" className="w-full" onClick={() => alternarInscripcion(a.id)}>
                      <Check size={14} aria-hidden /> Inscrito · cancelar
                    </Boton>
                  ) : lleno ? (
                    <Boton variante="secundario" tamano="sm" className="w-full" onClick={() => alternarInscripcion(a.id)}>
                      Entrar a lista de espera
                    </Boton>
                  ) : (
                    <Boton tamano="sm" className="w-full" onClick={() => alternarInscripcion(a.id)}>
                      Inscribirme
                    </Boton>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {pestana === "mias" && (
        <Card>
          {mias.length === 0 ? (
            <Vacio
              titulo="No tienes inscripciones activas"
              detalle="Cuando te inscribas a una actividad aparecerá aquí, junto con su fecha y su enlace de acceso."
              accion={<Boton variante="secundario" tamano="sm" onClick={() => setPestana("catalogo")}>Ver catálogo</Boton>}
            />
          ) : (
            <div className="divide-y divide-line">
              {mias.map((a) => (
                <div key={a.id} className="flex flex-wrap items-center gap-3 p-4">
                  <div className="min-w-[220px] flex-1">
                    <p className="font-semibold">{a.titulo}</p>
                    <p className="text-[13px] text-muted">{a.programa} · {fecha(a.fecha)} · {a.modalidad}</p>
                  </div>
                  <Chip tono={a.estado === "abierto" ? "info" : "neutro"}>
                    {a.estado === "abierto" ? "Próxima" : "Finalizada"}
                  </Chip>
                  <Boton variante="secundario" tamano="sm" onClick={() => alternarInscripcion(a.id)}>Cancelar</Boton>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {pestana === "equipo" && (
        <>
          <p className="max-w-[70ch] text-[15px] text-muted">
            Esto es lo que hoy no existe: saber quién de tu equipo participó en qué. La asistencia queda asociada a la
            empresa y al contacto.
          </p>
          <Card className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-[14.5px]">
              <thead>
                <tr className="border-b border-line text-left text-[11.5px] uppercase tracking-wider text-muted">
                  <th className="px-4 py-3 font-semibold">Contacto</th>
                  <th className="px-4 py-3 font-semibold">Actividad</th>
                  <th className="px-4 py-3 font-semibold">Fecha</th>
                  <th className="px-4 py-3 font-semibold">Asistencia</th>
                </tr>
              </thead>
              <tbody>
                {HISTORIAL_EQUIPO.map((h, i) => (
                  <tr key={i} className="border-b border-line last:border-0">
                    <td className="px-4 py-3.5 font-semibold">{h.contacto}</td>
                    <td className="px-4 py-3.5">{h.actividad}</td>
                    <td className="px-4 py-3.5 text-muted">{fecha(h.fecha)}</td>
                    <td className="px-4 py-3.5">
                      <Chip tono={h.asistio ? "exito" : "aviso"}>{h.asistio ? "Asistió" : "No asistió"}</Chip>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>
  );
}
