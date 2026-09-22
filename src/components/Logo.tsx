/** Wordmark de Fedesoft: `fede` en marino, `soft` en azul, con la barra que lo abraza. */
export function Logo({ compacto = false }: { compacto?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2" aria-label="Fedesoft">
      <span className="relative font-display text-[19px] font-extrabold leading-none tracking-tight">
        <span className="text-ink">fede</span>
        <span className="text-accent">soft</span>
        <span
          aria-hidden
          className="absolute -left-1 top-1/2 h-[3px] w-[calc(100%+8px)] -translate-y-1/2 rounded-full bg-accent opacity-15"
        />
      </span>
      {!compacto && (
        <>
          <span aria-hidden className="h-4 w-px bg-line" />
          <span className="text-[13px] font-semibold text-muted">Portal del Afiliado</span>
        </>
      )}
    </span>
  );
}
