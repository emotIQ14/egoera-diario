'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Cuaderno } from '@/lib/cuadernos-data';
import {
  getState,
  setState,
  markPageCompleted,
  resetCuaderno,
  CuadernoState,
} from '@/lib/cuadernos-storage';
import { track } from '@/lib/track';
import CuadernoPageRender from './CuadernoPageRender';

type Mode = 'read' | 'work';
type Direction = 'forward' | 'backward';

type Props = {
  cuaderno: Cuaderno;
};

/**
 * Visor estilo "cuaderno de campo".
 *
 * Inspiración: cuadernos de Bidaiatzen (recursos/hiljainen-kansa) — papel
 * cálido con textura, costura central, sin flip 3D (más robusto en móvil),
 * transición fade + translateX. En móvil las dos páginas se apilan
 * verticalmente; en desktop son spread doble.
 *
 * Identidad Egoera mantenida: tipos Fraunces / Caveat / Inter / JBM, paleta
 * cobalto / crema / coral / mostaza.
 */
export default function CuadernoViewer({ cuaderno }: Props) {
  const { meta, pages } = cuaderno;
  const total = pages.length;

  const [mode, setMode] = useState<Mode>('read');
  const [pageIndex, setPageIndex] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [state, setLocalState] = useState<CuadernoState | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [enter, setEnter] = useState<Direction | null>(null);
  const [exiting, setExiting] = useState<Direction | null>(null);
  const [seal, setSeal] = useState<string | null>(null); // mostrar sello de completado
  const sealTimeout = useRef<number | null>(null);

  // Hidratación
  useEffect(() => {
    setHydrated(true);
    const s = getState(meta.slug);
    setLocalState(s);
    if (s.pageIndex > 0 && s.pageIndex < total) {
      setPageIndex(s.pageIndex);
    }
    track('cuaderno_opened', { slug: meta.slug });
  }, [meta.slug, total]);

  // Detectar desktop (para doble página)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 900px)');
    setIsDesktop(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Guardar pageIndex en storage
  useEffect(() => {
    if (!hydrated) return;
    setState(meta.slug, { pageIndex });
  }, [pageIndex, meta.slug, hydrated]);

  const advance = useCallback(
    (delta: number) => {
      if (exiting) return;
      const next = pageIndex + delta;
      if (next < 0 || next >= total) return;
      const dir: Direction = delta > 0 ? 'forward' : 'backward';
      setExiting(dir);
      window.setTimeout(() => {
        setPageIndex(next);
        const updated = markPageCompleted(meta.slug, pageIndex, total);
        setLocalState(updated);
        setExiting(null);
        setEnter(dir);
        window.setTimeout(() => setEnter(null), 40);
        track('cuaderno_page_turned', { slug: meta.slug, to: next });

        // Sello de capítulo cada 4 páginas o al final
        if (delta > 0) {
          if ((next % 4 === 0 && next > 0) || next === total - 1) {
            if (sealTimeout.current) window.clearTimeout(sealTimeout.current);
            setSeal(next === total - 1 ? 'cuaderno completado' : `capítulo · ${Math.ceil(next / 4)}`);
            sealTimeout.current = window.setTimeout(() => setSeal(null), 1800);
          }
        }
        if (updated.finishedAt && next >= total - 1) {
          track('cuaderno_finished', { slug: meta.slug });
        }
      }, 280);
    },
    [pageIndex, total, exiting, meta.slug]
  );

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') advance(isDesktop ? 2 : 1);
      else if (e.key === 'ArrowLeft') advance(isDesktop ? -2 : -1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [advance, isDesktop]);

  // Swipe touch
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    touchStart.current = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) advance(isDesktop ? 2 : 1);
      else advance(isDesktop ? -2 : -1);
    }
  };

  const completed = state?.completedPages.length ?? 0;
  const progressPct = Math.min(100, Math.round((completed / total) * 100));
  const answers = state?.answers ?? {};

  // En desktop mostramos pageIndex y pageIndex+1. En móvil sólo pageIndex.
  // Si en desktop estás en la portada (0), muestra portada sola a la derecha
  // con la izquierda en blanco (como contraportada del libro).
  const leftIndex = isDesktop && pageIndex > 0 && pageIndex % 2 === 1 ? pageIndex : pageIndex - 1;
  const rightIndex = isDesktop ? leftIndex + 1 : pageIndex;

  if (!hydrated) {
    return (
      <div className="cv-loading">
        Cargando cuaderno…
        <style jsx>{`
          .cv-loading {
            padding: 40px;
            text-align: center;
            color: var(--crema);
            background: #1a1410;
            min-height: 100vh;
            font-family: var(--font-body);
          }
        `}</style>
      </div>
    );
  }

  const spreadCls = `cv-spread ${exiting ? `is-exit-${exiting}` : ''} ${enter ? `is-enter-${enter}` : ''}`;

  return (
    <div className="cv">
      <div className="cv-desk" aria-hidden />

      {/* Toolbar */}
      <header className="cv-toolbar">
        <Link href="/cuadernos" className="cv-back" aria-label="Volver a cuadernos">
          <span aria-hidden>←</span>
          <span className="cv-back-text">Cuadernos</span>
        </Link>

        <div className="cv-meta">
          <span className="cv-issue">{meta.issue}</span>
          <h1 className="cv-title">
            <em>{meta.title}.</em>
            <span className="cv-sub">{meta.subtitle}</span>
          </h1>
        </div>

        <div className="cv-modes" role="tablist" aria-label="Modo">
          <button
            className={mode === 'read' ? 'cv-mode active' : 'cv-mode'}
            onClick={() => setMode('read')}
            role="tab"
            aria-selected={mode === 'read'}
          >
            Leer
          </button>
          <button
            className={mode === 'work' ? 'cv-mode active' : 'cv-mode'}
            onClick={() => {
              setMode('work');
              track('cuaderno_mode_changed', { slug: meta.slug, mode: 'work' });
            }}
            role="tab"
            aria-selected={mode === 'work'}
          >
            Trabajar
          </button>
        </div>
      </header>

      {/* Progress */}
      <div className="cv-progress">
        <div className="cv-progress-bar" aria-hidden>
          <div className="cv-progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
        <span className="cv-progress-label">
          {progressPct}% · {pageIndex + 1}/{total}
        </span>
      </div>

      {/* Libro */}
      <div className="cv-stage" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <button
          className="cv-arrow cv-arrow-left"
          disabled={pageIndex === 0 || exiting !== null}
          onClick={() => advance(isDesktop ? -2 : -1)}
          aria-label="Página anterior"
        >
          ‹
        </button>

        <div className={`cv-book ${isDesktop ? 'cv-book-double' : 'cv-book-single'}`}>
          {isDesktop && <div className="cv-spine" aria-hidden />}
          {isDesktop && <div className="cv-stitch" aria-hidden />}

          <div className={spreadCls}>
            {/* Página izquierda (en doble) */}
            {isDesktop && (
              <div className="cv-leaf cv-leaf-left">
                {leftIndex >= 0 && leftIndex < total && (
                  <CuadernoPageRender
                    page={pages[leftIndex]}
                    pageIndex={leftIndex}
                    totalPages={total}
                    slug={meta.slug}
                    issue={meta.issue}
                    title={meta.title}
                    mode={mode}
                    initialAnswers={answers}
                  />
                )}
              </div>
            )}

            {/* Página derecha (en doble) · única en móvil */}
            <div className="cv-leaf cv-leaf-right">
              {rightIndex >= 0 && rightIndex < total ? (
                <CuadernoPageRender
                  page={pages[rightIndex]}
                  pageIndex={rightIndex}
                  totalPages={total}
                  slug={meta.slug}
                  issue={meta.issue}
                  title={meta.title}
                  mode={mode}
                  initialAnswers={answers}
                />
              ) : (
                <div className="cv-leaf-empty" />
              )}
            </div>
          </div>

          {/* Sello de capítulo completado */}
          {seal && (
            <div className="cv-seal" aria-live="polite">
              <div className="cv-seal-ring">
                <span>{seal}</span>
              </div>
            </div>
          )}
        </div>

        <button
          className="cv-arrow cv-arrow-right"
          disabled={pageIndex >= total - 1 || exiting !== null}
          onClick={() => advance(isDesktop ? 2 : 1)}
          aria-label="Página siguiente"
        >
          ›
        </button>
      </div>

      {/* Footer acciones */}
      <footer className="cv-actions">
        <a
          className="cv-action cv-action-primary"
          href={meta.pdfUrl}
          download
          onClick={() => track('cuaderno_pdf_downloaded', { slug: meta.slug })}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span>Descargar PDF para imprimir</span>
        </a>
        <button
          className="cv-action"
          onClick={() => {
            if (confirm('¿Reiniciar el cuaderno? Se borran las respuestas guardadas.')) {
              resetCuaderno(meta.slug);
              setLocalState(getState(meta.slug));
              setPageIndex(0);
            }
          }}
        >
          Reiniciar
        </button>
        {meta.postUrl && (
          <a className="cv-action" href={meta.postUrl} target="_blank" rel="noopener">
            Leer el artículo →
          </a>
        )}
      </footer>

      <style jsx>{`
        .cv {
          min-height: 100vh;
          min-height: 100dvh;
          background:
            radial-gradient(ellipse at 30% 20%, rgba(244, 200, 66, 0.06) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 80%, rgba(217, 119, 87, 0.05) 0%, transparent 50%),
            linear-gradient(135deg, #0d0f3d 0%, #1c1f4a 100%);
          color: var(--crema);
          padding: 14px 12px 110px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          position: relative;
        }
        @media (min-width: 768px) {
          .cv {
            padding: 20px 24px 90px;
            gap: 14px;
          }
        }
        /* Textura noise sutil sobre todo el fondo (estilo desk) */
        .cv-desk {
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='2'/><feColorMatrix values='0 0 0 0 0.2 0 0 0 0 0.18 0 0 0 0 0.3 0 0 0 0.45 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.6'/></svg>");
          opacity: 0.22;
          pointer-events: none;
          z-index: 0;
        }
        .cv > * {
          position: relative;
          z-index: 1;
        }
        .cv-toolbar {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .cv-back {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: var(--font-mono);
          font-size: 10.5px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(241, 234, 216, 0.85);
          text-decoration: none;
          padding: 8px 12px;
          border-radius: 10px;
          border: 1px solid rgba(241, 234, 216, 0.20);
          background: rgba(241, 234, 216, 0.04);
        }
        .cv-back:hover {
          background: rgba(244, 200, 66, 0.14);
          border-color: rgba(244, 200, 66, 0.5);
          color: #f4c842;
        }
        .cv-back-text {
          display: inline;
        }
        @media (max-width: 480px) {
          .cv-back-text {
            display: none;
          }
        }
        .cv-meta {
          flex: 1;
          min-width: 140px;
        }
        .cv-issue {
          display: block;
          font-family: var(--font-mono);
          font-size: 9.5px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #f4c842;
          margin-bottom: 2px;
        }
        .cv-title {
          font-family: var(--font-display);
          font-weight: 300;
          font-size: clamp(18px, 3vw, 24px);
          color: var(--crema);
          margin: 0;
          line-height: 1.1;
          letter-spacing: -0.01em;
          display: flex;
          flex-wrap: wrap;
          align-items: baseline;
          gap: 8px;
        }
        .cv-title em {
          font-style: italic;
          font-weight: 600;
        }
        .cv-sub {
          color: rgba(241, 234, 216, 0.55);
          font-family: var(--font-body);
          font-style: italic;
          font-weight: 400;
          font-size: 12px;
        }
        .cv-modes {
          display: inline-flex;
          background: rgba(241, 234, 216, 0.06);
          border-radius: 10px;
          padding: 3px;
          gap: 2px;
          border: 1px solid rgba(241, 234, 216, 0.10);
        }
        .cv-mode {
          padding: 7px 12px;
          font-family: var(--font-mono);
          font-size: 10.5px;
          letter-spacing: 0.10em;
          text-transform: uppercase;
          background: transparent;
          color: rgba(241, 234, 216, 0.65);
          border: none;
          border-radius: 7px;
          cursor: pointer;
          min-height: 30px;
        }
        .cv-mode.active {
          background: #f4c842;
          color: #0d0f3d;
          font-weight: 700;
        }
        @media (max-width: 380px) {
          .cv-mode {
            padding: 6px 10px;
            font-size: 9.5px;
          }
        }
        .cv-progress {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 4px;
        }
        .cv-progress-bar {
          flex: 1;
          height: 3px;
          background: rgba(241, 234, 216, 0.10);
          border-radius: 999px;
          overflow: hidden;
        }
        .cv-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #f4c842 0%, #d97757 100%);
          border-radius: 999px;
          transition: width 0.5s ease;
        }
        .cv-progress-label {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.14em;
          color: rgba(241, 234, 216, 0.6);
          white-space: nowrap;
        }
        /* ─── STAGE ─── */
        .cv-stage {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 4px 0;
          min-height: 540px;
        }
        @media (min-width: 768px) {
          .cv-stage {
            min-height: 720px;
            gap: 14px;
            padding: 8px 0;
          }
        }
        .cv-arrow {
          flex-shrink: 0;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid rgba(241, 234, 216, 0.18);
          background: rgba(241, 234, 216, 0.04);
          color: var(--crema);
          font-size: 22px;
          line-height: 1;
          cursor: pointer;
          display: grid;
          place-items: center;
          transition: all 0.2s;
          font-family: var(--font-body);
        }
        @media (min-width: 768px) {
          .cv-arrow {
            width: 48px;
            height: 48px;
            font-size: 28px;
          }
        }
        .cv-arrow:hover:not(:disabled) {
          background: rgba(244, 200, 66, 0.18);
          border-color: #f4c842;
          color: #f4c842;
        }
        .cv-arrow:disabled {
          opacity: 0.22;
          cursor: not-allowed;
        }
        /* ─── BOOK ─── */
        .cv-book {
          position: relative;
          width: 100%;
          max-width: 460px;
          aspect-ratio: 0.7 / 1;
          filter: drop-shadow(0 24px 60px rgba(0, 0, 0, 0.55));
          border-radius: 6px;
          overflow: hidden;
        }
        .cv-book-double {
          max-width: 1100px;
          aspect-ratio: 1.42 / 1;
        }
        /* Lomo */
        .cv-spine {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 50%;
          width: 4px;
          transform: translateX(-50%);
          background: linear-gradient(
            to right,
            rgba(13, 15, 61, 0.42) 0%,
            rgba(13, 15, 61, 0.7) 50%,
            rgba(13, 15, 61, 0.42) 100%
          );
          z-index: 6;
          pointer-events: none;
        }
        .cv-stitch {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 50%;
          width: 1px;
          transform: translateX(-0.5px);
          background-image: repeating-linear-gradient(
            to bottom,
            rgba(241, 234, 216, 0.5) 0,
            rgba(241, 234, 216, 0.5) 4px,
            transparent 4px,
            transparent 12px
          );
          z-index: 7;
          pointer-events: none;
        }
        /* Spread (contiene las dos páginas) */
        .cv-spread {
          position: absolute;
          inset: 0;
          display: flex;
          transition: opacity 0.32s ease, transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          opacity: 1;
          transform: translateX(0);
        }
        .cv-spread.is-exit-forward {
          opacity: 0;
          transform: translateX(-6%);
        }
        .cv-spread.is-exit-backward {
          opacity: 0;
          transform: translateX(6%);
        }
        .cv-spread.is-enter-forward {
          opacity: 0;
          transform: translateX(6%);
        }
        .cv-spread.is-enter-backward {
          opacity: 0;
          transform: translateX(-6%);
        }
        /* Páginas (hojas) */
        .cv-leaf {
          position: relative;
          height: 100%;
          background:
            url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'><filter id='p'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/><feColorMatrix values='0 0 0 0 0.6 0 0 0 0 0.58 0 0 0 0 0.5 0 0 0 0.1 0'/></filter><rect width='100%25' height='100%25' filter='url(%23p)'/></svg>"),
            linear-gradient(135deg, #f7eecf 0%, #ede0bd 100%);
          overflow: hidden;
        }
        .cv-book-single .cv-leaf-right {
          width: 100%;
          border-radius: 6px;
        }
        .cv-book-double .cv-leaf-left {
          width: 50%;
          border-radius: 6px 0 0 6px;
        }
        .cv-book-double .cv-leaf-left::after {
          /* Sombra que entra desde el lomo */
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          right: 0;
          width: 32px;
          background: linear-gradient(to right, transparent, rgba(13, 15, 61, 0.16) 80%, rgba(13, 15, 61, 0.28));
          pointer-events: none;
        }
        .cv-book-double .cv-leaf-right {
          width: 50%;
          border-radius: 0 6px 6px 0;
        }
        .cv-book-double .cv-leaf-right::after {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          width: 32px;
          background: linear-gradient(to left, transparent, rgba(13, 15, 61, 0.16) 80%, rgba(13, 15, 61, 0.28));
          pointer-events: none;
        }
        .cv-leaf-empty {
          width: 100%;
          height: 100%;
        }
        /* ─── MÓVIL: páginas apiladas verticalmente ─── */
        @media (max-width: 899px) {
          .cv-book {
            max-width: 540px;
          }
        }
        /* ─── SELLO DE CAPÍTULO COMPLETADO ─── */
        .cv-seal {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          pointer-events: none;
          z-index: 20;
          animation: sealIn 1.8s ease-out forwards;
        }
        .cv-seal-ring {
          width: 180px;
          height: 180px;
          border: 3px solid #f4c842;
          border-radius: 50%;
          display: grid;
          place-items: center;
          color: #f4c842;
          background: rgba(13, 15, 61, 0.45);
          backdrop-filter: blur(3px);
          transform: rotate(-7deg);
          position: relative;
          padding: 8px;
        }
        .cv-seal-ring::before {
          content: '';
          position: absolute;
          inset: -12px;
          border: 1px solid rgba(244, 200, 66, 0.4);
          border-radius: 50%;
        }
        .cv-seal-ring span {
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 500;
          font-size: 18px;
          text-align: center;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          line-height: 1.1;
        }
        @keyframes sealIn {
          0% { opacity: 0; transform: scale(0.5) rotate(-30deg); }
          15% { opacity: 1; transform: scale(1.05) rotate(-5deg); }
          25% { transform: scale(1) rotate(-7deg); }
          75% { opacity: 1; transform: scale(1) rotate(-7deg); }
          100% { opacity: 0; transform: scale(1.1) rotate(-7deg); }
        }
        /* ─── ACTIONS ─── */
        .cv-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: center;
          padding-top: 4px;
        }
        .cv-action {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          font-family: var(--font-mono);
          font-size: 10.5px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(241, 234, 216, 0.85);
          background: rgba(241, 234, 216, 0.06);
          border: 1px solid rgba(241, 234, 216, 0.18);
          border-radius: 10px;
          text-decoration: none;
          cursor: pointer;
          font-weight: 600;
          min-height: 38px;
        }
        .cv-action:hover {
          background: rgba(241, 234, 216, 0.12);
          color: var(--crema);
        }
        .cv-action-primary {
          background: #f4c842;
          color: #0d0f3d;
          border-color: #f4c842;
          font-weight: 700;
        }
        .cv-action-primary:hover {
          background: #f7d35a;
          color: #0d0f3d;
        }
        @media (max-width: 480px) {
          .cv-action {
            font-size: 9.5px;
            padding: 9px 12px;
            letter-spacing: 0.08em;
          }
          .cv-action-primary span {
            font-size: 10.5px;
          }
        }
      `}</style>
    </div>
  );
}
