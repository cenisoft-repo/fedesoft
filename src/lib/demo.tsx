"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DATALABS, DATALABS_VENCIDA, VERTICE } from "./mock/empresas";
import type { Empresa, Rol } from "./mock/tipos";

export type EscenarioId = "mipyme-al-dia" | "mipyme-vencida" | "talento" | "grande";

export interface Escenario {
  id: EscenarioId;
  etiqueta: string;
  descripcion: string;
  demuestra: string;
  empresa: Empresa;
  rol: Rol;
  contactoId: string;
}

export const ESCENARIOS: Escenario[] = [
  {
    id: "mipyme-al-dia",
    etiqueta: "Gerente · MIPYME al día",
    descripcion: "Camilo Restrepo · Datalabs Andina",
    demuestra: "La experiencia completa: todo habilitado y el certificado a un clic.",
    empresa: DATALABS,
    rol: "gerente",
    contactoId: "c1",
  },
  {
    id: "mipyme-vencida",
    etiqueta: "Gerente · pago vencido",
    descripcion: "Camilo Restrepo · Datalabs Andina",
    demuestra: "Las reglas de negocio: el certificado se bloquea y se explica por qué.",
    empresa: DATALABS_VENCIDA,
    rol: "gerente",
    contactoId: "c1",
  },
  {
    id: "talento",
    etiqueta: "Líder de talento humano",
    descripcion: "Diana Salazar · Datalabs Andina",
    demuestra: "La segmentación por rol: ve formación, no ve facturación.",
    empresa: DATALABS,
    rol: "talento",
    contactoId: "c2",
  },
  {
    id: "grande",
    etiqueta: "Gerente · empresa grande",
    descripcion: "Marcela Betancur · Sistemas Vértice",
    demuestra: "El Eje 2: aparece la cuenta estratégica con su gestor asignado.",
    empresa: VERTICE,
    rol: "gerente",
    contactoId: "v1",
  },
];

interface DemoState {
  escenario: Escenario;
  cambiarEscenario: (id: EscenarioId) => void;
  /** El pago simulado de esta sesión, si ya ocurrió. */
  pagoRealizado: boolean;
  registrarPago: () => void;
  inscripciones: string[];
  alternarInscripcion: (actividadId: string) => void;
}

const Ctx = createContext<DemoState | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [id, setId] = useState<EscenarioId>("mipyme-al-dia");
  const [pagoRealizado, setPagoRealizado] = useState(false);
  const [inscripciones, setInscripciones] = useState<string[]>(["a1"]);

  const valor = useMemo<DemoState>(() => {
    const base = ESCENARIOS.find((e) => e.id === id) ?? ESCENARIOS[0];
    // Tras pagar, la empresa queda al día dentro de la demostración.
    const escenario: Escenario =
      pagoRealizado && base.empresa.estado !== "al-dia"
        ? {
            ...base,
            empresa: {
              ...base.empresa,
              estado: "al-dia",
              vigenciaHasta: "2026-12-31",
              cargos: base.empresa.cargos.map((c) => ({ ...c, estado: "pagado" as const })),
            },
          }
        : base;

    return {
      escenario,
      cambiarEscenario: (nuevo) => {
        setId(nuevo);
        setPagoRealizado(false);
      },
      pagoRealizado,
      registrarPago: () => setPagoRealizado(true),
      inscripciones,
      alternarInscripcion: (actividadId) =>
        setInscripciones((prev) =>
          prev.includes(actividadId) ? prev.filter((x) => x !== actividadId) : [...prev, actividadId],
        ),
    };
  }, [id, pagoRealizado, inscripciones]);

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export function useDemo(): DemoState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useDemo debe usarse dentro de DemoProvider");
  return ctx;
}

/** Tema claro/oscuro persistido en el navegador. */
export function useTema() {
  const [tema, setTema] = useState<"claro" | "oscuro" | null>(null);

  useEffect(() => {
    const guardado = typeof window !== "undefined" ? window.localStorage.getItem("fedesoft-tema") : null;
    if (guardado === "claro" || guardado === "oscuro") {
      setTema(guardado);
      document.documentElement.setAttribute("data-theme", guardado === "oscuro" ? "dark" : "light");
    }
  }, []);

  const alternar = () => {
    const siguiente = tema === "oscuro" ? "claro" : "oscuro";
    setTema(siguiente);
    document.documentElement.setAttribute("data-theme", siguiente === "oscuro" ? "dark" : "light");
    try {
      window.localStorage.setItem("fedesoft-tema", siguiente);
    } catch {
      /* almacenamiento no disponible: el tema sigue aplicado en la sesión */
    }
  };

  return { tema, alternar };
}
