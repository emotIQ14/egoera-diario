'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Screen from '@/components/Screen';
import TabBar from '@/components/TabBar';
import { loadEntries, type DiaryEntry, type Emotion } from '@/lib/storage';

const MONTHS_SHORT = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
] as const;

const DAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'] as const;

const STOP_WORDS = new Set<string>([
  'el', 'la', 'los', 'las', 'lo', 'un', 'una', 'unos', 'unas',
  'de', 'del', 'al', 'a', 'en', 'y', 'o', 'u', 'que', 'si', 'no',
  'me', 'mi', 'mis', 'tu', 'tus', 'te', 'se', 'le', 'les', 'su', 'sus',
  'es', 'son', 'esta', 'está', 'estoy', 'estas', 'estás', 'estan', 'están',
  'fue', 'era', 'eran', 'ser', 'estar', 'haber', 'hacer', 'tener',
  'he', 'has', 'ha', 'hemos', 'han', 'había', 'hay',
  'por', 'para', 'con', 'sin', 'sobre', 'entre', 'hasta', 'desde',
  'pero', 'aunque', 'porque', 'cuando', 'como', 'donde',
  'esto', 'eso', 'aquello', 'este', 'esta', 'ese', 'esa', 'aquel', 'aquella',
  'yo', 'tú', 'él', 'ella', 'nosotros', 'vosotros', 'ellos', 'ellas',
  'muy', 'más', 'menos', 'tan', 'también', 'tampoco', 'ya', 'aún', 'todavía',
  'algo', 'nada', 'todo', 'todos', 'toda', 'todas', 'cada',
  'voy', 'vas', 'va', 'vamos', 'van', 'iba',
  'soy', 'eres', 'somos', 'sois',
  'tengo', 'tienes', 'tiene', 'tenemos', 'tienen', 'tenía',
  'hago', 'haces', 'hace', 'hacemos', 'hacen',
  'puede', 'puedo', 'puedes', 'podemos', 'pueden',
  'sea', 'sean',
  'creo', 'crees', 'cree', 'siento', 'sientes', 'siente',
  'algo', 'alguien', 'mismo', 'misma',
  'así', 'ahí', 'aquí', 'allí',
  'sí', 'ni', 'porque', 'qué', 'cuál', 'quién',
]);

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function startOfWeek(d: Date): Date {
  const day = d.getDay() || 7; // 1=lun, 7=dom
  const monday = new Date(d);
  monday.setDate(d.getDate() - (day - 1));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function endOfWeek(monday: Date): Date {
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return sunday;
}

function formatRange(monday: Date, sunday: Date): string {
  const y = sunday.getFullYear();
  const ms = MONTHS_SHORT[monday.getMonth()];
  const me = MONTHS_SHORT[sunday.getMonth()];
  return `${pad2(monday.getDate())} ${ms} — ${pad2(sunday.getDate())} ${me} · ${y}`;
}

function entriesInRange(all: DiaryEntry[], from: Date, to: Date): DiaryEntry[] {
  return all.filter((e) => {
    const t = new Date(e.createdAt).getTime();
    return t >= from.getTime() && t <= to.getTime();
  });
}

function getMoodByDay(entries: DiaryEntry[]): number[] {
  const sums = [0, 0, 0, 0, 0, 0, 0];
  const counts = [0, 0, 0, 0, 0, 0, 0];
  for (const e of entries) {
    const d = new Date(e.createdAt);
    const idx = (d.getDay() || 7) - 1; // 0=lun..6=dom
    sums[idx] += e.mood;
    counts[idx] += 1;
  }
  return sums.map((s, i) => (counts[i] > 0 ? s / counts[i] : 0));
}

function dominantEmotion(entries: DiaryEntry[]): string {
  const tally = new Map<Emotion, number>();
  for (const e of entries) {
    for (const em of e.emotions) {
      tally.set(em, (tally.get(em) ?? 0) + 1);
    }
  }
  let best: Emotion | null = null;
  let max = 0;
  for (const [k, v] of tally) {
    if (v > max) {
      max = v;
      best = k;
    }
  }
  return best ?? '';
}

function normalizeWord(w: string): string {
  return w
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zñ]/g, '');
}

