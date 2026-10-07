import Link from "next/link";
import { BadgeCheck, Building2, CalendarCheck, ShieldAlert } from "lucide-react";
import { fecha } from "@/lib/format";
import { BotonTema } from "@/components/BotonTema";
import { Lienzo } from "@/components/landing/Lienzo";

/** Registro público de certificados. Un tercero valida sin iniciar sesión. */
const REGISTRO: Record<
  string,
  { empresa: string; nit: string; tipo: string; expedido: string; vigenteHasta: string; vigente: boolean }
> = {
  "FS-2026-00184": {
    empresa: "Datalabs Andina S.A.S.",
    nit: "901.487.203-6",
    tipo: "Activo",
    expedido: "2026-09-22",
    vigenteHasta: "2026-12-31",
    vigente: true,
  },
  "FS-2025-00097": {
    empresa: "Sistemas Vértice S.A.",
    nit: "900.315.882-1",
    tipo: "Activo",
    expedido: "2025-10-03",
    vigenteHasta: "2025-12-31",
    vigente: false,
  },
};

export function generateStaticParams() {
  return Object.keys(REGISTRO).map((folio) => ({ folio }));
}

export default async function Verificar({ params }: { params: Promise<{ folio: string }> }) {
  const { folio } = await params;
  const cert = REGISTRO[folio.toUpperCase()];

  return (
    <Lienzo className="grid place-items-center px-6 py-16">
      <div
        aria-hidden
        className="pointer-events-none fixed left-1/2 top-1/3 h-[520px] w-[520px] -translate-x-1/2 rounded-full opacity-25 blur-[130px] claro:opacity-[0.16]"
        style={{ background: "radial-gradient(circle, var(--lienzo-acento) 0%, transparent 70%)" }}
      />

      <div className="relative w-full max-w-[560px]">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="font-display text-[13px] font-bold uppercase tracking-[0.34em] text-lienzo-tinta-3">
            Fedesoft
          </Link>
          {/* Esta página la abre un tercero con el folio en la mano: también puede elegir su vista */}
          <BotonTema
            predeterminado="oscuro"
            className="-mr-2 rounded-full p-2 text-lienzo-tinta-3 transition hover:bg-lienzo-relleno-2 hover:text-lienzo-tinta"
          />
        </div>
        <p className="mt-6 text-[12px] uppercase tracking-[0.2em] text-lienzo-tinta-5">Verificación de certificado</p>

        {!cert ? (
          <div className="mt-5 rounded-2xl border border-lienzo-linea-2 bg-lienzo-tarjeta p-8 shadow-[var(--lienzo-tarjeta-sombra)] backdrop-blur">
            <div className="flex items-start gap-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-lienzo-relleno-2 text-lienzo-tinta-3">
                <ShieldAlert size={21} aria-hidden />
              </div>
              <div>
                <h1 className="font-display text-[24px] font-light">Folio no encontrado</h1>
                <p className="mt-2 text-[15px] leading-relaxed text-lienzo-tinta-4">
                  No existe ningún certificado con el folio{" "}
                  <span className="font-mono text-lienzo-tinta-2">{folio}</span>. Verifica que esté completo y sin espacios.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-5 overflow-hidden rounded-2xl border border-lienzo-linea-2 bg-lienzo-tarjeta shadow-[var(--lienzo-tarjeta-sombra)] backdrop-blur">
            <div
              className={`flex items-center gap-3 px-8 py-5 ${cert.vigente ? "bg-lienzo-exito-fondo" : "bg-lienzo-error-fondo"}`}
            >
              {cert.vigente ? (
                <BadgeCheck size={22} className="shrink-0 text-lienzo-exito" aria-hidden />
              ) : (
                <ShieldAlert size={22} className="shrink-0 text-lienzo-error" aria-hidden />
              )}
              <p className={`font-display text-[19px] font-semibold ${cert.vigente ? "text-lienzo-exito" : "text-lienzo-error"}`}>
                {cert.vigente ? "Certificado vigente" : "Certificado no vigente"}
              </p>
            </div>

            <div className="grid gap-6 px-8 py-8">
              <div>
                <p className="text-[12px] uppercase tracking-[0.16em] text-lienzo-tinta-5">Empresa certificada</p>
                <p className="mt-2 flex items-center gap-2.5 font-display text-[22px] font-light">
                  <Building2 size={19} className="shrink-0 text-lienzo-tinta-4" aria-hidden />
                  {cert.empresa}
                </p>
                <p className="mt-1 font-mono text-[13.5px] text-lienzo-tinta-4">NIT {cert.nit}</p>
              </div>

              <dl className="grid gap-4 border-t border-lienzo-linea pt-6 sm:grid-cols-2">
                <div>
                  <dt className="text-[12px] uppercase tracking-[0.16em] text-lienzo-tinta-5">Folio</dt>
                  <dd className="mt-1 font-mono text-[14.5px] text-lienzo-tinta-2">{folio.toUpperCase()}</dd>
                </div>
                <div>
                  <dt className="text-[12px] uppercase tracking-[0.16em] text-lienzo-tinta-5">Tipo de afiliación</dt>
                  <dd className="mt-1 text-[14.5px] text-lienzo-tinta-2">Afiliado {cert.tipo}</dd>
                </div>
                <div>
                  <dt className="text-[12px] uppercase tracking-[0.16em] text-lienzo-tinta-5">Expedido</dt>
                  <dd className="mt-1 text-[14.5px] text-lienzo-tinta-2">{fecha(cert.expedido)}</dd>
                </div>
                <div>
                  <dt className="text-[12px] uppercase tracking-[0.16em] text-lienzo-tinta-5">Vigente hasta</dt>
                  <dd className="mt-1 flex items-center gap-1.5 text-[14.5px] text-lienzo-tinta-2">
                    <CalendarCheck size={14} className="text-lienzo-tinta-5" aria-hidden />
                    {fecha(cert.vigenteHasta)}
                  </dd>
                </div>
              </dl>

              <p className="border-t border-lienzo-linea pt-5 text-[13.5px] leading-relaxed text-lienzo-tinta-5">
                {cert.vigente
                  ? "La verificación refleja el estado real de la afiliación en este momento. Si la empresa deja de estar al día, este certificado pasa a no vigente automáticamente."
                  : "Este certificado corresponde a una vigencia ya terminada. La empresa debe emitir uno nuevo desde su portal."}
              </p>
            </div>
          </div>
        )}

        <p className="mt-6 text-[12.5px] text-lienzo-tinta-6">Prototipo de demostración · datos simulados</p>
      </div>
    </Lienzo>
  );
}
