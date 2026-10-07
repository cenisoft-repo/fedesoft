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

/**
 * `auto`: sigue la vista del portal (equipo o botón). `oscuro`: fijo para fondos navy de
 * marca (cabecera de la consola, columna de video). `lienzo`: sigue la vista del lienzo de
 * la landing —oscuro por defecto, claro solo si la persona lo eligió—.
 */
type Tema = "auto" | "oscuro" | "lienzo";

/** Escala un arte a la altura pedida sin deformarlo. */
function medidas(arte: { w: number; h: number }, alto: number) {
  return { width: Math.round((alto * arte.w) / arte.h), height: alto };
}

/**
 * Wordmark oficial de Fedesoft. El manual trae dos artes —fondo claro y fondo
 * oscuro— y aquí se intercambian por CSS: el tema puede venir del sistema o del
 * botón, así que el cambio no depende de JavaScript ni parpadea al hidratar.
 * `tema="oscuro"` lo fija para fondos navy de marca; `tema="lienzo"` es para la landing y
 * las páginas públicas, cuyo lienzo es oscuro salvo que la persona elija la vista clara.
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
      {tema !== "oscuro" && (
        <Image
          src={WORDMARK.claro.src}
          alt="Fedesoft"
          {...medidas(WORDMARK.claro, alto)}
          loading="eager"
          className={tema === "auto" ? "marca-claro" : "lienzo-arte-claro"}
        />
      )}
      <Image
        src={WORDMARK.oscuro.src}
        alt="Fedesoft"
        {...medidas(WORDMARK.oscuro, alto)}
        loading="eager"
        className={tema === "auto" ? "marca-oscuro" : tema === "lienzo" ? "lienzo-arte-oscuro" : undefined}
      />
      {!compacto && (
        <>
          {/* Sobre fondo oscuro fijo, el subtítulo pasa a blanco translúcido para conservar contraste AA. */}
          <span aria-hidden className={`h-4 w-px ${SUBTITULO[tema].linea}`} />
          <span className={`text-[13px] font-semibold ${SUBTITULO[tema].texto}`}>Portal del Afiliado</span>
        </>
      )}
    </span>
  );
}

/** Línea y texto del subtítulo según el fondo sobre el que va el wordmark. */
const SUBTITULO: Record<Tema, { linea: string; texto: string }> = {
  auto: { linea: "bg-line", texto: "text-muted" },
  oscuro: { linea: "bg-white/30", texto: "text-white/80" },
  lienzo: { linea: "bg-lienzo-linea-fuerte", texto: "text-lienzo-tinta-2" },
};

/**
 * Firma institucional Fedesoft | Cenisoft para los pies de página. El arte de
 * fondo oscuro se derivó del par oficial del wordmark: sobre navy el azul de
 * marca pasa a blanco y el navy pasa a azul.
 */
export function Firma({ alto = 20, tema = "auto" }: { alto?: number; tema?: Tema }) {
  return (
    <span className="inline-flex items-center">
      {tema !== "oscuro" && (
        <Image
          src={FIRMA.claro.src}
          alt="Fedesoft y Cenisoft"
          {...medidas(FIRMA.claro, alto)}
          className={tema === "auto" ? "marca-claro" : "lienzo-arte-claro"}
        />
      )}
      <Image
        src={FIRMA.oscuro.src}
        alt="Fedesoft y Cenisoft"
        {...medidas(FIRMA.oscuro, alto)}
        className={tema === "auto" ? "marca-oscuro" : tema === "lienzo" ? "lienzo-arte-oscuro" : undefined}
      />
    </span>
  );
}
