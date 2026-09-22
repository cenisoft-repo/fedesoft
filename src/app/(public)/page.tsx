import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Mail, MapPin } from "lucide-react";
import { CampoRed } from "@/components/landing/CampoRed";
import { TextoRevelado } from "@/components/landing/TextoRevelado";
import { Escala } from "@/components/landing/Escala";
import { VideoTextura } from "@/components/landing/VideoTextura";
import { Mosaico, type Pieza } from "@/components/landing/Mosaico";
import { Logo, Firma } from "@/components/Logo";

/** Cifras publicadas por Fedesoft, con los íconos del sitio institucional. */
const SECTOR = [
  {
    icono: "/recursos/iconos/empresas-crecimiento.webp",
    valor: "6.805",
    unidad: "empresas de software",
    detalle: "registradas en la industria nacional de software y TI",
  },
  {
    icono: "/recursos/iconos/talento-personas.webp",
    valor: "406.000",
    unidad: "empleos",
    detalle: "generados por el sector durante 2024",
  },
  {
    icono: "/recursos/iconos/pib-colombia.webp",
    valor: "3,7 %",
    unidad: "de representación en el PIB",
    detalle: "frente a menos del 1 % en 2010",
  },
  {
    icono: "/recursos/iconos/ingresos-crecimiento.webp",
    valor: "$44,2",
    unidad: "billones facturados",
    detalle: "por la industria durante 2024",
  },
];

/** Frentes, verticales e iniciativas reales, cada uno con su propio metraje. */
const PIEZAS: Pieza[] = [
  {
    titulo: "Softic",
    bajada: "El encuentro anual donde la industria se reconoce y hace negocio.",
    video: "apreton-digital",
    logo: { src: "/recursos/logos/softic-blanco.webp", alto: 30, w: 545, h: 165 },
  },
  {
    titulo: "Talentsoft",
    bajada: "La plataforma de vacantes y perfiles TI para las empresas afiliadas.",
    video: "codigo-pantalla",
    logo: { src: "/recursos/logos/talentsoft-blanco.webp", alto: 22, w: 1664, h: 327 },
  },
  {
    titulo: "Softlanding",
    bajada: "Aterrizaje de empresas colombianas en mercados externos.",
    video: "mapa-global",
  },
  {
    titulo: "TrainingLAB",
    bajada: "Formación técnica para los equipos de las empresas afiliadas.",
    video: "codigo-editor",
  },
  {
    titulo: "Seguridad y Confianza Digital",
    bajada: "Una de las cuatro verticales donde el gremio construye consenso.",
    video: "centro-seguridad",
  },
  {
    titulo: "Identidad digital",
    bajada: "Verificación y confianza en línea: el nuevo perímetro del negocio.",
    video: "identidad-digital",
  },
  {
    titulo: "Inteligencia artificial",
    bajada: "La agenda que atraviesa al sector, en Series C+I y TIC Talks.",
    video: "reconocimiento-ia",
  },
  {
    titulo: "Competitividad nacional",
    bajada: "Política pública y compra estatal de tecnología colombiana.",
    video: "sector-publico",
  },
  {
    titulo: "Ciberseguridad empresarial",
    bajada: "Proteger el negocio, no solo la red: mesas de trabajo y formación.",
    video: "ciberseguridad",
  },
];

