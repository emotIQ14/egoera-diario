'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { loadEntries, streakDays, entriesThisWeek } from '@/lib/storage';
import {
  loadCompletions,
  completionsThisWeek,
  totalMinutesThisWeek,
} from '@/lib/activities';

const BADGES = [3, 7, 14, 30, 60, 100] as const;

/**
 * Tarjeta-resumen gamificada que vive arriba de la home.
 * Combina diario + actividades + badge progress en un solo bloque.
 * No es agresiva: la copy es contemplativa, no de hype.
 */
export default function GamSummary() {
  const [ready, setReady] = useState(false);
  useEffect(() => { setReady(true); }, []);

  const data = useMemo(() => {
    if (!ready) return null;
    const entries = loadEntries();
    const completions = loadCompletions();
    const streak = streakDays();
    const weekEntries = entriesThisWeek().length;
    const weekActs = completionsThisWeek().length;
    const weekMinutes = totalMinutesThisWeek();
    const nextBadge = BADGES.find((b) => b > streak) ?? null;
    const lastBadge = [...BADGES].reverse().find((b) => b <= streak) ?? null;
    return {
      streak,
      total: entries.length,
      weekEntries,
      weekActs,
      weekMinutes,
      nextBadge,
      lastBadge,
      completionsTotal: completions.length,
    };
  }, [ready]);

  if (!data) {
    // Skeleton mínimo para no romper layout
    return <div className="gam-skeleton" aria-hidden="true" />;
  }

  const { streak, weekEntries, weekActs, weekMinutes, nextBadge, lastBadge } = data;
  const ringPct = nextBadge
    ? Math.min(100, Math.round((streak / nextBadge) * 100))
    : 100;
  const ringStroke = (ringPct / 100) * 2 * Math.PI * 30; // r=30
  const ringCirc = 2 * Math.PI * 30;

  return (
    <section className="gam" aria-label="Tu cuidado esta semana">
      <div className="gam-row">
        <div className="gam-ring" aria-hidden="true">
          <svg viewBox="0 0 80 80" className="gam-ring-svg">
            <circle cx="40" cy="40" r="30" className="ring-bg" />
            <circle
              cx="40"
              cy="40"
              r="30"
              className="ring-fill"
              strokeDasharray={`${ringStroke} ${ringCirc}`}
            />
          </svg>
          <div className="gam-ring-content">
            <span className="gam-ring-num">{streak}</span>
            <span className="gam-ring-lbl">días</span>
          </div>
        </div>
        <div className="gam-meta">
          <span className="gam-eyebrow">— racha —</span>
          <p className="gam-headline">
            {streak === 0 && 'Empieza hoy.'}
            {streak === 1 && 'Primer día.'}
            {streak >= 2 && streak < 7 && 'Coges ritmo.'}
            {streak >= 7 && streak < 14 && 'Una semana entera.'}
            {streak >= 14 && streak < 30 && 'Vas constante.'}
            {streak >= 30 && 'Mes a mes.'}
          </p>
          {nextBadge ? (
            <p className="gam-sub">
              <strong>{nextBadge - streak}</strong> {nextBadge - streak === 1 ? 'día' : 'días'} para la insignia de {nextBadge}
            </p>
          ) : (
            <p className="gam-sub">Has pasado todas las insignias. Sigues, sin más.</p>
          )}
        </div>
      </div>

      <div className="gam-stats" aria-label="Esta semana">
        <Link className="gam-stat" href="/diario/historial">
          <span className="gam-stat-n">{weekEntries}</span>
          <span className="gam-stat-lbl">entradas</span>
        </Link>
        <Link className="gam-stat" href="/actividades">
          <span className="gam-stat-n">{weekActs}</span>
          <span className="gam-stat-lbl">actividades</span>
        </Link>
        <Link className="gam-stat" href="/actividades">
          <span className="gam-stat-n">{weekMinutes}</span>
          <span className="gam-stat-lbl">min trabajados</span>
        </Link>
      </div>

      <div className="gam-badges" aria-label="Insignias">
        {BADGES.map((b) => {
          const got = streak >= b;
          const isLast = lastBadge === b;
          return (
            <div
              key={b}
              className={`gam-badge ${got ? 'is-got' : ''} ${isLast ? 'is-last' : ''}`}
              aria-label={got ? `Insignia ${b} días conseguida` : `Insignia ${b} días pendiente`}
              title={got ? `${b} días conseguidos` : `${b} días`}
            >
              <span>{b}</span>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .gam-skeleton {
          height: 220px;
          background: var(--crema-soft);
          border-radius: var(--r-md);
          margin-bottom: 22px;
        }
        .gam {
          background: linear-gradient(160deg, #f7eecf 0%, #ede0bd 100%);
          border: 1px solid rgba(15, 27, 170, 0.10);
          border-radius: 22px;
          padding: 22px 20px 18px;
          margin: 4px 0 24px;
          color: var(--ink);
          box-shadow: 0 8px 24px -16px rgba(15, 27, 170, 0.25);
          position: relative;
          overflow: hidden;
        }
        .gam::before {
          content: '';
          position: absolute;
          top: -40px;
          right: -40px;
          width: 140px;
          height: 140px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(244, 200, 66, 0.45) 0%, rgba(244, 200, 66, 0) 70%);
          pointer-events: none;
        }
        .gam-row {
          display: grid;
          grid-template-columns: 96px 1fr;
          gap: 16px;
          align-items: center;
          margin-bottom: 16px;
        }
        .gam-ring {
          position: relative;
          width: 96px;
          height: 96px;
        }
        .gam-ring-svg {
          width: 96px;
          height: 96px;
          transform: rotate(-90deg);
        }
        .ring-bg {
          fill: none;
          stroke: rgba(15, 27, 170, 0.10);
          stroke-width: 6;
        }
        .ring-fill {
          fill: none;
          stroke: var(--cobalto);
          stroke-width: 6;
          stroke-linecap: round;
          transition: stroke-dasharray 0.6s cubic-bezier(0.34, 1.4, 0.64, 1);
        }
        .gam-ring-content {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          line-height: 1;
        }
        .gam-ring-num {
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 600;
          font-size: 32px;
          color: var(--cobalto);
        }
        .gam-ring-lbl {
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--ink);
          opacity: 0.62;
          margin-top: 2px;
        }
        .gam-meta {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .gam-eyebrow {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--cobalto);
          opacity: 0.78;
        }
        .gam-headline {
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 600;
          font-size: 24px;
          line-height: 1.1;
          margin: 0;
          color: var(--ink);
        }
        .gam-sub {
          font-family: var(--font-body);
          font-size: 13.5px;
          line-height: 1.4;
          margin: 0;
          color: var(--ink);
          opacity: 0.78;
        }
        .gam-sub strong {
          font-weight: 600;
          color: var(--cobalto);
        }
        .gam-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-bottom: 14px;
        }
        .gam-stat {
          background: rgba(255, 255, 255, 0.55);
          border: 1px solid rgba(15, 27, 170, 0.08);
          border-radius: 12px;
          padding: 10px 8px 9px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          text-decoration: none;
          color: var(--ink);
          transition: background 0.15s, transform 0.15s ease;
        }
        .gam-stat:hover { background: rgba(255, 255, 255, 0.78); transform: translateY(-1px); }
        .gam-stat-n {
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 600;
          font-size: 22px;
          line-height: 1;
          color: var(--cobalto);
        }
        .gam-stat-lbl {
          font-family: var(--font-mono);
          font-size: 8.5px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          opacity: 0.6;
          text-align: center;
        }
        .gam-badges {
          display: flex;
          gap: 6px;
          justify-content: space-between;
          padding-top: 12px;
          border-top: 1px dashed rgba(15, 27, 170, 0.18);
        }
        .gam-badge {
          flex: 1;
          aspect-ratio: 1;
          max-width: 38px;
          border-radius: 50%;
          background: rgba(15, 27, 170, 0.06);
          border: 1.5px dashed rgba(15, 27, 170, 0.24);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-mono);
          font-size: 10.5px;
          letter-spacing: 0.04em;
          color: rgba(15, 27, 170, 0.45);
          font-weight: 600;
          transition: background 0.2s, border 0.2s, transform 0.25s cubic-bezier(.34,1.4,.64,1);
        }
        .gam-badge.is-got {
          background: var(--cobalto);
          color: var(--crema);
          border: 1.5px solid var(--cobalto);
        }
        .gam-badge.is-last {
          background: var(--accent);
          color: var(--crema);
          border: 1.5px solid var(--accent);
          transform: scale(1.18);
          box-shadow: 0 4px 12px rgba(217, 119, 87, 0.45);
        }
        @media (max-width: 380px) {
          .gam { padding: 18px 16px 14px; }
          .gam-row { grid-template-columns: 80px 1fr; gap: 12px; }
          .gam-ring, .gam-ring-svg { width: 80px; height: 80px; }
          .gam-ring-num { font-size: 27px; }
          .gam-headline { font-size: 21px; }
          .gam-sub { font-size: 12.5px; }
          .gam-stat-n { font-size: 20px; }
          .gam-badge { max-width: 32px; font-size: 9.5px; }
        }
      `}</style>
    </section>
  );
}
