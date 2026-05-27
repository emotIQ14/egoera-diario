'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CUADERNOS } from '@/lib/cuadernos-data';
import { progressPct, isStarted, isFinished } from '@/lib/cuadernos-storage';
import Screen from '@/components/Screen';
import TabBar from '@/components/TabBar';

/**
 * Hub de cuadernos · /cuadernos
 *
 * Grid editorial con las cinco fichas. Cada card simula la portada del
 * cuaderno con su título, accent y eyebrow. Click → /cuadernos/[slug].
 */
export default function CuadernosHub() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return (
    <>
      <Screen>
        <div className="hub">
          <header className="hub-head">
            <span className="hub-eyebrow">— CUADERNOS —</span>
            <h1>Trabajo con boli y respiración.</h1>
            <p className="hub-lede">
              Cinco cuadernos para mirar despacio. Los puedes leer aquí dentro
              — modo libro — o descargarlos en PDF para imprimirlos y trabajar
              a mano. Cada uno entre 12 y 13 páginas A4.
            </p>
          </header>

          <div className="hub-grid">
            {CUADERNOS.map((c, i) => {
              const accent = accentFor(i);
              const pct = hydrated ? progressPct(c.meta.slug, c.pages.length) : 0;
              const started = hydrated && isStarted(c.meta.slug);
              const finished = hydrated && isFinished(c.meta.slug);
              return (
                <Link key={c.meta.slug} href={`/cuadernos/${c.meta.slug}`} className="cb">
                  <div className="cb-cover" style={{ background: accent.bg }}>
                    <span className="cb-eyebrow" style={{ color: accent.fg }}>
                      — Nº {String(i + 1).padStart(2, '0')} · EGOERA —
                    </span>
                    <h2 className="cb-title" style={{ color: accent.fg }}>
                      {c.meta.title}.
                    </h2>
                    <span className="cb-accent" style={{ color: accent.accentText }}>
                      {coverAccentFor(c.meta.slug)}
                    </span>
                    <div className="cb-sticker" style={{ background: accent.sticker }} />
                  </div>
                  <div className="cb-meta">
                    <div className="cb-meta-top">
                      <span className="cb-topic">{c.meta.topic}</span>
                      <span className="cb-duration">{c.meta.duration}</span>
                    </div>
                    <p className="cb-sub">{c.meta.subtitle}</p>
                    {hydrated && started && (
                      <div className="cb-progress">
                        <div className="cb-progress-bar">
                          <div
                            className="cb-progress-fill"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="cb-progress-label">
                          {finished ? '✓ Completado' : `${pct}% leído`}
                        </span>
                      </div>
                    )}
                    {!started && hydrated && (
                      <span className="cb-cta">Abrir →</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          <footer className="hub-foot">
            <p>
              ¿No sabes por dónde empezar? Empieza por el primero —
              <strong> Hipervigilancia</strong>. Está pensado como la puerta de
              entrada al universo Egoera.
            </p>
          </footer>
        </div>
      </Screen>
      <TabBar />

      <style jsx>{`
        .hub {
          padding: 18px 14px 110px;
          max-width: 1100px;
          margin: 0 auto;
          width: 100%;
          overflow-x: hidden;
        }
        @media (min-width: 768px) {
          .hub {
            padding: 32px 24px 110px;
          }
        }
        .hub-head {
          margin-bottom: 24px;
        }
        .hub-eyebrow {
          font-family: var(--font-mono);
          font-size: 10.5px;
          letter-spacing: 0.22em;
          color: var(--cobalto);
          opacity: 0.78;
        }
        .hub-head h1 {
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 600;
          font-size: clamp(26px, 5vw, 44px);
          line-height: 1.05;
          color: var(--ink);
          margin: 6px 0 12px;
          word-wrap: break-word;
          overflow-wrap: break-word;
          hyphens: auto;
        }
        .hub-lede {
          font-family: var(--font-body);
          font-size: clamp(14px, 2.6vw, 15px);
          line-height: 1.55;
          color: var(--ink-soft);
          max-width: 38em;
          margin: 0;
        }
        .hub-grid {
          display: grid;
          gap: 18px;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          margin-bottom: 32px;
        }
        @media (max-width: 480px) {
          .hub-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
        }
        @media (min-width: 900px) {
          .hub-grid {
            gap: 24px;
          }
        }
        .cb {
          display: flex;
          flex-direction: column;
          background: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          text-decoration: none;
          color: inherit;
          box-shadow: 0 8px 24px -16px rgba(13, 15, 61, 0.28);
          transition: transform 0.22s ease, box-shadow 0.22s ease;
        }
        .cb:hover {
          transform: translateY(-3px);
          box-shadow: 0 16px 36px -16px rgba(13, 15, 61, 0.42);
        }
        .cb-cover {
          aspect-ratio: 4 / 3;
          position: relative;
          padding: 22px 22px 18px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          overflow: hidden;
        }
        .cb-eyebrow {
          font-family: var(--font-mono);
          font-size: 9.5px;
          letter-spacing: 0.18em;
          opacity: 0.85;
          margin-bottom: 4px;
          z-index: 1;
        }
        .cb-title {
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 600;
          font-size: clamp(24px, 3vw, 30px);
          line-height: 1;
          margin: 0;
          z-index: 1;
        }
        .cb-accent {
          font-family: var(--font-hand, 'Caveat'), cursive;
          font-size: clamp(38px, 5vw, 52px);
          line-height: 0.85;
          margin: 4px 0 0;
          z-index: 1;
        }
        .cb-sticker {
          position: absolute;
          top: -28px;
          right: -28px;
          width: 110px;
          height: 110px;
          border-radius: 50%;
          opacity: 0.92;
        }
        .cb-meta {
          padding: 14px 18px 18px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .cb-meta-top {
          display: flex;
          justify-content: space-between;
          gap: 8px;
          font-family: var(--font-mono);
          font-size: 9.5px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--cobalto);
        }
        .cb-sub {
          font-family: var(--font-body);
          font-size: 14px;
          line-height: 1.4;
          color: var(--ink-soft);
          margin: 0;
        }
        .cb-progress {
          display: flex;
          align-items: center;
          gap: 8px;
          padding-top: 4px;
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
          align-self: flex-start;
        }
        .hub-foot {
          margin-top: 32px;
          padding: 18px 22px;
          background: rgba(244, 200, 66, 0.16);
          border-radius: 14px;
        }
        .hub-foot p {
          font-family: var(--font-body);
          font-size: 14px;
          line-height: 1.55;
          color: var(--ink);
          margin: 0;
        }
      `}</style>
    </>
  );
}

function accentFor(i: number) {
  // Cinco temas visuales rotativos, todos dentro de la identidad Egoera
  const palettes = [
    { bg: '#1d2bdb', fg: '#f1ead8', accentText: '#d97757', sticker: '#f4c842' }, // hipervigilancia
    { bg: '#0d0f3d', fg: '#f1ead8', accentText: '#f4c842', sticker: '#d97757' }, // gottman
    { bg: '#d97757', fg: '#f1ead8', accentText: '#1d2bdb', sticker: '#f4c842' }, // lenguajes
    { bg: '#f4c842', fg: '#0d0f3d', accentText: '#d97757', sticker: '#1d2bdb' }, // emociones
    { bg: '#f1ead8', fg: '#1d2bdb', accentText: '#d97757', sticker: '#f4c842' }, // fortalezas
  ];
  return palettes[i % palettes.length];
}

function coverAccentFor(slug: string): string {
  return (
    {
      hipervigilancia: 'contigo.',
      'reparar-gottman': 'después.',
      'lenguajes-amor': 'tuyos.',
      'mapa-emociones': 'sentir.',
      'fortalezas-linea-vida': 'tuyas.',
    } as Record<string, string>
  )[slug] ?? 'tuyo.';
}
