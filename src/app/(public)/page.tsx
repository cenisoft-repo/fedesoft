import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { CampoRed } from "@/components/landing/CampoRed";
import { TextoRevelado } from "@/components/landing/TextoRevelado";
import { Escala } from "@/components/landing/Escala";

const CIFRAS = [
  { valor: "30", unidad: "años", detalle: "representando a la industria de software y TI del país" },
  { valor: "500+", unidad: "empresas", detalle: "afiliadas que construyen producto y servicio colombiano" },
  { valor: "4", unidad: "verticales", detalle: "Salud, Financiera, Educación y Seguridad Digital" },
  { valor: "1", unidad: "centro", detalle: "Cenisoft, de innovación y productividad, reconocido por MinCiencias" },
];

const SERVICIOS = [
  { titulo: "Representación gremial", detalle: "Voz de la industria ante el Estado y los gremios en las decisiones de política pública." },
  { titulo: "Formación del talento", detalle: "TrainingLAB, TIC Talks y Series C+I para actualizar equipos en IA, nube y ciberseguridad." },
  { titulo: "Acceso a verticales", detalle: "Mesas sectoriales donde se construyen consensos e iniciativas con los actores del sector." },
  { titulo: "Proyectos e internacionalización", detalle: "Oportunidades con entidades públicas y privadas, encadenamiento y misiones comerciales." },
  { titulo: "Visibilidad comercial", detalle: "Directorio verificado de la industria y espacio para difundir tu oferta ante otros afiliados." },
  { titulo: "Información exclusiva", detalle: "Cifras del sector, revenue por empleado y boletines normativos para decidir con datos." },
];

