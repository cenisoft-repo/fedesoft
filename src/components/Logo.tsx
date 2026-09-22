import Image from "next/image";

/* Artes oficiales del manual, con sus medidas intrínsecas. */
const WORDMARK = {
  claro: { src: "/recursos/logos/fedesoft-fondo-claro.webp", w: 797, h: 167 },
  oscuro: { src: "/recursos/logos/fedesoft-fondo-oscuro.webp", w: 1024, h: 214 },
};

const FIRMA = {
  claro: { src: "/recursos/logos/fedesoft-cenisoft.png", w: 723, h: 120 },
  oscuro: { src: "/recursos/logos/fedesoft-cenisoft-oscuro.webp", w: 723, h: 120 },
};

type Tema = "auto" | "oscuro";

/** Escala un arte a la altura pedida sin deformarlo. */
function medidas(arte: { w: number; h: number }, alto: number) {
  return { width: Math.round((alto * arte.w) / arte.h), height: alto };
}

/**
 * Wordmark oficial de Fedesoft. El manual trae dos artes —fondo claro y fondo
 * oscuro— y aquí se intercambian por CSS: el tema puede venir del sistema o del
 * botón, así que el cambio no depende de JavaScript ni parpadea al hidratar.
 * `tema="oscuro"` lo fija para la landing, que pinta su propio lienzo navy.
 */
export function Logo({
  compacto = false,
  alto = 22,
  tema = "auto",
}: {
  compacto?: boolean;
  alto?: number;
  tema?: Tema;
}) {
  return (
    <span className="inline-flex items-center gap-2.5">
      {tema === "auto" && (
        <Image
          src={WORDMARK.claro.src}
          alt="Fedesoft"
          {...medidas(WORDMARK.claro, alto)}
          loading="eager"
          className="marca-claro"
        />
      )}
      <Image
        src={WORDMARK.oscuro.src}
        alt="Fedesoft"
        {...medidas(WORDMARK.oscuro, alto)}
        loading="eager"
        className={tema === "auto" ? "marca-oscuro" : undefined}
      />
      {!compacto && (
        <>
          <span aria-hidden className="h-4 w-px bg-line" />
          <span className="text-[13px] font-semibold text-muted">Portal del Afiliado</span>
        </>
      )}
    </span>
  );
}

/**
 * Firma institucional Fedesoft | Cenisoft para los pies de página. El arte de
 * fondo oscuro se derivó del par oficial del wordmark: sobre navy el azul de
 * marca pasa a blanco y el navy pasa a azul.
 */
export function Firma({ alto = 20, tema = "auto" }: { alto?: number; tema?: Tema }) {
  return (
    <span className="inline-flex items-center">
      {tema === "auto" && (
        <Image
          src={FIRMA.claro.src}
          alt="Fedesoft y Cenisoft"
          {...medidas(FIRMA.claro, alto)}
          className="marca-claro"
        />
      )}
      <Image
        src={FIRMA.oscuro.src}
        alt="Fedesoft y Cenisoft"
        {...medidas(FIRMA.oscuro, alto)}
        className={tema === "auto" ? "marca-oscuro" : undefined}
      />
    </span>
  );
}
