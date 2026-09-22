"use client";

import Link from "next/link";
import {
  AlertTriangle, ArrowRight, Award, BadgeCheck, Building2, CalendarDays,
  Download, GraduationCap, Receipt, Sparkles, Star, TrendingUp,
} from "lucide-react";
import { useDemo } from "@/lib/demo";
import { ACTIVIDADES, OPORTUNIDADES, VERTICALES } from "@/lib/mock/catalogo";
import { cop, diasHasta, fecha } from "@/lib/format";
import { Boton, Card, Chip, Eyebrow } from "@/components/ui/primitivos";

export default function Inicio() {
  const { escenario, inscripciones } = useDemo();
  const { empresa, rol } = escenario;
  const contacto = empresa.contactos.find((c) => c.id === escenario.contactoId);
  const nombreCorto = contacto?.nombre.split(" ")[0] ?? "";

  const cargoPendiente = empresa.cargos.find((c) => c.estado !== "pagado");
  const alDia = empresa.estado === "al-dia";
  const dias = cargoPendiente ? diasHasta(cargoPendiente.vence) : 0;

  const misSesiones = ACTIVIDADES.filter((a) => inscripciones.includes(a.id) && a.estado === "abierto");
  const oportunidades = OPORTUNIDADES.filter(
    (o) => o.estado === "abierta" && o.aplicaA.includes(empresa.segmento),
  );

  return (
    <div className="grid gap-8">
      {/* Saludo y estado de la afiliación */}
      <section className="grid gap-4">
        <Eyebrow>Tu portal</Eyebrow>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-[clamp(28px,4.4vw,38px)] font-extrabold leading-tight">
              Hola, {nombreCorto}
            </h1>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[16.5px] text-muted">
              <Building2 size={16} aria-hidden />
              {empresa.razonSocial}
              <span aria-hidden>·</span>
              <span className="font-mono text-[14px]">{empresa.nit}</span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Chip tono={alDia ? "exito" : "error"}>
              <BadgeCheck size={13} aria-hidden />
              Afiliación {alDia ? "al día" : "vencida"}
            </Chip>
            <Chip tono="neutro">
              Afiliado {empresa.tipoAfiliacion} · vigente hasta {fecha(empresa.vigenciaHasta)}
            </Chip>
            {empresa.segmento === "grande" && (
              <Chip tono="info">
                <Star size={13} aria-hidden /> Cuenta estratégica
              </Chip>
            )}
          </div>
        </div>
      </section>

      {/* Acción pendiente — solo si existe algo por resolver */}
      {rol === "gerente" && cargoPendiente && (
        <Card destacada className="p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="flex gap-4">
              <div
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${
                  alDia ? "bg-warning-bg text-warning" : "bg-danger-bg text-danger"
                }`}
              >
                <AlertTriangle size={20} aria-hidden />
              </div>
              <div className="grid gap-1">
                <p className="font-display text-[17px] font-bold">
                  {alDia
                    ? `Tu cuota anual vence en ${dias} días`
                    : `Tu cuota anual está vencida hace ${Math.abs(dias)} días`}
                </p>
                <p className="max-w-[58ch] text-[14.5px] text-muted">
                  {cargoPendiente.concepto} {cargoPendiente.periodo} por{" "}
                  <strong className="num text-ink">{cop(cargoPendiente.monto)}</strong>, con vencimiento el{" "}
                  {fecha(cargoPendiente.vence)}.
                  {!alDia && " Mientras esté vencida, tu certificado y tu sello no están disponibles."}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/facturacion">
                <Boton variante="secundario">Ver estado de cuenta</Boton>
              </Link>
              <Link href="/facturacion/pagar">
                <Boton>
                  Pagar ahora <ArrowRight size={16} aria-hidden />
                </Boton>
              </Link>
            </div>
          </div>
        </Card>
      )}

      {/* Accesos rápidos según el rol */}
      <section className="grid gap-3">
        <h2 className="text-[20px] font-extrabold">Accesos rápidos</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {rol === "gerente" ? (
            <>
              <Acceso href="/facturacion" icono={Receipt} titulo="Estado de cuenta" detalle="Cargos, pagos y facturas" />
              <Acceso
                href="/facturacion/certificado"
                icono={Award}
                titulo="Certificado y sello"
                detalle={alDia ? "Descarga inmediata" : "Requiere estar al día"}
                inhabilitado={!alDia}
              />
              <Acceso href="/formacion" icono={GraduationCap} titulo="Formación" detalle="TrainingLAB y TIC Talks" />
              <Acceso href="/empresa" icono={Building2} titulo="Mis datos" detalle="Empresa y contactos" />
            </>
          ) : (
            <>
              <Acceso href="/formacion" icono={GraduationCap} titulo="Catálogo de formación" detalle="Inscribe a tu equipo" />
              <Acceso href="/formacion" icono={TrendingUp} titulo="Historial del equipo" detalle="Quién participó en qué" />
              <Acceso href="/directorio" icono={Building2} titulo="Directorio" detalle="Empresas afiliadas" />
              <Acceso href="/empresa" icono={Building2} titulo="Datos de la empresa" detalle="Consulta el perfil" />
            </>
          )}
        </div>
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Próximas sesiones */}
        <section className="grid gap-3">
          <h2 className="text-[20px] font-extrabold">Tus próximas sesiones</h2>
          {misSesiones.length > 0 ? (
            <Card className="divide-y divide-line">
              {misSesiones.map((a) => (
                <div key={a.id} className="flex flex-wrap items-center gap-3 p-4">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[var(--info-bg)] text-info">
                    <CalendarDays size={18} aria-hidden />
                  </div>
                  <div className="min-w-[200px] flex-1">
                    <p className="text-[15px] font-semibold">{a.titulo}</p>
                    <p className="text-[13px] text-muted">
                      {a.programa} · {fecha(a.fecha)} · {a.modalidad}
                    </p>
                  </div>
                  <Chip tono="info">Inscrito</Chip>
                </div>
              ))}
              <div className="p-3">
                <Link href="/formacion" className="text-[14px] font-semibold text-link hover:underline">
                  Ver todo el catálogo →
                </Link>
              </div>
            </Card>
          ) : (
            <Card>
              <div className="grid gap-2 p-6 text-center">
                <p className="font-display text-[16px] font-bold">Aún no tienes sesiones inscritas</p>
                <p className="text-[14px] text-muted">
                  El catálogo tiene {ACTIVIDADES.filter((a) => a.estado === "abierto").length} actividades abiertas.
                </p>
                <div className="mt-1 flex justify-center">
                  <Link href="/formacion">
                    <Boton variante="secundario" tamano="sm">Ver formación</Boton>
                  </Link>
                </div>
              </div>
            </Card>
          )}
        </section>

        {/* Novedades filtradas por perfil */}
        <section className="grid gap-3">
          <h2 className="text-[20px] font-extrabold">Novedades para ti</h2>
          <Card className="divide-y divide-line">
            {rol === "gerente" && oportunidades.slice(0, 2).map((o) => (
              <Link key={o.id} href="/oportunidades" className="block p-4 transition hover:bg-bg">
                <div className="flex items-start gap-2">
                  <Sparkles size={15} className="mt-0.5 shrink-0 text-accent" aria-hidden />
                  <div>
                    <p className="text-[14.5px] font-semibold">{o.titulo}</p>
                    <p className="text-[13px] text-muted">
                      {o.tipo} · cierra el {fecha(o.cierra)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
            {empresa.verticales.slice(0, 2).map((v) => {
              const vert = VERTICALES.find((x) => x.nombre === v);
              return (
                <div key={v} className="p-4">
                  <div className="flex items-start gap-2">
                    <CalendarDays size={15} className="mt-0.5 shrink-0 text-accent" aria-hidden />
                    <div>
                      <p className="text-[14.5px] font-semibold">Vertical {v}</p>
                      <p className="text-[13px] text-muted">
                        Próxima mesa: {vert ? fecha(vert.proxima) : "por confirmar"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </Card>
        </section>
      </div>

      {/* Cuenta estratégica: solo para empresas grandes */}
      {empresa.kam && (
        <Card destacada className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[var(--navy-700)] font-display text-[15px] font-bold text-white">
                {empresa.kam.iniciales}
              </div>
              <div>
                <Eyebrow>Tu cuenta estratégica</Eyebrow>
                <p className="mt-1 font-display text-[17px] font-bold">{empresa.kam.nombre}</p>
                <p className="text-[14px] text-muted">
                  {empresa.kam.cargo} · {empresa.kam.telefono}
                </p>
              </div>
            </div>
            <Link href="/cuenta-estrategica">
              <Boton variante="secundario">
                Ver panel consolidado <ArrowRight size={16} aria-hidden />
              </Boton>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}

function Acceso({
  href,
  icono: Icono,
  titulo,
  detalle,
  inhabilitado = false,
}: {
  href: string;
  icono: typeof Receipt;
  titulo: string;
  detalle: string;
  inhabilitado?: boolean;
}) {
  const contenido = (
    <>
      <div
        className={`grid h-10 w-10 place-items-center rounded-lg ${
          inhabilitado ? "bg-bg text-muted" : "bg-[var(--info-bg)] text-info"
        }`}
      >
        <Icono size={18} aria-hidden />
      </div>
      <div>
        <p className="text-[15px] font-semibold">{titulo}</p>
        <p className="text-[13px] text-muted">{detalle}</p>
      </div>
    </>
  );

  if (inhabilitado) {
    return (
      <div
        className="flex items-center gap-3 rounded-[10px] border border-dashed border-line p-4 opacity-70"
        aria-disabled
      >
        {contenido}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-[10px] border border-line bg-surface p-4 shadow-[var(--shadow-card)] transition hover:border-accent"
    >
      {contenido}
    </Link>
  );
}
