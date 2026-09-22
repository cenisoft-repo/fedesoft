"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ArrowRight, KeyRound, ShieldCheck } from "lucide-react";
import { ESCENARIOS, useDemo, type EscenarioId } from "@/lib/demo";

/**
 * Puerta única del afiliado. En el prototipo, elegir una persona equivale a
 * autenticarse: es lo que hace visible la segmentación desde el acceso.
 */
export default function Entrar() {
  const { cambiarEscenario } = useDemo();
  const router = useRouter();
  const [entrando, setEntrando] = useState<EscenarioId | null>(null);

  const entrar = (id: EscenarioId) => {
    setEntrando(id);
    cambiarEscenario(id);
    setTimeout(() => router.push("/portal"), 450);
  };

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_1.1fr]">
      {/* Columna de marca */}
      <aside className="relative hidden overflow-hidden bg-navy-abismo px-12 py-14 lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden
          className="absolute left-1/2 top-1/3 h-[560px] w-[560px] -translate-x-1/2 rounded-full opacity-35 blur-[130px]"
          style={{ background: "radial-gradient(circle, #008BED 0%, transparent 70%)" }}
        />
        <Link href="/" className="relative font-display text-[13px] font-bold uppercase tracking-[0.34em] text-white/85">
          Fedesoft
        </Link>
        <div className="relative">
          <h1 className="max-w-[16ch] font-display text-[clamp(32px,3.6vw,48px)] font-light leading-[1.05] text-white">
            Todo lo tuyo con la federación, en un solo lugar
          </h1>
          <p className="mt-6 max-w-[42ch] text-[16px] font-light leading-relaxed text-white/60">
            Tu afiliación, tu estado de cuenta, tu certificado y la formación de tu equipo. El portal se adapta a tu
            rol desde que entras.
          </p>
        </div>
        <p className="relative text-[12.5px] text-white/35">
          Prototipo de demostración · datos simulados
        </p>
      </aside>

      {/* Columna de acceso */}
      <main className="flex items-center bg-surface px-6 py-14 sm:px-12">
        <div className="mx-auto w-full max-w-[460px]">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-muted transition hover:text-ink lg:hidden"
          >
            <ArrowLeft size={14} aria-hidden /> Volver
          </Link>

          <h2 className="font-display text-[30px] font-light leading-tight">Ingresa al portal</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-muted">
            Una empresa afiliada tiene varios contactos, y cada uno ve lo que le corresponde. Elige con quién quieres
            entrar.
          </p>

          <div className="mt-8 grid gap-2.5">
            {ESCENARIOS.map((e) => {
              const contacto = e.empresa.contactos.find((c) => c.id === e.contactoId);
              const cargando = entrando === e.id;
              return (
                <button
                  key={e.id}
                  onClick={() => entrar(e.id)}
                  disabled={entrando !== null}
                  className="group flex items-center gap-4 rounded-xl border border-line bg-surface p-4 text-left transition hover:border-accent disabled:opacity-60"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--navy-700)] text-[13px] font-bold text-white">
                    {contacto?.nombre.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-semibold">{contacto?.nombre}</span>
                    <span className="block truncate text-[13.5px] text-muted">
                      {contacto?.cargo} · {e.empresa.razonSocial}
                    </span>
                  </span>
                  <ArrowRight
                    size={17}
                    className={`shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-accent ${cargando ? "animate-pulse" : ""}`}
                    aria-hidden
                  />
                </button>
              );
            })}
          </div>

          <div className="mt-8 grid gap-3 border-t border-line pt-6 text-[13.5px] text-muted">
            <p className="flex items-start gap-2">
              <ShieldCheck size={15} className="mt-0.5 shrink-0 text-accent" aria-hidden />
              En el portal real el acceso es con tu correo corporativo y segundo factor. Los permisos los decide el
              servidor, no la pantalla.
            </p>
            <p className="flex items-start gap-2">
              <KeyRound size={15} className="mt-0.5 shrink-0 text-muted" aria-hidden />
              ¿Tu empresa aún no está afiliada?{" "}
              <Link href="/afiliarme" className="font-semibold text-link hover:underline">
                Solicita la afiliación
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
