'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { loadEntries, entriesThisWeek } from '@/lib/storage';
import { EMOTIONS } from '@/lib/types';

/**
 * Reflexión semanal automática — card que aparece en home cuando hay ≥3 entradas
 * en la semana actual. Detecta el patrón sin interpretarlo: emoción más frecuente,
 * mood promedio, día más bajo y más alto.
 *
 * Voz Egoera: anti-imperativa, narrativa, sin "claves" ni "consejos".
 */

const WEEKDAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

function emotionLabel(id: string): string {
  return EMOTIONS.find((e) => e.id === id)?.label ?? id;
}

type Reflection = {
  count: number;
  avgMood: number;
  topEmotion: string | null;
  topEmotionCount: number;
  lowestDay: { day: string; mood: number } | null;
  highestDay: { day: string; mood: number } | null;
};

function computeReflection(): Reflection | null {
  const entries = entriesThisWeek();
  if (entries.length < 3) return null;
  // Mood medio
  const avg = entries.reduce((s, e) => s + e.mood, 0) / entries.length;
  // Emoción más frecuente
  const freq = new Map<string, number>();
  for (const e of entries) {
    for (const emo of e.emotions) freq.set(emo, (freq.get(emo) ?? 0) + 1);
  }
  let topId: string | null = null;
  let topCount = 0;
  for (const [id, c] of freq) {
    if (c > topCount) { topId = id; topCount = c; }
  }
  // Día más alto y más bajo
  const sorted = [...entries].sort((a, b) => a.mood - b.mood);
  const lowest = sorted[0];
  const highest = sorted[sorted.length - 1];
  return {
    count: entries.length,
    avgMood: Math.round(avg * 10) / 10,
    topEmotion: topId ? emotionLabel(topId) : null,
    topEmotionCount: topCount,
    lowestDay: lowest ? { day: WEEKDAYS[new Date(lowest.createdAt).getDay()], mood: lowest.mood } : null,
    highestDay: highest && highest !== lowest
      ? { day: WEEKDAYS[new Date(highest.createdAt).getDay()], mood: highest.mood }
      : null,
  };
}

export default function WeeklyReflection() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setHydrated(true); }, []);
  const r = useMemo(() => hydrated ? computeReflection() : null, [hydrated]);
  if (!r) return null;

  // Headline contextual según mood medio
  let headline = 'una semana suave.';
  if (r.avgMood < 4) headline = 'una semana que pesó.';
  else if (r.avgMood < 6) headline = 'una semana de ratos.';
  else if (r.avgMood < 8) headline = 'una semana con respiración.';
  else headline = 'una semana ligera.';

  return (
    <Link href="/patrones" className="wr">
      <div className="wr-head">
        <span className="wr-eyebrow">— REFLEXIÓN DE LA SEMANA —</span>
        <span className="wr-arrow">→</span>
      </div>
      <h2 className="wr-h">{headline}</h2>
      <div className="wr-stats">
        <div className="wr-stat">
          <span className="wr-num">{r.count}</span>
          <span className="wr-lbl">entradas</span>
        </div>
        <div className="wr-stat">
          <span className="wr-num">{r.avgMood.toFixed(1)}</span>
          <span className="wr-lbl">mood medio</span>
        </div>
        {r.topEmotion && (
          <div className="wr-stat">
            <span className="wr-num wr-num-text">{r.topEmotion.toLowerCase()}</span>
            <span className="wr-lbl">la más repetida</span>
          </div>
        )}
      </div>
      {(r.lowestDay || r.highestDay) && (
        <p className="wr-arc">
          {r.lowestDay && r.highestDay && (
            <>
              El <strong>{r.lowestDay.day}</strong> fue el más bajo ({r.lowestDay.mood}). El{' '}
              <strong>{r.highestDay.day}</strong>, el más alto ({r.highestDay.mood}).
            </>
          )}
          {r.lowestDay && !r.highestDay && (
            <>El <strong>{r.lowestDay.day}</strong> fue el día más bajo ({r.lowestDay.mood}).</>
          )}
        </p>
      )}
      <span className="wr-cta">Ver patrones completos →</span>

      <style jsx>{`
        .wr {
          display: block;
          background: linear-gradient(155deg, #f7eecf 0%, #ede0bd 100%);
          border: 1px solid rgba(15, 27, 170, 0.10);
          border-radius: 22px;
          padding: 22px 22px 20px;
          margin: 4px 0 22px;
          color: var(--ink);
          text-decoration: none;
          position: relative;
          overflow: hidden;
          box-shadow: 0 8px 24px -16px rgba(15, 27, 170, 0.20);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .wr:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 32px -16px rgba(15, 27, 170, 0.32);
        }
        .wr::before {
          content: '';
          position: absolute;
          top: -50px;
          right: -50px;
          width: 150px;
          height: 150px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(217, 119, 87, 0.30) 0%, rgba(217, 119, 87, 0) 70%);
          pointer-events: none;
        }
        .wr-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        .wr-eyebrow {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--cobalto);
          opacity: 0.78;
        }
        .wr-arrow {
          font-family: var(--font-mono);
          color: var(--cobalto);
          opacity: 0.55;
          font-size: 15px;
        }
        .wr-h {
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 600;
          font-size: 28px;
          line-height: 1.05;
          color: var(--cobalto);
          margin: 0 0 16px;
        }
        .wr-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-bottom: 12px;
          position: relative;
          z-index: 1;
        }
        .wr-stat {
          background: rgba(255, 255, 255, 0.55);
          border-radius: 12px;
          padding: 10px 8px 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }
        .wr-num {
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 600;
          font-size: 26px;
          line-height: 1;
          color: var(--cobalto);
          letter-spacing: -0.02em;
        }
        .wr-num-text {
          font-size: 17px;
          font-weight: 500;
        }
        .wr-lbl {
          font-family: var(--font-mono);
          font-size: 8.5px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--ink);
          opacity: 0.62;
          text-align: center;
        }
        .wr-arc {
          font-family: var(--font-body);
          font-size: 13.5px;
          line-height: 1.5;
          color: var(--ink);
          opacity: 0.78;
          margin: 8px 0 6px;
        }
        .wr-arc strong {
          font-weight: 600;
          color: var(--cobalto);
        }
        .wr-cta {
          display: inline-block;
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--cobalto);
          opacity: 0.85;
          margin-top: 6px;
        }
        @media (max-width: 380px) {
          .wr-h { font-size: 24px; }
          .wr-num { font-size: 22px; }
        }
      `}</style>
    </Link>
  );
}
