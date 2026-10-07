"use client";

import { useMemo, useState } from "react";
import { Download, FileText, Search } from "lucide-react";
import { AUDITORIA_CONSOLA, type EventoConsola } from "@/lib/mock/consola";
import { ASIGNACIONES_KAM } from "@/lib/mock/usuarios";
import { NOMBRE_AREA, areasPropias, type Area } from "@/lib/acceso";
import { useAccesoConsola } from "@/lib/useAcceso";
import { useIdentidad } from "@/lib/identidad";
import { Aviso } from "@/components/ui/Dialogo";
import { AvisoNivel } from "@/components/admin/AvisoNivel";
import { Boton, Card, Chip, PageHeader, Vacio } from "@/components/ui/primitivos";

export default function AuditoriaConsola() {
  const { nivel, roles, operadorId } = useAccesoConsola("auditoria");
  const { auditoria } = useIdentidad();
  const [area, setArea] = useState<Area | "todas">("todas");
  const [q, setQ] = useState("");
  const [aviso, setAviso] = useState<string | null>(null);

  /* Lo de esta sesión de la demostración (accesos, roles, bloqueos) entra al
     mismo registro que lo histórico: es un solo log de solo adición. */
  const eventos = useMemo<EventoConsola[]>(() => {
    const vivos: EventoConsola[] = auditoria.map((e) => ({
      id: `vivo-${e.id}`,
      area: e.empresa ? "afiliacion" : "usuarios",
      cuando: e.cuando,
      actor: e.actor,
      accion: e.accion,
      empresa: e.empresa ?? undefined,
      ip: "Este navegador",
    }));
    const todos = [...vivos, ...AUDITORIA_CONSOLA];
    if (nivel === "propia") {
      const propias = areasPropias(roles) ?? [];
      return todos.filter((e) => propias.includes(e.area));
    }
    if (nivel === "asignadas") {
      const suyas = ASIGNACIONES_KAM[operadorId ?? ""] ?? [];
      return todos.filter((e) => e.empresa && suyas.includes(e.empresa));
    }
    return todos;
  }, [auditoria, nivel, roles, operadorId]);

  const areas = [...new Set(eventos.map((e) => e.area))];
  const t = q.trim().toLowerCase();
  const lista = eventos
    .filter((e) => area === "todas" || e.area === area)
    .filter((e) => !t || e.accion.toLowerCase().includes(t) || e.actor.toLowerCase().includes(t))
    .sort((a, b) => b.cuando.localeCompare(a.cuando));

  return (
    <div className="grid gap-7">
      <PageHeader
        eyebrow="Auditoría"
        titulo="Registro de auditoría"
        lede="Quién hizo qué, cuándo y desde dónde. Es de solo adición: ninguna pantalla lo edita ni lo borra."
        acciones={
          nivel === "gestiona" ? (
            <Boton
              variante="secundario"
              tamano="sm"
              onClick={() => setAviso(`Exportación generada con ${lista.length} eventos. La propia exportación queda registrada.`)}
            >
              <Download size={15} aria-hidden /> Exportar
            </Boton>
          ) : undefined
        }
      />

      <AvisoNivel
        nivel={nivel}
        detalle={nivel === "propia"
          ? "Ves los eventos de tu área de trabajo."
          : nivel === "asignadas"
            ? "Ves los eventos de tus empresas asignadas."
            : "Exportar el registro les corresponde a Super Admin y Auditoría."}
      />
      {aviso && <Aviso ok>{aviso}</Aviso>}

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
          <label htmlFor="buscar-auditoria" className="sr-only">Buscar en la auditoría</label>
          <input
            id="buscar-auditoria"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por acción o persona"
            className="w-full rounded-lg border border-line bg-surface py-2.5 pl-9 pr-3 text-[14.5px]"
          />
        </div>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrar por área">
          {(["todas", ...areas] as const).map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setArea(a)}
              aria-pressed={area === a}
              className={`rounded-full border px-3 py-1.5 text-[13px] font-semibold transition ${
                area === a ? "border-accent bg-[var(--info-bg)] text-ink" : "border-line text-muted hover:text-ink"
              }`}
            >
              {a === "todas" ? "Todas" : NOMBRE_AREA[a]}
            </button>
          ))}
        </div>
      </div>

      {lista.length === 0 ? (
        <Vacio titulo="Sin eventos para mostrar" detalle="Prueba con otra búsqueda o con otra área." />
      ) : (
        <Card className="divide-y divide-line">
          {lista.map((e) => (
            <div key={e.id} className="grid gap-1 p-4 md:grid-cols-[1fr_auto] md:items-center">
              <div className="min-w-0">
                <p className="text-[14.5px] font-semibold">{e.accion}</p>
                <p className="text-[13px] text-muted">
                  {e.actor} · <span className="font-mono">{e.cuando}</span> · IP <span className="font-mono">{e.ip}</span>
                </p>
              </div>
              <Chip tono="neutro">{NOMBRE_AREA[e.area]}</Chip>
            </div>
          ))}
          <p className="flex items-center gap-2 p-4 text-[13px] text-muted">
            <FileText size={14} aria-hidden /> Registro de solo adición: no se edita desde ninguna pantalla.
          </p>
        </Card>
      )}
    </div>
  );
}
