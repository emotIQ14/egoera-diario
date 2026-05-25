'use client';

import { useEffect, useMemo, useState } from 'react';
import Screen from '@/components/Screen';
import TabBar from '@/components/TabBar';
import { useToast } from '@/components/toast/ToastProvider';
import { ActivityYogaScene } from '@/components/illustrations/GamScenes';
import {
  ACTIVITIES,
  ACTIVITY_KINDS,
  type Activity,
  type ActivityKind,
  loadCompletions,
  markActivityDone,
  completionsThisWeek,
  totalMinutesThisWeek,
  isCompletedToday,
  timesCompleted,
} from '@/lib/activities';

type Filter = 'all' | ActivityKind;

export default function ActividadesPage() {
  const toast = useToast();
  const [filter, setFilter] = useState<Filter>('all');
  const [openId, setOpenId] = useState<string | null>(null);
  const [tick, setTick] = useState(0); // forzar re-render tras marcar completada
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => { setHydrated(true); }, []);

  const stats = useMemo(() => {
    if (!hydrated) return { weekCount: 0, weekMinutes: 0, totalDone: 0 };
    return {
      weekCount: completionsThisWeek().length,
      weekMinutes: totalMinutesThisWeek(),
      totalDone: loadCompletions().length,
    };
  }, [hydrated, tick]);

  const visible = useMemo<Activity[]>(() => {
    if (filter === 'all') return ACTIVITIES;
    return ACTIVITIES.filter((a) => a.kind === filter);
  }, [filter]);

  function onComplete(a: Activity) {
    if (typeof window === 'undefined') return;
    markActivityDone(a.id);
    setTick((n) => n + 1);
    toast.info(`Hecho · ${a.title}`);
  }

  return (
    <>
      <Screen background="cream">
        <header className="head">
          <div className="head-hero">
            <ActivityYogaScene size={140} className="head-illu" />
          </div>
          <span className="kicker">— actividades —</span>
          <h1 className="title">
            trabájate <em>despacio</em>.
          </h1>
          <p className="lede">
            Ejercicios pequeños que el sistema nervioso entiende. Tres minutos importan;
            quince también. No es deber, es vuelta a ti.
          </p>
        </header>

        <section className="stats" aria-label="Resumen semanal">
          <div className="stat">
            <span className="stat-n">{stats.weekCount}</span>
            <span className="stat-lbl">esta semana</span>
          </div>
          <div className="stat">
            <span className="stat-n">{stats.weekMinutes}</span>
            <span className="stat-lbl">min trabajados</span>
          </div>
          <div className="stat">
            <span className="stat-n">{stats.totalDone}</span>
            <span className="stat-lbl">total</span>
          </div>
        </section>

        <nav className="filter" aria-label="Filtro por tipo">
          <button
            type="button"
            className={`chip ${filter === 'all' ? 'on' : ''}`}
            onClick={() => setFilter('all')}
          >
            Todo
          </button>
          {ACTIVITY_KINDS.map((k) => (
            <button
              key={k.id}
              type="button"
              className={`chip ${filter === k.id ? 'on' : ''}`}
              onClick={() => setFilter(k.id)}
              data-kind={k.id}
            >
              {k.label}
            </button>
          ))}
        </nav>

        <ul className="list">
          {visible.map((a, idx) => {
            const done = hydrated ? isCompletedToday(a.id) : false;
            const times = hydrated ? timesCompleted(a.id) : 0;
            const open = openId === a.id;
            return (
              <li key={a.id} className={`item ${done ? 'is-done' : ''}`} data-kind={a.kind}>
                <button
                  type="button"
                  className="item-head"
                  aria-expanded={open}
                  aria-controls={`act-body-${a.id}`}
                  onClick={() => setOpenId(open ? null : a.id)}
                >
                  <span className="item-n">{String(idx + 1).padStart(2, '0')}</span>
                  <div className="item-meta">
                    <span className="item-kind">{kindLabel(a.kind)}</span>
                    <span className="item-title">{a.title}</span>
                    <span className="item-intent">{a.intent}</span>
                  </div>
                  <div className="item-side">
                    <span className="item-time">{a.minutes} min</span>
                    {times > 0 && (
                      <span className="item-badge" aria-label={`Hecho ${times} veces`}>
                        ×{times}
                      </span>
                    )}
                  </div>
                </button>
                <div id={`act-body-${a.id}`} className="item-body" hidden={!open}>
                  <p>{a.body}</p>
                  {a.region && <p className="item-region">{a.region}</p>}
                  <button
                    type="button"
                    className={`done-btn ${done ? 'is-done' : ''}`}
                    onClick={() => onComplete(a)}
                    aria-label={done ? 'Marcar otra vez' : 'Marcar como hecho'}
                  >
                    {done ? '✓  hecho hoy · marcar otra vez' : 'hecho · sumar al cuaderno →'}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </Screen>
      <TabBar />

      <style jsx>{`
        .head { margin-bottom: 24px; }
        .head-hero {
          display: flex;
          justify-content: center;
          margin-bottom: 10px;
        }
        .head-illu {
          border-radius: 50%;
          background: var(--crema-soft);
          padding: 6px;
          box-shadow: 0 8px 22px -16px rgba(15, 27, 170, 0.4);
        }
        .kicker {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--cobalto);
          opacity: 0.85;
        }
        .title {
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 600;
          font-size: clamp(36px, 9vw, 52px);
          line-height: 1.02;
          letter-spacing: -0.015em;
          margin: 8px 0 14px;
          color: var(--ink);
        }
        .title em { font-style: italic; color: var(--cobalto); }
        .lede {
          font-family: var(--font-body);
          font-size: 15px;
          line-height: 1.55;
          color: var(--ink);
          opacity: 0.78;
          margin: 0 0 26px;
        }
        .stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-bottom: 22px;
        }
        .stat {
          background: var(--crema-soft);
          border: 1px solid rgba(13, 15, 61, 0.08);
          border-radius: var(--r-md);
          padding: 14px 12px 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }
        .stat-n {
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 600;
          font-size: 28px;
          line-height: 1;
          color: var(--cobalto);
        }
        .stat-lbl {
          font-family: var(--font-mono);
          font-size: 9.5px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--ink);
          opacity: 0.6;
          text-align: center;
        }
        .filter {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 18px;
        }
        .chip {
          background: transparent;
          border: 1px solid rgba(13, 15, 61, 0.18);
          color: var(--ink);
          padding: 8px 14px;
          border-radius: 999px;
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s, color 0.15s;
        }
        .chip:hover { border-color: var(--cobalto); color: var(--cobalto); }
        .chip.on {
          background: var(--cobalto);
          color: var(--crema);
          border-color: var(--cobalto);
        }
        .chip[data-kind='cuerpo'].on { background: var(--accent); border-color: var(--accent); }
        .chip[data-kind='escritura'].on { background: var(--ink); border-color: var(--ink); color: var(--crema); }
        .chip[data-kind='ritual'].on { background: var(--ink); border-color: var(--ink); color: var(--crema); }
        .list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .item {
          background: #fff;
          border: 1px solid rgba(13, 15, 61, 0.10);
          border-radius: var(--r-md);
          overflow: hidden;
          transition: transform 0.15s ease, border-color 0.15s;
        }
        .item:hover { border-color: rgba(13, 15, 61, 0.22); }
        .item.is-done { background: var(--crema-soft); }
        .item-head {
          width: 100%;
          background: transparent;
          border: none;
          padding: 16px 16px;
          display: grid;
          grid-template-columns: 36px 1fr auto;
          gap: 12px;
          align-items: start;
          text-align: left;
          cursor: pointer;
        }
        .item-n {
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 600;
          font-size: 22px;
          line-height: 1;
          color: var(--cobalto);
        }
        .item-meta { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
        .item-kind {
          font-family: var(--font-mono);
          font-size: 9.5px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--ink);
          opacity: 0.55;
        }
        .item-title {
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 500;
          font-size: 19px;
          line-height: 1.2;
          color: var(--ink);
        }
        .item-intent {
          font-family: var(--font-body);
          font-size: 13.5px;
          color: var(--ink);
          opacity: 0.65;
          margin-top: 2px;
        }
        .item-side {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 6px;
        }
        .item-time {
          font-family: var(--font-mono);
          font-size: 10.5px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--cobalto);
          background: rgba(15, 27, 170, 0.08);
          padding: 4px 8px;
          border-radius: 999px;
        }
        .item-badge {
          font-family: var(--font-mono);
          font-size: 10.5px;
          letter-spacing: 0.12em;
          color: var(--accent);
          background: rgba(217, 119, 87, 0.12);
          padding: 3px 8px;
          border-radius: 999px;
        }
        .item-body {
          padding: 0 16px 18px 64px;
          color: var(--ink);
          opacity: 0.92;
        }
        .item-body p {
          font-family: var(--font-body);
          font-size: 14.5px;
          line-height: 1.55;
          margin: 0 0 12px;
        }
        .item-region {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--ink);
          opacity: 0.5;
          margin: 0 0 14px !important;
        }
        .done-btn {
          background: var(--cobalto);
          color: var(--crema);
          border: none;
          border-radius: 999px;
          padding: 11px 18px;
          font-family: var(--font-body);
          font-size: 13.5px;
          font-weight: 500;
          letter-spacing: 0.01em;
          cursor: pointer;
          transition: background 0.15s ease, transform 0.15s ease;
        }
        .done-btn:hover { background: var(--cobalto-deep, #0f1baa); transform: translateY(-1px); }
        .done-btn.is-done {
          background: rgba(45, 143, 95, 0.12);
          color: rgb(30, 110, 70);
        }
        .done-btn.is-done:hover { background: rgba(45, 143, 95, 0.2); }
        @media (max-width: 380px) {
          .item-body { padding-left: 16px; }
          .item-head { grid-template-columns: 28px 1fr auto; }
          .item-n { font-size: 18px; }
        }
      `}</style>
    </>
  );
}

function kindLabel(kind: ActivityKind): string {
  return ACTIVITY_KINDS.find((k) => k.id === kind)?.label ?? kind;
}
