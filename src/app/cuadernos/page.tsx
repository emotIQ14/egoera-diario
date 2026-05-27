'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CUADERNOS } from '@/lib/cuadernos-data';
import { progressPct, isStarted, isFinished } from '@/lib/cuadernos-storage';
import Screen from '@/components/Screen';
import TabBar from '@/components/TabBar';
import Peep from '@/components/peeps/Peep';
import {
  WavePattern,
  DotsGrid,
  ConcentricStamp,
  CornerMark,
  SeamLine,
  MarginNote,
} from '@/components/cuaderno/EgoeraPatterns';

/**
 * Hub de cuadernos · /cuadernos
 *
 * Diseño v4 — identidad Egoera reforzada:
 *  - Hero con WavePattern decorativo de fondo + DotsGrid sutil
 *  - Grid responsive 1/2/3 columnas con cards ricas
 *  - Cada card: sello concéntrico con Nº + Peep ilustración + cover Fraunces +
 *    pattern de wave/dots según tema + footer con progress
 */

type CardTheme = {
  cover_bg: string;
  cover_fg: string;
  cover_accent: string; // color del Caveat coral
  stamp_bg: string;
  stamp_fg: string;
  pattern_color: string;
  peep_name: string;
  peep_folder: 'amigas' | 'ifs' | 'arquetipos';
};

const THEMES: Record<string, CardTheme> = {
  hipervigilancia: {
    cover_bg: '#1d2bdb',
    cover_fg: '#f1ead8',
    cover_accent: '#d97757',
    stamp_bg: '#f4c842',
    stamp_fg: '#0d0f3d',
    pattern_color: 'rgba(241,234,216,0.18)',
    peep_name: 'nora',
    peep_folder: 'amigas',
  },
  'reparar-gottman': {
    cover_bg: '#0d0f3d',
    cover_fg: '#f1ead8',
    cover_accent: '#f4c842',
    stamp_bg: '#d97757',
    stamp_fg: '#f1ead8',
    pattern_color: 'rgba(241,234,216,0.14)',
    peep_name: 'eva',
    peep_folder: 'amigas',
  },
  'lenguajes-amor': {
    cover_bg: '#d97757',
    cover_fg: '#f1ead8',
    cover_accent: '#1d2bdb',
    stamp_bg: '#f4c842',
    stamp_fg: '#0d0f3d',
    pattern_color: 'rgba(241,234,216,0.20)',
    peep_name: 'mira',
    peep_folder: 'amigas',
  },
  'mapa-emociones': {
    cover_bg: '#f4c842',
    cover_fg: '#0d0f3d',
    cover_accent: '#d97757',
    stamp_bg: '#1d2bdb',
    stamp_fg: '#f1ead8',
    pattern_color: 'rgba(13,15,61,0.16)',
    peep_name: 'iris',
    peep_folder: 'amigas',
  },
  'fortalezas-linea-vida': {
    cover_bg: '#f1ead8',
    cover_fg: '#1d2bdb',
    cover_accent: '#d97757',
    stamp_bg: '#f4c842',
    stamp_fg: '#0d0f3d',
    pattern_color: 'rgba(29,43,219,0.16)',
    peep_name: 'zuri',
    peep_folder: 'amigas',
  },
};

const ACCENT_LABELS: Record<string, string> = {
  hipervigilancia: 'contigo.',
  'reparar-gottman': 'después.',
  'lenguajes-amor': 'tuyos.',
  'mapa-emociones': 'sentir.',
  'fortalezas-linea-vida': 'tuyas.',
};

