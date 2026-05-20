'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Screen from '@/components/Screen';
import TabBar from '@/components/TabBar';
import { deleteEntry, loadEntries } from '@/lib/storage';
import type { DiaryEntry } from '@/lib/storage';
import { EMOTIONS } from '@/lib/types';
import { useToast } from '@/components/toast/ToastProvider';

// ─── helpers ────────────────────────────────────────────────────────────────

const MONTHS: readonly string[] = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];
const MONTHS_SHORT: readonly string[] = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
];
const WEEKDAYS: readonly string[] = [
  'domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado',
];

function pad2(n: number): string { return n < 10 ? `0${n}` : `${n}`; }

function formatFull(iso: string): string {
  const d = new Date(iso);
  return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} de ${MONTHS[d.getMonth()]} · ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function formatMonthKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
}

function formatMonthLabel(key: string): string {
  const [y, m] = key.split('-');
  return `${MONTHS[parseInt(m, 10) - 1]} ${y}`;
}

function formatShort(iso: string): string {
  const d = new Date(iso);
  return `${pad2(d.getDate())} ${MONTHS_SHORT[d.getMonth()]} · ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function emotionLabel(id: string): string {
  return EMOTIONS.find((e) => e.id === id)?.label ?? id;
}

function moodColor(mood: number): string {
  if (mood <= 3) return 'var(--accent)';
  if (mood <= 6) return 'rgba(13,15,61,0.55)';
  return 'var(--cobalto)';
}

// ─── group by month ──────────────────────────────────────────────────────────

type Group = { key: string; label: string; entries: DiaryEntry[] };

function groupByMonth(entries: DiaryEntry[]): Group[] {
  const map = new Map<string, DiaryEntry[]>();
  for (const e of entries) {
    const k = formatMonthKey(e.createdAt);
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(e);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, ents]) => ({
      key,
      label: formatMonthLabel(key),
      entries: ents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    }));
}

// ─── component ───────────────────────────────────────────────────────────────

export default function HistorialPage() {
  const router = useRouter();
  const toast = useToast();

  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  useEffect(() => {
    setEntries(loadEntries());
  }, []);

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function confirmDelete(id: string) {
    setPendingDelete(id);
  }

  function executeDelete(id: string) {
    deleteEntry(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setExpanded((prev) => { const n = new Set(prev); n.delete(id); return n; });
    setPendingDelete(null);
    toast.success('Entrada eliminada.');
  }

  function cancelDelete() {
    setPendingDelete(null);
  }

  const groups = groupByMonth(entries);

  return (
    <>
      <Screen background="cream">
        {/* ── header ── */}
        <header className="hdr">
          <button
            type="button"
            className="back-btn"
            onClick={() => router.back()}
            aria-label="Volver al diario"
          >
            ← Volver
          </button>
          <div className="hdr-text">
            <span className="eyebrow">— Historial —</span>
            <h1 className="s-greet">
              Todo lo que
              <br />
              has <em>escrito</em>.
            </h1>
          </div>
          <p className="entry-count">
            {entries.length === 0
              ? 'Todavía sin entradas'
              : `${entries.length} ${entries.length === 1 ? 'entrada' : 'entradas'}`}
          </p>
        </header>

        {/* ── empty state ── */}
        {entries.length === 0 ? (
          <div className="empty">
            <p className="empty-text">
              Aún no hay nada aquí. Cuando anotes tu primer momento, aparecerá.
            </p>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => router.push('/diario')}
            >
              Escribir ahora →
            </button>
          </div>
        ) : null}

        {/* ── entry list grouped by month ── */}
        {groups.map((group) => (
          <section key={group.key} className="month-group">
            <h2 className="month-label">{group.label}</h2>
            <ul className="entry-list" role="list">
              {group.entries.map((entry) => {
                const isOpen = expanded.has(entry.id);
                const isPending = pendingDelete === entry.id;
                const hasText = entry.text.trim().length > 0;

                return (
                  <li key={entry.id} className={`entry-card ${isOpen ? 'open' : ''}`}>
                    {/* ── card top row ── */}
                    <div className="card-top">
                      <button
                        type="button"
                        className="card-main"
                        onClick={() => toggleExpand(entry.id)}
                        aria-expanded={isOpen}
                        aria-label={`Entrada del ${formatShort(entry.createdAt)}`}
                      >
                        <div className="mood-badge" style={{ color: moodColor(entry.mood) }}>
                          {entry.mood}
                        </div>
                        <div className="card-meta">
                          <span className="card-date">{formatShort(entry.createdAt)}</span>
                          {entry.emotions.length > 0 && (
                            <div className="chips-mini">
                              {entry.emotions.slice(0, 3).map((id) => (
                                <span key={id} className="chip-mini">{emotionLabel(id)}</span>
                              ))}
                              {entry.emotions.length > 3 && (
                                <span className="chip-mini chip-more">+{entry.emotions.length - 3}</span>
                              )}
                            </div>
                          )}
                          {!isOpen && hasText && (
                            <p className="text-preview">{entry.text.slice(0, 80)}{entry.text.length > 80 ? '…' : ''}</p>
                          )}
                        </div>
                        <span className="chevron" aria-hidden="true">
                          {isOpen ? '↑' : '↓'}
                        </span>
                      </button>

                      <button
                        type="button"
                        className="delete-btn"
                        onClick={() => confirmDelete(entry.id)}
                        aria-label="Eliminar entrada"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14H6L5 6" />
                          <path d="M10 11v6M14 11v6" />
                          <path d="M9 6V4h6v2" />
                        </svg>
                      </button>
                    </div>

                    {/* ── expanded content ── */}
                    {isOpen && (
                      <div className="card-body">
                        <p className="full-date">{formatFull(entry.createdAt)}</p>
                        {entry.emotions.length > 0 && (
                          <div className="chips-full">
                            {entry.emotions.map((id) => (
                              <span key={id} className="chip-full">{emotionLabel(id)}</span>
                            ))}
                          </div>
                        )}
                        {hasText ? (
                          <p className="full-text">{entry.text}</p>
                        ) : (
                          <p className="no-text">Solo ánimo y emociones. Sin texto.</p>
                        )}
                      </div>
                    )}

                    {/* ── delete confirm ── */}
                    {isPending && (
                      <div className="confirm-bar" role="alert">
                        <span className="confirm-msg">¿Eliminar esta entrada?</span>
                        <div className="confirm-btns">
                          <button type="button" className="confirm-yes" onClick={() => executeDelete(entry.id)}>
                            Eliminar
                          </button>
                          <button type="button" className="confirm-no" onClick={cancelDelete}>
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}

        {/* ── bottom spacer for tab bar ── */}
        <div style={{ height: 96 }} />
      </Screen>

      <TabBar />

      <style jsx>{`
        /* ── layout ── */
        .hdr {
          margin-bottom: 28px;
        }
        .back-btn {
          background: none;
          border: none;
          padding: 0 0 14px;
          font-family: var(--font-mono);
          font-size: 12px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--cobalto);
          cursor: pointer;
          opacity: 0.7;
          transition: opacity 0.15s;
        }
        .back-btn:hover { opacity: 1; }
        .hdr-text { display: flex; flex-direction: column; gap: 10px; }
        .entry-count {
          margin-top: 6px;
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          opacity: 0.5;
        }

        /* ── empty ── */
        .empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          padding: 48px 0;
          text-align: center;
        }
        .empty-text {
          font-family: var(--font-body);
          font-size: 15px;
          line-height: 1.55;
          color: var(--ink);
          opacity: 0.6;
          max-width: 280px;
        }

        /* ── month group ── */
        .month-group {
          margin-bottom: 32px;
        }
        .month-label {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          opacity: 0.5;
          margin: 0 0 12px;
          padding: 0 4px;
        }
        .entry-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        /* ── entry card ── */
        .entry-card {
          background: rgba(255, 255, 255, 0.55);
          border: 1px solid rgba(13, 15, 61, 0.1);
          border-radius: var(--r-md);
          overflow: hidden;
          transition: border-color 0.15s;
        }
        .entry-card.open {
          border-color: rgba(13, 15, 61, 0.2);
        }

        .card-top {
          display: flex;
          align-items: stretch;
        }
        .card-main {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 8px 12px 14px;
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
          font: inherit;
          -webkit-tap-highlight-color: transparent;
          min-width: 0;
        }
        .card-main:focus-visible {
          outline: 2px solid var(--cobalto);
          outline-offset: -2px;
          border-radius: var(--r-md);
        }

        /* mood badge */
        .mood-badge {
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 800;
          font-size: 36px;
          line-height: 1;
          min-width: 38px;
          letter-spacing: -0.03em;
          flex-shrink: 0;
        }

        .card-meta {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .card-date {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          opacity: 0.6;
        }
        .chips-mini {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }
        .chip-mini {
          font-family: var(--font-body);
          font-size: 10px;
          font-weight: 500;
          padding: 2px 7px;
          border-radius: 99px;
          background: rgba(29, 43, 219, 0.1);
          color: var(--cobalto);
          white-space: nowrap;
        }
        .chip-more {
          background: rgba(13, 15, 61, 0.07);
          color: rgba(13, 15, 61, 0.5);
        }
        .text-preview {
          font-family: var(--font-display);
          font-style: italic;
          font-size: 13px;
          line-height: 1.45;
          color: var(--ink);
          opacity: 0.65;
          margin: 0;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
        .chevron {
          font-size: 11px;
          opacity: 0.4;
          flex-shrink: 0;
          padding: 0 4px;
          font-family: var(--font-mono);
        }

        /* delete button */
        .delete-btn {
          padding: 0 14px;
          background: none;
          border: none;
          border-left: 1px solid rgba(13, 15, 61, 0.08);
          cursor: pointer;
          color: rgba(13, 15, 61, 0.3);
          transition: color 0.15s, background 0.15s;
          -webkit-tap-highlight-color: transparent;
          flex-shrink: 0;
          display: flex;
          align-items: center;
        }
        .delete-btn:hover {
          color: var(--accent);
          background: rgba(217, 119, 87, 0.06);
        }
        .delete-btn:focus-visible {
          outline: 2px solid var(--accent);
          outline-offset: -2px;
        }
        .delete-btn svg {
          width: 16px;
          height: 16px;
        }

        /* expanded body */
        .card-body {
          padding: 0 14px 14px 64px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          border-top: 1px solid rgba(13, 15, 61, 0.07);
        }
        .full-date {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          opacity: 0.45;
          margin: 8px 0 0;
        }
        .chips-full {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
        }
        .chip-full {
          font-family: var(--font-body);
          font-size: 11px;
          font-weight: 500;
          padding: 3px 9px;
          border-radius: 99px;
          border: 1px solid rgba(29, 43, 219, 0.22);
          color: var(--cobalto);
        }
        .full-text {
          font-family: var(--font-body);
          font-size: 15px;
          line-height: 1.6;
          color: var(--ink);
          margin: 0;
          white-space: pre-wrap;
        }
        .no-text {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.1em;
          opacity: 0.4;
          margin: 0;
        }

        /* delete confirm bar */
        .confirm-bar {
          background: rgba(217, 119, 87, 0.08);
          border-top: 1px solid rgba(217, 119, 87, 0.2);
          padding: 10px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .confirm-msg {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.1em;
          color: var(--accent);
        }
        .confirm-btns {
          display: flex;
          gap: 8px;
        }
        .confirm-yes {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 5px 12px;
          border-radius: 99px;
          background: var(--accent);
          color: var(--crema);
          border: none;
          cursor: pointer;
          transition: opacity 0.15s;
        }
        .confirm-yes:hover { opacity: 0.85; }
        .confirm-no {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 5px 12px;
          border-radius: 99px;
          background: none;
          color: var(--ink);
          border: 1px solid rgba(13, 15, 61, 0.18);
          cursor: pointer;
          opacity: 0.6;
          transition: opacity 0.15s;
        }
        .confirm-no:hover { opacity: 1; }
      `}</style>
    </>
  );
}