export default function Landing() {
  return (
    <div className="min-h-dvh bg-navy-abismo text-white">
      {/* ── Barra mínima ───────────────────────────────────────────── */}
      <header className="fixed inset-x-0 top-0 z-30">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between px-6 py-6">
          <span className="font-display text-[13px] font-bold uppercase tracking-[0.34em] text-white/85">
            Fedesoft
          </span>
          <nav className="flex items-center gap-5 text-[13.5px]">
            <Link href="#servicios" className="hidden text-white/60 transition hover:text-white sm:block">
              Qué hacemos
            </Link>
            <Link
              href="/portal"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-4 py-2 font-semibold backdrop-blur transition hover:bg-white/20"
            >
              Ingresar al portal <ArrowRight size={14} aria-hidden />
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Portada ────────────────────────────────────────────────── */}
      <section className="relative grid min-h-dvh place-items-center overflow-hidden px-6">
        <div aria-hidden className="absolute inset-0 opacity-70">
          <CampoRed densidad={1.1} />
        </div>
        {/* Viñeta pesada que funde el campo al negro */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 45%, rgba(7,20,41,0) 0%, rgba(7,20,41,0.55) 55%, var(--navy-abismo) 100%)",
          }}
        />
        <div
          aria-hidden
          className="absolute left-1/2 top-[38%] h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-[120px]"
          style={{ background: "radial-gradient(circle, #008BED 0%, transparent 70%)" }}
        />

        <div className="relative mx-auto w-full max-w-[1240px]">
          <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-white/45">
            Federación Colombiana de la Industria de Software y TI
          </p>
          <h1 className="mt-6 max-w-[16ch] font-display text-[clamp(44px,8.2vw,104px)] font-light leading-[0.98] tracking-[-0.02em]">
            Colombia, país origen de <span className="text-[var(--brand-azure)]">software</span>
          </h1>
          <p className="mt-7 max-w-[54ch] text-[clamp(16px,2vw,21px)] font-light leading-relaxed text-white/65">
            Treinta años representando a las empresas que construyen el software que mueve al país.
            Hoy son más de quinientas.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/portal"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[15px] font-semibold text-[var(--navy-abismo)] transition hover:bg-white/90"
            >
              Ingresar al portal <ArrowRight size={16} aria-hidden />
            </Link>
            <Link
              href="#afiliacion"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-6 py-3 text-[15px] font-semibold backdrop-blur transition hover:bg-white/15"
            >
              Afíliate <ArrowRight size={16} aria-hidden />
            </Link>
          </div>

          <div className="mt-16 flex flex-wrap items-center gap-x-10 gap-y-4">
            {["Cenisoft", "MinTIC", "MinCiencias"].map((s) => (
              <span key={s} className="font-mono text-[11.5px] uppercase tracking-[0.24em] text-white/30">
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Manifiesto: revelado palabra por palabra ───────────────── */}
      <section className="relative px-6 py-[18vh]">
        <div className="mx-auto max-w-[1240px]">
          <TextoRevelado
            texto="Fedesoft reúne a las empresas que escriben el código con el que Colombia trabaja, estudia, se atiende y se mueve — y que hoy empieza a mover al mundo."
            acento="empieza a mover al mundo."
            className="max-w-[24ch] font-display text-[clamp(30px,5.4vw,64px)] font-light leading-[1.14] tracking-[-0.015em]"
          />
        </div>
      </section>

      {/* ── La escala de ambición ──────────────────────────────────── */}
      <section className="relative overflow-hidden px-6 py-[14vh]">
        <div aria-hidden className="absolute inset-0 opacity-40">
          <CampoRed densidad={0.6} />
        </div>
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 70% at 70% 50%, rgba(7,20,41,0) 0%, rgba(7,20,41,0.7) 50%, var(--navy-abismo) 100%)",
          }}
        />
        <div className="relative mx-auto max-w-[1240px]">
          <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-white/45">La escala de la industria</p>
          <h2 className="mt-5 max-w-[18ch] font-display text-[clamp(30px,5vw,58px)] font-light leading-[1.08] tracking-[-0.015em]">
            Aspiramos a ser un país origen de software
          </h2>
          <div className="mt-12 max-w-[860px]">
            <Escala />
          </div>
        </div>
      </section>

      {/* ── Cifras ─────────────────────────────────────────────────── */}
      <section className="relative px-6 py-[14vh]">
        <div className="mx-auto max-w-[1240px]">
          <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-white/45">La federación en cifras</p>
          <div className="mt-12 grid gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
            {CIFRAS.map((c) => (
              <div key={c.unidad} className="border-t border-white/10 pt-6">
                <p className="font-display text-[clamp(46px,6vw,76px)] font-light leading-none tracking-[-0.03em]">
                  {c.valor}
                </p>
                <p className="mt-2 font-mono text-[12px] uppercase tracking-[0.16em] text-[var(--brand-azure)]">
                  {c.unidad}
                </p>
                <p className="mt-3 max-w-[34ch] text-[14.5px] font-light leading-relaxed text-white/55">{c.detalle}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Qué hace la federación (bloque claro, como el referente) ─ */}
      <section id="servicios" className="bg-white px-6 py-[14vh] text-[#0D2343]">
        <div className="mx-auto max-w-[1240px]">
          <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-[#637287]">Servicios gremiales</p>
          <h2 className="mt-5 max-w-[20ch] font-display text-[clamp(28px,4.6vw,52px)] font-light leading-[1.1] tracking-[-0.015em]">
            Lo que tu empresa obtiene al afiliarse
          </h2>
          <div className="mt-14 grid gap-x-12 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICIOS.map((s) => (
              <div key={s.titulo} className="border-t border-[#D9D9D9] pt-5">
                <h3 className="font-display text-[18px] font-bold">{s.titulo}</h3>
                <p className="mt-2 max-w-[38ch] text-[15px] leading-relaxed text-[#637287]">{s.detalle}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Cierre: el portal ──────────────────────────────────────── */}
      <section id="afiliacion" className="relative overflow-hidden px-6 py-[18vh]">
        <div aria-hidden className="absolute inset-0 opacity-50">
          <CampoRed densidad={0.8} />
        </div>
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 75% 65% at 50% 50%, rgba(7,20,41,0) 0%, rgba(7,20,41,0.6) 55%, var(--navy-abismo) 100%)",
          }}
        />
        <div className="relative mx-auto max-w-[1240px]">
          <h2 className="max-w-[20ch] font-display text-[clamp(32px,5.6vw,68px)] font-light leading-[1.06] tracking-[-0.02em]">
            Todo lo tuyo con la federación, en un solo lugar
          </h2>
          <p className="mt-7 max-w-[56ch] text-[clamp(16px,1.9vw,20px)] font-light leading-relaxed text-white/60">
            Tu afiliación, tu estado de cuenta con factura electrónica, tu certificado al instante, la formación de tu
            equipo y las oportunidades que te aplican. Sin formularios y sin esperas.
          </p>
          <div className="mt-11 flex flex-wrap gap-3">
            <Link
              href="/portal"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--navy-700)] px-7 py-3.5 text-[15.5px] font-semibold text-white transition hover:brightness-110"
            >
              Ingresar al portal <ArrowUpRight size={17} aria-hidden />
            </Link>
            <a
              href="mailto:info@fedesoft.org"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-7 py-3.5 text-[15.5px] font-semibold backdrop-blur transition hover:bg-white/15"
            >
              Hablar con la federación
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 py-10">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-4 text-[13px] text-white/40">
          <span className="font-mono uppercase tracking-[0.2em]">Fedesoft</span>
          <span>Prototipo de demostración · datos simulados</span>
        </div>
      </footer>
    </div>
  );
}
