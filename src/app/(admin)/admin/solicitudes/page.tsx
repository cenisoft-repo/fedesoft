"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle, Building2, Check, CircleDashed, FileWarning, Mail,
  MapPin, Phone, Settings2, Sliders, Users, X,
} from "lucide-react";
import {
  PARAMETRO_CUOTA, SOLICITUDES, tarifaPara,
  type EstadoSolicitud, type Solicitud,
} from "@/lib/mock/admin";
import { cop, diasHasta, fecha } from "@/lib/format";
import { Boton, Card, Chip, Eyebrow, PageHeader, Vacio } from "@/components/ui/primitivos";

const ESTADOS: { id: EstadoSolicitud | "todas"; etiqueta: string }[] = [
  { id: "todas", etiqueta: "Todas" },
  { id: "nueva", etiqueta: "Nuevas" },
  { id: "en-revision", etiqueta: "En revisión" },
  { id: "info-solicitada", etiqueta: "Información pedida" },
  { id: "aprobada", etiqueta: "Aprobadas" },
  { id: "rechazada", etiqueta: "Rechazadas" },
];

const TONO: Record<EstadoSolicitud, { tono: "exito" | "aviso" | "error" | "info" | "neutro"; texto: string }> = {
  nueva: { tono: "info", texto: "Nueva" },
  "en-revision": { tono: "aviso", texto: "En revisión" },
  "info-solicitada": { tono: "aviso", texto: "Información pedida" },
  aprobada: { tono: "exito", texto: "Aprobada" },
  rechazada: { tono: "error", texto: "Rechazada" },
};

