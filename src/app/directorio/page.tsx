"use client";

import { useState } from "react";
import { BadgeCheck, Building2, MapPin, Search, Users } from "lucide-react";
import { CATEGORIAS, DIRECTORIO } from "@/lib/mock/catalogo";
import { Boton, Card, Chip, PageHeader, Vacio } from "@/components/ui/primitivos";

type Pestana = "afiliados" | "proveedor" | "ofertas";

export default function Directorio() {
  const [pestana, setPestana] = useState<Pestana>("afiliados");
  const [texto, setTexto] = useState("");
  const [categoria, setCategoria] = useState(CATEGORIAS[0]);

  const resultados = DIRECTORIO.filter((e) => {
    const coincideTexto =
      texto.trim() === "" ||
      e.nombre.toLowerCase().includes(texto.toLowerCase()) ||
      e.servicios.some((s) => s.toLowerCase().includes(texto.toLowerCase()));
    const coincideCat = categoria === CATEGORIAS[0] || e.categoria === categoria;
    return coincideTexto && coincideCat;
  });

  return (
    <div className="grid gap-7">
      <PageHeader
        eyebrow="Directorio"
        titulo="El directorio de las empresas de software de Colombia"
        lede="Se alimenta del perfil de cada afiliado. La insignia de verificado deriva del estado real de la afiliación, no de un registro aparte."
      />

      <Card className="p-5">
        <div role="tablist" aria-label="Tipo de búsqueda" className="flex flex-wrap gap-1 border-b border-line">
          {([
            { id: "afiliados", etiqueta: "Afiliados" },
            { id: "proveedor", etiqueta: "Busco proveedor" },
            { id: "ofertas", etiqueta: "Ofertas de servicio" },
          ] as const).map((p) => {
            const activa = p.id === pestana;
            return (
              <button
                key={p.id}
                role="tab"
                aria-selected={activa}
                onClick={() => setPestana(p.id)}
                className={`relative px-3 py-2.5 text-[14px] font-semibold transition ${
                  activa ? "text-ink" : "text-muted hover:text-ink"
                }`}
              >
                {p.etiqueta}
                {activa && <span aria-hidden className="absolute inset-x-2 bottom-0 h-[3px] rounded-t-full bg-accent" />}
              </button>
            );
          })}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
          <div className="grid gap-1.5">
            <label htmlFor="q" className="text-[13px] font-semibold text-muted">¿Qué estás buscando?</label>
            <input
              id="q"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Empresa, servicio o tecnología"
              className="rounded-lg border border-line bg-surface px-3 py-2.5 text-[14.5px]"
            />
          </div>
          <div className="grid gap-1.5">
            <label htmlFor="cat" className="text-[13px] font-semibold text-muted">Categoría</label>
            <select
              id="cat"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="rounded-lg border border-line bg-surface px-3 py-2.5 text-[14.5px]"
            >
              {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <Boton className="w-full sm:w-auto">
              <Search size={16} aria-hidden /> Buscar
            </Boton>
          </div>
        </div>
      </Card>

      <section className="grid gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-[19px] font-extrabold">
            {pestana === "afiliados" ? "Resultados" : pestana === "proveedor" ? "Proveedores sugeridos" : "Ofertas publicadas"}
          </h2>
          <p className="num text-[14px] text-muted">{resultados.length} empresas</p>
        </div>

        {resultados.length === 0 ? (
          <Card>
            <Vacio
              titulo="Ninguna empresa coincide con tu búsqueda"
              detalle="Prueba con otro término o cambia la categoría para ampliar los resultados."
              accion={
                <Boton variante="secundario" tamano="sm" onClick={() => { setTexto(""); setCategoria(CATEGORIAS[0]); }}>
                  Limpiar filtros
                </Boton>
              }
            />
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {resultados.map((e) => (
              <Card key={e.nombre} className="flex flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-bg text-muted">
                    <Building2 size={20} aria-hidden />
                  </div>
                  {e.verificada ? (
                    <Chip tono="exito"><BadgeCheck size={13} aria-hidden /> Verificada</Chip>
                  ) : (
                    <Chip tono="aviso">Por verificar</Chip>
                  )}
                </div>
                <h3 className="mt-3 font-display text-[16px] font-bold">{e.nombre}</h3>
                <p className="mt-1 text-[13.5px] text-muted">{e.categoria}</p>
                <dl className="mt-3 grid gap-1.5 text-[13.5px] text-muted">
                  <div className="flex items-center gap-1.5"><MapPin size={13} aria-hidden /> {e.ciudad}</div>
                  <div className="flex items-center gap-1.5"><Users size={13} aria-hidden /> {e.empleados} empleados</div>
                </dl>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {e.servicios.map((s) => (
                    <span key={s} className="rounded-full border border-line px-2 py-0.5 text-[12px] text-muted">{s}</span>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
