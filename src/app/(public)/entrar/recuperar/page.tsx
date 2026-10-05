"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ArrowLeft, Loader2, Mail, MailCheck } from "lucide-react";
import { Boton } from "@/components/ui/primitivos";

/**
 * Recuperar acceso (P-02, RF-IDE-007).
 *
 * La respuesta es la misma exista o no el correo: decir "ese correo no está
 * registrado" le serviría a un tercero para saber quién tiene cuenta. El enlace
 * lo envía el proveedor de identidad, es de un solo uso y vence.
 */
export default function Recuperar() {
  const [correo, setCorreo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [estado, setEstado] = useState<"formulario" | "enviando" | "enviado">("formulario");

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo.trim())) {
      setError("Escribe tu correo corporativo completo.");
      return;
    }
    setError(null);
    setEstado("enviando");
    setTimeout(() => setEstado("enviado"), 700);
  };

  return (
    <main className="grid min-h-dvh place-items-center bg-surface px-6 py-14">
      <div className="w-full max-w-[440px]" aria-live="polite">
        <Link
          href="/entrar"
          className="mb-8 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-muted transition hover:text-ink"
        >
          <ArrowLeft size={14} aria-hidden /> Volver a ingresar
        </Link>

        {estado !== "enviado" ? (
          <>
            <h1 className="font-display text-[30px] font-light leading-tight">Recupera tu acceso</h1>
            <p className="mt-2 text-[15px] leading-relaxed text-muted">
              Te enviaremos un enlace para crear una contraseña nueva.
            </p>
            <form onSubmit={enviar} className="mt-8 grid gap-3" noValidate>
              <label htmlFor="correo" className="text-[13.5px] font-semibold">Correo corporativo</label>
              <div className="relative">
                <Mail size={16} aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  id="correo"
                  type="email"
                  autoComplete="username"
                  autoFocus
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? "correo-error" : undefined}
                  className="w-full rounded-xl border border-line bg-surface py-3 pl-10 pr-3 text-[15px]"
                />
              </div>
              {error && <p id="correo-error" role="alert" className="text-[13.5px] text-danger">{error}</p>}
              <Boton type="submit" disabled={estado === "enviando"} className="mt-1 w-full">
                {estado === "enviando" ? <><Loader2 size={16} className="animate-spin" aria-hidden /> Enviando…</> : "Enviar enlace"}
              </Boton>
            </form>
          </>
        ) : (
          <>
            <span className="grid h-11 w-11 place-items-center rounded-full bg-success-bg text-success">
              <MailCheck size={20} aria-hidden />
            </span>
            <h1 className="mt-4 font-display text-[28px] font-light leading-tight">Revisa tu correo</h1>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">
              Si <span className="font-semibold text-ink">{correo.trim().toLowerCase()}</span> tiene acceso al portal,
              en unos minutos te llegará un enlace. Sirve una sola vez y vence en 30 minutos.
            </p>
            <p className="mt-3 text-[14px] leading-relaxed text-muted">
              ¿No llega? Revisa la carpeta de correo no deseado. Por seguridad, después de varios intentos seguidos hay
              que esperar unos minutos antes de pedir otro.
            </p>
            <Link
              href="/entrar"
              className="mt-6 inline-flex items-center rounded-full border border-line px-5 py-2.5 text-[15px] font-semibold transition hover:border-accent"
            >
              Volver a ingresar
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