export default function Solicitudes() {
  const [filtro, setFiltro] = useState<EstadoSolicitud | "todas">("todas");
  const [abierta, setAbierta] = useState<string>(SOLICITUDES[0].radicado);
  const [resueltas, setResueltas] = useState<Record<string, EstadoSolicitud>>({});
  const [verParametro, setVerParametro] = useState(false);

  const estadoDe = (s: Solicitud): EstadoSolicitud => resueltas[s.radicado] ?? s.estado;

  const lista = useMemo(
    () => SOLICITUDES.filter((s) => filtro === "todas" || estadoDe(s) === filtro),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filtro, resueltas],
  );

  const seleccionada = SOLICITUDES.find((s) => s.radicado === abierta);
  const pendientes = SOLICITUDES.filter((s) => ["nueva", "en-revision", "info-solicitada"].includes(estadoDe(s)));

  return (
    <div className="grid gap-7">
      <PageHeader
        eyebrow="Gestión operativa"
        titulo="Bandeja de solicitudes de afiliación"
        lede="Cada radicado que entrega el portal aterriza aquí. La empresa ve un número; el equipo ve el expediente, los documentos y la cuota que corresponde según el parámetro vigente."
        acciones={
          <Boton variante="secundario" tamano="sm" onClick={() => setVerParametro((v) => !v)}>
            <Sliders size={15} aria-hidden /> {verParametro ? "Ocultar" : "Ver"} parámetro de cuota
          </Boton>
        }
      />

      {verParametro && <PanelParametro />}

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrar por estado">
          {ESTADOS.map((e) => {
            const n = e.id === "todas" ? SOLICITUDES.length : SOLICITUDES.filter((s) => estadoDe(s) === e.id).length;
            const activo = filtro === e.id;
            return (
              <button
                key={e.id}
                type="button"
                onClick={() => setFiltro(e.id)}
                aria-pressed={activo}
                className={`rounded-full px-3.5 py-1.5 text-[13.5px] font-semibold transition ${
                  activo ? "bg-[var(--navy-700)] text-white" : "border border-line text-muted hover:border-accent hover:text-ink"
                }`}
              >
                {e.etiqueta} <span className="num opacity-70">{n}</span>
              </button>
            );
          })}
        </div>
        <p className="ml-auto text-[13.5px] text-muted">
          <span className="num font-semibold text-ink">{pendientes.length}</span> esperan decisión
        </p>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
        {/* Lista */}
        <Card className="divide-y divide-line">
          {lista.length === 0 ? (
            <Vacio
              titulo="Sin solicitudes en este estado"
              detalle="Cambia el filtro para ver las demás. La bandeja se alimenta del formulario público de afiliación."
            />
          ) : (
            lista.map((s) => {
              const est = estadoDe(s);
              const activa = s.radicado === abierta;
              const faltantes = s.documentos.filter((d) => d.estado !== "recibido").length;
              return (
                <button
                  key={s.radicado}
                  type="button"
                  onClick={() => setAbierta(s.radicado)}
                  aria-current={activa ? "true" : undefined}
                  className={`flex w-full flex-col gap-1.5 p-4 text-left transition ${
                    activa ? "bg-info-bg" : "hover:bg-bg"
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="num font-mono text-[13px] text-muted">{s.radicado}</span>
                    <Chip tono={TONO[est].tono}>{TONO[est].texto}</Chip>
                    {faltantes > 0 && (
                      <Chip tono="error">
                        <FileWarning size={12} aria-hidden /> {faltantes} doc.
                      </Chip>
                    )}
                  </div>
                  <p className="text-[15.5px] font-semibold leading-snug">{s.razonSocial}</p>
                  <p className="text-[13.5px] text-muted">
                    {s.ciudad} · <span className="num">{s.empleados}</span> empleados · recibida {fecha(s.recibida)}
                  </p>
                </button>
              );
            })
          )}
        </Card>

        {/* Expediente */}
        {seleccionada && (
          <Expediente
            key={seleccionada.radicado}
            s={seleccionada}
            estado={estadoDe(seleccionada)}
            onResolver={(nuevo) => setResueltas((r) => ({ ...r, [seleccionada.radicado]: nuevo }))}
          />
        )}
      </div>
    </div>
  );
}

/* ── El parámetro, no la constante ─────────────────────────────────── */
function PanelParametro() {
  return (
    <Card destacada className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Eyebrow>
            <Settings2 size={13} aria-hidden /> Parametrización
          </Eyebrow>
          <h2 className="mt-2 font-display text-[19px] font-semibold">Cuota anual de afiliación</h2>
          <p className="mt-1 max-w-[62ch] text-[14px] leading-relaxed text-muted">
            La cuota no se digita en cada solicitud: sale de una tabla con alcance, vigencia y versión. Cambiarla es
            un acto administrativo que queda registrado, no una edición de código.
          </p>
        </div>
        <dl className="grid gap-1 text-[13px]">
          <Meta termino="Clave" valor={PARAMETRO_CUOTA.clave} mono />
          <Meta termino="Versión" valor={`v${PARAMETRO_CUOTA.version}`} />
          <Meta termino="Vigencia" valor={`${fecha(PARAMETRO_CUOTA.vigenteDesde)} — ${fecha(PARAMETRO_CUOTA.vigenteHasta)}`} />
          <Meta termino="Aprobado por" valor={PARAMETRO_CUOTA.aprobadoPor} />
        </dl>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[420px] text-[14px]">
          <thead>
            <tr className="border-b border-line text-left text-[12px] uppercase tracking-[0.1em] text-muted">
              <th scope="col" className="py-2 font-semibold">Tamaño</th>
              <th scope="col" className="py-2 font-semibold">Segmento</th>
              <th scope="col" className="py-2 text-right font-semibold">Cuota 2026</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {PARAMETRO_CUOTA.tarifas.map((t) => (
              <tr key={t.id}>
                <td className="py-2.5">{t.rango}</td>
                <td className="py-2.5 text-muted">{t.segmento === "grande" ? "Grande" : "MIPYME"}</td>
                <td className="num py-2.5 text-right font-semibold">{cop(t.valor)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

/* ── Expediente de una solicitud ───────────────────────────────────── */
function Expediente({
  s,
  estado,
  onResolver,
}: {
  s: Solicitud;
  estado: EstadoSolicitud;
  onResolver: (e: EstadoSolicitud) => void;
}) {
  const tarifa = tarifaPara(s.empleados);
  const faltantes = s.documentos.filter((d) => d.estado !== "recibido");
  const cerrada = estado === "aprobada" || estado === "rechazada";
  const espera = -diasHasta(s.recibida);

  return (
    <Card className="grid gap-5 p-5 sm:p-6">
      <header className="grid gap-2.5 border-b border-line pb-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[13.5px] text-muted">{s.radicado}</span>
          <Chip tono={TONO[estado].tono}>{TONO[estado].texto}</Chip>
          <span className="ml-auto text-[13px] text-muted">
            {espera === 0 ? "Recibida hoy" : `${espera} ${espera === 1 ? "día" : "días"} en bandeja`}
          </span>
        </div>
        <h2 className="font-display text-[clamp(20px,2.6vw,26px)] font-semibold leading-tight">{s.razonSocial}</h2>
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[14px] text-muted">
          <span className="font-mono">NIT {s.nit}</span>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1"><MapPin size={13} aria-hidden /> {s.ciudad}</span>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1"><Users size={13} aria-hidden /> <span className="num">{s.empleados}</span> empleados</span>
          <span aria-hidden>·</span>
          <span>{s.sector}</span>
        </p>
      </header>

      <div className="grid items-start gap-5 sm:grid-cols-2">
        <section className="grid gap-2.5">
          <h3 className="flex items-center gap-2 text-[15px] font-bold">
            <Building2 size={15} className="text-accent" aria-hidden /> Contacto principal
          </h3>
          <p className="text-[14.5px] font-semibold">{s.contacto.nombre}</p>
          <p className="text-[13.5px] text-muted">{s.contacto.cargo}</p>
          <p className="flex items-center gap-1.5 text-[13.5px] text-muted">
            <Mail size={13} aria-hidden /> {s.contacto.correo}
          </p>
          <p className="flex items-center gap-1.5 text-[13.5px] text-muted">
            <Phone size={13} aria-hidden /> <span className="num">{s.contacto.telefono}</span>
          </p>
          <p className="text-[13.5px] text-muted">{s.sitioWeb}</p>
        </section>

        <section className="grid gap-2.5">
          <h3 className="text-[15px] font-bold">Documentos</h3>
          <ul className="grid gap-2">
            {s.documentos.map((d) => {
              const ok = d.estado === "recibido";
              return (
                <li key={d.nombre} className="flex items-start gap-2 text-[14px]">
                  {ok ? (
                    <Check size={15} className="mt-0.5 shrink-0 text-success" aria-hidden />
                  ) : (
                    <AlertTriangle size={15} className="mt-0.5 shrink-0 text-danger" aria-hidden />
                  )}
                  <span className={ok ? "" : "text-danger"}>
                    {d.nombre}
                    {!ok && <span className="ml-1 font-semibold">· {d.estado}</span>}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      {/* La cuota: resultado del parámetro, con la regla a la vista */}
      <div className="rounded-lg border border-line bg-bg p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-[11.5px] font-semibold uppercase tracking-[0.16em] text-muted">Cuota que corresponde</p>
          <p className="num font-display text-[28px] font-light leading-none">{cop(tarifa.valor)}</p>
        </div>
        <p className="mt-2 text-[13.5px] leading-relaxed text-muted">
          Calculada por <span className="font-mono text-[12.5px]">{PARAMETRO_CUOTA.clave}</span> v{PARAMETRO_CUOTA.version}:{" "}
          {tarifa.rango} → {tarifa.segmento === "grande" ? "Grande" : "MIPYME"}. Nadie la escribe a mano.
        </p>
      </div>

      {s.nota && (
        <p className="border-l-[3px] border-accent pl-3 text-[14px] leading-relaxed text-muted">{s.nota}</p>
      )}

      {/* Decisión */}
      {cerrada ? (
        <div className="flex items-center gap-2 border-t border-line pt-5 text-[14px] text-muted">
          <CircleDashed size={15} aria-hidden />
          Solicitud cerrada. Reabrirla exige justificación y queda en la auditoría.
        </div>
      ) : (
        <div className="grid gap-3 border-t border-line pt-5">
          {faltantes.length > 0 && (
            <p className="flex items-start gap-2 text-[14px] text-danger">
              <AlertTriangle size={15} className="mt-0.5 shrink-0" aria-hidden />
              Faltan <span className="num font-semibold">{faltantes.length}</span> documentos. Aprobar está bloqueado
              hasta completarlos: la regla vive en el servidor, no en este botón.
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <Boton onClick={() => onResolver("aprobada")} disabled={faltantes.length > 0}>
              <Check size={16} aria-hidden /> Aprobar y facturar {cop(tarifa.valor)}
            </Boton>
            <Boton variante="secundario" onClick={() => onResolver("info-solicitada")}>
              <Mail size={15} aria-hidden /> Pedir información
            </Boton>
            <Boton variante="fantasma" onClick={() => onResolver("rechazada")}>
              <X size={15} aria-hidden /> Rechazar
            </Boton>
          </div>
          <p className="text-[13px] text-muted">
            Aprobar crea la empresa en el núcleo, emite la cuota y le abre el portal al contacto principal. Es una sola
            transacción: si algo falla, no queda una empresa a medias.
          </p>
        </div>
      )}
    </Card>
  );
}

function Meta({ termino, valor, mono = false }: { termino: string; valor: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted">{termino}</dt>
      <dd className={`font-semibold ${mono ? "font-mono text-[12.5px]" : ""}`}>{valor}</dd>
    </div>
  );
}
