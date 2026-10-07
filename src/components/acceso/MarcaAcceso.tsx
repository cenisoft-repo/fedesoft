import Link from "next/link";
import { Logo } from "../Logo";
import { VideoTextura } from "../landing/VideoTextura";

/**
 * Columna de marca del acceso al portal: metraje de la federación como
 * textura, el wordmark oficial y la promesa del portal. La comparten el acceso
 * simulado y el del modo API, para que ambos se vean igual.
 */
export function MarcaAcceso({ pie }: { pie: string }) {
  return (
    <aside className="relative hidden overflow-hidden bg-navy-abismo px-12 py-14 lg:flex lg:flex-col lg:justify-between">
      {/* Tinte navy y velo: el texto blanco conserva contraste AA sobre cualquier fotograma. */}
      <VideoTextura
        src="/recursos/video/equipo-oficina.mp4"
        poster="/recursos/video/equipo-oficina-poster.jpg"
        className="opacity-50"
        activo
      />
      <div aria-hidden className="absolute inset-0 bg-[var(--brand-azure)] opacity-[0.14] mix-blend-overlay" />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(7,20,41,0.72) 0%, rgba(7,20,41,0.45) 38%, rgba(7,20,41,0.78) 70%, var(--navy-abismo) 100%)",
        }}
      />
      <div
        aria-hidden
        className="absolute left-1/2 top-1/3 h-[560px] w-[560px] -translate-x-1/2 rounded-full opacity-25 blur-[130px]"
        style={{ background: "radial-gradient(circle, #008BED 0%, transparent 70%)" }}
      />
      <Link href="/" aria-label="Fedesoft · ir al inicio" className="relative w-fit rounded">
        <Logo tema="oscuro" alto={34} />
      </Link>
      <div className="relative">
        <span aria-hidden className="mb-6 block h-1 w-14 rounded-full bg-[var(--brand-azure)]" />
        <h1 className="max-w-[16ch] font-display text-[clamp(32px,3.6vw,48px)] font-light leading-[1.05] text-white">
          Todo lo tuyo con la federación, en un solo lugar
        </h1>
        <p className="mt-6 max-w-[42ch] text-[16px] font-light leading-relaxed text-white/75">
          Tu afiliación, tu estado de cuenta, tu certificado y la formación de tu equipo. El portal se adapta a tu rol
          desde que entras.
        </p>
      </div>
      <p className="relative text-[12.5px] text-white/60">{pie}</p>
    </aside>
  );
}