const OTROS_PROGRAMAS = [
  "Premios Ingenio",
  "RegiónLAB",
  "Bebras Colombia",
  "Creadores TI",
  "Maratón de Inmersión",
  "Concurso Nacional de Programación",
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
          <Logo tema="oscuro" compacto alto={22} />
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

      {/* ── Portada: metraje bajo el campo generativo ──────────────── */}
      <section className="relative grid min-h-dvh place-items-center overflow-hidden px-6">
        <VideoTextura
          src="/recursos/video/teclado-red.mp4"
          poster="/recursos/video/teclado-red-poster.jpg"
          className="opacity-30"
        />
        <div aria-hidden className="absolute inset-0 bg-[var(--brand-azure)] opacity-[0.16] mix-blend-overlay" />
        <div aria-hidden className="absolute inset-0 opacity-60">
          <CampoRed densidad={1.1} />
        </div>
        {/* Viñeta pesada que funde el fondo al navy */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 45%, rgba(7,20,41,0.25) 0%, rgba(7,20,41,0.72) 55%, var(--navy-abismo) 100%)",
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
          <p className="mt-7 max-w-[54ch] text-[clamp(16px,2vw,21px)] font-light leading-relaxed text-white/70">
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

      {/* ── Manifiesto, con el panel de inteligencia artificial ────── */}
      <section className="relative px-6 py-[18vh]">
        <div className="mx-auto grid max-w-[1240px] items-center gap-14 lg:grid-cols-[1fr_300px]">
          <TextoRevelado
            texto="Fedesoft reúne a las empresas que escriben el código con el que Colombia trabaja, estudia, se atiende y se mueve — y que hoy empieza a mover al mundo."
            acento="empieza a mover al mundo."
            className="max-w-[24ch] font-display text-[clamp(30px,5.4vw,64px)] font-light leading-[1.14] tracking-[-0.015em]"
          />
          <div className="relative mx-auto aspect-[9/16] w-full max-w-[300px] overflow-hidden rounded-2xl border border-white/10">
            <VideoTextura
              src="/recursos/video/ia-volumen.mp4"
              poster="/recursos/video/ia-volumen-poster.jpg"
              className="opacity-80"
            />
            <div aria-hidden className="absolute inset-0 bg-[var(--brand-azure)] opacity-[0.2] mix-blend-overlay" />
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(7,20,41,0.2) 0%, rgba(7,20,41,0.1) 45%, rgba(7,20,41,0.92) 100%)",
              }}
            />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--brand-azure)]">
                Inteligencia artificial
              </p>
              <p className="mt-2 text-[13.5px] font-light leading-relaxed text-white/60">
                La capacidad que está redefiniendo lo que la industria colombiana puede exportar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── La escala de ambición ──────────────────────────────────── */}
      <section className="relative overflow-hidden px-6 py-[14vh]">
        <VideoTextura
          src="/recursos/video/rostro-datos.mp4"
          poster="/recursos/video/rostro-datos-poster.jpg"
          className="opacity-[0.28]"
        />
        <div aria-hidden className="absolute inset-0 bg-[var(--brand-azure)] opacity-[0.14] mix-blend-overlay" />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 70% at 72% 50%, rgba(7,20,41,0.2) 0%, rgba(7,20,41,0.82) 48%, var(--navy-abismo) 100%)",
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

      {/* ── Cifras del sector, con los íconos institucionales ──────── */}
      <section className="relative overflow-hidden px-6 py-[14vh]">
        <VideoTextura
          src="/recursos/video/hud-portatil.mp4"
          poster="/recursos/video/hud-portatil-poster.jpg"
          className="opacity-[0.16]"
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, var(--navy-abismo) 0%, rgba(7,20,41,0.76) 30%, rgba(7,20,41,0.76) 70%, var(--navy-abismo) 100%)",
          }}
        />
        <div className="relative mx-auto max-w-[1240px]">
          <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-white/45">Cifras del sector</p>
          <div className="mt-12 grid gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
            {SECTOR.map((c) => (
              <div key={c.unidad} className="border-t border-white/10 pt-6">
                <Image src={c.icono} alt="" aria-hidden width={44} height={40} className="icono-calado opacity-75" />
                <p className="num mt-6 font-display text-[clamp(38px,4.8vw,62px)] font-light leading-none tracking-[-0.03em]">
                  {c.valor}
                </p>
                <p className="mt-2.5 font-mono text-[12px] uppercase tracking-[0.16em] text-[var(--brand-azure)]">
                  {c.unidad}
                </p>
                <p className="mt-3 max-w-[34ch] text-[14.5px] font-light leading-relaxed text-white/55">{c.detalle}</p>
              </div>
            ))}
          </div>

          {/* La federación, en una sola línea */}
          <div className="mt-16 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-white/10 pt-7 text-[13.5px] font-light text-white/45">
            <span>30 años de representación gremial</span>
            <span aria-hidden className="h-3 w-px bg-white/15" />
            <span>Más de 500 empresas afiliadas</span>
            <span aria-hidden className="h-3 w-px bg-white/15" />
            <span>4 verticales: Salud, Financiera, Educación y Seguridad Digital</span>
            <span aria-hidden className="h-3 w-px bg-white/15" />
            <span>Cenisoft, centro reconocido por MinCiencias</span>
          </div>
        </div>
      </section>

      {/* ── La pared de metraje: la federación en marcha ───────────── */}
      <section className="relative px-6 pb-[14vh]">
        <div className="mx-auto max-w-[1240px] border-t border-white/10 pt-[10vh]">
          <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-white/45">La federación en marcha</p>
          <h2 className="mt-5 max-w-[22ch] font-display text-[clamp(28px,4.4vw,50px)] font-light leading-[1.1] tracking-[-0.015em]">
            Frentes, verticales e iniciativas con nombre propio
          </h2>
          <div className="mt-12">
            <Mosaico piezas={PIEZAS} />
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2.5">
            <span className="font-mono text-[11.5px] uppercase tracking-[0.18em] text-white/30">Y además</span>
            {OTROS_PROGRAMAS.map((p) => (
              <span key={p} className="text-[14px] font-light text-white/45">
                {p}
              </span>
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
        <VideoTextura
          src="/recursos/video/equipo-oficina.mp4"
          poster="/recursos/video/equipo-oficina-poster.jpg"
          className="opacity-30"
        />
        <div aria-hidden className="absolute inset-0 bg-[var(--brand-azure)] opacity-[0.12] mix-blend-overlay" />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, var(--navy-abismo) 0%, rgba(7,20,41,0.9) 46%, rgba(7,20,41,0.6) 100%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, var(--navy-abismo) 0%, rgba(7,20,41,0) 26%, rgba(7,20,41,0) 74%, var(--navy-abismo) 100%)",
          }}
        />
        <div className="relative mx-auto max-w-[1240px]">
          <h2 className="max-w-[20ch] font-display text-[clamp(32px,5.6vw,68px)] font-light leading-[1.06] tracking-[-0.02em]">
            Todo lo tuyo con la federación, en un solo lugar
          </h2>
          <p className="mt-7 max-w-[56ch] text-[clamp(16px,1.9vw,20px)] font-light leading-relaxed text-white/70">
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

      <footer className="border-t border-white/10 px-6 py-12">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-end justify-between gap-x-10 gap-y-8">
          <div className="grid gap-5">
            <Firma tema="oscuro" alto={26} />
            <div className="grid gap-1.5 text-[13.5px] font-light text-white/45">
              <span className="inline-flex items-center gap-2">
                <MapPin size={14} aria-hidden className="text-white/30" />
                Edificio IQ · Cra. 11a #97a-19, oficina 304 · Bogotá D.C.
              </span>
              <a href="mailto:info@fedesoft.org" className="inline-flex w-fit items-center gap-2 transition hover:text-white">
                <Mail size={14} aria-hidden className="text-white/30" />
                info@fedesoft.org
              </a>
            </div>
          </div>
          <span className="text-[13px] text-white/35">Prototipo de demostración · datos simulados</span>
        </div>
      </footer>
    </div>
  );
}
