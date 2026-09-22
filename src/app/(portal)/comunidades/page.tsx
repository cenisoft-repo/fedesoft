"use client";

import { useState } from "react";
import { Check, FileText, Lock, Users } from "lucide-react";
import { useDemo } from "@/lib/demo";
import { COMUNIDADES } from "@/lib/mock/catalogo";
import { fecha } from "@/lib/format";
import { Boton, Card, Chip, PageHeader, Seccion } from "@/components/ui/primitivos";

export default function Comunidades() {
  const { escenario } = useDemo();
  const { rol } = escenario;
  const [inscritas, setInscritas] = useState<string[]>(["com-gerentes"]);

  const elegible = (rolComunidad: string) => rolComunidad === "todos" || rolComunidad === rol;

  return (
    <div className="grid gap-10">
      <PageHeader
        eyebrow="Comunidades"
        titulo="Los espacios del gremio que te corresponden"
        lede="Cada comunidad se filtra por el rol de tu contacto. Lo que no te aplica no aparece, y el servidor lo verifica: no basta con esconder el botón."
        imagen="eventos"
      />

      <section className="grid gap-5">
        <Seccion
          titulo="Disponibles para ti"
          extra={<span className="text-[14px] text-muted">{COMUNIDADES.filter((c) => elegible(c.rol)).length} de {COMUNIDADES.length}</span>}
        />
        <div className="grid gap-5 lg:grid-cols-2">
          {COMUNIDADES.map((c) => {
            const puede = elegible(c.rol);
            const dentro = inscritas.includes(c.id);
            const lleno = c.miembros >= c.cupos;

            return (
              <Card key={c.id} className={`flex flex-col p-6 ${!puede ? "opacity-60" : ""}`} destacada={dentro}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h3 className="font-display text-[19px] font-semibold leading-snug">{c.nombre}</h3>
                  {dentro ? (
                    <Chip tono="exito"><Check size={13} aria-hidden /> Participas</Chip>
                  ) : !puede ? (
                    <Chip tono="neutro"><Lock size={12} aria-hidden /> Otro rol</Chip>
                  ) : lleno ? (
                    <Chip tono="aviso">Sin cupos</Chip>
                  ) : null}
                </div>

                <p className="mt-2.5 max-w-[46ch] text-[14.5px] leading-relaxed text-muted">{c.descripcion}</p>

                <dl className="mt-5 flex flex-wrap gap-x-7 gap-y-2 text-[13.5px] text-muted">
                  <div className="flex items-center gap-1.5">
                    <Users size={14} aria-hidden />
                    <span className="num">{c.miembros}</span> de <span className="num">{c.cupos}</span> miembros
                  </div>
                  {c.requiereAprobacion && <span>Requiere aprobación</span>}
                </dl>

                {puede && (
                  <div className="mt-5 border-t border-line pt-5">
                    <p className="text-[11.5px] font-semibold uppercase tracking-[0.16em] text-muted">Próxima sesión</p>
                    <p className="mt-1.5 text-[15px] font-semibold">{c.temaProxima}</p>
                    <p className="text-[13.5px] text-muted">{fecha(c.proxima)}</p>
                  </div>
                )}

                {dentro && c.materiales.length > 0 && (
                  <div className="mt-5 grid gap-2 border-t border-line pt-5">
                    <p className="text-[11.5px] font-semibold uppercase tracking-[0.16em] text-muted">Materiales</p>
                    {c.materiales.map((m) => (
                      <div key={m.titulo} className="flex items-center gap-2.5 text-[14px]">
                        <FileText size={14} className="shrink-0 text-muted" aria-hidden />
                        <span className="flex-1">{m.titulo}</span>
                        <span className="text-[12.5px] text-muted">{m.tipo}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-6 pt-1">
                  {!puede ? (
                    <p className="text-[13.5px] text-muted">
                      Esta comunidad es para el rol de {c.rol === "gerente" ? "gerencia" : "talento humano"}. Tu
                      empresa puede inscribir al contacto que corresponda desde Mi empresa.
                    </p>
                  ) : dentro ? (
                    <Boton variante="secundario" tamano="sm" onClick={() => setInscritas((p) => p.filter((x) => x !== c.id))}>
                      Salir de la comunidad
                    </Boton>
                  ) : lleno ? (
                    <Boton variante="secundario" tamano="sm" onClick={() => setInscritas((p) => [...p, c.id])}>
                      Entrar a lista de espera
                    </Boton>
                  ) : (
                    <Boton tamano="sm" onClick={() => setInscritas((p) => [...p, c.id])}>
                      {c.requiereAprobacion ? "Solicitar ingreso" : "Unirme"}
                    </Boton>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
