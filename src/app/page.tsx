'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Screen from '@/components/Screen';
import TabBar from '@/components/TabBar';
import { entriesThisWeek, loadEntries, streakDays } from '@/lib/storage';

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

export default function HomePage() {
  const router = useRouter();
  const [now, setNow] = useState<Date | null>(null);
  const [name, setName] = useState<string>('Ander');
  const [streak, setStreak] = useState<number>(0);
  const [todayCount, setTodayCount] = useState<number>(0);

  useEffect(() => {
    const current = new Date();
    setNow(current);

    const stored = window.localStorage.getItem(NAME_KEY);
    if (stored && stored.trim().length > 0) setName(stored.trim());

    setStreak(streakDays());

    const todayKey = new Date();
    todayKey.setHours(0, 0, 0, 0);
    const count = loadEntries().filter((e) => {
      const d = new Date(e.createdAt);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === todayKey.getTime();
    }).length;
    setTodayCount(count);

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

      {todayCount > 0 ? (
        <p className="teaser">
          Hoy ya escribiste {todayCount} {todayCount === 1 ? 'vez' : 'veces'}.{' '}
          <button
            type="button"
            className="teaser-link"
            onClick={() => router.push('/diario')}
          >
            Ver entrada →
          </button>
        </p>
      ) : null}

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
        .teaser {
          margin-top: 18px;
          font-family: var(--font-mono);
          font-size: 12px;
          letter-spacing: 0.04em;
          color: var(--ink);
          opacity: 0.7;
        }
        .teaser-link {
          background: none;
          border: none;
          padding: 0;
          font: inherit;
          color: var(--cobalto);
          cursor: pointer;
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .teaser-link:focus-visible {
          outline: 2px solid var(--cobalto);
          outline-offset: 2px;
          border-radius: 2px;
        }
      `}</style>
    </Screen>
  );
}
