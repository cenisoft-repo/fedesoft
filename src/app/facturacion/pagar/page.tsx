"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Award, CheckCircle2, Copy, CreditCard, FileCheck2, Loader2, ShieldCheck } from "lucide-react";
import { useDemo } from "@/lib/demo";
import { cop, fecha, truncar } from "@/lib/format";
import { Boton, Card, Chip, Eyebrow } from "@/components/ui/primitivos";

type Paso = "resumen" | "pasarela" | "confirmando" | "listo";

const CUFE_DEMO = "e4b91d07ca8f236510bd9e74a3c0f82b6d15e9a742c8031f";

export default function Pagar() {
  const { escenario, registrarPago } = useDemo();
  const { empresa } = escenario;
  const [paso, setPaso] = useState<Paso>("resumen");
  const [copiado, setCopiado] = useState(false);

  const cargos = empresa.cargos.filter((c) => c.estado !== "pagado");
  const total = cargos.reduce((s, c) => s + c.monto, 0);

  // La confirmación real llega del servidor, no del navegador: aquí se simula esa espera.
  useEffect(() => {
    if (paso !== "confirmando") return;
    const t = setTimeout(() => {
      registrarPago();
      setPaso("listo");
    }, 2200);
    return () => clearTimeout(t);
  }, [paso, registrarPago]);

  if (total === 0 && paso === "resumen") {
    return (
      <Card className="mx-auto max-w-[520px]">
        <div className="grid justify-items-center gap-3 px-6 py-14 text-center">
          <CheckCircle2 size={36} className="text-success" aria-hidden />
          <h1 className="font-display text-[20px] font-bold">No tienes cargos por pagar</h1>
          <p className="text-[15px] text-muted">Tu afiliación está al día.</p>
          <Link href="/facturacion" className="mt-1">
            <Boton variante="secundario">Volver al estado de cuenta</Boton>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="mx-auto grid max-w-[720px] gap-6">
      <Pasos actual={paso} />

      {paso === "resumen" && (
        <Card className="p-6">
          <Eyebrow>Confirma tu pago</Eyebrow>
          <h1 className="mt-2 text-[26px] font-extrabold">Vas a pagar {cop(total)}</h1>
          <div className="mt-5 grid gap-3 border-y border-line py-5">
            {cargos.map((c) => (
              <div key={c.id} className="flex flex-wrap justify-between gap-2">
                <div>
                  <p className="font-semibold">{c.concepto}</p>
                  <p className="text-[13.5px] text-muted">
                    Periodo {c.periodo} · vence {fecha(c.vence)}
                  </p>
                </div>
                <span className="num font-semibold">{cop(c.monto)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[15px] font-semibold">Total</p>
            <p className="num font-display text-[26px] font-extrabold">{cop(total)}</p>
          </div>
          <p className="mt-2 text-[13.5px] text-muted">
            Se facturará a {empresa.razonSocial} · NIT <span className="font-mono">{empresa.nit}</span>
          </p>
          <Boton className="mt-5 w-full" onClick={() => setPaso("pasarela")}>
            <CreditCard size={17} aria-hidden /> Continuar al pago seguro
          </Boton>
        </Card>
      )}

      {paso === "pasarela" && (
        <Card className="p-6">
          <div className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wider text-muted">
            <ShieldCheck size={15} className="text-accent" aria-hidden /> Pasarela de pago
          </div>
          <h1 className="mt-2 text-[24px] font-extrabold">Pago seguro</h1>
          <p className="mt-1 text-[14.5px] text-muted">
            En el portal real esto ocurre en el entorno de la pasarela. La confirmación llega a Fedesoft de servidor a
            servidor, nunca desde el navegador.
          </p>
          <div className="mt-5 grid gap-3">
            <Campo etiqueta="Número de tarjeta" valor="4242 4242 4242 4242" />
            <div className="grid grid-cols-2 gap-3">
              <Campo etiqueta="Vencimiento" valor="12 / 29" />
              <Campo etiqueta="Código" valor="•••" />
            </div>
          </div>
          <Boton className="mt-5 w-full" onClick={() => setPaso("confirmando")}>
            Pagar {cop(total)}
          </Boton>
          <button
            type="button"
            onClick={() => setPaso("resumen")}
            className="mt-3 w-full text-[13.5px] font-semibold text-muted hover:text-ink"
          >
            Volver
          </button>
        </Card>
      )}

      {paso === "confirmando" && (
        <Card className="p-10">
          <div className="grid justify-items-center gap-4 text-center">
            <Loader2 size={38} className="animate-spin text-accent" aria-hidden />
            <h1 className="font-display text-[21px] font-bold">Confirmando tu pago…</h1>
            <p className="max-w-[46ch] text-[15px] text-muted">
              Estamos esperando la confirmación de la pasarela. Puedes cerrar esta ventana: cuando vuelvas verás el
              estado correcto.
            </p>
          </div>
        </Card>
      )}

      {paso === "listo" && (
        <>
          <Card destacada className="p-6">
            <div className="flex items-start gap-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-success-bg text-success">
                <CheckCircle2 size={22} aria-hidden />
              </div>
              <div>
                <h1 className="font-display text-[22px] font-extrabold">Pago aprobado</h1>
                <p className="mt-1 text-[15px] text-muted">
                  Recibimos {cop(total)} de {empresa.razonSocial}. Tu afiliación quedó al día hasta el{" "}
                  {fecha("2026-12-31")}.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2">
              <FileCheck2 size={18} className="text-success" aria-hidden />
              <h2 className="font-display text-[17px] font-bold">Factura electrónica emitida</h2>
              <Chip tono="exito">Validada ante la DIAN</Chip>
            </div>
            <dl className="mt-4 grid gap-3 text-[14.5px] sm:grid-cols-2">
              <div>
                <dt className="text-[12.5px] uppercase tracking-wider text-muted">Número</dt>
                <dd className="font-mono font-semibold">FES-8967</dd>
              </div>
              <div>
                <dt className="text-[12.5px] uppercase tracking-wider text-muted">Fecha de emisión</dt>
                <dd className="font-semibold">{fecha("2026-09-22")}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-[12.5px] uppercase tracking-wider text-muted">CUFE</dt>
                <dd className="mt-0.5 flex flex-wrap items-center gap-2">
                  <code className="rounded bg-bg px-2 py-1 font-mono text-[13px]">{truncar(CUFE_DEMO, 20, 10)}</code>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(CUFE_DEMO).catch(() => {});
                      setCopiado(true);
                      setTimeout(() => setCopiado(false), 1800);
                    }}
                    className="inline-flex items-center gap-1 text-[13px] font-semibold text-link hover:underline"
                  >
                    <Copy size={13} aria-hidden /> {copiado ? "Copiado" : "Copiar"}
                  </button>
                </dd>
              </div>
            </dl>
          </Card>

          <Card className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Award size={20} className="text-accent" aria-hidden />
                <div>
                  <p className="font-display text-[16px] font-bold">Tu certificado ya está disponible</p>
                  <p className="text-[14px] text-muted">
                    Al quedar al día se habilitaron el certificado de afiliación y el sello.
                  </p>
                </div>
              </div>
              <Link href="/facturacion/certificado">
                <Boton>Ir al certificado</Boton>
              </Link>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

function Pasos({ actual }: { actual: Paso }) {
  const orden: Paso[] = ["resumen", "pasarela", "confirmando", "listo"];
  const etiquetas = { resumen: "Resumen", pasarela: "Pago", confirmando: "Confirmación", listo: "Listo" };
  const idx = orden.indexOf(actual);

  return (
    <ol className="flex flex-wrap items-center gap-2 text-[13px]">
      {orden.map((p, i) => (
        <li key={p} className="flex items-center gap-2">
          <span
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold ${
              i < idx ? "text-success" : i === idx ? "bg-[var(--info-bg)] text-info" : "text-muted"
            }`}
          >
            {i < idx ? <CheckCircle2 size={13} aria-hidden /> : null}
            {etiquetas[p]}
          </span>
          {i < orden.length - 1 && <span aria-hidden className="h-px w-5 bg-line" />}
        </li>
      ))}
    </ol>
  );
}

function Campo({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  const id = etiqueta.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-[13px] font-semibold text-muted">
        {etiqueta}
      </label>
      <input
        id={id}
        defaultValue={valor}
        readOnly
        className="rounded-lg border border-line bg-surface-2 px-3 py-2.5 font-mono text-[14px]"
      />
    </div>
  );
}
