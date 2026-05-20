'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Screen from '@/components/Screen';
import TabBar from '@/components/TabBar';
import InstallPrompt from '@/components/InstallPrompt';
import { entriesThisWeek, loadEntries, streakDays, type DiaryEntry } from '@/lib/storage';
import { EMOTIONS } from '@/lib/types';
import { useToast } from '@/components/toast/ToastProvider';

function emotionLabelHome(id: string): string {
  return EMOTIONS.find((e) => e.id === id)?.label ?? id;
}

function todayStats(entries: DiaryEntry[]): { avgMood: number; topEmotion: string | null } | null {
  if (entries.length === 0) return null;
  const avg = entries.reduce((s, e) => s + e.mood, 0) / entries.length;
  const freq = new Map<string, number>();
  for (const e of entries) {
    for (const emo of e.emotions) freq.set(emo, (freq.get(emo) ?? 0) + 1);
  }
  let topEmotion: string | null = null;
  if (freq.size > 0) {
    const [topId] = Array.from(freq.entries()).sort((a, b) => b[1] - a[1])[0];
    topEmotion = emotionLabelHome(topId);
  }
  return { avgMood: Math.round(avg * 10) / 10, topEmotion };
}

const STREAK_MILESTONE_KEY = 'egoera-streak-celebrated';
const MILESTONES = [3, 7, 14, 30, 60, 100];
const REMINDER_KEY = 'egoera-reminder-time';
const REMINDER_SHOWN_KEY = 'egoera-reminder-shown-date'; // YYYY-MM-DD

function getNextMilestone(streak: number): number | null {
  return MILESTONES.find((m) => m <= streak) ?? null;
}

function checkReminder(
  now: Date,
  todayCount: number,
  toast: { info: (msg: string) => void }
): void {
  if (typeof window === 'undefined') return;
  try {
    const reminderTime = window.localStorage.getItem(REMINDER_KEY);
    if (!reminderTime) return;
    const [rh, rm] = reminderTime.split(':').map(Number);
    if (isNaN(rh) || isNaN(rm)) return;

    // Solo si ya pasó la hora del recordatorio hoy
    const nowH = now.getHours();
    const nowM = now.getMinutes();
    if (nowH < rh || (nowH === rh && nowM < rm)) return;

    // Solo si no ha escrito hoy
    if (todayCount > 0) return;

    // Solo una vez por día
    const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const lastShown = window.localStorage.getItem(REMINDER_SHOWN_KEY);
    if (lastShown === todayIso) return;

    window.localStorage.setItem(REMINDER_SHOWN_KEY, todayIso);
    toast.info('Todavía no has escrito hoy. Cuando quieras, aquí estamos.');
  } catch {
    // silencioso
  }
}

function celebrateMilestone(streak: number, toast: { success: (msg: string) => void }): void {
  if (typeof window === 'undefined' || streak <= 0) return;
  try {
    const raw = window.localStorage.getItem(STREAK_MILESTONE_KEY);
    const celebrated = raw ? (JSON.parse(raw) as number) : 0;
    const milestone = getNextMilestone(streak);
    if (!milestone || celebrated >= milestone) return;
    window.localStorage.setItem(STREAK_MILESTONE_KEY, JSON.stringify(milestone));
    const messages: Record<number, string> = {
      3: '3 días seguidos. El hábito empieza aquí.',
      7: 'Una semana entera. Gracias por no saltarte ningún día.',
      14: 'Dos semanas. Estás construyendo algo real.',
      30: '30 días. Un mes escuchándote. Eso no es pequeño.',
      60: 'Dos meses. La constancia es su propio regalo.',
      100: '100 días. Un logro genuino. Sigues.',
    };
    toast.success(messages[milestone] ?? `${milestone} días seguidos.`);
  } catch {
    // silencioso
  }
}

const WEEKDAYS = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
] as const;

const MONTHS = [
  'ENE',
  'FEB',
  'MAR',
  'ABR',
  'MAY',
  'JUN',
  'JUL',
  'AGO',
  'SEP',
  'OCT',
  'NOV',
  'DIC',
] as const;

const NAME_KEY = 'egoera-diario-name';
const ONBOARDED_KEY = 'egoera-diario-onboarded';

