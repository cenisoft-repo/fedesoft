import Image from "next/image";
import { VideoTextura } from "./VideoTextura";

export interface Pieza {
  /** Se usa como título cuando la pieza no trae marca propia. */
  titulo: string;
  bajada: string;
  /** Nombre base del clip en /recursos/video. */
  video: string;
  logo?: { src: string; alto: number; w: number; h: number };
}

/**
 * La pared de metraje: cada frente, vertical o iniciativa con su propia
 * imagen en movimiento. Todo el material llega en gris y se tiñe aquí con
 * el azul de marca, así que nueve clips distintos leen como una sola pieza.
 */
export function Mosaico({ piezas }: { piezas: Pieza[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {piezas.map((p) => (
        <article
          key={p.titulo}
          className="group relative isolate aspect-video overflow-hidden rounded-xl border border-white/10"
        >
          <VideoTextura
            src={`/recursos/video/${p.video}.mp4`}
            poster={`/recursos/video/${p.video}-poster.jpg`}
            className="opacity-70 transition duration-700 group-hover:scale-[1.04] group-hover:opacity-90"
          />
          <div aria-hidden className="absolute inset-0 bg-[var(--brand-azure)] opacity-[0.18] mix-blend-overlay" />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(7,20,41,0.1) 0%, rgba(7,20,41,0.42) 52%, rgba(7,20,41,0.93) 100%)",
            }}
          />
          <div className="absolute inset-x-0 bottom-0 p-5">
            {p.logo ? (
              <Image
                src={p.logo.src}
                alt={p.titulo}
                width={Math.round((p.logo.alto * p.logo.w) / p.logo.h)}
                height={p.logo.alto}
                className="opacity-90"
              />
            ) : (
              <h3 className="font-display text-[17px] font-semibold leading-snug">{p.titulo}</h3>
            )}
            <p className="mt-2 max-w-[32ch] text-[13px] font-light leading-relaxed text-white/60">{p.bajada}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
