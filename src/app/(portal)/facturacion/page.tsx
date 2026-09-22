"use client";

import Link from "next/link";
import { ArrowRight, Download, FileText, Lock } from "lucide-react";
import { useDemo } from "@/lib/demo";
import { cop, diasHasta, fecha, truncar } from "@/lib/format";
import { Boton, Card, Chip, Cifra, PageHeader, Seccion, Vacio } from "@/components/ui/primitivos";

export default function Facturacion() {
  const { escenario } = useDemo();
  const { empresa, rol } = escenario;

  if (rol !== "gerente") return <SinPermiso />;

  const pendientes = empresa.cargos.filter((c) => c.estado !== "pagado");
  const total = pendientes.reduce((s, c) => s + c.monto, 0);
  const vencido = pendientes.some((c) => c.estado === "vencido");

  return (
    <div className="grid gap-10">
      <PageHeader
        imagen="informacion-exclusiva"
        eyebrow="Facturación"
        titulo="Estado de cuenta"
        lede="Tus cargos, pagos y facturas electrónicas en un solo lugar. Al pagar, la factura se emite sola y tu afiliación queda al día."
        acciones={
          <Link href="/facturacion/certificado">
            <Boton variante="secundario">Certificado y sello</Boton>
          </Link>
        }
      />

      <div className="grid items-start gap-5 lg:grid-cols-[1.6fr_1fr]">
        <section className="grid gap-4">
          <Seccion titulo="Cargos" />
          <Card className="overflow-hidden">
            {pendientes.length === 0 ? (
              <Vacio
                titulo="No tienes cargos pendientes"
                detalle="Tu afiliación está al día. El próximo cargo se generará al iniciar la siguiente vigencia."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-[14.5px]">
                  <thead>
                    <tr className="border-b border-line text-left text-[11.5px] uppercase tracking-wider text-muted">
                      <th className="px-5 py-3 font-semibold">Concepto</th>
                      <th className="px-5 py-3 font-semibold">Vence</th>
                      <th className="px-4 py-3 text-right font-semibold">Monto</th>
                      <th className="px-5 py-3 font-semibold">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendientes.map((c) => {
                      const dias = diasHasta(c.vence);
                      return (
                        <tr key={c.id} className="border-b border-line last:border-0">
                          <td className="px-5 py-5">
                            <p className="font-semibold">{c.concepto}</p>
                            <p className="text-[13px] text-muted">Periodo {c.periodo}</p>
                          </td>
                          <td className="px-5 py-5">
                            <p>{fecha(c.vence)}</p>
                            <p className="text-[13px] text-muted">
                              {dias >= 0 ? `en ${dias} días` : `hace ${Math.abs(dias)} días`}
                            </p>
                          </td>
                          <td className="num px-5 py-5 text-right font-semibold">{cop(c.monto)}</td>
                          <td className="px-5 py-5">
                            <Chip tono={c.estado === "vencido" ? "error" : "aviso"}>
                              {c.estado === "vencido" ? "Vencido" : "Pendiente"}
                            </Chip>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <div className="mt-6"><Seccion titulo="Facturas electrónicas" /></div>
          <Card className="divide-y divide-line">
            {empresa.facturas.map((f) => (
              <div key={f.numero} className="flex flex-wrap items-center gap-3 p-4">
                <FileText size={18} className="shrink-0 text-muted" aria-hidden />
                <div className="min-w-[180px] flex-1">
                  <p className="font-semibold">Factura {f.numero}</p>
                  <p className="text-[13px] text-muted">
                    {fecha(f.fecha)} · CUFE <span className="font-mono">{truncar(f.cufe)}</span>
                  </p>
                </div>
                <span className="num font-semibold">{cop(f.monto)}</span>
                <Boton variante="secundario" tamano="sm">
                  <Download size={14} aria-hidden /> PDF
                </Boton>
              </div>
            ))}
          </Card>
        </section>

        <aside className="grid h-fit gap-3">
          <Card destacada className="p-6">
            <Cifra valor={cop(total)} etiqueta="Total por pagar" tamano="lg" />
            <p className="mt-4 text-[14.5px] leading-relaxed text-muted">
              {vencido
                ? "Tienes un cargo vencido. Al pagarlo, tu afiliación vuelve a quedar al día de inmediato."
                : "Al pagar, la factura electrónica se emite automáticamente ante la DIAN."}
            </p>
            {total > 0 && (
              <Link href="/facturacion/pagar" className="mt-6 block">
                <Boton className="w-full">
                  Pagar ahora <ArrowRight size={16} aria-hidden />
                </Boton>
              </Link>
            )}
            <p className="mt-3 text-[12.5px] text-muted">
              Pago seguro con pasarela local. También puedes pagar por transferencia y registrar el soporte.
            </p>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function SinPermiso() {
  return (
    <Card className="mx-auto max-w-[520px]">
      <div className="grid justify-items-center gap-3 px-6 py-14 text-center">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-bg text-muted">
          <Lock size={22} aria-hidden />
        </div>
        <h1 className="font-display text-[20px] font-bold">Esta sección es del rol de gerencia</h1>
        <p className="max-w-[44ch] text-[15px] text-muted">
          Tu perfil de líder de talento humano no tiene acceso a facturación. Si necesitas consultar el estado de
          cuenta, pídeselo al gerente registrado de tu empresa.
        </p>
        <Link href="/" className="mt-1">
          <Boton variante="secundario">Volver al inicio</Boton>
        </Link>
      </div>
    </Card>
  );
}
