import Link from "next/link";
import { BadgeCheck, Building2, CalendarCheck, ShieldAlert } from "lucide-react";
import { fecha } from "@/lib/format";

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
    <div className="grid min-h-dvh place-items-center bg-navy-abismo px-6 py-16">
      <div
        aria-hidden
        className="pointer-events-none fixed left-1/2 top-1/3 h-[520px] w-[520px] -translate-x-1/2 rounded-full opacity-25 blur-[130px]"
        style={{ background: "radial-gradient(circle, #008BED 0%, transparent 70%)" }}
      />

      <div className="relative w-full max-w-[560px]">
        <Link href="/" className="font-display text-[13px] font-bold uppercase tracking-[0.34em] text-white/70">
          Fedesoft
        </Link>
        <p className="mt-6 text-[12px] uppercase tracking-[0.2em] text-white/40">Verificación de certificado</p>

        {!cert ? (
          <div className="mt-5 rounded-2xl border border-white/15 bg-white/5 p-8 backdrop-blur">
            <div className="flex items-start gap-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/10 text-white/70">
                <ShieldAlert size={21} aria-hidden />
              </div>
              <div>
                <h1 className="font-display text-[24px] font-light text-white">Folio no encontrado</h1>
                <p className="mt-2 text-[15px] leading-relaxed text-white/60">
                  No existe ningún certificado con el folio{" "}
                  <span className="font-mono text-white/80">{folio}</span>. Verifica que esté completo y sin espacios.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-5 overflow-hidden rounded-2xl border border-white/15 bg-white/5 backdrop-blur">
            <div
              className={`flex items-center gap-3 px-8 py-5 ${cert.vigente ? "bg-[#157347]/20" : "bg-[#c62828]/20"}`}
            >
              {cert.vigente ? (
                <BadgeCheck size={22} className="shrink-0 text-[#7bdba8]" aria-hidden />
              ) : (
                <ShieldAlert size={22} className="shrink-0 text-[#f28b8b]" aria-hidden />
              )}
              <p className={`font-display text-[19px] font-semibold ${cert.vigente ? "text-[#7bdba8]" : "text-[#f28b8b]"}`}>
                {cert.vigente ? "Certificado vigente" : "Certificado no vigente"}
              </p>
            </div>

            <div className="grid gap-6 px-8 py-8">
              <div>
                <p className="text-[12px] uppercase tracking-[0.16em] text-white/40">Empresa certificada</p>
                <p className="mt-2 flex items-center gap-2.5 font-display text-[22px] font-light text-white">
                  <Building2 size={19} className="shrink-0 text-white/50" aria-hidden />
                  {cert.empresa}
                </p>
                <p className="mt-1 font-mono text-[13.5px] text-white/50">NIT {cert.nit}</p>
              </div>

              <dl className="grid gap-4 border-t border-white/10 pt-6 sm:grid-cols-2">
                <div>
                  <dt className="text-[12px] uppercase tracking-[0.16em] text-white/40">Folio</dt>
                  <dd className="mt-1 font-mono text-[14.5px] text-white/85">{folio.toUpperCase()}</dd>
                </div>
                <div>
                  <dt className="text-[12px] uppercase tracking-[0.16em] text-white/40">Tipo de afiliación</dt>
                  <dd className="mt-1 text-[14.5px] text-white/85">Afiliado {cert.tipo}</dd>
                </div>
                <div>
                  <dt className="text-[12px] uppercase tracking-[0.16em] text-white/40">Expedido</dt>
                  <dd className="mt-1 text-[14.5px] text-white/85">{fecha(cert.expedido)}</dd>
                </div>
                <div>
                  <dt className="text-[12px] uppercase tracking-[0.16em] text-white/40">Vigente hasta</dt>
                  <dd className="mt-1 flex items-center gap-1.5 text-[14.5px] text-white/85">
                    <CalendarCheck size={14} className="text-white/45" aria-hidden />
                    {fecha(cert.vigenteHasta)}
                  </dd>
                </div>
              </dl>

              <p className="border-t border-white/10 pt-5 text-[13.5px] leading-relaxed text-white/45">
                {cert.vigente
                  ? "La verificación refleja el estado real de la afiliación en este momento. Si la empresa deja de estar al día, este certificado pasa a no vigente automáticamente."
                  : "Este certificado corresponde a una vigencia ya terminada. La empresa debe emitir uno nuevo desde su portal."}
              </p>
            </div>
          </div>
        )}

        <p className="mt-6 text-[12.5px] text-white/30">Prototipo de demostración · datos simulados</p>
      </div>
    </div>
  );
}
