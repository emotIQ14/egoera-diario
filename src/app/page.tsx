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

function buildGreetingQuestion(
  now: Date,
  streak: number,
  todayCount: number,
  totalEntries: number
): string {
  const h = now.getHours();
  const dow = now.getDay(); // 0=dom, 1=lun…6=sab

  // Ya escribió hoy
  if (todayCount > 0) return '¿Algo más\nque soltar hoy?';

  // Tarde del viernes → cierre de semana
  if (dow === 5 && h >= 17) return '¿Cómo cierras\nla semana?';

  // Domingo → reflexión semanal
  if (dow === 0) return '¿Cómo fue\ntu semana?';

  // Noche → cierre del día
  if (h >= 21 || h < 6) return '¿Cómo terminas\nel día?';

  // Lunes por la mañana → inicio de semana
  if (dow === 1 && h < 12) return '¿Cómo empiezas\nla semana?';

  // Mañana general
  if (h < 12) return '¿Cómo empiezas\nel día?';

  // Usuario que regresa tras pausa (racha rota, hay historial)
  if (streak === 0 && totalEntries >= 3) return 'Sin prisa.\n¿Cómo llegas hoy?';

  // Racha alta → reconocimiento
  if (streak >= 14) return '¿Qué traes\nhoy contigo?';

  // Default
  return '¿Cómo te\nencuentras?';
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
  const [flashback, setFlashback] = useState<{ daysAgo: number; avgMood: number; topEmotion: string | null } | null>(null);
  const [diaryExcerpt, setDiaryExcerpt] = useState<{ date: string; text: string; mood: number } | null>(null);
  const [weekSummary, setWeekSummary] = useState<{ count: number; avgMood: number; topEmotion: string | null } | null>(null);
  const [totalEntries, setTotalEntries] = useState<number>(0);
  const [hasDraft, setHasDraft] = useState<boolean>(false);
  const [lowMoodAlert, setLowMoodAlert] = useState<boolean>(false);
  const [lowMoodDismissed, setLowMoodDismissed] = useState<boolean>(false);

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

    // Flashback: look for entries from 7, 14, or 30 days ago (in that order)
    const allEntries = loadEntries();
    setTotalEntries(allEntries.length);
    for (const daysAgo of [7, 14, 30]) {
      const target = new Date();
      target.setDate(target.getDate() - daysAgo);
      target.setHours(0, 0, 0, 0);
      const match = allEntries.filter((e) => {
        const d = new Date(e.createdAt);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === target.getTime();
      });
      if (match.length > 0) {
        const avg = Math.round((match.reduce((s, e) => s + e.mood, 0) / match.length) * 10) / 10;
        const freq = new Map<string, number>();
        for (const e of match) for (const emo of e.emotions) freq.set(emo, (freq.get(emo) ?? 0) + 1);
        const topEmo = freq.size > 0
          ? (emotionLabelHome(Array.from(freq.entries()).sort((a, b) => b[1] - a[1])[0][0]))
          : null;
        setFlashback({ daysAgo, avgMood: avg, topEmotion: topEmo });
        break;
      }
    }

    // Daily excerpt: una entrada pasada con texto, semilla = día del año (mismo todo el día)
    const pastWithText = allEntries.filter((e) => {
      const d = new Date(e.createdAt);
      d.setHours(0, 0, 0, 0);
      return d.getTime() < todayKey.getTime() && e.text.trim().length > 30;
    });
    if (pastWithText.length > 0) {
      const dayOfYear = Math.floor(Date.now() / 86_400_000);
      const pick = pastWithText[dayOfYear % pastWithText.length];
      setDiaryExcerpt({ date: pick.createdAt, text: pick.text.trim(), mood: pick.mood });
    }

    // Resumen semana actual (Lun → hoy), mínimo 3 entradas para mostrar
    {
      const monday = new Date(current);
      const dayIdx = monday.getDay() || 7;
      monday.setDate(current.getDate() - (dayIdx - 1));
      monday.setHours(0, 0, 0, 0);
      const weekEntries = allEntries.filter((e) => {
        const d = new Date(e.createdAt);
        d.setHours(0, 0, 0, 0);
        return d.getTime() >= monday.getTime() && d.getTime() <= todayKey.getTime();
      });
      if (weekEntries.length >= 3) {
        const avg = Math.round(
          (weekEntries.reduce((s, e) => s + e.mood, 0) / weekEntries.length) * 10
        ) / 10;
        const freq = new Map<string, number>();
        for (const e of weekEntries)
          for (const emo of e.emotions)
            freq.set(emo, (freq.get(emo) ?? 0) + 1);
        const topEmo =
          freq.size > 0
            ? emotionLabelHome(
                Array.from(freq.entries()).sort((a, b) => b[1] - a[1])[0][0]
              )
            : null;
        setWeekSummary({ count: weekEntries.length, avgMood: avg, topEmotion: topEmo });
      }
    }

    // Low mood alert: ≥2 días únicos con mood ≤4 en los últimos 7 días
    {
      const lowEntries = allEntries.filter((e) => {
        const d = new Date(e.createdAt);
        d.setHours(0, 0, 0, 0);
        const diff = Math.round((todayKey.getTime() - d.getTime()) / 86_400_000);
        return diff >= 0 && diff < 7 && e.mood <= 4;
      });
      const lowDays = new Set(lowEntries.map((e) => {
        const d = new Date(e.createdAt);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      }));
      if (lowDays.size >= 2) setLowMoodAlert(true);
    }

    // Detectar borrador guardado
    try {
      const rawDraft = window.localStorage.getItem('egoera-diario-draft');
      if (rawDraft) {
        const parsed = JSON.parse(rawDraft) as { text?: string; emotions?: string[]; moodTouched?: boolean };
        const meaningful =
          (parsed.text && parsed.text.trim().length > 0) ||
          (parsed.emotions && parsed.emotions.length > 0) ||
          parsed.moodTouched === true;
        setHasDraft(!!meaningful);
      }
    } catch { /* silencioso */ }

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

  const greetingQuestion = useMemo(() => {
    if (!now) return '¿Cómo te\nencuentras?';
    return buildGreetingQuestion(now, streak, todayCount, totalEntries);
  }, [now, streak, todayCount, totalEntries]);

  const streakGoal = useMemo(() => {
    if (streak <= 0) return null;
    const next = MILESTONES.find((m) => m > streak);
    if (!next) return null;
    return { next, daysLeft: next - streak };
  }, [streak]);

  const weekActive = useMemo(() => weekDots.filter(Boolean).length, [weekDots]);

  const streakAtRisk = useMemo(() => {
    if (!now) return false;
    return streak >= 3 && todayCount === 0 && now.getHours() >= 17;
  }, [now, streak, todayCount]);

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
          {greetingQuestion.split('\n').map((line, i, arr) => (
            <span key={i}>
              {line}
              {i < arr.length - 1 ? <br /> : null}
            </span>
          ))}
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
            {hasDraft ? (
              <span className="pill-draft">Borrador guardado ·</span>
            ) : streak > 0 ? (
              <span className="pill-yellow">
                +{streak}{weekActive > 0 ? ` · ${weekActive} sem` : ''}
              </span>
            ) : totalEntries >= 3 ? (
              <span className="pill-return">Vuelves cuando quieras</span>
            ) : null}
          </div>
          <h2 className="card-title">
            {hasDraft ? (
              <>Continúa<br />donde lo dejaste.</>
            ) : (
              <>Anota cómo<br />estás hoy.</>
            )}
          </h2>
          <p className="card-sub">
            {hasDraft ? 'Tu borrador te está esperando.' : '3 minutos. Sin presión, sin métricas raras.'}
          </p>
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
            {weekSummary ? (
              <span className="pill-week-stat">
                {weekSummary.avgMood.toFixed(1)}
                {weekSummary.topEmotion ? ` · ${weekSummary.topEmotion}` : ''}
              </span>
            ) : null}
          </div>
          <h2 className="card-title">
            ¿Qué se
            <br />
            repite esta
            <br />
            semana?
          </h2>
          <p className="card-sub">
            {weekSummary
              ? `${weekSummary.count} entradas · esta semana`
              : 'Tus emociones, sin interpretarlas por ti.'}
          </p>
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

      {streakAtRisk ? (
        <button
          type="button"
          className="streak-risk"
          onClick={() => router.push('/diario')}
          aria-label="Sin entrada hoy, racha en riesgo — anotar ahora"
        >
          <span className="risk-dot" aria-hidden="true" />
          <span className="risk-text">Sin entrada hoy · racha en riesgo</span>
          <span className="risk-arrow">→</span>
        </button>
      ) : null}

      {lowMoodAlert && !lowMoodDismissed ? (
        <div className="low-mood-card" role="complementary" aria-label="Apoyo en momentos difíciles">
          <button
            type="button"
            className="low-mood-dismiss"
            aria-label="Cerrar"
            onClick={() => setLowMoodDismissed(true)}
          >
            ×
          </button>
          <p className="low-mood-title">Ha habido días difíciles esta semana.</p>
          <p className="low-mood-sub">Está bien que así sea. La conversa está aquí cuando quieras ponerlo en palabras.</p>
          <button
            type="button"
            className="low-mood-cta"
            onClick={() => router.push('/conversa')}
          >
            Hablar →
          </button>
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

      {flashback ? (
        <button
          type="button"
          className="flashback-card"
          onClick={() => router.push('/diario/historial')}
          aria-label={`Ver entradas de hace ${flashback.daysAgo} días`}
        >
          <span className="flashback-when">Hace {flashback.daysAgo} días</span>
          <span className="flashback-dot" aria-hidden="true">·</span>
          <span className="flashback-mood">{flashback.avgMood.toFixed(1)}</span>
          {flashback.topEmotion && (
            <>
              <span className="flashback-dot" aria-hidden="true">·</span>
              <span className="flashback-emo">{flashback.topEmotion}</span>
            </>
          )}
          <span className="flashback-arrow">→</span>
        </button>
      ) : null}

      {diaryExcerpt ? (
        <button
          type="button"
          className="excerpt-card"
          onClick={() => router.push('/diario/historial')}
          aria-label="Ver esta entrada en el historial"
        >
          <span className="excerpt-eyebrow">— De tu diario —</span>
          <p className="excerpt-text">
            &ldquo;{diaryExcerpt.text.length > 110
              ? `${diaryExcerpt.text.slice(0, 110)}…`
              : diaryExcerpt.text}&rdquo;
          </p>
          <div className="excerpt-meta">
            <span className="excerpt-date">
              {new Date(diaryExcerpt.date).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
            <span className="excerpt-mood">{diaryExcerpt.mood}/10</span>
          </div>
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

        /* ── streak at-risk warning ── */
        .streak-risk {
          margin-top: 10px;
          display: flex;
          align-items: center;
          gap: 9px;
          width: 100%;
          background: rgba(244, 200, 66, 0.12);
          border: 1px solid rgba(200, 160, 0, 0.28);
          border-radius: var(--r-md);
          padding: 10px 14px;
          cursor: pointer;
          font: inherit;
          text-align: left;
          -webkit-tap-highlight-color: transparent;
          transition: background 0.15s;
        }
        .streak-risk:hover { background: rgba(244, 200, 66, 0.2); }
        .risk-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #c8960a;
          flex-shrink: 0;
          animation: pulse-risk 2s ease-in-out infinite;
        }
        @keyframes pulse-risk {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.45; transform: scale(0.8); }
        }
        .risk-text {
          flex: 1;
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #7a6000;
        }
        .risk-arrow {
          font-size: 11px;
          color: #7a6000;
          opacity: 0.65;
          font-family: var(--font-mono);
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
        /* ── flashback card ── */
        .flashback-card {
          margin-top: 12px;
          display: flex;
          align-items: center;
          gap: 7px;
          width: 100%;
          padding: 10px 14px;
          background: rgba(13, 15, 61, 0.04);
          border: 1px solid rgba(13, 15, 61, 0.1);
          border-radius: var(--r-md);
          cursor: pointer;
          font: inherit;
          text-align: left;
          -webkit-tap-highlight-color: transparent;
          transition: background 0.15s;
        }
        .flashback-card:hover { background: rgba(13, 15, 61, 0.07); }
        .flashback-when {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--ink);
          opacity: 0.45;
          flex-shrink: 0;
        }
        .flashback-dot {
          font-family: var(--font-mono);
          font-size: 10px;
          color: var(--ink);
          opacity: 0.3;
        }
        .flashback-mood {
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 700;
          font-size: 16px;
          color: var(--cobalto);
          opacity: 0.8;
        }
        .flashback-emo {
          font-family: var(--font-display);
          font-style: italic;
          font-size: 13px;
          color: var(--ink);
          opacity: 0.55;
          flex: 1;
        }
        .flashback-arrow {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--ink);
          opacity: 0.3;
          margin-left: auto;
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

        /* ── diary excerpt card ── */
        .excerpt-card {
          margin-top: 14px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
          width: 100%;
          padding: 16px 18px;
          background: rgba(255, 255, 255, 0.5);
          border: 1px solid rgba(13, 15, 61, 0.1);
          border-radius: var(--r-md);
          cursor: pointer;
          font: inherit;
          text-align: left;
          -webkit-tap-highlight-color: transparent;
          transition: background 0.15s, border-color 0.15s;
        }
        .excerpt-card:hover {
          background: rgba(255, 255, 255, 0.75);
          border-color: rgba(13, 15, 61, 0.18);
        }
        .excerpt-card:focus-visible {
          outline: 2px solid var(--cobalto);
          outline-offset: 2px;
        }
        .excerpt-eyebrow {
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--ink);
          opacity: 0.4;
        }
        .excerpt-text {
          font-family: var(--font-display);
          font-style: italic;
          font-size: 15px;
          line-height: 1.55;
          color: var(--ink);
          margin: 0;
          opacity: 0.82;
        }
        .excerpt-meta {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          justify-content: space-between;
        }
        .excerpt-date {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: capitalize;
          color: var(--ink);
          opacity: 0.4;
        }
        .excerpt-mood {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.1em;
          color: var(--cobalto);
          opacity: 0.6;
        }

        /* === Low mood support card === */
        .low-mood-card {
          position: relative;
          background: var(--ink);
          color: var(--crema);
          border-radius: var(--r-md);
          padding: 18px 20px 16px;
          margin: 0 0 12px;
          animation: fadeSlideUp 0.3s ease both;
        }
        .low-mood-dismiss {
          position: absolute;
          top: 10px;
          right: 12px;
          font-size: 18px;
          line-height: 1;
          color: var(--crema);
          opacity: 0.4;
          padding: 2px 6px;
          border-radius: 6px;
          transition: opacity 0.15s ease;
        }
        .low-mood-dismiss:hover { opacity: 0.75; }
        .low-mood-title {
          font-family: var(--font-display);
          font-style: italic;
          font-size: 17px;
          font-weight: 700;
          line-height: 1.2;
          color: var(--crema);
          margin: 0 0 6px;
          padding-right: 28px;
        }
        .low-mood-sub {
          font-family: var(--font-body);
          font-size: 13px;
          line-height: 1.5;
          color: var(--crema);
          opacity: 0.72;
          margin: 0 0 14px;
        }
        .low-mood-cta {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: rgba(241, 234, 216, 0.12);
          color: var(--crema);
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          font-weight: 600;
          padding: 8px 14px;
          border-radius: var(--r-pill);
          border: 1px solid rgba(241, 234, 216, 0.2);
          transition: background 0.15s ease;
        }
        .low-mood-cta:hover { background: rgba(241, 234, 216, 0.2); }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Screen>
  );
}