function greetingFor(hour: number): string {
  if (hour >= 6 && hour < 12) return 'Buenos días';
  if (hour >= 12 && hour < 19) return 'Buenas tardes';
  if (hour >= 19) return 'Buenas noches';
  return 'Buenas';
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function formatDateLine(d: Date): string {
  const day = pad2(d.getDate());
  const month = MONTHS[d.getMonth()];
  const year = d.getFullYear();
  const time = `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  return `${day} · ${month} · ${year} · ${time}`;
}

const WEEK_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'] as const;

/** Devuelve un array[7] donde true = hay al menos 1 entrada ese día de la semana actual (Lun=0). */
function weekActivityDots(now: Date): boolean[] {
  if (typeof window === 'undefined') return Array(7).fill(false) as boolean[];
  const monday = new Date(now);
  const day = monday.getDay() || 7;
  monday.setDate(now.getDate() - (day - 1));
  monday.setHours(0, 0, 0, 0);

  const seen = new Set<number>();
  try {
    const entries = JSON.parse(
      window.localStorage.getItem('egoera-diario-entries-v1') ?? '[]'
    ) as Array<{ createdAt: string }>;
    for (const e of entries) {
      const d = new Date(e.createdAt);
      d.setHours(0, 0, 0, 0);
      const diff = Math.round((d.getTime() - monday.getTime()) / 86_400_000);
      if (diff >= 0 && diff < 7) seen.add(diff);
    }
  } catch { /* silencioso */ }

  return Array.from({ length: 7 }, (_, i) => seen.has(i));
}

export default function HomePage() {
  const router = useRouter();
  const toast = useToast();
  const [now, setNow] = useState<Date | null>(null);
  const [name, setName] = useState<string>('Ander');
  const [streak, setStreak] = useState<number>(0);
  const [todayCount, setTodayCount] = useState<number>(0);
  const [weekDots, setWeekDots] = useState<boolean[]>(Array(7).fill(false) as boolean[]);
  const [todayStat, setTodayStat] = useState<{ avgMood: number; topEmotion: string | null } | null>(null);

  // Redirige a /bienvenida si el usuario aún no ha hecho onboarding.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onboarded = window.localStorage.getItem(ONBOARDED_KEY);
    if (onboarded !== 'true') {
      router.replace('/bienvenida');
    }
  }, [router]);

  useEffect(() => {
    const current = new Date();
    setNow(current);
    setWeekDots(weekActivityDots(current));

    const stored = window.localStorage.getItem(NAME_KEY);
    if (stored && stored.trim().length > 0) setName(stored.trim());

    const todayKey = new Date();
    todayKey.setHours(0, 0, 0, 0);
    const todayEntries = loadEntries().filter((e) => {
      const d = new Date(e.createdAt);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === todayKey.getTime();
    });
    const count = todayEntries.length;
    setTodayCount(count);
    setTodayStat(todayStats(todayEntries));

    const currentStreak = streakDays();
    setStreak(currentStreak);
    // Celebrar hitos de racha (solo la primera vez que se alcanzan)
    celebrateMilestone(currentStreak, toast);
    // Recordatorio si el usuario lo activó y aún no ha escrito hoy
    checkReminder(current, count, toast);

    // Mantener fresca la línea de fecha cada minuto.
    const tick = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(tick);
    // entriesThisWeek se importa por contrato del stack aunque aún no se renderice.
    // Lo invocamos para que el bundle lo conserve y futuras secciones lo usen.
    // (Sin efectos secundarios.)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pre-cálculo defensivo: aunque entriesThisWeek aún no se muestra, queda disponible
  // para evolucionar el teaser sin tocar el resto.
  void entriesThisWeek;

  const greeting = useMemo(() => {
    if (!now) return 'Buenas';
    return greetingFor(now.getHours());
  }, [now]);

  const streakGoal = useMemo(() => {
    if (streak <= 0) return null;
    const next = MILESTONES.find((m) => m > streak);
    if (!next) return null;
    return { next, daysLeft: next - streak };
  }, [streak]);

  const weekday = useMemo(() => {
    if (!now) return '';
    return WEEKDAYS[now.getDay()];
  }, [now]);

  const dateLine = useMemo(() => {
    if (!now) return '';
    return formatDateLine(now);
  }, [now]);

  return (
    <Screen background="cream">
      <header className="head">
        <p className="eyebrow">— Hoy {weekday ? `· ${weekday}` : ''} —</p>
        <h1 className="s-greet">
          {greeting}, <em>{name}</em>.
          <br />
          ¿Cómo te encuentras?
        </h1>
        <p className="s-date">{dateLine}</p>
      </header>

      <section className="cards" aria-label="Acciones de hoy">
        <button
          type="button"
          className="m-card m-card-cobalto card-btn"
          onClick={() => router.push('/diario')}
          aria-label="Anota cómo estás hoy"
        >
          <div className="card-row">
            <span className="pill-num">01 · Diario</span>
            {streak > 0 ? (
              <span className="pill-yellow">+{streak} días</span>
            ) : null}
          </div>
          <h2 className="card-title">
            Anota cómo
            <br />
            estás hoy.
          </h2>
          <p className="card-sub">3 minutos. Sin presión, sin métricas raras.</p>
        </button>

        <button
          type="button"
          className="m-card m-card-cream card-btn"
          onClick={() => router.push('/conversa')}
          aria-label="Habla con Egoera"
        >
          <div className="card-row">
            <span className="pill-num">02 · Conversa</span>
          </div>
          <h2 className="card-title card-title-ink">Habla con Egoera.</h2>
          <p className="card-sub">Una conversación contigo mismo, mediada.</p>
        </button>

        <button
          type="button"
          className="m-card m-card-accent card-btn"
          onClick={() => router.push('/patrones')}
          aria-label="Mira qué se repite esta semana"
        >
          <div className="card-row">
            <span className="pill-num">03 · Patrones</span>
          </div>
          <h2 className="card-title">
            ¿Qué se
            <br />
            repite esta
            <br />
            semana?
          </h2>
          <p className="card-sub">Tus emociones, sin interpretarlas por ti.</p>
        </button>
      </section>

      {/* ── week activity dots ── */}
      {now ? (
        <button
          type="button"
          className="week-dots"
          onClick={() => router.push('/diario/historial')}
          aria-label="Ver historial de entradas de esta semana"
        >
          {WEEK_LABELS.map((label, i) => {
            const dayIdx = (now.getDay() || 7) - 1; // 0=lun
            const isToday = i === dayIdx;
            const filled = weekDots[i];
            return (
              <div key={label} className={`week-day ${isToday ? 'today' : ''}`}>
                <span
                  className={`dot ${filled ? 'dot-on' : ''} ${isToday ? 'dot-today' : ''}`}
                  aria-label={filled ? `${label}: entrada` : `${label}: sin entrada`}
                />
                <span className="day-lbl">{label}</span>
              </div>
            );
          })}
        </button>
      ) : null}

      {streakGoal ? (
        <div className="streak-goal" aria-label={`${streakGoal.daysLeft} días hasta la racha de ${streakGoal.next}`}>
          <div className="streak-goal-row">
            <span className="streak-goal-text">
              {streakGoal.daysLeft === 1 ? 'Mañana' : `${streakGoal.daysLeft} días`} para racha de {streakGoal.next}
            </span>
            <span className="streak-goal-num">{streak}/{streakGoal.next}</span>
          </div>
          <div className="streak-prog" role="progressbar" aria-valuenow={streak} aria-valuemin={0} aria-valuemax={streakGoal.next}>
            <div
              className="streak-prog-fill"
              style={{ width: `${Math.round((streak / streakGoal.next) * 100)}%` }}
            />
          </div>
        </div>
      ) : null}

      {todayCount > 0 && todayStat ? (
        <button
          type="button"
          className="today-recap"
          onClick={() => router.push('/diario/historial')}
          aria-label="Ver entradas de hoy"
        >
          <div className="recap-mood">
            <span className="recap-num">{todayStat.avgMood.toFixed(1)}</span>
            <span className="recap-num-sub">hoy</span>
          </div>
          <div className="recap-text">
            <span className="recap-line">
              {todayCount === 1 ? '1 entrada · hoy' : `${todayCount} entradas · hoy`}
            </span>
            {todayStat.topEmotion && (
              <span className="recap-emo">{todayStat.topEmotion}</span>
            )}
          </div>
          <span className="recap-arrow">→</span>
        </button>
      ) : null}

      <nav className="discover" aria-label="Descubrir más">
        <button
          type="button"
          className="discover-link"
          onClick={() => router.push('/bienvenida')}
        >
          ¿Primera vez? · Empieza guiado →
        </button>
        <button
          type="button"
          className="discover-link discover-link-pro"
          onClick={() => router.push('/pro')}
        >
          Egoera Pro · 7 días gratis →
        </button>
      </nav>

      <InstallPrompt />

      <TabBar />

      <style jsx>{`
        .head {
          margin-bottom: 28px;
        }
        .head .eyebrow {
          margin-bottom: 14px;
        }
        .cards {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .card-btn {
          display: block;
          width: 100%;
          text-align: left;
          border: none;
          font: inherit;
          cursor: pointer;
          appearance: none;
          -webkit-tap-highlight-color: transparent;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .card-btn:active {
          transform: scale(0.985);
        }
        .card-btn:focus-visible {
          outline: 2px solid var(--ink);
          outline-offset: 3px;
        }
        .card-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }
        .card-title-ink {
          color: var(--ink);
        }
        /* ── streak goal ── */
        .streak-goal {
          margin-top: 12px;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .streak-goal-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }
        .streak-goal-text {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--ink);
          opacity: 0.5;
        }
        .streak-goal-num {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.1em;
          color: var(--cobalto);
          opacity: 0.65;
        }
        .streak-prog {
          height: 3px;
          width: 100%;
          background: rgba(13, 15, 61, 0.1);
          border-radius: 999px;
          overflow: hidden;
        }
        .streak-prog-fill {
          height: 100%;
          background: var(--cobalto);
          border-radius: 999px;
          transition: width 0.4s ease;
        }

        /* ── today recap card ── */
        .today-recap {
          margin-top: 18px;
          display: flex;
          align-items: center;
          gap: 14px;
          width: 100%;
          padding: 14px 16px;
          background: rgba(29, 43, 219, 0.06);
          border: 1px solid rgba(29, 43, 219, 0.14);
          border-radius: var(--r-md);
          cursor: pointer;
          font: inherit;
          text-align: left;
          -webkit-tap-highlight-color: transparent;
          transition: background 0.15s, border-color 0.15s;
        }
        .today-recap:hover {
          background: rgba(29, 43, 219, 0.1);
          border-color: rgba(29, 43, 219, 0.24);
        }
        .today-recap:focus-visible {
          outline: 2px solid var(--cobalto);
          outline-offset: 2px;
        }
        .recap-mood {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex-shrink: 0;
          min-width: 44px;
        }
        .recap-num {
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 800;
          font-size: 36px;
          line-height: 1;
          letter-spacing: -0.03em;
          color: var(--cobalto);
          font-variant-numeric: tabular-nums;
        }
        .recap-num-sub {
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          opacity: 0.45;
          color: var(--cobalto);
        }
        .recap-text {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 3px;
          min-width: 0;
        }
        .recap-line {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--ink);
          opacity: 0.65;
        }
        .recap-emo {
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 600;
          font-size: 15px;
          color: var(--cobalto);
        }
        .recap-arrow {
          font-family: var(--font-mono);
          font-size: 14px;
          color: var(--cobalto);
          opacity: 0.5;
          flex-shrink: 0;
        }
        .discover {
          margin-top: 32px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .discover-link {
          background: none;
          border: 1px dashed rgba(13, 15, 61, 0.18);
          padding: 12px 16px;
          border-radius: 12px;
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--ink);
          cursor: pointer;
          opacity: 0.78;
          transition: opacity 0.15s, border-color 0.15s;
          text-align: left;
        }
        .discover-link:hover {
          opacity: 1;
          border-color: var(--cobalto);
        }
        .discover-link-pro {
          color: var(--accent-deep);
          border-color: rgba(184, 74, 38, 0.3);
        }
        .discover-link-pro:hover {
          border-color: var(--accent);
        }

        /* ── week dots ── */
        .week-dots {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 20px 0 4px;
          padding: 14px 16px;
          background: rgba(255, 255, 255, 0.45);
          border: 1px solid rgba(13, 15, 61, 0.08);
          border-radius: var(--r-md);
          width: 100%;
          cursor: pointer;
          font: inherit;
          -webkit-tap-highlight-color: transparent;
          transition: background 0.15s, border-color 0.15s;
        }
        .week-dots:hover {
          background: rgba(255, 255, 255, 0.7);
          border-color: rgba(13, 15, 61, 0.16);
        }
        .week-dots:focus-visible {
          outline: 2px solid var(--cobalto);
          outline-offset: 2px;
        }
        .week-day {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
        }
        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: rgba(13, 15, 61, 0.1);
          transition: background 0.15s;
        }
        .dot-on { background: var(--cobalto); }
        .dot-today {
          box-shadow: 0 0 0 2px rgba(29, 43, 219, 0.25);
        }
        .dot-on.dot-today {
          background: var(--cobalto);
          box-shadow: 0 0 0 2px rgba(29, 43, 219, 0.4);
        }
        .day-lbl {
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          opacity: 0.4;
        }
        .today .day-lbl {
          opacity: 0.75;
          color: var(--cobalto);
        }
      `}</style>
    </Screen>
  );
}