function wordOfWeek(
  entries: DiaryEntry[],
): { word: string; count: number; total: number } {
  const total = entries.length;
  const tally = new Map<string, { display: string; count: number }>();
  for (const e of entries) {
    const text = `${e.text ?? ''} ${e.voiceTranscript ?? ''}`;
    const tokens = text.split(/\s+/).filter(Boolean);
    const seenInEntry = new Set<string>();
    for (const tok of tokens) {
      const norm = normalizeWord(tok);
      if (norm.length < 4) continue;
      if (STOP_WORDS.has(norm)) continue;
      if (seenInEntry.has(norm)) continue;
      seenInEntry.add(norm);
      const display = tok.toLowerCase().replace(/[^\p{L}]/gu, '');
      const prev = tally.get(norm);
      if (prev) {
        prev.count += 1;
      } else {
        tally.set(norm, { display: display || norm, count: 1 });
      }
    }
  }
  let bestWord = '';
  let bestCount = 0;
  for (const [, v] of tally) {
    if (v.count > bestCount) {
      bestCount = v.count;
      bestWord = v.display;
    }
  }
  return { word: bestWord, count: bestCount, total };
}

function avgMood(entries: DiaryEntry[]): number {
  if (entries.length === 0) return 0;
  return entries.reduce((s, e) => s + e.mood, 0) / entries.length;
}

function weeklyNarrative(
  entries: DiaryEntry[],
  prevWeekEntries: DiaryEntry[],
): { headline: string; emphasis: string } {
  if (entries.length < 3) {
    return { headline: 'Empieza a anotar para', emphasis: 'ver patrones' };
  }
  const dom = dominantEmotion(entries);
  if (dom === 'tristeza') {
    return { headline: 'Esta semana ha pesado', emphasis: 'la tristeza' };
  }
  if (dom === 'calma' || dom === 'esperanza') {
    return { headline: 'Esta semana has sido', emphasis: 'menos ansioso' };
  }
  const cur = avgMood(entries);
  const prev = avgMood(prevWeekEntries);
  if (prevWeekEntries.length > 0 && cur > prev) {
    return { headline: 'Esta semana has sido', emphasis: 'más estable' };
  }
  return { headline: 'Esta semana has sido', emphasis: 'más tú' };
}

function nightEntriesCount(entries: DiaryEntry[]): {
  early: number;
  total: number;
} {
  let early = 0;
  for (const e of entries) {
    const d = new Date(e.createdAt);
    const h = d.getHours();
    // "antes de las 23:00" → contemplamos también horas de tarde
    if (h < 23 && h >= 18) early += 1;
  }
  return { early, total: entries.length };
}

type State = {
  entries: DiaryEntry[];
  prev: DiaryEntry[];
  monday: Date;
  sunday: Date;
};

