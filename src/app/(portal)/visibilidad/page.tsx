"use client";

import { useState } from "react";
import { BadgeCheck, Download, Eye, FileBarChart, Lock, Plus } from "lucide-react";
import { useDemo } from "@/lib/demo";
import { INSIGHTS, MIS_OFERTAS } from "@/lib/mock/catalogo";
import { fecha } from "@/lib/format";
import { Boton, Card, Chip, PageHeader, Seccion, Vacio } from "@/components/ui/primitivos";

type Pestana = "ficha" | "ofertas" | "insights";

export default function Visibilidad() {
  const { escenario } = useDemo();
  const { empresa, rol } = escenario;
  const [pestana, setPestana] = useState<Pestana>("ficha");
  const puedeEditar = rol === "gerente";
  const alDia = empresa.estado === "al-dia";

  const pestanas: { id: Pestana; etiqueta: string }[] = [
    { id: "ficha", etiqueta: "Mi ficha del directorio" },
    { id: "ofertas", etiqueta: "Mis publicaciones" },
    { id: "insights", etiqueta: "Insights del sector" },
  ];

  return (
    <div className="grid gap-10">
      <PageHeader
        eyebrow="Visibilidad"
        titulo="Tu presencia comercial ante el sector"
        lede="Tu ficha del directorio, lo que publicas para otros afiliados y la información sectorial a la que da derecho tu afiliación."
        imagen="visibilidad"
      />

      <div role="tablist" aria-label="Vistas de visibilidad" className="flex flex-wrap gap-1 border-b border-line">
        {pestanas.map((p) => {
          const activa = p.id === pestana;
          return (
            <button
              key={p.id}
              role="tab"
              aria-selected={activa}
              onClick={() => setPestana(p.id)}
              className={`relative px-3.5 py-3 text-[14.5px] font-semibold transition ${
                activa ? "text-ink" : "text-muted hover:text-ink"
              }`}
            >
              {p.etiqueta}
              {activa && <span aria-hidden className="absolute inset-x-2 bottom-0 h-[3px] rounded-t-full bg-accent" />}
            </button>
          );
        })}
      </div>

      {/* ── Ficha del directorio ─────────────────────────────────── */}
      {pestana === "ficha" && (
        <div className="grid items-start gap-8 lg:grid-cols-[1.4fr_1fr]">
          <Card className="overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-6 py-4">
              <p className="font-display text-[16px] font-semibold">Así te ve el directorio</p>
              {alDia ? (
                <Chip tono="exito"><BadgeCheck size={13} aria-hidden /> Verificada</Chip>
              ) : (
                <Chip tono="aviso">Sin verificar</Chip>
              )}
            </div>
            <div className="grid gap-5 p-6">
              <div>
                <h2 className="font-display text-[22px] font-semibold">{empresa.razonSocial}</h2>
                <p className="mt-1 text-[14px] text-muted">
                  {empresa.sector} · {empresa.ciudad} · <span className="num">{empresa.empleados}</span> empleados
                </p>
              </div>
              <p className="max-w-[54ch] text-[15px] leading-relaxed text-muted">{empresa.descripcion}</p>
              <div className="flex flex-wrap gap-2">
                {["Analítica", "Automatización", "IA"].map((s) => (
                  <span key={s} className="rounded-full border border-line px-3 py-1 text-[13px] text-muted">{s}</span>
                ))}
              </div>
            </div>
            <div className="border-t border-line px-6 py-4">
              <p className="text-[13.5px] text-muted">
                Esta ficha se arma sola con lo que registras en{" "}
                <span className="font-semibold text-ink">Mi empresa</span>. No hay que cargarla dos veces.
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <p className="text-[11.5px] font-semibold uppercase tracking-[0.16em] text-muted">Cómo se gana la insignia</p>
            <p className="mt-3 text-[14.5px] leading-relaxed text-muted">
              La marca de <strong className="text-ink">verificada</strong> no se solicita ni se otorga a mano: se
              deriva del estado real de tu afiliación. Si dejas de estar al día, desaparece sola; al regularizar,
              vuelve.
            </p>
            <div className="mt-5 border-t border-line pt-5">
              <p className="text-[11.5px] font-semibold uppercase tracking-[0.16em] text-muted">Tu estado</p>
              <p className="mt-2 text-[15px] font-semibold">
                {alDia ? "Al día · insignia activa" : "Vencida · insignia retirada"}
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* ── Publicaciones y ofertas ──────────────────────────────── */}
      {pestana === "ofertas" && (
        <section className="grid gap-5">
          <Seccion
            titulo="Tus publicaciones en #AfiliadosFedesoft"
            extra={puedeEditar ? <Boton tamano="sm"><Plus size={14} aria-hidden /> Nueva publicación</Boton> : undefined}
          />
          {MIS_OFERTAS.length === 0 ? (
            <Card><Vacio titulo="Aún no has publicado nada" detalle="Difunde tu oferta ante las demás empresas afiliadas." /></Card>
          ) : (
            <div className="grid gap-4">
              {MIS_OFERTAS.map((o) => (
                <Card key={o.id} className="p-5 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="max-w-[58ch]">
                      <div className="flex flex-wrap items-center gap-2">
                        <Chip tono={o.estado === "publicada" ? "exito" : o.estado === "en-revision" ? "aviso" : "neutro"}>
                          {o.estado === "publicada" ? "Publicada" : o.estado === "en-revision" ? "En revisión" : "Expirada"}
                        </Chip>
                        <Chip tono="neutro">{o.categoria}</Chip>
                      </div>
                      <h3 className="mt-2.5 font-display text-[17px] font-semibold">{o.titulo}</h3>
                      <p className="mt-1.5 text-[14.5px] leading-relaxed text-muted">{o.descripcion}</p>
                      <p className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-[13px] text-muted">
                        <span>Publicada el {fecha(o.publicada)}</span>
                        <span>{o.estado === "expirada" ? "Expiró" : "Expira"} el {fecha(o.expira)}</span>
                        {o.vistas > 0 && (
                          <span className="flex items-center gap-1.5">
                            <Eye size={13} aria-hidden /> <span className="num">{o.vistas}</span> vistas
                          </span>
                        )}
                      </p>
                    </div>
                    {puedeEditar && (
                      <Boton variante="secundario" tamano="sm">
                        {o.estado === "expirada" ? "Volver a publicar" : "Editar"}
                      </Boton>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
          <p className="max-w-[70ch] text-[13.5px] text-muted">
            Las publicaciones pasan por moderación del equipo de comunicaciones antes de aparecer, y expiran solas en
            la fecha que definas.
          </p>
        </section>
      )}

      {/* ── Insights del sector ──────────────────────────────────── */}
      {pestana === "insights" && (
        <section className="grid gap-5">
          <Seccion titulo="Información sectorial" />
          <div className="grid gap-4 sm:grid-cols-2">
            {INSIGHTS.map((i) => {
              const bloqueado = i.exclusivo && !alDia;
              return (
                <Card key={i.titulo} className={`flex flex-col p-6 ${bloqueado ? "opacity-70" : ""}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-info-bg text-info">
                      <FileBarChart size={18} aria-hidden />
                    </div>
                    {i.exclusivo ? <Chip tono="neutro">Exclusivo afiliados</Chip> : <Chip tono="neutro">Abierto</Chip>}
                  </div>
                  <h3 className="mt-4 font-display text-[17px] font-semibold leading-snug">{i.titulo}</h3>
                  <p className="mt-2 flex-1 text-[14.5px] leading-relaxed text-muted">{i.descripcion}</p>
                  <p className="mt-4 text-[13px] text-muted">
                    {i.tipo} · actualizado el {fecha(i.actualizado)}
                  </p>
                  <div className="mt-5">
                    {bloqueado ? (
                      <p className="flex items-center gap-2 text-[13.5px] text-muted">
                        <Lock size={14} className="shrink-0" aria-hidden />
                        Disponible con la afiliación al día
                      </p>
                    ) : (
                      <Boton variante="secundario" tamano="sm">
                        <Download size={14} aria-hidden /> Descargar
                      </Boton>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
