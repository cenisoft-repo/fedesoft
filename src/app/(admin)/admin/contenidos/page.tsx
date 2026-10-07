"use client";

import { useState } from "react";
import { Check, Send, X } from "lucide-react";
import { CAMPANAS, MODERACION, type Campana } from "@/lib/mock/consola";
import { INSIGHTS } from "@/lib/mock/catalogo";
import { fecha } from "@/lib/format";
import { useAccesoConsola } from "@/lib/useAcceso";
import { nivelContenidos } from "@/lib/acceso";
import { AvisoEnfocado, AvisoNivel } from "@/components/admin/AvisoNivel";
import { Boton, Card, Chip, PageHeader, Seccion, Vacio } from "@/components/ui/primitivos";

const ESTADO_CAMPANA: Record<Campana["estado"], { tono: "neutro" | "info" | "exito"; texto: string }> = {
  borrador: { tono: "neutro", texto: "Borrador" },
  programada: { tono: "info", texto: "Programada" },
  enviada: { tono: "exito", texto: "Enviada" },
};

export default function ContenidosConsola() {
  const { nivel, roles } = useAccesoConsola("contenidos");
  /* Simulado: un nivel por recurso. Modo API: el del módulo, que decide el servidor. */
  const nivelCampanas = roles.length ? nivelContenidos(roles, "campanas") : nivel;
  const nivelDirectorio = roles.length ? nivelContenidos(roles, "directorio") : nivel;
  const gestionaCampanas = nivelCampanas === "gestiona";
  const gestionaDirectorio = nivelDirectorio === "gestiona";
  const [campanas, setCampanas] = useState(CAMPANAS);
  const [pendientes, setPendientes] = useState(MODERACION);
  const [aviso, setAviso] = useState<string | null>(null);

  const programar = (id: string) => {
    setCampanas((cs) => cs.map((c) => (c.id === id ? { ...c, estado: "programada" } : c)));
    setAviso("Campaña programada. Sale en la fecha indicada y su envío queda en auditoría.");
  };

  const moderar = (id: string, aprobada: boolean) => {
    const item = pendientes.find((p) => p.id === id);
    setPendientes((ps) => ps.filter((p) => p.id !== id));
    setAviso(
      aprobada
        ? `«${item?.titulo}» quedó publicada en #AfiliadosFedesoft.`
        : `«${item?.titulo}» se devolvió a ${item?.empresa} con el motivo del rechazo.`,
    );
  };

  return (
    <div className="grid gap-8">
      <PageHeader
        eyebrow="Comunicaciones · Contenido"
        titulo="Comunicaciones y contenido"
        lede="Campañas a los afiliados, los insights publicados y la moderación de lo que las empresas publican en el directorio."
      />

      <AvisoNivel
        nivel={gestionaCampanas || gestionaDirectorio ? "gestiona" : (nivelCampanas ?? nivelDirectorio)}
        detalle="Programar campañas y moderar publicaciones le corresponde a Comunicaciones."
      />
      <AvisoEnfocado mensaje={aviso} />

      {nivelCampanas && (
      <section className="grid gap-3">
        <Seccion titulo="Campañas" />
        <Card className="divide-y divide-line">
          {campanas.map((c) => (
            <div key={c.id} className="grid gap-2 p-4 md:grid-cols-[1fr_auto] md:items-center">
              <div className="min-w-0">
                <p className="text-[15px] font-semibold">{c.titulo}</p>
                <p className="mt-1 text-[13px] text-muted">
                  {c.canal} · {c.audiencia} · {fecha(c.fecha)}
                  {c.apertura !== undefined && <> · <span className="num font-semibold text-ink">{c.apertura}%</span> de apertura</>}
                </p>
              </div>
              <div className="flex items-center gap-2 md:justify-end">
                <Chip tono={ESTADO_CAMPANA[c.estado].tono}>{ESTADO_CAMPANA[c.estado].texto}</Chip>
                {gestionaCampanas && c.estado === "borrador" && (
                  <Boton variante="secundario" tamano="sm" onClick={() => programar(c.id)}>
                    <Send size={14} aria-hidden /> Programar
                  </Boton>
                )}
              </div>
            </div>
          ))}
        </Card>
      </section>
      )}

      {nivelDirectorio && (
      <div className="grid items-start gap-8 lg:grid-cols-2">
        <section className="grid gap-3">
          <Seccion
            titulo="Moderación del directorio"
            extra={<span className="num text-[14px] text-muted">{pendientes.length} pendientes</span>}
          />
          {pendientes.length === 0 ? (
            <Vacio titulo="Nada por moderar" detalle="Las nuevas publicaciones de los afiliados aparecerán aquí antes de salir al directorio." />
          ) : (
            <Card className="divide-y divide-line">
              {pendientes.map((p) => (
                <div key={p.id} className="grid gap-2 p-4">
                  <p className="text-[15px] font-semibold leading-snug">{p.titulo}</p>
                  <p className="text-[13px] text-muted">{p.empresa} · {p.categoria} · enviada el {fecha(p.enviada)}</p>
                  {gestionaDirectorio && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Boton tamano="sm" onClick={() => moderar(p.id, true)}><Check size={14} aria-hidden /> Publicar</Boton>
                      <Boton variante="fantasma" tamano="sm" onClick={() => moderar(p.id, false)}><X size={14} aria-hidden /> Devolver</Boton>
                    </div>
                  )}
                </div>
              ))}
            </Card>
          )}
        </section>

        <section className="grid gap-3">
          <Seccion titulo="Insights publicados" />
          <Card className="divide-y divide-line">
            {INSIGHTS.map((i) => (
              <div key={i.titulo} className="grid gap-1 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[15px] font-semibold">{i.titulo}</p>
                  {i.exclusivo && <Chip tono="info">Exclusivo afiliados</Chip>}
                </div>
                <p className="text-[13px] text-muted">{i.tipo} · actualizado el {fecha(i.actualizado)}</p>
              </div>
            ))}
          </Card>
        </section>
      </div>
      )}
    </div>
  );
}
