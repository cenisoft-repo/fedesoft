"use client";

import { useState } from "react";
import { ArrowDownRight, ArrowRight, ArrowUpRight, Download } from "lucide-react";
import { INDICADORES, type Indicador } from "@/lib/mock/consola";
import { NOMBRE_AREA, areasPropias, type Area } from "@/lib/acceso";
import { useAccesoConsola } from "@/lib/useAcceso";
import { Aviso } from "@/components/ui/Dialogo";
import { AvisoNivel } from "@/components/admin/AvisoNivel";
import { Boton, Card, PageHeader, Seccion } from "@/components/ui/primitivos";

const TENDENCIA: Record<Indicador["tendencia"], { icono: typeof ArrowUpRight; texto: string }> = {
  sube: { icono: ArrowUpRight, texto: "Sube" },
  baja: { icono: ArrowDownRight, texto: "Baja" },
  estable: { icono: ArrowRight, texto: "Estable" },
};

export default function ResultadosConsola() {
  const { nivel, roles } = useAccesoConsola("resultados");
  const [aviso, setAviso] = useState<string | null>(null);

  /* Dirección y Auditoría ven todo y exportan; cada área, sus propios
     indicadores; el gestor de cuenta, los de cuentas estratégicas. */
  const visibles: Area[] | null =
    nivel === "propia" ? areasPropias(roles) : nivel === "asignadas" ? ["cuentas"] : null;
  const indicadores = INDICADORES.filter((i) => !visibles || visibles.includes(i.area));
  const areas = [...new Set(indicadores.map((i) => i.area))];

  return (
    <div className="grid gap-8">
      <PageHeader
        eyebrow="Analítica y resultados"
        titulo={visibles ? "Resultados de tu área" : "Resultados del gremio"}
        lede="Los indicadores salen del esquema de analítica, derivado y de solo lectura: nadie los edita a mano."
        acciones={
          nivel === "gestiona" ? (
            <Boton
              variante="secundario"
              tamano="sm"
              onClick={() => setAviso("Exportación generada: indicadores-2026-09.csv. La descarga queda en auditoría con tu nombre.")}
            >
              <Download size={15} aria-hidden /> Exportar
            </Boton>
          ) : undefined
        }
      />

      <AvisoNivel
        nivel={nivel}
        detalle={nivel === "consulta"
          ? "Exportar los resultados les corresponde a Dirección y Auditoría."
          : "Ves los indicadores de tu área; el tablero completo es de Dirección."}
      />
      {aviso && <Aviso ok>{aviso}</Aviso>}

      {areas.map((area) => (
        <section key={area} className="grid gap-3">
          <Seccion titulo={NOMBRE_AREA[area]} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {indicadores.filter((i) => i.area === area).map((i) => {
              const T = TENDENCIA[i.tendencia];
              return (
                <Card key={i.nombre} className="grid gap-2 p-5">
                  <p className="text-[11.5px] font-semibold uppercase tracking-[0.16em] text-muted">{i.nombre}</p>
                  <p className="num font-display text-[34px] font-light leading-none tracking-[-0.03em]">{i.valor}</p>
                  <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13.5px] text-muted">
                    <span className="inline-flex items-center gap-1 font-semibold text-ink">
                      <T.icono size={14} className="text-accent" aria-hidden /> {T.texto}
                    </span>
                    {i.meta && <span>Meta: <span className="num">{i.meta}</span></span>}
                  </p>
                  <p className="text-[13.5px] text-muted">{i.nota}</p>
                </Card>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