export default function CuadernosHub() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return (
    <>
      <Screen>
        <div className="hub">
          {/* ─── HERO ──────────────────────────────────────────────── */}
          <header className="hub-hero">
            <div className="hub-hero-bg" aria-hidden>
              <WavePattern color="rgba(29,43,219,0.10)" className="hub-hero-wave" />
              <DotsGrid
                color="rgba(29,43,219,0.10)"
                size={16}
                dot={1.1}
                className="hub-hero-dots"
              />
              <div className="hub-hero-sticker" />
            </div>
            <span className="hub-eyebrow">— EGOERA · CUADERNOS —</span>
            <h1 className="hub-h">
              Trabajo con boli<span className="hub-h-amp"> &amp; </span>
              <em>respiración.</em>
            </h1>
            <p className="hub-lede">
              Cinco cuadernos para mirar despacio. Los puedes leer aquí dentro —
              <strong> modo libro</strong> — o descargarlos en PDF para imprimirlos y
              trabajar a mano. Cada uno entre 12 y 13 páginas A4.
            </p>
            <div className="hub-meta">
              <span><strong>5</strong> cuadernos</span>
              <span className="hub-meta-dot" aria-hidden>·</span>
              <span><strong>~65</strong> páginas A4</span>
              <span className="hub-meta-dot" aria-hidden>·</span>
              <span>Imprimibles</span>
            </div>
          </header>

          {/* ─── GRID DE CUADERNOS ─────────────────────────────────── */}
          <ul className="hub-grid">
            {CUADERNOS.map((c, i) => {
              const slug = c.meta.slug;
              const theme = THEMES[slug];
              const accent = ACCENT_LABELS[slug] ?? '';
              const pct = hydrated ? progressPct(slug, c.pages.length) : 0;
              const started = hydrated && isStarted(slug);
              const finished = hydrated && isFinished(slug);
              return (
                <li key={slug}>
                  <Link href={`/cuadernos/${slug}`} className="cb">
                    {/* Cover */}
                    <div
                      className="cb-cover"
                      style={{ background: theme.cover_bg, color: theme.cover_fg }}
                    >
                      {/* Pattern de fondo */}
                      <div className="cb-cover-bg" aria-hidden>
                        <DotsGrid
                          color={theme.pattern_color}
                          size={14}
                          dot={1.0}
                          className="cb-dots"
                        />
                        <WavePattern color={theme.pattern_color} className="cb-wave" />
                      </div>

                      {/* Sello con número */}
                      <div className="cb-stamp">
                        <ConcentricStamp
                          label={String(i + 1).padStart(2, '0')}
                          size={72}
                          fg={theme.stamp_fg}
                          bg={theme.stamp_bg}
                        />
                      </div>

                      {/* Esquinas decorativas */}
                      <CornerMark
                        position="tl"
                        color={theme.cover_fg}
                        className="cb-corner cb-corner-tl"
                        style={{ opacity: 0.4 }}
                      />
                      <CornerMark
                        position="br"
                        color={theme.cover_fg}
                        className="cb-corner cb-corner-br"
                        style={{ opacity: 0.4 }}
                      />

                      {/* Peep ilustración */}
                      <div className="cb-peep">
                        <Peep
                          name={theme.peep_name}
                          folder={theme.peep_folder}
                          size={84}
                          alt=""
                        />
                      </div>

                      {/* Eyebrow + título + accent */}
                      <div className="cb-text">
                        <span className="cb-eyebrow">
                          — NÚMERO {String(i + 1).padStart(2, '0')} ·
                          {' '}{c.meta.duration}{' '}—
                        </span>
                        <h2 className="cb-title">{c.meta.title}.</h2>
                        <span
                          className="cb-accent"
                          style={{ color: theme.cover_accent }}
                        >
                          {accent}
                        </span>
                      </div>
                    </div>

                    {/* Pie · meta + progress */}
                    <div className="cb-meta">
                      <span className="cb-topic">{c.meta.topic}</span>
                      <p className="cb-sub">{c.meta.subtitle}</p>
                      {hydrated && started ? (
                        <div className="cb-progress">
                          <div className="cb-progress-bar" aria-hidden>
                            <div
                              className="cb-progress-fill"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="cb-progress-label">
                            {finished ? '✓ Completado' : `${pct}% · seguir`}
                          </span>
                        </div>
                      ) : (
                        <span className="cb-cta">Abrir cuaderno →</span>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* ─── BLOQUE FINAL ──────────────────────────────────────── */}
          <footer className="hub-foot">
            <div className="hub-foot-mark" aria-hidden>
              <ConcentricStamp label="*" size={56} fg="#1d2bdb" bg="#f4c842" />
            </div>
            <div>
              <span className="hub-foot-eyebrow">— EMPIEZA POR AQUÍ —</span>
              <p className="hub-foot-body">
                ¿No sabes por dónde empezar? El primer cuaderno —
                <strong> Hipervigilancia</strong> — está pensado como la puerta de
                entrada al universo Egoera.
              </p>
              <SeamLine color="rgba(29,43,219,0.32)" style={{ marginTop: 14 }} />
              <MarginNote text="psicología, despacio" rotate={-2} style={{ marginTop: 10 }} />
            </div>
          </footer>
        </div>
      </Screen>
      <TabBar />

      <style jsx>{`
        .hub {
          padding: 18px 14px 110px;
          max-width: 1180px;
          margin: 0 auto;
          width: 100%;
        }
        @media (min-width: 768px) {
          .hub {
            padding: 36px 28px 110px;
          }
        }

        /* ═══ HERO ═══ */
        .hub-hero {
          position: relative;
          padding: 24px 18px 28px;
          margin-bottom: 28px;
          border-radius: 22px;
          background: linear-gradient(135deg, #f7eecf 0%, #f1ead8 60%, #ede0bd 100%);
          overflow: hidden;
          border: 1px solid rgba(29, 43, 219, 0.10);
        }
        @media (min-width: 768px) {
          .hub-hero {
            padding: 44px 40px 40px;
            margin-bottom: 40px;
          }
        }
        .hub-hero-bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        .hub-hero-wave {
          position: absolute;
          left: -20%;
          right: -20%;
          bottom: -10%;
          width: 140%;
          height: 70%;
          opacity: 0.7;
        }
        .hub-hero-dots {
          position: absolute;
          inset: 0;
          opacity: 0.5;
        }
        .hub-hero-sticker {
          position: absolute;
          top: -40px;
          right: -40px;
          width: 130px;
          height: 130px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(244, 200, 66, 0.45) 30%, transparent 70%);
        }
        .hub-hero-sticker::after {
          content: '';
          position: absolute;
          top: 60px;
          right: 60px;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #d97757;
        }

        .hub-eyebrow {
          position: relative;
          z-index: 1;
          font-family: var(--font-mono);
          font-size: 10.5px;
          letter-spacing: 0.26em;
          color: var(--cobalto);
          opacity: 0.85;
        }
        .hub-h {
          position: relative;
          z-index: 1;
          font-family: var(--font-display);
          font-weight: 600;
          font-style: normal;
          font-size: clamp(28px, 5.4vw, 52px);
          line-height: 1.04;
          letter-spacing: -0.02em;
          color: var(--ink);
          margin: 10px 0 14px;
          max-width: 16ch;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        .hub-h em {
          font-style: italic;
          color: var(--cobalto);
        }
        .hub-h-amp {
          font-family: var(--font-hand, 'Caveat'), cursive;
          font-size: 0.85em;
          color: var(--coral, #d97757);
          font-style: normal;
        }
        .hub-lede {
          position: relative;
          z-index: 1;
          font-family: var(--font-body);
          font-size: clamp(13.5px, 2.6vw, 16px);
          line-height: 1.6;
          color: var(--ink-soft);
          max-width: 56ch;
          margin: 0;
        }
        .hub-lede strong {
          color: var(--cobalto);
          font-weight: 600;
        }
        .hub-meta {
          position: relative;
          z-index: 1;
          display: flex;
          flex-wrap: wrap;
          gap: 6px 10px;
          align-items: center;
          margin-top: 18px;
          font-family: var(--font-mono);
          font-size: 10.5px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--cobalto);
        }
        .hub-meta strong {
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 600;
          font-size: 16px;
          letter-spacing: -0.01em;
          text-transform: none;
          color: var(--coral, #d97757);
          margin-right: 2px;
        }
        .hub-meta-dot {
          opacity: 0.45;
        }

        /* ═══ GRID DE CUADERNOS ═══ */
        .hub-grid {
          list-style: none;
          padding: 0;
          margin: 0 0 32px;
          display: grid;
          gap: 18px;
          grid-template-columns: 1fr;
        }
        @media (min-width: 560px) {
          .hub-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
          }
        }
        @media (min-width: 980px) {
          .hub-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
          }
        }
        .hub-grid > li {
          display: flex;
        }

        /* ═══ CARD ═══ */
        .cb {
          display: flex;
          flex-direction: column;
          background: #ffffff;
          border-radius: 18px;
          overflow: hidden;
          text-decoration: none;
          color: inherit;
          width: 100%;
          box-shadow: 0 10px 26px -18px rgba(13, 15, 61, 0.30);
          transition: transform 0.22s ease, box-shadow 0.22s ease;
          border: 1px solid rgba(13, 15, 61, 0.06);
        }
        .cb:hover {
          transform: translateY(-3px);
          box-shadow: 0 20px 40px -18px rgba(13, 15, 61, 0.42);
        }
        /* ── Cover ── */
        .cb-cover {
          position: relative;
          aspect-ratio: 4 / 5;
          padding: 22px 22px 24px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          overflow: hidden;
          min-height: 280px;
        }
        .cb-cover-bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        .cb-dots {
          position: absolute;
          inset: 0;
        }
        .cb-wave {
          position: absolute;
          left: -10%;
          right: -10%;
          top: 38%;
          width: 120%;
          height: 30%;
          opacity: 0.7;
        }
        .cb-stamp {
          position: absolute;
          top: 18px;
          left: 18px;
          z-index: 2;
          filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.22));
        }
        .cb-corner {
          position: absolute;
          z-index: 2;
        }
        .cb-corner-tl {
          display: none; /* eliminado para limpieza visual */
        }
        .cb-corner-br {
          display: none;
        }
        .cb-peep {
          position: absolute;
          top: 14px;
          right: 14px;
          z-index: 2;
          opacity: 1;
          filter: drop-shadow(0 10px 22px rgba(0, 0, 0, 0.32));
        }
        .cb-peep :global(.peep-wrap) {
          width: 96px !important;
          height: 96px !important;
        }
        @media (max-width: 559px) {
          .cb-peep :global(.peep-wrap) {
            width: 88px !important;
            height: 88px !important;
          }
        }
        .cb-text {
          position: relative;
          z-index: 2;
        }
        .cb-eyebrow {
          display: block;
          font-family: var(--font-mono);
          font-size: 9.5px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          opacity: 0.78;
          margin-bottom: 4px;
        }
        .cb-title {
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 600;
          font-size: clamp(20px, 2.4vw, 26px);
          line-height: 1.02;
          letter-spacing: -0.01em;
          margin: 0;
          word-break: normal;
          overflow-wrap: break-word;
          hyphens: auto;
        }
        .cb-accent {
          display: block;
          font-family: var(--font-hand, 'Caveat'), cursive;
          font-weight: 700;
          font-size: clamp(34px, 4vw, 48px);
          line-height: 0.85;
          margin: 4px 0 0;
        }

        /* ── Pie de card ── */
        .cb-meta {
          padding: 16px 18px 18px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          background: #ffffff;
          position: relative;
        }
        .cb-meta::before {
          /* línea decorativa entre cover y meta */
          content: '';
          position: absolute;
          top: 0;
          left: 18px;
          right: 18px;
          height: 1px;
          background-image: repeating-linear-gradient(
            to right,
            rgba(29, 43, 219, 0.25) 0,
            rgba(29, 43, 219, 0.25) 5px,
            transparent 5px,
            transparent 10px
          );
        }
        .cb-topic {
          font-family: var(--font-mono);
          font-size: 9.5px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--cobalto);
        }
        .cb-sub {
          font-family: var(--font-body);
          font-size: 14px;
          line-height: 1.4;
          color: var(--ink-soft);
          margin: 0;
          font-style: italic;
        }
        .cb-progress {
          display: flex;
          align-items: center;
          gap: 8px;
          padding-top: 6px;
        }
        .cb-progress-bar {
          flex: 1;
          height: 4px;
          background: rgba(29, 43, 219, 0.12);
          border-radius: 999px;
          overflow: hidden;
        }
        .cb-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #f4c842 0%, #d97757 100%);
          border-radius: 999px;
          transition: width 0.4s ease;
        }
        .cb-progress-label {
          font-family: var(--font-mono);
          font-size: 9.5px;
          letter-spacing: 0.14em;
          color: var(--cobalto);
          white-space: nowrap;
        }
        .cb-cta {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.18em;
          color: var(--cobalto);
          padding-top: 2px;
          font-weight: 600;
        }

        /* ═══ FOOTER ═══ */
        .hub-foot {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 18px;
          padding: 22px 22px;
          background: rgba(244, 200, 66, 0.16);
          border-radius: 16px;
          border: 1px solid rgba(244, 200, 66, 0.32);
          margin-bottom: 24px;
        }
        @media (max-width: 480px) {
          .hub-foot {
            grid-template-columns: 1fr;
            text-align: center;
            justify-items: center;
          }
        }
        .hub-foot-mark {
          flex-shrink: 0;
          display: grid;
          place-items: center;
        }
        .hub-foot-eyebrow {
          display: block;
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.22em;
          color: var(--cobalto);
          margin-bottom: 6px;
        }
        .hub-foot-body {
          font-family: var(--font-body);
          font-size: 14px;
          line-height: 1.55;
          color: var(--ink);
          margin: 0;
        }
        .hub-foot-body strong {
          color: var(--cobalto);
          font-weight: 600;
        }
      `}</style>
    </>
  );
}
