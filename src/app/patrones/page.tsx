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

function entriesLast30Days(all: DiaryEntry[], now: Date = new Date()): DiaryEntry[] {
  const start = new Date(now);
  start.setDate(now.getDate() - 29);
  start.setHours(0, 0, 0, 0);
  return all.filter((e) => {
    const t = new Date(e.createdAt).getTime();
    return t >= start.getTime() && t <= now.getTime();
  });
}

type DayMood = { day: number; mood: number; date: Date };

function moodByDayLast30(entries: DiaryEntry[], now: Date = new Date()): DayMood[] {
  const start = new Date(now);
  start.setDate(now.getDate() - 29);
  start.setHours(0, 0, 0, 0);
  const sums = new Array<number>(30).fill(0);
  const counts = new Array<number>(30).fill(0);
  for (const e of entries) {
    const t = new Date(e.createdAt);
    t.setHours(0, 0, 0, 0);
    const idx = Math.floor((t.getTime() - start.getTime()) / 86400000);
    if (idx < 0 || idx > 29) continue;
    sums[idx] += e.mood;
    counts[idx] += 1;
  }
  return sums.map((s, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return {
      day: i + 1,
      mood: counts[i] > 0 ? s / counts[i] : NaN,
      date: d,
    };
  });
}

type Pt = { x: number; y: number };

// Catmull-Rom → Bezier (curve smoothing)
function smoothPath(points: Pt[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return d;
}

const SVG_W = 600;
const SVG_H = 337.5; // 16/9
const PAD_L = 36;
const PAD_R = 16;
const PAD_T = 18;
const PAD_B = 30;
const PLOT_W = SVG_W - PAD_L - PAD_R;
const PLOT_H = SVG_H - PAD_T - PAD_B;

function dayToX(day: number): number {
  return PAD_L + ((day - 1) / 29) * PLOT_W;
}
function moodToY(mood: number): number {
  // 0..10 → invertido, alto = bueno arriba
  const clamped = Math.max(0, Math.min(10, mood));
  return PAD_T + (1 - clamped / 10) * PLOT_H;
}

function moodPathSVG(dayMoods: DayMood[]): { path: string; dots: DayMood[] } {
  const real = dayMoods.filter((d) => !Number.isNaN(d.mood));
  if (real.length === 0) return { path: '', dots: [] };
  const points: Pt[] = real.map((d) => ({ x: dayToX(d.day), y: moodToY(d.mood) }));
  return { path: smoothPath(points), dots: real };
}

function projectedMoodPath(currentMood: number, fromDay: number): string {
  // Línea proyectada: del último día con dato hasta día 30, mood→8
  const startMood = Number.isFinite(currentMood) ? currentMood : 5;
  const startDay = Math.max(1, Math.min(30, fromDay));
  const points: Pt[] = [];
  const steps = Math.max(2, 30 - startDay + 1);
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    const day = startDay + (30 - startDay) * t;
    const mood = startMood + (8 - startMood) * t;
    points.push({ x: dayToX(day), y: moodToY(mood) });
  }
  return smoothPath(points);
}

function areaPath(path: string): string {
  // Cierra el path bajo la curva hasta la línea base (mood=0 → y=PAD_T+PLOT_H)
  if (!path) return '';
  const baseY = PAD_T + PLOT_H;
  // Extraer último x del path: buscar el último número par antes del cierre
  const matches = Array.from(path.matchAll(/([\d.]+)\s+([\d.]+)/g));
  if (matches.length === 0) return '';
  const last = matches[matches.length - 1];
  const first = matches[0];
  const lastX = parseFloat(last[1]);
  const firstX = parseFloat(first[1]);
  return `${path} L ${lastX.toFixed(2)} ${baseY.toFixed(2)} L ${firstX.toFixed(2)} ${baseY.toFixed(2)} Z`;
}

function fmtDateShort(d: Date): string {
  return `${pad2(d.getDate())} ${MONTHS_SHORT[d.getMonth()]}`;
}

type State = {
  entries: DiaryEntry[];
  prev: DiaryEntry[];
  monthEntries: DiaryEntry[];
  totalEntries: number;
  consecutiveDays: number;
  monday: Date;
  sunday: Date;
  now: Date;
};

