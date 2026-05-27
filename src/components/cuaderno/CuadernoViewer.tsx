'use client';

import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
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

type Props = {
  cuaderno: Cuaderno;
};

export default function CuadernoViewer({ cuaderno }: Props) {
  const { meta, pages } = cuaderno;
  const total = pages.length;

  const [mode, setMode] = useState<Mode>('read');
  const [pageIndex, setPageIndex] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [state, setLocalState] = useState<CuadernoState | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [flipDir, setFlipDir] = useState<'forward' | 'backward' | null>(null);
  const [flipping, setFlipping] = useState(false);

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
      const next = pageIndex + delta;
      if (next < 0 || next >= total || flipping) return;
      setFlipDir(delta > 0 ? 'forward' : 'backward');
      setFlipping(true);
      setTimeout(() => {
        setPageIndex(next);
        // Marcar página anterior como leída
        const updated = markPageCompleted(meta.slug, pageIndex, total);
        setLocalState(updated);
        track('cuaderno_page_turned', { slug: meta.slug, to: next });
        if (updated.finishedAt && next >= total - 1) {
          track('cuaderno_finished', { slug: meta.slug });
        }
      }, 380);
      setTimeout(() => {
        setFlipping(false);
        setFlipDir(null);
      }, 720);
    },
    [pageIndex, total, flipping, meta.slug]
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

  // En desktop mostramos pageIndex y pageIndex+1 (doble página). En móvil, sólo pageIndex.
  const leftIndex = isDesktop && pageIndex % 2 === 1 ? pageIndex - 1 : pageIndex;
  const rightIndex = isDesktop ? leftIndex + 1 : null;

  if (!hydrated) {
    return (
      <div className="cv-loading">
        Cargando cuaderno…
        <style jsx>{`
          .cv-loading {
            padding: 40px;
            text-align: center;
            color: var(--ink-soft);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="cv">
      {/* Toolbar */}
      <header className="cv-toolbar">
        <Link href="/cuadernos" className="cv-back" aria-label="Volver a cuadernos">
          ← Cuadernos
        </Link>

        <div className="cv-meta">
          <span className="cv-issue">{meta.issue}</span>
          <h1 className="cv-title">
            {meta.title}
            <span className="cv-sub">· {meta.subtitle}</span>
          </h1>
        </div>

        <div className="cv-modes">
          <button
            className={mode === 'read' ? 'cv-mode active' : 'cv-mode'}
            onClick={() => setMode('read')}
          >
            Leer
          </button>
          <button
            className={mode === 'work' ? 'cv-mode active' : 'cv-mode'}
            onClick={() => {
              setMode('work');
              track('cuaderno_mode_changed', { slug: meta.slug, mode: 'work' });
            }}
          >
            Trabajar
          </button>
        </div>
      </header>

      {/* Progress */}
      <div className="cv-progress">
        <div className="cv-progress-bar">
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
          disabled={pageIndex === 0 || flipping}
          onClick={() => advance(isDesktop ? -2 : -1)}
          aria-label="Página anterior"
        >
          ‹
        </button>

        <div className={`cv-book ${isDesktop ? 'cv-book-double' : 'cv-book-single'}`}>
          {/* Lomo (sólo doble página) */}
          {isDesktop && <div className="cv-spine" />}

          {/* Página izquierda (en doble) */}
          {isDesktop && (
            <div
              className={`cv-leaf cv-leaf-left ${
                flipping && flipDir === 'backward' ? 'is-flipping-back' : ''
              }`}
            >
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

          {/* Página principal (derecha en doble · única en móvil) */}
          <div
            className={`cv-leaf cv-leaf-right ${
              flipping && flipDir === 'forward' ? 'is-flipping' : ''
            }`}
          >
            {rightIndex !== null && rightIndex < total && (
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
            )}
            {rightIndex === null && (
              <CuadernoPageRender
                page={pages[pageIndex]}
                pageIndex={pageIndex}
                totalPages={total}
                slug={meta.slug}
                issue={meta.issue}
                title={meta.title}
                mode={mode}
                initialAnswers={answers}
              />
            )}
          </div>
        </div>

        <button
          className="cv-arrow cv-arrow-right"
          disabled={pageIndex >= total - 1 || flipping}
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
          Descargar PDF para imprimir
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
          background: linear-gradient(180deg, #0d0f3d 0%, #1c1f4a 60%, #0d0f3d 100%);
          color: var(--crema);
          padding: 14px 12px 96px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        @media (min-width: 768px) {
          .cv {
            padding: 20px 24px 80px;
          }
        }
        .cv-toolbar {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .cv-back {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(241, 234, 216, 0.78);
          text-decoration: none;
          padding: 6px 10px;
          border-radius: 8px;
          border: 1px solid rgba(241, 234, 216, 0.18);
        }
        .cv-back:hover {
          background: rgba(241, 234, 216, 0.06);
        }
        .cv-meta {
          flex: 1;
          min-width: 200px;
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
          font-style: italic;
          font-weight: 600;
          font-size: clamp(18px, 3vw, 22px);
          color: var(--crema);
          margin: 0;
        }
        .cv-sub {
          color: rgba(241, 234, 216, 0.62);
          font-style: italic;
          font-weight: 400;
        }
        .cv-modes {
          display: inline-flex;
          background: rgba(241, 234, 216, 0.08);
          border-radius: 10px;
          padding: 3px;
          gap: 2px;
        }
        .cv-mode {
          padding: 7px 14px;
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          background: transparent;
          color: rgba(241, 234, 216, 0.65);
          border: none;
          border-radius: 7px;
          cursor: pointer;
        }
        .cv-mode.active {
          background: #f4c842;
          color: #0d0f3d;
          font-weight: 600;
        }
        .cv-progress {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 4px;
        }
        .cv-progress-bar {
          flex: 1;
          height: 4px;
          background: rgba(241, 234, 216, 0.12);
          border-radius: 999px;
          overflow: hidden;
        }
        .cv-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #f4c842 0%, #d97757 100%);
          border-radius: 999px;
          transition: width 0.4s ease;
        }
        .cv-progress-label {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.14em;
          color: rgba(241, 234, 216, 0.7);
          white-space: nowrap;
        }
        .cv-stage {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          perspective: 2200px;
          min-height: 600px;
        }
        @media (min-width: 768px) {
          .cv-stage {
            min-height: 720px;
            gap: 16px;
          }
        }
        .cv-arrow {
          flex-shrink: 0;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: 1px solid rgba(241, 234, 216, 0.18);
          background: rgba(241, 234, 216, 0.05);
          color: var(--crema);
          font-size: 22px;
          line-height: 1;
          cursor: pointer;
          display: grid;
          place-items: center;
          transition: all 0.2s;
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
          opacity: 0.25;
          cursor: not-allowed;
        }
        .cv-book {
          position: relative;
          width: 100%;
          max-width: 460px;
          aspect-ratio: 0.71 / 1;
          transform-style: preserve-3d;
          border-radius: 6px;
          filter: drop-shadow(0 24px 36px rgba(0, 0, 0, 0.45));
        }
        .cv-book-double {
          max-width: 920px;
          aspect-ratio: 1.42 / 1;
        }
        .cv-spine {
          position: absolute;
          top: 0;
          left: 50%;
          width: 16px;
          height: 100%;
          transform: translateX(-50%);
          background: linear-gradient(
            90deg,
            rgba(0, 0, 0, 0.32) 0%,
            rgba(0, 0, 0, 0.12) 30%,
            rgba(0, 0, 0, 0) 50%,
            rgba(0, 0, 0, 0.12) 70%,
            rgba(0, 0, 0, 0.32) 100%
          );
          z-index: 5;
          pointer-events: none;
        }
        .cv-leaf {
          position: absolute;
          top: 0;
          height: 100%;
          background: #f1ead8;
          border-radius: 6px;
          overflow: hidden;
          backface-visibility: hidden;
        }
        .cv-book-single .cv-leaf-right {
          left: 0;
          width: 100%;
          transform-origin: left center;
        }
        .cv-book-double .cv-leaf-left {
          left: 0;
          width: 50%;
          transform-origin: right center;
          border-top-right-radius: 0;
          border-bottom-right-radius: 0;
          box-shadow: inset -8px 0 16px -8px rgba(0, 0, 0, 0.22);
        }
        .cv-book-double .cv-leaf-right {
          left: 50%;
          width: 50%;
          transform-origin: left center;
          border-top-left-radius: 0;
          border-bottom-left-radius: 0;
          box-shadow: inset 8px 0 16px -8px rgba(0, 0, 0, 0.22);
        }
        .cv-leaf-right.is-flipping {
          animation: flipForward 0.72s ease-in-out;
          z-index: 4;
          transform-style: preserve-3d;
        }
        .cv-leaf-left.is-flipping-back {
          animation: flipBackward 0.72s ease-in-out;
          z-index: 4;
        }
        @keyframes flipForward {
          0% {
            transform: rotateY(0deg);
            box-shadow: inset 8px 0 16px -8px rgba(0, 0, 0, 0.22);
          }
          50% {
            box-shadow: 0 24px 32px rgba(0, 0, 0, 0.35), inset 8px 0 16px -8px rgba(0, 0, 0, 0.42);
          }
          100% {
            transform: rotateY(-180deg);
            box-shadow: inset 8px 0 16px -8px rgba(0, 0, 0, 0.22);
          }
        }
        @keyframes flipBackward {
          0% {
            transform: rotateY(0deg);
          }
          50% {
            box-shadow: 0 24px 32px rgba(0, 0, 0, 0.35);
          }
          100% {
            transform: rotateY(180deg);
          }
        }
        .cv-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: center;
          padding-top: 4px;
        }
        .cv-action {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(241, 234, 216, 0.85);
          background: rgba(241, 234, 216, 0.07);
          border: 1px solid rgba(241, 234, 216, 0.18);
          border-radius: 10px;
          text-decoration: none;
          cursor: pointer;
          font-weight: 500;
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
      `}</style>
    </div>
  );
}
