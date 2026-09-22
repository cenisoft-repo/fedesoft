"use client";

import { useEffect, useRef } from "react";

/**
 * Campo generativo de nodos conectados: la industria como red de empresas.
 * Reemplaza a la fotografía mientras no haya material propio, y se comporta
 * como fondo cinematográfico con viñeta pesada.
 */
export function CampoRed({ densidad = 1, className = "" }: { densidad?: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let raf = 0;

    type Nodo = { x: number; y: number; vx: number; vy: number; r: number };
    let nodos: Nodo[] = [];

    const redimensionar = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const cantidad = Math.round(((w * h) / 26000) * densidad);
      nodos = Array.from({ length: cantidad }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.12,
        r: Math.random() * 1.4 + 0.5,
      }));
    };

    const dibujar = () => {
      ctx.clearRect(0, 0, w, h);
      const alcance = Math.min(w, h) * 0.16;

      for (const n of nodos) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      }

      // Enlaces entre nodos cercanos
      for (let i = 0; i < nodos.length; i++) {
        for (let j = i + 1; j < nodos.length; j++) {
          const a = nodos[i];
          const b = nodos[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d > alcance) continue;
          const alfa = (1 - d / alcance) * 0.22;
          ctx.strokeStyle = `rgba(46, 160, 249, ${alfa})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      for (const n of nodos) {
        ctx.fillStyle = "rgba(165, 201, 230, 0.6)";
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!reducido) raf = requestAnimationFrame(dibujar);
    };

    redimensionar();
    dibujar();
    window.addEventListener("resize", redimensionar);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", redimensionar);
    };
  }, [densidad]);

  return <canvas ref={ref} aria-hidden className={`h-full w-full ${className}`} />;
}
