'use client';

import { useEffect, useRef } from 'react';
import { paletteStops, type Dream } from '@/lib/dreams';

type Props = {
  dream: Dream;
  width?: number;
  height?: number;
  className?: string;
  /** Si true, renderiza estática (sin animación) para thumbnails. */
  still?: boolean;
};

/**
 * Pinta el visual del sueño en <canvas>. Blobs de gradient orgánico
 * pulsando + partículas (estrellas/polvo cósmico) flotando.
 *
 * Es 100% local — el aspecto del visual depende de:
 *  - palette: colores base
 *  - render.blobs: posiciones + tamaños + alpha
 *  - render.particles: densidad
 *  - render.blur: cuán "onírico" se ve
 *  - render.rotation, pulseMs: cómo respira
 */
export default function DreamCanvas({ dream, width = 360, height = 480, className, still = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const cnv = canvasRef.current;
    if (!cnv) return;
    const ctx = cnv.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cnv.width = width * dpr;
    cnv.height = height * dpr;
    ctx.scale(dpr, dpr);

    const stops = paletteStops(dream.palette);
    const { blobs, particles, blur, pulseMs } = dream.render;
    let raf: number;
    const start = performance.now();

    function frame(now: number) {
      const t = still ? 0 : ((now - start) % pulseMs) / pulseMs; // 0..1
      const wave = Math.sin(t * Math.PI * 2);
      ctx!.clearRect(0, 0, width, height);

      // Fondo profundo del último stop (más oscuro)
      ctx!.fillStyle = stops[stops.length - 1];
      ctx!.fillRect(0, 0, width, height);

      // Pintar cada blob con radial gradient
      ctx!.filter = `blur(${blur}px)`;
      blobs.forEach((b, i) => {
        const cx = (b.x / 100) * width;
        const cy = (b.y / 100) * height;
        const r = (b.r / 100) * Math.max(width, height) * (1 + wave * 0.08);
        const grad = ctx!.createRadialGradient(cx, cy, 0, cx, cy, r);
        const stopIdx = Math.floor(b.hue * (stops.length - 1));
        grad.addColorStop(0, hexWithAlpha(stops[stopIdx], b.alpha));
        grad.addColorStop(1, hexWithAlpha(stops[stopIdx], 0));
        ctx!.fillStyle = grad;
        ctx!.beginPath();
        ctx!.arc(cx, cy, r, 0, Math.PI * 2);
        ctx!.fill();
      });

      // Partículas: puntos pequeños con shimmer
      ctx!.filter = 'blur(0.5px)';
      for (let i = 0; i < particles; i++) {
        const angle = (i / particles) * Math.PI * 2;
        const radius = (i % 5 === 0 ? 0.42 : 0.28) * Math.min(width, height);
        const px = width / 2 + Math.cos(angle + t * Math.PI * 2 * 0.2) * radius;
        const py = height / 2 + Math.sin(angle + t * Math.PI * 2 * 0.2) * radius;
        const a = 0.4 + 0.3 * Math.sin(t * Math.PI * 4 + i);
        ctx!.fillStyle = hexWithAlpha(stops[0], a);
        ctx!.beginPath();
        ctx!.arc(px, py, 1.4, 0, Math.PI * 2);
        ctx!.fill();
      }

      // Halo central pulsante
      ctx!.filter = `blur(${Math.max(2, blur * 0.4)}px)`;
      const haloR = (Math.min(width, height) / 4.5) * (1 + wave * 0.18);
      const halo = ctx!.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, haloR);
      halo.addColorStop(0, hexWithAlpha(stops[0], 0.9));
      halo.addColorStop(0.45, hexWithAlpha(stops[1] ?? stops[0], 0.55));
      halo.addColorStop(1, hexWithAlpha(stops[stops.length - 1], 0));
      ctx!.fillStyle = halo;
      ctx!.beginPath();
      ctx!.arc(width / 2, height / 2, haloR, 0, Math.PI * 2);
      ctx!.fill();

      ctx!.filter = 'none';
      if (!still) raf = requestAnimationFrame(frame);
    }

    if (still) {
      frame(0);
    } else {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced) frame(0);
      else raf = requestAnimationFrame(frame);
    }
    rafRef.current = raf!;
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [dream, width, height, still]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width, height, display: 'block', borderRadius: 18 }}
      className={className}
      aria-label={`Visual onírico — sueño ${dream.id}`}
    />
  );
}

function hexWithAlpha(hex: string, a: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, a)).toFixed(3)})`;
}