function consecutiveDaysStreak(all: DiaryEntry[], now: Date = new Date()): number {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const seen = new Set<string>();
  for (const e of all) {
    const d = new Date(e.createdAt);
    d.setHours(0, 0, 0, 0);
    seen.add(d.toISOString().slice(0, 10));
  }
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    if (seen.has(d.toISOString().slice(0, 10))) streak++;
    else break;
  }
  return streak;
}

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
      monthEntries: entriesLast30Days(all, now),
      totalEntries: all.length,
      consecutiveDays: consecutiveDaysStreak(all, now),
      monday,
      sunday,
      now,
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

  const monthCurve = useMemo(() => {
    if (!state) {
      return {
        dayMoods: [] as DayMood[],
        path: '',
        dots: [] as DayMood[],
        projected: '',
        hasEnoughData: false,
        realCount: 0,
      };
    }
    const dayMoods = moodByDayLast30(state.monthEntries, state.now);
    const real = dayMoods.filter((d) => !Number.isNaN(d.mood));
    const { path, dots } = moodPathSVG(dayMoods);
    let projected = '';
    if (real.length > 0 && real.length < 5) {
      const last = real[real.length - 1];
      projected = projectedMoodPath(last.mood, last.day);
    }
    return {
      dayMoods,
      path,
      dots,
      projected,
      hasEnoughData: real.length >= 5,
      realCount: real.length,
    };
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

  const showStreakPill = state.consecutiveDays >= 7;
  const showVeteranBadge = state.totalEntries >= 30;

  return (
    <Screen background="cream">
      <header className="head">
        <p className="eyebrow">— 04 · Patrones —</p>
        {showStreakPill ? (
          <span className="streak-pill" aria-label={`${state.consecutiveDays} días seguidos`}>
            +{state.consecutiveDays} días seguidos
          </span>
        ) : null}
        <h1 className="sec-big">
          {narrative.headline}
          <br />
          <em>{narrative.emphasis}</em>.
        </h1>
        {showVeteranBadge ? (
          <span className="veteran-badge">Veterano · 30 días en Egoera</span>
        ) : null}
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

      <section className="month-curve" aria-label="Curva de los últimos 30 días">
        <p className="eyebrow eyebrow-section">— TUS 30 DÍAS —</p>
        <h2 className="sec-big sec-big-sm">
          Tu camino hacia
          <br />
          <em>la calma</em>.
        </h2>

        {monthCurve.realCount === 0 ? (
          <div className="curve-empty">
            <p className="curve-empty-text">
              Empieza hoy. En 30 días podrás ver tu curva real.
            </p>
            <Link href="/diario" className="btn btn-cobalto curve-cta">
              Escribir hoy →
            </Link>
          </div>
        ) : (
          <div className="curve-wrap">
            <svg
              className="curve-svg"
              viewBox={`0 0 ${SVG_W} ${SVG_H}`}
              preserveAspectRatio="none"
              role="img"
              aria-label="Gráfica de mood diario en los últimos 30 días"
            >
              {/* Banda de bienestar (área bajo curva real) */}
              {monthCurve.path ? (
                <path
                  d={areaPath(monthCurve.path)}
                  fill="var(--accent)"
                  fillOpacity="0.1"
                />
              ) : null}

              {/* Línea objetivo (mood = 7) */}
              <line
                x1={PAD_L}
                y1={moodToY(7)}
                x2={SVG_W - PAD_R}
                y2={moodToY(7)}
                stroke="var(--ink)"
                strokeOpacity="0.28"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text
                x={SVG_W - PAD_R}
                y={moodToY(7) - 6}
                textAnchor="end"
                fontFamily="var(--font-mono)"
                fontSize="10"
                fill="var(--ink)"
                fillOpacity="0.55"
                letterSpacing="0.18em"
              >
                OBJETIVO
              </text>

              {/* Eje X labels (cada 5 días) */}
              {[1, 5, 10, 15, 20, 25, 30].map((d) => (
                <text
                  key={d}
                  x={dayToX(d)}
                  y={SVG_H - 8}
                  textAnchor="middle"
                  fontFamily="var(--font-mono)"
                  fontSize="10"
                  fill="var(--ink)"
                  fillOpacity="0.5"
                  letterSpacing="0.1em"
                >
                  {d}
                </text>
              ))}

              {/* Curva real */}
              {monthCurve.path ? (
                <path
                  d={monthCurve.path}
                  fill="none"
                  stroke="var(--cobalto)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : null}

              {/* Curva proyectada (si hay <5 entradas) */}
              {monthCurve.projected ? (
                <path
                  d={monthCurve.projected}
                  fill="none"
                  stroke="var(--cobalto)"
                  strokeOpacity="0.5"
                  strokeWidth="2.5"
                  strokeDasharray="6 5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : null}

              {/* Dots con tooltips */}
              {monthCurve.dots.map((d) => (
                <g key={d.day}>
                  <circle
                    cx={dayToX(d.day)}
                    cy={moodToY(d.mood)}
                    r="4.5"
                    fill="var(--cobalto)"
                    stroke="var(--crema)"
                    strokeWidth="2"
                  >
                    <title>{`${fmtDateShort(d.date)} · mood ${d.mood.toFixed(1)}`}</title>
                  </circle>
                </g>
              ))}
            </svg>
            {!monthCurve.hasEnoughData && monthCurve.realCount > 0 ? (
              <p className="curve-hint">Proyección estimada con 5+ entradas</p>
            ) : null}
          </div>
        )}
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

      <section className="science" aria-label="Respaldo científico">
        <span className="pill-mono">— RESPALDADO POR —</span>
        <h2 className="science-title">
          30 días son suficientes para <em>ver patrones</em>.
        </h2>
        <div className="science-grid">
          <article className="science-card">
            <p className="science-quote">
              «Escribir 5 minutos al día sobre emociones reduce ansiedad un 30% en 4 semanas.»
            </p>
            <p className="science-author">— Pennebaker, J. (1997). Universidad de Texas.</p>
          </article>
          <article className="science-card">
            <p className="science-quote">
              «Identificar la emoción la reduce hasta un 50%. Etiquetarla es regularla.»
            </p>
            <p className="science-author">— Lieberman, M. (2007). UCLA, fMRI study.</p>
          </article>
          <article className="science-card">
            <p className="science-quote">
              «La rumiación se rompe cuando se escribe en lugar de pensarse.»
            </p>
            <p className="science-author">— Watkins, E. (2008). Universidad de Exeter.</p>
          </article>
        </div>
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

        .streak-pill {
          display: inline-block;
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          background: #f5d36b;
          color: var(--ink);
          padding: 5px 10px;
          border-radius: 999px;
          margin-bottom: 10px;
        }
        .veteran-badge {
          display: inline-block;
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--accent);
          margin-top: 8px;
          margin-bottom: 4px;
        }

        .month-curve {
          margin-top: 26px;
        }
        .eyebrow-section {
          margin-bottom: 10px;
        }
        .sec-big-sm {
          font-size: 28px;
          line-height: 1.1;
          margin-bottom: 18px;
        }
        .sec-big-sm :global(em) {
          color: var(--accent);
          font-style: italic;
        }
        .curve-wrap {
          width: 100%;
          background: var(--crema);
          border: 1px solid rgba(13, 15, 61, 0.08);
          border-radius: var(--r-md);
          padding: 14px 14px 8px;
        }
        .curve-svg {
          width: 100%;
          height: auto;
          display: block;
          aspect-ratio: 16 / 9;
        }
        .curve-hint {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--cobalto);
          opacity: 0.7;
          margin-top: 6px;
          text-align: center;
        }
        .curve-empty {
          padding: 28px 18px;
          background: var(--crema);
          border: 1px dashed rgba(13, 15, 61, 0.18);
          border-radius: var(--r-md);
          text-align: center;
        }
        .curve-empty-text {
          font-family: var(--font-display);
          font-style: italic;
          font-size: 18px;
          line-height: 1.3;
          color: var(--ink);
          margin-bottom: 14px;
        }
        .curve-cta {
          display: inline-block;
        }

        .science {
          margin-top: 26px;
          background: var(--crema);
          border: 1px solid rgba(13, 15, 61, 0.1);
          border-radius: var(--r-md);
          padding: 20px 18px;
        }
        .pill-mono {
          display: inline-block;
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          background: rgba(13, 15, 61, 0.08);
          color: var(--ink);
          padding: 4px 10px;
          border-radius: 999px;
          margin-bottom: 12px;
        }
        .science-title {
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 600;
          font-size: 22px;
          line-height: 1.2;
          letter-spacing: -0.01em;
          color: var(--ink);
          margin-bottom: 16px;
        }
        .science-title :global(em) {
          color: var(--cobalto);
          font-style: italic;
        }
        .science-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }
        .science-card {
          padding: 14px 14px;
          background: rgba(13, 15, 61, 0.04);
          border-radius: var(--r-sm, 10px);
          border-left: 2px solid var(--cobalto);
        }
        .science-quote {
          font-family: var(--font-display);
          font-style: italic;
          font-size: 14px;
          line-height: 1.45;
          color: var(--ink);
        }
        .science-author {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.08em;
          opacity: 0.7;
          margin-top: 8px;
        }
      `}</style>
    </Screen>
  );
}
