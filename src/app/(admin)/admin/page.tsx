"use client";

import Link from "next/link";
import { Building2, ChevronRight, FileText, GraduationCap, History, Receipt, ShieldCheck, Target } from "lucide-react";
import { DATALABS } from "@/lib/mock/empresas";
import { HISTORIAL_EQUIPO } from "@/lib/mock/catalogo";
import { cop, fecha, truncar } from "@/lib/format";
import { Boton, Card, Chip, Eyebrow } from "@/components/ui/primitivos";

const e = DATALABS;

const AUDITORIA = [
  { actor: "Camilo Restrepo (afiliado)", accion: "Actualizó los datos de la empresa", cuando: "2026-09-20 14:32" },
  { actor: "Sistema", accion: "Emitió certificado FS-2026-00184", cuando: "2026-09-18 09:07" },
  { actor: "Sistema", accion: "Aplicó pago y emitió factura FES-8841", cuando: "2025-10-08 11:15" },
  { actor: "Operaciones · L. Mejía", accion: "Aprobó la afiliación (acta JD-2021-04)", cuando: "2021-03-15 16:40" },
];

export default function Admin() {
  return (
    <div className="grid gap-6">
      <nav aria-label="Ruta" className="flex flex-wrap items-center gap-1.5 text-[13.5px] text-muted">
        <span className="font-semibold">Afiliados</span>
        <ChevronRight size={14} aria-hidden />
        <span className="text-ink">{e.razonSocial}</span>
        <span className="ml-auto">
          Una de <span className="num font-semibold text-ink">518</span> afiliadas. En el prototipo se abre
          directamente esta ficha.
        </span>
      </nav>

      <header className="grid gap-3 border-b border-line pb-6">
        <Eyebrow>Ficha 360 de la empresa</Eyebrow>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-[clamp(26px,3.8vw,38px)] font-light leading-[1.1]">{e.razonSocial}</h1>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 text-[15px] text-muted">
              <span className="font-mono">{e.nit}</span>
              <span aria-hidden>·</span> {e.ciudad}
              <span aria-hidden>·</span> <span className="num">{e.empleados}</span> empleados
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Chip tono="exito"><ShieldCheck size={13} aria-hidden /> Al día</Chip>
            <Chip tono="neutro">MIPYME</Chip>
            <Chip tono="neutro">Afiliado {e.tipoAfiliacion}</Chip>
          </div>
        </div>
        <p className="max-w-[72ch] text-[14.5px] text-muted">
          Todo el contexto del afiliado en una pantalla, leído de cada dominio. El equipo no consulta cuatro sistemas ni
          hojas de cálculo: ve lo mismo que el afiliado, más lo que solo le corresponde a Fedesoft.
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-3">
        <Panel
          titulo="Cartera"
          icono={Receipt}
          pie={
            <Link href="/admin/cartera" className="inline-flex items-center gap-1 text-[13.5px] font-semibold text-link hover:underline">
              Ver en el tablero de cartera <ChevronRight size={14} aria-hidden />
            </Link>
          }
        >
          <Fila termino="Cuota 2026" valor={cop(e.cargos[0].monto)} />
          <Fila termino="Vence" valor={fecha(e.cargos[0].vence)} />
          <Fila termino="Última factura" valor={e.facturas[0].numero} />
          <Fila termino="CUFE" valor={truncar(e.facturas[0].cufe, 10, 6)} mono />
        </Panel>

        <Panel titulo="Afiliación" icono={Building2}>
          <Fila termino="Desde" valor={fecha(e.afiliadaDesde)} />
          <Fila termino="Vigente hasta" valor={fecha(e.vigenciaHasta)} />
          <Fila termino="Contactos" valor={`${e.contactos.length} (${e.contactos.filter((c) => c.conAcceso).length} con acceso)`} />
          <Fila termino="Verticales" valor={e.verticales.join(", ")} />
        </Panel>

        <Panel titulo="Participación" icono={Target}>
          <Fila termino="Formación 2026" valor={`${HISTORIAL_EQUIPO.length} registros`} />
          <Fila termino="Asistencia" valor={`${HISTORIAL_EQUIPO.filter((h) => h.asistio).length} de ${HISTORIAL_EQUIPO.length}`} />
          <Fila termino="Comunidades" valor="2 activas" />
          <Fila termino="Directorio" valor="Publicada y verificada" />
        </Panel>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-2">
        <section className="grid gap-3">
          <h2 className="flex items-center gap-2 text-[18px] font-extrabold">
            <GraduationCap size={18} className="text-accent" aria-hidden /> Participación del equipo
          </h2>
          <Card className="divide-y divide-line">
            {HISTORIAL_EQUIPO.slice(0, 4).map((h, i) => (
              <div key={i} className="flex flex-wrap items-center gap-3 p-3.5">
                <div className="min-w-[180px] flex-1">
                  <p className="text-[14.5px] font-semibold">{h.contacto}</p>
                  <p className="text-[13px] text-muted">{h.actividad}</p>
                </div>
                <span className="text-[13px] text-muted">{fecha(h.fecha)}</span>
                <Chip tono={h.asistio ? "exito" : "aviso"}>{h.asistio ? "Asistió" : "No asistió"}</Chip>
              </div>
            ))}
          </Card>
        </section>

        <section className="grid gap-3">
          <h2 className="flex items-center gap-2 text-[18px] font-extrabold">
            <History size={18} className="text-accent" aria-hidden /> Auditoría
          </h2>
          <Card className="divide-y divide-line">
            {AUDITORIA.map((a, i) => (
              <div key={i} className="p-3.5">
                <p className="text-[14.5px] font-semibold">{a.accion}</p>
                <p className="text-[13px] text-muted">
                  {a.actor} · <span className="font-mono">{a.cuando}</span>
                </p>
              </div>
            ))}
            <div className="flex items-center gap-2 p-3.5 text-[13px] text-muted">
              <FileText size={14} aria-hidden /> Registro de solo adición: no se edita desde ninguna pantalla.
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}

function Panel({
  titulo,
  icono: Icono,
  children,
  pie,
}: {
  titulo: string;
  icono: typeof Receipt;
  children: React.ReactNode;
  pie?: React.ReactNode;
}) {
  return (
    <Card className="p-5">
      <h2 className="flex items-center gap-2 font-display text-[16px] font-bold">
        <Icono size={16} className="text-accent" aria-hidden /> {titulo}
      </h2>
      <dl className="mt-3 grid gap-2.5 text-[14px]">{children}</dl>
      {pie ? <div className="mt-3">{pie}</div> : null}
    </Card>
  );
}

function Fila({ termino, valor, mono = false }: { termino: string; valor: string; mono?: boolean }) {
  return (
    <div className="flex flex-wrap justify-between gap-2 border-b border-line pb-2 last:border-0 last:pb-0">
      <dt className="text-muted">{termino}</dt>
      <dd className={`font-semibold ${mono ? "font-mono text-[13px]" : ""}`}>{valor}</dd>
    </div>
  );
}
