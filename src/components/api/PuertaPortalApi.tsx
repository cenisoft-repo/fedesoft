"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { ArrowRight, Building2, Loader2, Mail, RotateCcw } from "lucide-react";
import { useDemo, type EscenarioId } from "@/lib/demo";
import { useSesionApi, type EmpresaSesion, type InvitacionPendiente } from "@/lib/api/sesion";
import { ErrorApi } from "@/lib/api/cliente";
import { fecha } from "@/lib/format";
import { Boton, Card } from "@/components/ui/primitivos";
import { Aviso } from "@/components/ui/Dialogo";

/**
 * En modo API, el portal solo se muestra con una sesión real.
 *
 * La identidad (quién, qué empresa, qué rol) sale del servidor. Las pantallas
 * de negocio siguen simuladas, así que se elige el escenario de demostración
 * que corresponde al rol y al segmento reales: un talento ve lo que ve un
 * talento, una empresa grande ve su cuenta estratégica.
 */
export function PuertaPortalApi({ children }: { children: ReactNode }) {
  const { actual, cargar, elegirEmpresa, responderInvitacion } = useSesionApi("portal");
  const { escenario, cambiarEscenario } = useDemo();
  const router = useRouter();

  useEffect(() => {
    if (actual.estado === "anonimo") router.replace("/entrar");
  }, [actual.estado, router]);

  const activa = actual.estado === "lista" ? actual.vista.activeOrganization : null;
  useEffect(() => {
    if (!activa) return;
    const id = escenarioPara(activa);
    if (id !== escenario.id) cambiarEscenario(id);
  }, [activa, escenario.id, cambiarEscenario]);

  if (actual.estado === "cargando" || actual.estado === "anonimo") {
    return (
      <div className="grid min-h-[50vh] place-items-center text-[14px] text-muted" role="status">
        <span className="inline-flex items-center gap-2">
          <Loader2 size={16} className="animate-spin" aria-hidden /> Verificando tu sesión…
        </span>
      </div>
    );
  }

  if (actual.estado === "error") {
    return (
      <Card className="mx-auto max-w-[520px]">
        <div className="grid justify-items-center gap-3 px-6 py-12 text-center">
          <h1 className="font-display text-[20px] font-bold">No pudimos cargar tu sesión</h1>
          <p className="max-w-[44ch] text-[15px] text-muted">{actual.mensaje}</p>
          <Boton variante="secundario" onClick={() => void cargar("portal")}>
            <RotateCcw size={15} aria-hidden /> Reintentar
          </Boton>
        </div>
      </Card>
    );
  }

  const vista = actual.vista;
  if (!vista.activeOrganization) {
    return (
      <Eleccion
        nombre={vista.user.name ?? vista.user.email}
        empresas={vista.organizations}
        invitaciones={vista.pendingInvitations}
        onElegir={elegirEmpresa}
        onResponder={responderInvitacion}
      />
    );
  }

  return (
    <>
      {vista.pendingInvitations.length > 0 && (
        <div className="mb-6">
          <Invitaciones invitaciones={vista.pendingInvitations} onResponder={responderInvitacion} compacto />
        </div>
      )}
      {children}
    </>
  );
}

/** Rol y segmento reales → escenario de demostración equivalente. */
function escenarioPara(e: EmpresaSesion): EscenarioId {
  if (e.role.key === "gerente") return e.segment === "GRANDE" ? "grande" : "mipyme-al-dia";
  return "talento";
}

function Eleccion({
  nombre, empresas, invitaciones, onElegir, onResponder,
}: {
  nombre: string;
  empresas: EmpresaSesion[];
  invitaciones: InvitacionPendiente[];
  onElegir: (id: string) => Promise<void>;
  onResponder: (id: string, acepta: boolean) => Promise<void>;
}) {
  const [error, setError] = useState<string | null>(null);
  const [eligiendo, setEligiendo] = useState<string | null>(null);

  return (
    <div className="mx-auto grid max-w-[620px] gap-6">
      <header>
        <h1 className="font-display text-[30px] font-light leading-tight">Hola, {nombre}</h1>
        <p className="mt-2 text-[15px] text-muted">
          {empresas.length > 0 ? "¿Con qué empresa quieres trabajar ahora? Puedes cambiarla luego." : "Responde tu invitación para empezar."}
        </p>
      </header>
      {error && <Aviso ok={false}>{error}</Aviso>}
      {empresas.length > 0 && (
        <Card className="overflow-hidden">
          <ul className="divide-y divide-line">
            {empresas.map((e) => (
              <li key={e.id}>
                <button
                  type="button"
                  disabled={eligiendo !== null}
                  onClick={async () => {
                    setError(null);
                    setEligiendo(e.id);
                    try {
                      await onElegir(e.id);
                    } catch (err) {
                      setError(err instanceof ErrorApi ? err.message : "No pudimos cambiar de empresa.");
                    } finally {
                      setEligiendo(null);
                    }
                  }}
                  className="flex w-full items-center gap-3 px-5 py-4 text-left transition hover:bg-bg disabled:opacity-60"
                >
                  <Building2 size={18} className="text-muted" aria-hidden />
                  <span className="flex-1">
                    <span className="block font-semibold">{e.legalName}</span>
                    <span className="block text-[13px] text-muted">{e.role.name} · {e.segment === "GRANDE" ? "Empresa grande" : "MIPYME"}</span>
                  </span>
                  {eligiendo === e.id ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <ArrowRight size={16} className="text-muted" aria-hidden />}
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}
      {invitaciones.length > 0 && <Invitaciones invitaciones={invitaciones} onResponder={onResponder} />}
    </div>
  );
}

function Invitaciones({
  invitaciones, onResponder, compacto = false,
}: {
  invitaciones: InvitacionPendiente[];
  onResponder: (id: string, acepta: boolean) => Promise<void>;
  compacto?: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState<string | null>(null);
  const responder = async (id: string, acepta: boolean) => {
    setError(null);
    setOcupado(id);
    try {
      await onResponder(id, acepta);
    } catch (e) {
      setError(e instanceof ErrorApi ? e.message : "No pudimos responder la invitación.");
    } finally {
      setOcupado(null);
    }
  };

  return (
    <Card className="overflow-hidden" destacada={!compacto}>
      <div className="border-b border-line px-5 py-4">
        <h2 className="flex items-center gap-2 font-display text-[17px] font-bold">
          <Mail size={17} className="text-accent" aria-hidden />
          {invitaciones.length === 1 ? "Tienes una invitación" : `Tienes ${invitaciones.length} invitaciones`}
        </h2>
        <p className="mt-1 text-[13.5px] text-muted">
          Entrar no la acepta por ti. Hasta que aceptes, la empresa no registra tus datos.
        </p>
      </div>
      {error && <div className="px-5 pt-4"><Aviso ok={false}>{error}</Aviso></div>}
      <ul className="divide-y divide-line">
        {invitaciones.map((i) => (
          <li key={i.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
            <div className="min-w-[200px] flex-1">
              <p className="font-semibold">{i.legalName}</p>
              <p className="text-[13px] text-muted">
                Como {i.role.name}
                {i.expiresAt ? ` · vence el ${fecha(i.expiresAt.slice(0, 10))}` : ""}
              </p>
            </div>
            <div className="flex gap-2">
              <Boton tamano="sm" disabled={ocupado !== null} onClick={() => void responder(i.id, true)}>Aceptar</Boton>
              <Boton tamano="sm" variante="secundario" disabled={ocupado !== null} onClick={() => void responder(i.id, false)}>
                Rechazar
              </Boton>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
