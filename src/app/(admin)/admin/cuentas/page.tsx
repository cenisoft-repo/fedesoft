"use client";

import { useState, type FormEvent } from "react";
import { MessageSquarePlus, Target } from "lucide-react";
import { CUENTAS_ESTRATEGICAS, INTERACCIONES, type CuentaEstrategica } from "@/lib/mock/consola";
import { ASIGNACIONES_KAM } from "@/lib/mock/usuarios";
import { HOY, fecha } from "@/lib/format";
import { useAccesoConsola } from "@/lib/useAcceso";
import { useIdentidad } from "@/lib/identidad";
import { AvisoEnfocado, AvisoNivel } from "@/components/admin/AvisoNivel";
import { Boton, Card, Chip, Eyebrow, PageHeader, Vacio } from "@/components/ui/primitivos";

const SALUD: Record<CuentaEstrategica["salud"], { tono: "exito" | "aviso" | "error"; texto: string }> = {
  estable: { tono: "exito", texto: "Estable" },
  atencion: { tono: "aviso", texto: "Requiere atención" },
  riesgo: { tono: "error", texto: "En riesgo" },
};

const TIPOS = ["Reunión", "Llamada", "Correo", "Visita"] as const;

export default function CuentasConsola() {
  const { nivel, operadorId } = useAccesoConsola("cuentas");
  const { porId } = useIdentidad();
  /* ABAC: el gestor ve y registra solo en sus cuentas; Super Admin, todas. */
  const suyas = nivel === "asignadas" ? (ASIGNACIONES_KAM[operadorId ?? ""] ?? []) : null;
  const cuentas = suyas ? CUENTAS_ESTRATEGICAS.filter((c) => suyas.includes(c.nit)) : CUENTAS_ESTRATEGICAS;
  const puedeRegistrar = nivel === "gestiona" || nivel === "asignadas";

  const [seleccion, setSeleccion] = useState(cuentas[0]?.nit ?? "");
  const [registros, setRegistros] = useState(INTERACCIONES);
  const [tipo, setTipo] = useState<(typeof TIPOS)[number]>("Reunión");
  const [resumen, setResumen] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const cuenta = cuentas.find((c) => c.nit === seleccion) ?? cuentas[0];

  if (!cuenta) {
    return (
      <div className="grid gap-7">
        <PageHeader eyebrow="Cuentas estratégicas" titulo="Tus cuentas" lede="Empresas grandes con gestor asignado." />
        <Vacio titulo="Aún no tienes cuentas asignadas" detalle="Cuando un Super Admin te asigne empresas, aparecerán aquí con su plan de acción." />
      </div>
    );
  }

  const historial = registros.filter((r) => r.nit === cuenta.nit).sort((a, b) => b.fecha.localeCompare(a.fecha));

  const registrar = (e: FormEvent) => {
    e.preventDefault();
    if (resumen.trim().length < 10) {
      setError("Describe la interacción en al menos 10 caracteres: es lo que verá el próximo gestor.");
      return;
    }
    const autor = porId(operadorId ?? "")?.nombre ?? "Equipo interno";
    setRegistros((rs) => [{ nit: cuenta.nit, fecha: HOY, tipo, resumen: resumen.trim(), autor }, ...rs]);
    setResumen("");
    setError(null);
    setAviso(`${tipo} registrada en ${cuenta.empresa}. Queda en la ficha 360 y en auditoría.`);
  };

  return (
    <div className="grid gap-8">
      <PageHeader
        eyebrow="Cuentas estratégicas"
        titulo={suyas ? "Tus cuentas asignadas" : "Cuentas estratégicas"}
        lede="Empresas grandes con un gestor de cuenta: salud de la relación, plan de acción y cada interacción registrada."
      />

      <AvisoNivel
        nivel={nivel}
        detalle={nivel === "asignadas"
          ? "Solo ves y registras en las empresas a tu cargo; el resto del padrón no aparece."
          : "Registrar interacciones les corresponde a los gestores de cada cuenta."}
      />

      <div className="grid items-start gap-6 lg:grid-cols-[320px_1fr]">
        <Card className="divide-y divide-line">
          {cuentas.map((c) => (
            <button
              key={c.nit}
              type="button"
              onClick={() => { setSeleccion(c.nit); setAviso(null); setError(null); }}
              aria-current={c.nit === cuenta.nit ? "true" : undefined}
              className={`grid w-full gap-1 p-4 text-left transition ${c.nit === cuenta.nit ? "bg-[var(--info-bg)]" : "hover:bg-bg"}`}
            >
              <span className="text-[14.5px] font-semibold">{c.empresa}</span>
              <span className="text-[13px] text-muted">{c.gestor} · {c.ciudad}</span>
              <span><Chip tono={SALUD[c.salud].tono}>{SALUD[c.salud].texto}</Chip></span>
            </button>
          ))}
        </Card>

        <div className="grid gap-5">
          <Card className="grid gap-4 p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <Eyebrow>Cuenta</Eyebrow>
                <h2 className="mt-1 font-display text-[22px] font-bold">{cuenta.empresa}</h2>
                <p className="text-[14px] text-muted">
                  <span className="font-mono">{cuenta.nit}</span> · Gestor: {cuenta.gestor} · última interacción {fecha(cuenta.ultimaInteraccion)}
                </p>
              </div>
              <Chip tono={SALUD[cuenta.salud].tono}>{SALUD[cuenta.salud].texto}</Chip>
            </div>
            <div>
              <h3 className="flex items-center gap-2 text-[15px] font-bold"><Target size={15} className="text-accent" aria-hidden /> Plan de acción</h3>
              <ul className="mt-2 grid gap-1.5 text-[14.5px]">
                {cuenta.plan.map((p) => (
                  <li key={p} className="flex gap-2"><span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />{p}</li>
                ))}
              </ul>
            </div>
          </Card>

          {puedeRegistrar && (
            <Card className="p-6">
              <form onSubmit={registrar} className="grid gap-3" noValidate>
                <h3 className="flex items-center gap-2 text-[15px] font-bold">
                  <MessageSquarePlus size={15} className="text-accent" aria-hidden /> Registrar interacción
                </h3>
                <div className="grid gap-3 sm:grid-cols-[160px_1fr]">
                  <div className="grid gap-1.5">
                    <label htmlFor="tipo-interaccion" className="text-[13px] font-semibold text-muted">Tipo</label>
                    <select
                      id="tipo-interaccion"
                      value={tipo}
                      onChange={(e) => setTipo(e.target.value as (typeof TIPOS)[number])}
                      className="rounded-lg border border-line bg-surface px-3 py-2.5 text-[14.5px]"
                    >
                      {TIPOS.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="grid gap-1.5">
                    <label htmlFor="resumen-interaccion" className="text-[13px] font-semibold text-muted">Resumen</label>
                    <textarea
                      id="resumen-interaccion"
                      value={resumen}
                      onChange={(e) => setResumen(e.target.value)}
                      rows={2}
                      aria-invalid={error ? true : undefined}
                      aria-describedby={error ? "resumen-error" : undefined}
                      className="rounded-lg border border-line bg-surface px-3 py-2.5 text-[14.5px]"
                      placeholder="Qué se habló y qué sigue"
                    />
                  </div>
                </div>
                {error && <p id="resumen-error" role="alert" className="text-[13.5px] text-danger">{error}</p>}
                <div><Boton type="submit" tamano="sm">Registrar</Boton></div>
              </form>
            </Card>
          )}
          <AvisoEnfocado mensaje={aviso} />

          <Card className="divide-y divide-line">
            <h3 className="p-4 text-[15px] font-bold">Interacciones</h3>
            {historial.length === 0 ? (
              <p className="p-4 text-[14px] text-muted">Sin interacciones registradas todavía.</p>
            ) : (
              historial.map((r, i) => (
                <div key={`${r.fecha}-${i}`} className="grid gap-1 p-4">
                  <p className="text-[14.5px]">{r.resumen}</p>
                  <p className="text-[13px] text-muted">{r.tipo} · {r.autor} · {fecha(r.fecha)}</p>
                </div>
              ))
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
