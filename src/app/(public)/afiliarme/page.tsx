"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Copy, FileText } from "lucide-react";

type Paso = 1 | 2 | 3 | 4;
const RADICADO = "AF-2026-0417";

const PASOS = ["La empresa", "Contacto principal", "Documentos", "Listo"] as const;

export default function Afiliarme() {
  const [paso, setPaso] = useState<Paso>(1);
  const [copiado, setCopiado] = useState(false);

  return (
    <div className="min-h-dvh bg-navy-abismo">
      <div
        aria-hidden
        className="pointer-events-none fixed left-1/2 top-0 h-[520px] w-[820px] -translate-x-1/2 opacity-30 blur-[130px]"
        style={{ background: "radial-gradient(ellipse, #008BED 0%, transparent 70%)" }}
      />

      <header className="relative mx-auto flex max-w-[860px] items-center justify-between px-6 py-7">
        <Link href="/" className="font-display text-[13px] font-bold uppercase tracking-[0.34em] text-white/80">
          Fedesoft
        </Link>
        <Link href="/entrar" className="text-[13.5px] font-semibold text-white/60 transition hover:text-white">
          Ya estoy afiliado
        </Link>
      </header>

      <main className="relative mx-auto max-w-[860px] px-6 pb-24">
        {paso < 4 && (
          <>
            <h1 className="max-w-[18ch] font-display text-[clamp(30px,4.6vw,46px)] font-light leading-[1.06] text-white">
              Afilia tu empresa a la federación
            </h1>
            <p className="mt-5 max-w-[56ch] text-[16.5px] font-light leading-relaxed text-white/60">
              Tres pasos. La Junta Directiva valida la solicitud y, al aprobarla, tus servicios quedan activos y
              recibes el acceso al portal.
            </p>
          </>
        )}

        {/* Progreso */}
        <ol className="mt-10 flex flex-wrap items-center gap-x-3 gap-y-2 text-[13px]">
          {PASOS.map((etiqueta, i) => {
            const n = (i + 1) as Paso;
            const hecho = paso > n;
            const actual = paso === n;
            return (
              <li key={etiqueta} className="flex items-center gap-3">
                <span
                  className={`flex items-center gap-2 rounded-full px-3 py-1.5 font-semibold transition ${
                    actual ? "bg-white text-navy-abismo" : hecho ? "text-[#7bdba8]" : "text-white/35"
                  }`}
                >
                  {hecho ? <Check size={13} aria-hidden /> : <span className="num">{n}</span>}
                  {etiqueta}
                </span>
                {i < PASOS.length - 1 && <span aria-hidden className="h-px w-5 bg-white/20" />}
              </li>
            );
          })}
        </ol>

        <div className="mt-8 rounded-2xl border border-white/15 bg-white/[0.06] p-7 backdrop-blur sm:p-9">
          {paso === 1 && (
            <fieldset className="grid gap-5">
              <legend className="font-display text-[20px] font-semibold text-white">Datos de la empresa</legend>
              <div className="grid gap-5 sm:grid-cols-2">
                <Campo id="razon" etiqueta="Razón social" placeholder="Nombre legal completo" />
                <Campo id="nit" etiqueta="NIT" placeholder="900.123.456-7" mono />
                <Campo id="ciudad" etiqueta="Ciudad" placeholder="Bogotá D.C." />
                <Campo id="empleados" etiqueta="Número de empleados" placeholder="24" />
                <Campo id="web" etiqueta="Sitio web" placeholder="tuempresa.co" />
                <Selector
                  id="categoria"
                  etiqueta="Categoría principal"
                  opciones={[
                    "Desarrollo a la medida / apps",
                    "Consultoría TI",
                    "Pruebas de software",
                    "Identidad digital",
                    "Infraestructura y redes",
                  ]}
                />
              </div>
            </fieldset>
          )}

          {paso === 2 && (
            <fieldset className="grid gap-5">
              <legend className="font-display text-[20px] font-semibold text-white">Contacto principal</legend>
              <p className="max-w-[54ch] text-[14.5px] leading-relaxed text-white/55">
                Será el primer usuario del portal y podrá invitar al resto del equipo con los roles que decida.
              </p>
              <div className="grid gap-5 sm:grid-cols-2">
                <Campo id="nombre" etiqueta="Nombre y apellido" placeholder="Camilo Restrepo" />
                <Campo id="cargo" etiqueta="Cargo" placeholder="Gerente General" />
                <Campo id="correo" etiqueta="Correo corporativo" placeholder="nombre@tuempresa.co" tipo="email" />
                <Campo id="tel" etiqueta="Teléfono" placeholder="+57 310 000 0000" tipo="tel" />
              </div>
            </fieldset>
          )}

          {paso === 3 && (
            <fieldset className="grid gap-5">
              <legend className="font-display text-[20px] font-semibold text-white">Documentos de soporte</legend>
              <div className="grid gap-3">
                {["Cámara de comercio (menor a 90 días)", "RUT actualizado", "Cédula del representante legal"].map(
                  (d) => (
                    <div
                      key={d}
                      className="flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-white/20 px-5 py-4"
                    >
                      <FileText size={17} className="shrink-0 text-white/45" aria-hidden />
                      <span className="flex-1 text-[14.5px] text-white/80">{d}</span>
                      <span className="rounded-full border border-white/25 px-3.5 py-1.5 text-[13px] font-semibold text-white/70">
                        Adjuntar
                      </span>
                    </div>
                  ),
                )}
              </div>
              <label className="flex items-start gap-3 text-[13.5px] leading-relaxed text-white/55">
                <input type="checkbox" className="mt-1 h-4 w-4 shrink-0 accent-[#008BED]" />
                <span>
                  Autorizo el tratamiento de mis datos personales conforme a la política de Fedesoft y a la Ley 1581 de
                  2012.
                </span>
              </label>
            </fieldset>
          )}

          {paso === 4 && (
            <div className="grid gap-6">
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#157347]/25 text-[#7bdba8]">
                  <Check size={24} aria-hidden />
                </div>
                <div>
                  <h2 className="font-display text-[26px] font-light text-white">Solicitud radicada</h2>
                  <p className="mt-2 max-w-[52ch] text-[15.5px] leading-relaxed text-white/60">
                    La Junta Directiva revisa las solicitudes en su sesión mensual. Te escribiremos al correo que
                    registraste con la decisión.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-white/15 bg-white/5 px-6 py-5">
                <p className="text-[12px] uppercase tracking-[0.16em] text-white/40">Tu número de radicado</p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <p className="num font-mono text-[26px] text-white">{RADICADO}</p>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(RADICADO).catch(() => {});
                      setCopiado(true);
                      setTimeout(() => setCopiado(false), 1800);
                    }}
                    className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#8cc4ff] hover:underline"
                  >
                    <Copy size={13} aria-hidden /> {copiado ? "Copiado" : "Copiar"}
                  </button>
                </div>
                <p className="mt-3 text-[13.5px] text-white/50">
                  Con este número puedes consultar el estado de tu solicitud en cualquier momento, sin iniciar sesión.
                </p>
              </div>
            </div>
          )}

          {/* Navegación del formulario */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-6">
            {paso > 1 && paso < 4 ? (
              <button
                onClick={() => setPaso((p) => (p - 1) as Paso)}
                className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-white/60 transition hover:text-white"
              >
                <ArrowLeft size={15} aria-hidden /> Atrás
              </button>
            ) : (
              <span />
            )}

            {paso < 4 ? (
              <button
                onClick={() => setPaso((p) => (p + 1) as Paso)}
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[15px] font-semibold text-navy-abismo transition hover:bg-white/90"
              >
                {paso === 3 ? "Enviar solicitud" : "Continuar"} <ArrowRight size={16} aria-hidden />
              </button>
            ) : (
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-6 py-3 text-[15px] font-semibold text-white transition hover:bg-white/15"
              >
                Volver al inicio
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function Campo({
  id, etiqueta, placeholder, tipo = "text", mono = false,
}: { id: string; etiqueta: string; placeholder: string; tipo?: string; mono?: boolean }) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-[13px] font-semibold text-white/60">{etiqueta}</label>
      <input
        id={id}
        type={tipo}
        placeholder={placeholder}
        className={`rounded-lg border border-white/20 bg-white/5 px-3.5 py-2.5 text-[14.5px] text-white placeholder:text-white/30 ${mono ? "font-mono" : ""}`}
      />
    </div>
  );
}

function Selector({ id, etiqueta, opciones }: { id: string; etiqueta: string; opciones: string[] }) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-[13px] font-semibold text-white/60">{etiqueta}</label>
      <select
        id={id}
        defaultValue=""
        className="rounded-lg border border-white/20 bg-white/5 px-3.5 py-2.5 text-[14.5px] text-white"
      >
        <option value="" disabled className="text-navy-abismo">Selecciona una categoría</option>
        {opciones.map((o) => <option key={o} className="text-navy-abismo">{o}</option>)}
      </select>
    </div>
  );
}