export default function PatronesPage() {
  const [state, setState] = useState<State | null>(null);

  useEffect(() => {
    const all = loadEntries();
    const now = new Date();
    const monday = startOfWeek(now);
    const sunday = endOfWeek(monday);
    const prevMonday = new Date(monday);
    prevMonday.setDate(monday.getDate() - 7);
    const prevSunday = new Date(sunday);
    prevSunday.setDate(sunday.getDate() - 7);
    setState({
      entries: entriesInRange(all, monday, sunday),
      prev: entriesInRange(all, prevMonday, prevSunday),
      monday,
      sunday,
    });
  }, []);

  const moodByDay = useMemo<number[]>(() => {
    if (!state) return [0, 0, 0, 0, 0, 0, 0];
    return getMoodByDay(state.entries);
  }, [state]);

  const narrative = useMemo(() => {
    if (!state) return { headline: '', emphasis: '' };
    return weeklyNarrative(state.entries, state.prev);
  }, [state]);

  const wow = useMemo(() => {
    if (!state) return { word: '', count: 0, total: 0 };
    return wordOfWeek(state.entries);
  }, [state]);

  const sleepInsight = useMemo(() => {
    if (!state) return { early: 0, total: 0 };
    return nightEntriesCount(state.entries);
  }, [state]);

  const dateLine = useMemo(() => {
    if (!state) return '';
    return formatRange(state.monday, state.sunday);
  }, [state]);

  // Estado inicial (pre-hidratación) → render mínimo para evitar mismatch.
  if (!state) {
    return (
      <Screen background="cream">
        <header className="head">
          <p className="eyebrow">— 04 · Patrones —</p>
        </header>
        <TabBar />
      </Screen>
    );
  }

  const isEmpty = state.entries.length === 0;

  if (isEmpty) {
    return (
      <Screen background="cream">
        <header className="head">
          <p className="eyebrow">— 04 · Patrones —</p>
          <h1 className="sec-big">
            Empieza a escribir
            <br />
            para ver tus
            <br />
            <em>patrones</em>.
          </h1>
          <p className="s-date">{dateLine}</p>
        </header>
        <div className="empty-cta">
          <Link href="/diario" className="btn btn-cobalto">
            Escribir hoy →
          </Link>
        </div>
        <TabBar />
        <style jsx>{`
          .head {
            margin-bottom: 28px;
          }
          .head .eyebrow {
            margin-bottom: 14px;
          }
          .empty-cta {
            margin-top: 8px;
          }
        `}</style>
      </Screen>
    );
  }

  return (
    <Screen background="cream">
      <header className="head">
        <p className="eyebrow">— 04 · Patrones —</p>
        <h1 className="sec-big">
          {narrative.headline}
          <br />
          <em>{narrative.emphasis}</em>.
        </h1>
        <p className="s-date">{dateLine}</p>
      </header>

      <section className="m-card m-card-dark mood-card" aria-label="Estado de ánimo semanal">
        <span className="pill-num">— Estado de ánimo —</span>
        <div className="chart" role="img" aria-label="Gráfico de estado de ánimo por día">
          {moodByDay.map((m, i) => {
            const heightPct = m > 0 ? Math.max(8, (m / 10) * 100) : 4;
            const isGood = m >= 7;
            return (
              <div className="col" key={DAY_LABELS[i]}>
                <div className="bar-track">
                  <div
                    className={`bar ${isGood ? 'bar-good' : ''} ${m === 0 ? 'bar-empty' : ''}`}
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
                <span className="day">{DAY_LABELS[i]}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="insights" aria-label="Insights de la semana">
        <article className="insight insight-cobalto">
          <span className="ico" aria-hidden>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          </span>
          <div className="ins-body">
            <h3 className="ins-title">
              Has dormido mejor {sleepInsight.early} de {sleepInsight.total}{' '}
              {sleepInsight.total === 1 ? 'día' : 'días'}.
            </h3>
            <p className="ins-sub">
              Coincide con días en los que escribiste antes de las 23:00.
            </p>
          </div>
        </article>

        {wow.word ? (
          <article className="insight insight-accent">
            <span className="ico" aria-hidden>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
            </span>
            <div className="ins-body">
              <h3 className="ins-title">
                Tu palabra de la semana: <em>{wow.word}</em>.
              </h3>
              <p className="ins-sub">
                Apareció en {wow.count} de {wow.total}{' '}
                {wow.total === 1 ? 'entrada' : 'entradas'}.
              </p>
            </div>
          </article>
        ) : null}
      </section>

      <TabBar />

      <style jsx>{`
        .head {
          margin-bottom: 24px;
        }
        .head .eyebrow {
          margin-bottom: 14px;
        }
        .mood-card {
          margin-top: 8px;
        }
        .chart {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 10px;
          height: 120px;
          margin-top: 22px;
        }
        .col {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          height: 100%;
        }
        .bar-track {
          flex: 1;
          width: 100%;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }
        .bar {
          width: 100%;
          background: rgba(241, 234, 216, 0.4);
          border-radius: 6px 6px 2px 2px;
          transition: height 0.3s ease;
        }
        .bar-good {
          background: var(--accent);
        }
        .bar-empty {
          background: rgba(241, 234, 216, 0.18);
        }
        .day {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          opacity: 0.7;
        }
        .insights {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 18px;
        }
        .insight {
          display: flex;
          gap: 14px;
          align-items: flex-start;
          padding: 16px 18px;
          border-radius: var(--r-md);
          border: 1px solid rgba(13, 15, 61, 0.08);
        }
        .insight-cobalto {
          background: var(--cobalto);
          color: var(--crema);
          border-color: rgba(13, 15, 61, 0.18);
        }
        .insight-accent {
          background: rgba(230, 100, 58, 0.12);
          color: var(--ink);
          border-color: rgba(230, 100, 58, 0.28);
        }
        .ico {
          width: 28px;
          height: 28px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ico :global(svg) {
          width: 22px;
          height: 22px;
        }
        .ins-body {
          flex: 1;
        }
        .ins-title {
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 600;
          font-size: 18px;
          line-height: 1.2;
          letter-spacing: -0.01em;
        }
        .ins-title :global(em) {
          color: var(--accent);
          font-style: italic;
        }
        .insight-accent .ins-title :global(em) {
          color: var(--accent-deep);
        }
        .ins-sub {
          font-family: var(--font-body);
          font-size: 13px;
          line-height: 1.45;
          opacity: 0.78;
          margin-top: 4px;
        }
      `}</style>
    </Screen>
  );
}
