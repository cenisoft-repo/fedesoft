import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Mail, MapPin } from "lucide-react";
import { CampoRed } from "@/components/landing/CampoRed";
import { CapituloIA } from "@/components/landing/CapituloIA";
import { CapituloEscala } from "@/components/landing/CapituloEscala";
import { VideoTextura } from "@/components/landing/VideoTextura";
import { CapituloFederacion, type Pieza } from "@/components/landing/CapituloFederacion";
import { Firma } from "@/components/Logo";
import { Lienzo } from "@/components/landing/Lienzo";
import { velo } from "@/components/landing/velo";
import { MenuPrincipal } from "@/components/landing/MenuPrincipal";

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

/** Los nueve servicios gremiales, con las tarjetas que publica el sitio de la federación. */
const SERVICIOS = [
  { imagen: "representatividad", titulo: "Representatividad", detalle: "Voz de la industria ante el Estado y los gremios en las decisiones de política pública." },
  { imagen: "internacionalizacion", titulo: "Internacionalización", detalle: "Misiones comerciales, Softlanding y la ruta International Soft Route para salir a otros mercados." },
  { imagen: "eventos", titulo: "Eventos", detalle: "Softic, Premios Ingenio, RegiónLAB y el calendario gremial del año." },
  { imagen: "informacion-exclusiva", titulo: "Información exclusiva", detalle: "Cifras del sector, revenue por empleado y boletines normativos para decidir con datos." },
  { imagen: "verticales", titulo: "Acceso a verticales", detalle: "Mesas sectoriales donde se construyen consensos e iniciativas con los actores del sector." },
  { imagen: "networking", titulo: "Networking y encadenamiento", detalle: "Espacios para hacer negocio entre afiliados y encadenarse con empresas más grandes." },
  { imagen: "formacion-talento", titulo: "Formación y talento", detalle: "TrainingLAB, TIC Talks y Series C+I para actualizar equipos, y Talentsoft para atraerlos." },
  { imagen: "visibilidad", titulo: "Visibilidad", detalle: "Directorio verificado de la industria y espacio para difundir tu oferta ante otros afiliados." },
  { imagen: "proyectos", titulo: "Proyectos", detalle: "Oportunidades con entidades públicas y privadas, gestionadas con Cenisoft." },
];

/** Empresas afiliadas cuyos logos publica la federación en su sitio. */
const AFILIADAS = [
  "siigo", "open", "servinformacion", "siesa", "playtech", "vision-tecnologica", "wekall", "choucair",
  "comforce", "olimpia", "novaip", "cuantico", "optima", "firefly", "hp", "ifx",
];

/** Lo que hoy le cuesta a un afiliado y el portal resuelve. */
const RESUELVE = [
  "Afiliarse sin formularios en papel",
  "Certificado y sello al instante",
  "Factura electrónica que se emite sola",
  "Estado de cuenta en tiempo real",
  "Inscribir al equipo con un clic",
  "Saber quién participó en qué",
  "Directorio que se alimenta del perfil",
  "Oportunidades filtradas por perfil",
];

/**
 * La landing es el lienzo: oscuro por defecto (la firma cinematográfica) y claro solo
 * cuando la persona elige la vista clara. Los capítulos con metraje cambian de
 * composición —no solo de color—: en claro el video se invierte y se multiplica sobre
 * el papel, los velos son del color del lienzo y los halos azure bajan de intensidad.
 * Las secciones de cifras, servicios y afiliadas son papel en las dos vistas.
 */
