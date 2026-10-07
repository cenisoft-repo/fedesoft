import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";
import { Card } from "./primitivos";

/**
 * La autorización no se finge escondiendo botones: quien entra por la URL a
 * algo que su rol no alcanza recibe esta pantalla, que explica por qué y a
 * quién acudir. En producción la respuesta es un 403 del servidor.
 */
export function SinPermiso({
  titulo,
  detalle,
  quienes,
  volverHref,
  volverTexto,
}: {
  titulo: string;
  detalle: string;
  /** Roles que sí tienen acceso, ya con su nombre visible. */
  quienes?: string[];
  volverHref: string;
  volverTexto: string;
}) {
  return (
    <Card className="mx-auto max-w-[560px]">
      <div className="grid justify-items-center gap-3 px-6 py-14 text-center">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-bg text-muted">
          <Lock size={22} aria-hidden />
        </div>
        <h1 className="font-display text-[20px] font-bold">{titulo}</h1>
        <p className="max-w-[46ch] text-[15px] text-muted">{detalle}</p>
        {quienes && quienes.length > 0 && (
          <p className="max-w-[46ch] text-[13.5px] text-muted">
            Tienen acceso: <span className="font-semibold text-ink">{quienes.join(", ")}</span>.
          </p>
        )}
        <Link
          href={volverHref}
          className="mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[14px] font-semibold text-link underline-offset-4 hover:underline"
        >
          <ArrowLeft size={15} aria-hidden /> {volverTexto}
        </Link>
      </div>
    </Card>
  );
}
