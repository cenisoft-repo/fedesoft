"use client";

import { useEffect } from "react";

/**
 * Funde el cambio de vista clara/oscura en el lienzo. Observa el atributo
 * `data-theme` del documento y, mientras dura el cambio, marca `vista-cambia`
 * (lienzo.css) para que los colores se mezclen en vez de saltar. No renderiza
 * nada y respeta `prefers-reduced-motion`.
 */
export function TransicionVista() {
  useEffect(() => {
    const raiz = document.documentElement;
    let temporizador: ReturnType<typeof setTimeout> | undefined;

    const observador = new MutationObserver(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      raiz.classList.add("vista-cambia");
      clearTimeout(temporizador);
      temporizador = setTimeout(() => raiz.classList.remove("vista-cambia"), 500);
    });
    observador.observe(raiz, { attributes: true, attributeFilter: ["data-theme"] });

    return () => {
      observador.disconnect();
      clearTimeout(temporizador);
      raiz.classList.remove("vista-cambia");
    };
  }, []);

  return null;
}