export default function Landing() {
  return (
    <Lienzo>
      <MenuPrincipal />

      {/* ── Portada: metraje bajo el campo generativo ──────────────── */}
      <section className="relative grid min-h-dvh place-items-center overflow-hidden px-6">
        <VideoTextura
          src="/recursos/video/teclado-red.mp4"
          poster="/recursos/video/teclado-red-poster.jpg"
          className="opacity-30 claro:opacity-[0.2] claro:mix-blend-multiply claro:invert"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[var(--brand-azure)] opacity-[0.16] mix-blend-overlay claro:opacity-[0.05] claro:mix-blend-multiply"
        />
        <div aria-hidden className="absolute inset-0 opacity-60">
          <CampoRed densidad={1.1} />
        </div>
        {/* Viñeta pesada que funde el fondo al color del lienzo */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 80% 60% at 50% 45%, ${velo(0.25)} 0%, ${velo(0.72)} 55%, var(--lienzo-fondo) 100%)`,
          }}
        />
        <div
          aria-hidden
          className="absolute left-1/2 top-[38%] h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-[120px] claro:opacity-25"
          style={{ background: "radial-gradient(circle, var(--lienzo-acento) 0%, transparent 70%)" }}
        />

        <div className="relative mx-auto w-full max-w-[1240px]">
          <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-lienzo-tinta-5">
            Federación Colombiana de la Industria de Software y TI
          </p>
          <h1 className="mt-6 max-w-[16ch] font-display text-[clamp(44px,8.2vw,104px)] font-light leading-[0.98] tracking-[-0.02em]">
            Colombia, país origen de <span className="text-lienzo-acento">software</span>
          </h1>
          <p className="mt-7 max-w-[54ch] text-[clamp(16px,2vw,21px)] font-light leading-relaxed text-lienzo-tinta-3">
            Treinta años representando a las empresas que construyen el software que mueve al país.
            Hoy son más de quinientas.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/entrar"
              className="inline-flex items-center gap-2 rounded-full bg-lienzo-boton px-6 py-3 text-[15px] font-semibold text-lienzo-boton-tinta transition hover:bg-lienzo-boton-hover"
            >
              Ingresar al portal <ArrowRight size={16} aria-hidden />
            </Link>
            <Link
              href="#afiliacion"
              className="inline-flex items-center gap-2 rounded-full border border-lienzo-linea-fuerte bg-lienzo-relleno px-6 py-3 text-[15px] font-semibold backdrop-blur transition hover:bg-lienzo-relleno-3"
            >
              Afíliate <ArrowRight size={16} aria-hidden />
            </Link>
          </div>

          <div className="mt-16 flex flex-wrap items-center gap-x-6 gap-y-4 border-t border-lienzo-linea pt-7">
            {/* Dos artes del manual; la vista decide cuál se ve (lienzo.css), sin destello al hidratar */}
            <Image
              src="/recursos/logos/cenisoft-fondo-oscuro.webp"
              alt="Cenisoft"
              width={121}
              height={27}
              className="lienzo-arte-oscuro opacity-80"
            />
            <Image
              src="/recursos/logos/cenisoft-fondo-claro.webp"
              alt="Cenisoft"
              width={121}
              height={27}
              className="lienzo-arte-claro"
            />
            <span aria-hidden className="hidden h-5 w-px bg-lienzo-linea-2 sm:block" />
            <p className="max-w-[46ch] text-[13.5px] font-light leading-relaxed text-lienzo-tinta-5">
              Centro de innovación y productividad de la federación, reconocido por MinCiencias.
            </p>
          </div>
        </div>
      </section>

      {/* ── Manifiesto: capítulo inmersivo con el metraje de inteligencia artificial ── */}
      <CapituloIA />

      {/* ── La escala de ambición: segundo capítulo inmersivo ───────── */}
      <CapituloEscala />

      {/* ── Cifras del sector, en blanco, con los íconos en su trazo navy ── */}
      <section className="bg-white px-6 py-[14vh] text-[#0D2343]">
        <div className="mx-auto max-w-[1240px]">
          <p className="barra flex items-center gap-3 font-mono text-[12px] uppercase tracking-[0.2em] text-[#637287]">
            Cifras del sector
          </p>
          <h2 className="mt-5 max-w-[22ch] font-display text-[clamp(28px,4.4vw,50px)] font-light leading-[1.1] tracking-[-0.015em]">
            Una industria que ya pesa en la economía del país
          </h2>
          <div className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {SECTOR.map((c) => (
              <div key={c.unidad} className="border-t border-[#D9D9D9] pt-6">
                <Image src={c.icono} alt="" aria-hidden width={48} height={44} />
                <p className="num mt-6 font-display text-[clamp(38px,4.8vw,62px)] font-light leading-none tracking-[-0.03em]">
                  {c.valor}
                </p>
                <p className="mt-2.5 font-mono text-[12px] uppercase tracking-[0.16em] text-[var(--navy-700)]">
                  {c.unidad}
                </p>
                <p className="mt-3 max-w-[34ch] text-[14.5px] leading-relaxed text-[#637287]">{c.detalle}</p>
              </div>
            ))}
          </div>

          {/* La federación, en una sola línea */}
          <div className="mt-16 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-[#D9D9D9] pt-7 text-[13.5px] text-[#637287]">
            <span>30 años de representación gremial</span>
            <span aria-hidden className="h-3 w-px bg-[#D9D9D9]" />
            <span>Más de 500 empresas afiliadas</span>
            <span aria-hidden className="h-3 w-px bg-[#D9D9D9]" />
            <span>4 verticales: Salud, Financiera, Educación y Seguridad Digital</span>
            <span aria-hidden className="h-3 w-px bg-[#D9D9D9]" />
            <span>Cenisoft, centro reconocido por MinCiencias</span>
          </div>
        </div>
      </section>

      {/* ── La federación en marcha: travelling horizontal ─────────── */}
      <CapituloFederacion piezas={PIEZAS} otros={OTROS_PROGRAMAS} />

      {/* ── Servicios gremiales, con las tarjetas del sitio ────────── */}
      <section id="servicios" className="bg-[#f5f8fc] px-6 py-[14vh] text-[#0D2343]">
        <div className="mx-auto max-w-[1240px]">
          <p className="barra flex items-center gap-3 font-mono text-[12px] uppercase tracking-[0.2em] text-[#637287]">
            Servicios gremiales
          </p>
          <h2 className="mt-5 max-w-[20ch] font-display text-[clamp(28px,4.6vw,52px)] font-light leading-[1.1] tracking-[-0.015em]">
            Lo que tu empresa obtiene al afiliarse
          </h2>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICIOS.map((s) => (
              <article
                key={s.imagen}
                className="group overflow-hidden rounded-2xl border border-[#e3e9f1] bg-white shadow-[0_1px_2px_rgba(13,35,67,0.06)] transition hover:-translate-y-1 hover:shadow-[0_18px_40px_-20px_rgba(13,35,67,0.35)]"
              >
                {/* La tarjeta original trae el rótulo en el tercio inferior: se encuadra arriba y el título va en texto */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={`/recursos/servicios/${s.imagen}.webp`}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
                    className="object-cover object-top transition duration-700 group-hover:scale-[1.04]"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-display text-[17px] font-bold">{s.titulo}</h3>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-[#637287]">{s.detalle}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Las empresas que forman la federación ──────────────────── */}
      <section className="bg-white px-6 py-[12vh] text-[#0D2343]">
        <div className="mx-auto max-w-[1240px]">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="barra flex items-center gap-3 font-mono text-[12px] uppercase tracking-[0.2em] text-[#637287]">
                Las empresas que forman la federación
              </p>
              <h2 className="mt-5 max-w-[20ch] font-display text-[clamp(28px,4.4vw,50px)] font-light leading-[1.1] tracking-[-0.015em]">
                Más de quinientas afiliadas. Estas son algunas.
              </h2>
            </div>
            <Link
              href="/directorio"
              className="inline-flex items-center gap-2 rounded-full border border-[#D9D9D9] px-5 py-2.5 text-[14px] font-semibold text-[var(--navy-700)] transition hover:border-[var(--navy-700)]"
            >
              Ver el directorio <ArrowRight size={15} aria-hidden />
            </Link>
          </div>
          <ul className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[#e3e9f1] bg-[#e3e9f1] sm:grid-cols-4 lg:grid-cols-8">
            {AFILIADAS.map((a) => (
              <li key={a} className="grid h-24 place-items-center bg-white px-5">
                <Image
                  src={`/recursos/logos/afiliadas/${a}.webp`}
                  alt={a.replace(/-/g, " ")}
                  width={160}
                  height={64}
                  style={{ height: 40, width: "auto", maxWidth: 110 }}
                  className="object-contain opacity-80 grayscale transition duration-500 hover:opacity-100 hover:grayscale-0"
                />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Lo que el portal resuelve: la lista, sobre imagen ──────── */}
      <section className="relative overflow-hidden px-6 py-[14vh]">
        <VideoTextura
          src="/recursos/video/hud-portatil.mp4"
          poster="/recursos/video/hud-portatil-poster.jpg"
          className="opacity-60 claro:opacity-[0.3] claro:mix-blend-multiply"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[var(--brand-azure)] opacity-[0.16] mix-blend-overlay claro:opacity-[0.05] claro:mix-blend-multiply"
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: `linear-gradient(90deg, var(--lienzo-fondo) 0%, ${velo(0.94)} 40%, ${velo(0.55)} 75%, ${velo(0.2)} 100%)`,
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, var(--lienzo-fondo) 0%, ${velo(0)} 20%, ${velo(0)} 80%, var(--lienzo-fondo) 100%)`,
          }}
        />
        <div className="relative mx-auto max-w-[1240px]">
          <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-lienzo-tinta-5">El portal del afiliado</p>
          <h2 className="mt-5 max-w-[18ch] font-display text-[clamp(30px,5vw,58px)] font-light leading-[1.08] tracking-[-0.015em]">
            Lo que hoy cuesta, <span className="text-lienzo-tinta-5">resuelto.</span>
          </h2>
          <ol className="mt-12 grid max-w-[820px] gap-x-12 gap-y-1 sm:grid-cols-2">
            {RESUELVE.map((r, i) => (
              <li key={r} className="flex items-baseline gap-4 border-b border-lienzo-linea py-3.5">
                <span className="num font-mono text-[12px] text-lienzo-tinta-6">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-[15.5px] font-light text-lienzo-tinta-2">{r}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Cierre: el portal ──────────────────────────────────────── */}
      <section id="afiliacion" className="relative overflow-hidden px-6 py-[18vh]">
        <VideoTextura
          src="/recursos/video/equipo-oficina.mp4"
          poster="/recursos/video/equipo-oficina-poster.jpg"
          className="opacity-30 claro:opacity-[0.25] claro:mix-blend-multiply"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[var(--brand-azure)] opacity-[0.12] mix-blend-overlay claro:opacity-[0.05] claro:mix-blend-multiply"
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: `linear-gradient(90deg, var(--lienzo-fondo) 0%, ${velo(0.9)} 46%, ${velo(0.6)} 100%)`,
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, var(--lienzo-fondo) 0%, ${velo(0)} 26%, ${velo(0)} 74%, var(--lienzo-fondo) 100%)`,
          }}
        />
        <div className="relative mx-auto max-w-[1240px]">
          <h2 className="max-w-[20ch] font-display text-[clamp(32px,5.6vw,68px)] font-light leading-[1.06] tracking-[-0.02em]">
            Todo lo tuyo con la federación, en un solo lugar
          </h2>
          <p className="mt-7 max-w-[56ch] text-[clamp(16px,1.9vw,20px)] font-light leading-relaxed text-lienzo-tinta-3">
            Tu afiliación, tu estado de cuenta con factura electrónica, tu certificado al instante, la formación de tu
            equipo y las oportunidades que te aplican. Sin formularios y sin esperas.
          </p>
          <div className="mt-11 flex flex-wrap gap-3">
            <Link
              href="/entrar"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--navy-700)] px-7 py-3.5 text-[15.5px] font-semibold text-white transition hover:brightness-110"
            >
              Ingresar al portal <ArrowUpRight size={17} aria-hidden />
            </Link>
            <a
              href="mailto:info@fedesoft.org"
              className="inline-flex items-center gap-2 rounded-full border border-lienzo-linea-fuerte bg-lienzo-relleno px-7 py-3.5 text-[15.5px] font-semibold backdrop-blur transition hover:bg-lienzo-relleno-3"
            >
              Hablar con la federación
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-lienzo-linea px-6 py-12">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-end justify-between gap-x-10 gap-y-8">
          <div className="grid gap-5">
            <Firma tema="lienzo" alto={26} />
            <div className="grid gap-1.5 text-[13.5px] font-light text-lienzo-tinta-5">
              <span className="inline-flex items-center gap-2">
                <MapPin size={14} aria-hidden className="text-lienzo-tinta-6" />
                Edificio IQ · Cra. 11a #97a-19, oficina 304 · Bogotá D.C.
              </span>
              <a href="mailto:info@fedesoft.org" className="inline-flex w-fit items-center gap-2 transition hover:text-lienzo-tinta">
                <Mail size={14} aria-hidden className="text-lienzo-tinta-6" />
                info@fedesoft.org
              </a>
            </div>
          </div>
          <span className="text-[13px] text-lienzo-tinta-6">Prototipo de demostración · datos simulados</span>
        </div>
      </footer>
    </Lienzo>
  );
}
