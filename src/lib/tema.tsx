"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { CLAVE_TEMA as CLAVE } from "./tema-script";

export type Tema = "claro" | "oscuro";
type Preferencia = Tema | "sistema";

const atributo = (t: Tema) => (t === "oscuro" ? "dark" : "light");
const esTema = (v: unknown): v is Tema => v === "claro" || v === "oscuro";

interface ContextoTema {
  preferencia: Preferencia;
  sistema: Tema;
  elegir: (t: Tema) => void;
}

const Ctx = createContext<ContextoTema | null>(null);

/**
 * Vista clara u oscura a elección de la persona, la misma en todo el sitio y
 * recordada en este navegador. Sin elección, cada superficie usa la suya: el
 * portal y la consola siguen al equipo; la landing, su lienzo oscuro.
 */
export function TemaProvider({ children }: { children: React.ReactNode }) {
  const [preferencia, setPreferencia] = useState<Preferencia>("sistema");
  const [sistema, setSistema] = useState<Tema>("claro");

  useEffect(() => {
    try {
      const guardado = window.localStorage.getItem(CLAVE);
      if (esTema(guardado)) setPreferencia(guardado);
    } catch {
      /* sin almacenamiento: vale la del equipo */
    }
    const consulta = window.matchMedia("(prefers-color-scheme: dark)");
    const alCambiarEquipo = () => setSistema(consulta.matches ? "oscuro" : "claro");
    alCambiarEquipo();
    consulta.addEventListener("change", alCambiarEquipo);

    /* Otra pestaña cambió la vista: esta la sigue. */
    const alAlmacenar = (e: StorageEvent) => {
      if (e.key !== CLAVE || !esTema(e.newValue)) return;
      setPreferencia(e.newValue);
      document.documentElement.setAttribute("data-theme", atributo(e.newValue));
    };
    window.addEventListener("storage", alAlmacenar);
    return () => {
      consulta.removeEventListener("change", alCambiarEquipo);
      window.removeEventListener("storage", alAlmacenar);
    };
  }, []);

  const elegir = useCallback((t: Tema) => {
    setPreferencia(t);
    document.documentElement.setAttribute("data-theme", atributo(t));
    try {
      window.localStorage.setItem(CLAVE, t);
    } catch {
      /* sin almacenamiento: la vista sigue aplicada en esta página */
    }
  }, []);

  const valor = useMemo(() => ({ preferencia, sistema, elegir }), [preferencia, sistema, elegir]);
  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

/**
 * La vista que ve la persona en esta superficie. `predeterminado` es la de la
 * superficie cuando nadie ha elegido (la landing pasa "oscuro").
 */
export function useTema(predeterminado?: Tema) {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useTema necesita TemaProvider");
  const tema: Tema = ctx.preferencia === "sistema" ? (predeterminado ?? ctx.sistema) : ctx.preferencia;
  const { elegir } = ctx;
  const alternar = useCallback(() => elegir(tema === "oscuro" ? "claro" : "oscuro"), [elegir, tema]);
  return { tema, elegido: ctx.preferencia !== "sistema", elegir, alternar };
}
