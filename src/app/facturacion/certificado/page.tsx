"use client";

import Link from "next/link";
import { ArrowRight, Award, Download, Lock, QrCode, ShieldCheck } from "lucide-react";
import { useDemo } from "@/lib/demo";
import { cop, fecha } from "@/lib/format";
import { Boton, Card, Chip, Eyebrow, PageHeader } from "@/components/ui/primitivos";

const FOLIO = "FS-2026-00184";

export default function Certificado() {
  const { escenario } = useDemo();
  const { empresa, rol } = escenario;
  const alDia = empresa.estado === "al-dia";

  if (rol !== "gerente") {
    return (
      <Card className="mx-auto max-w-[520px]">
        <div className="grid justify-items-center gap-3 px-6 py-14 text-center">
          <Lock size={22} className="text-muted" aria-hidden />
          <h1 className="font-display text-[20px] font-bold">Sección del rol de gerencia</h1>
          <p className="text-[15px] text-muted">El certificado lo descarga el gerente registrado de la empresa.</p>
          <Link href="/"><Boton variante="secundario">Volver al inicio</Boton></Link>
        </div>
      </Card>
    );
  }

  const pendiente = empresa.cargos.find((c) => c.estado !== "pagado");

  return (
    <div className="grid gap-7">
      <PageHeader
        eyebrow="Facturación"
        titulo="Certificado y sello"
        lede="Dos trámites que antes pasaban por formulario y emisión manual, ahora son descargas instantáneas."
      />

      {!alDia ? (
        /* Estado bloqueado: la regla de negocio se explica, no se esconde */
        <Card className="overflow-hidden">
          <div className="border-b border-line bg-danger-bg/40 px-6 py-5">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-danger-bg text-danger">
                <Lock size={19} aria-hidden />
              </div>
              <div>
                <h2 className="font-display text-[18px] font-bold">Tu certificado no está disponible</h2>
                <p className="mt-1 max-w-[62ch] text-[14.5px] text-muted">
                  El certificado solo se emite con la afiliación vigente. Hoy tienes un cargo vencido por{" "}
                  <strong className="num text-ink">{cop(pendiente?.monto ?? 0)}</strong>, con vencimiento el{" "}
                  {pendiente ? fecha(pendiente.vence) : ""}.
                </p>
              </div>
            </div>
          </div>
          <div className="grid gap-4 px-6 py-5">
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-wider text-muted">Qué falta</p>
              <ol className="mt-2 grid gap-2 text-[14.5px]">
                <li className="flex gap-2">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-danger-bg text-[11px] font-bold text-danger">1</span>
                  Pagar el cargo pendiente de la cuota anual.
                </li>
                <li className="flex gap-2">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-bg text-[11px] font-bold text-muted">2</span>
                  La afiliación pasa a “al día” apenas se confirma el pago.
                </li>
                <li className="flex gap-2">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-bg text-[11px] font-bold text-muted">3</span>
                  El certificado y el sello se habilitan solos, sin pedir nada a nadie.
                </li>
              </ol>
            </div>
            <Link href="/facturacion/pagar" className="justify-self-start">
              <Boton>
                Regularizar ahora <ArrowRight size={16} aria-hidden />
              </Boton>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[1.3fr_1fr]">
          {/* Vista previa del certificado */}
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3">
              <p className="font-display text-[15px] font-bold">Certificado de afiliación</p>
              <Chip tono="exito">
                <ShieldCheck size={13} aria-hidden /> Vigente
              </Chip>
            </div>

            <div className="bg-surface-2 p-5 sm:p-7">
              <div className="mx-auto max-w-[520px] rounded-lg border border-line bg-surface p-7 shadow-[var(--shadow-card)]">
                <div className="flex items-center justify-between gap-4 border-b border-line pb-4">
                  <span className="font-display text-[17px] font-extrabold tracking-tight">
                    <span className="text-ink">fede</span>
                    <span className="text-accent">soft</span>
                  </span>
                  <span className="font-mono text-[11.5px] text-muted">{FOLIO}</span>
                </div>

                <p className="mt-6 text-center text-[12px] uppercase tracking-[0.14em] text-muted">
                  Certifica que
                </p>
                <p className="mt-2 text-center font-display text-[21px] font-extrabold leading-snug">
                  {empresa.razonSocial}
                </p>
                <p className="mt-1 text-center font-mono text-[13px] text-muted">NIT {empresa.nit}</p>

                <p className="mx-auto mt-5 max-w-[42ch] text-center text-[13.5px] leading-relaxed text-muted">
                  Es afiliada <strong className="text-ink">{empresa.tipoAfiliacion}</strong> de la Federación Colombiana
                  de la Industria de Software y TI, con afiliación vigente y al día en sus obligaciones desde{" "}
                  {fecha(empresa.afiliadaDesde)}.
                </p>

                <div className="mt-6 flex items-end justify-between gap-4 border-t border-line pt-4">
                  <div className="text-[11.5px] text-muted">
                    <p>Expedido el {fecha("2026-09-22")}</p>
                    <p>Vigente hasta {fecha(empresa.vigenciaHasta)}</p>
                  </div>
                  <div className="grid h-14 w-14 place-items-center rounded border border-line bg-bg text-muted">
                    <QrCode size={26} aria-hidden />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 border-t border-line px-5 py-4">
              <Boton>
                <Download size={16} aria-hidden /> Descargar certificado
              </Boton>
              <Boton variante="secundario">Enviar por correo</Boton>
            </div>
          </Card>

          <div className="grid h-fit gap-5">
            {/* Sello */}
            <Card className="p-5">
              <Eyebrow>Sello de afiliado</Eyebrow>
              <h2 className="mt-2 font-display text-[17px] font-bold">#SoyAfiliadoFedesoft</h2>
              <p className="mt-1 text-[14px] text-muted">
                Úsalo en tu sitio web, tus propuestas y tus redes. Disponible mientras tu afiliación esté vigente.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {["Color", "Monocromo"].map((variante) => (
                  <div key={variante} className="grid gap-2">
                    <div
                      className={`grid h-20 place-items-center rounded-lg border border-line ${
                        variante === "Color" ? "bg-[var(--navy-700)]" : "bg-bg"
                      }`}
                    >
                      <Award
                        size={28}
                        className={variante === "Color" ? "text-[var(--azure-300)]" : "text-muted"}
                        aria-hidden
                      />
                    </div>
                    <Boton variante="secundario" tamano="sm" className="w-full">
                      <Download size={13} aria-hidden /> {variante}
                    </Boton>
                  </div>
                ))}
              </div>
            </Card>

            {/* Verificación pública */}
            <Card className="p-5">
              <Eyebrow>Verificación pública</Eyebrow>
              <p className="mt-2 text-[14px] text-muted">
                Cualquier tercero puede validar la vigencia del certificado con su folio o el código QR, sin iniciar
                sesión y sin ver datos de más.
              </p>
              <div className="mt-3 rounded-lg border border-line bg-bg px-3 py-2.5">
                <p className="font-mono text-[12.5px] text-muted">
                  portal.fedesoft.org/verificar/<span className="text-ink">{FOLIO}</span>
                </p>
              </div>
              <p className="mt-3 text-[13px] text-muted">
                Si la empresa deja de estar al día, la verificación pasa a “no vigente” automáticamente.
              </p>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
