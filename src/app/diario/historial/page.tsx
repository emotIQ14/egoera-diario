'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Screen from '@/components/Screen';
import TabBar from '@/components/TabBar';
import { deleteEntry, loadEntries, updateEntry } from '@/lib/storage';
import type { DiaryEntry, Emotion } from '@/lib/storage';
import { EMOTIONS } from '@/lib/types';
import { useToast } from '@/components/toast/ToastProvider';
import { track } from '@/lib/track';

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

// ─── filter helpers ──────────────────────────────────────────────────────────

function normalizeSearch(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

function matchesSearch(entry: DiaryEntry, needle: string): boolean {
  if (!needle) return true;
  const n = normalizeSearch(needle);
  return (
    normalizeSearch(entry.text).includes(n) ||
    entry.emotions.some((e) => normalizeSearch(emotionLabel(e)).includes(n))
  );
}

function matchesEmotionFilter(entry: DiaryEntry, filter: Set<Emotion>): boolean {
  if (filter.size === 0) return true;
  return entry.emotions.some((e) => filter.has(e));
}

// ─── edit form state ─────────────────────────────────────────────────────────

type EditDraft = { mood: number; emotions: Emotion[]; text: string };

// ─── component ───────────────────────────────────────────────────────────────

export default function HistorialPage() {
  const router = useRouter();
  const toast = useToast();

  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<EditDraft | null>(null);
  // ── filter state ──
  const [search, setSearch] = useState<string>('');
  const [emotionFilter, setEmotionFilter] = useState<Set<Emotion>>(new Set());

  useEffect(() => {
    const all = loadEntries();
    setEntries(all);
    track('historial_opened', { total: all.length });
  }, []);

  function toggleExpand(id: string) {
    // cancel edit if switching card
    if (editingId && editingId !== id) {
      setEditingId(null);
      setDraft(null);
    }
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function confirmDelete(id: string) {
    setEditingId(null);
    setDraft(null);
    setPendingDelete(id);
  }

  function executeDelete(id: string) {
    deleteEntry(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setExpanded((prev) => { const n = new Set(prev); n.delete(id); return n; });
    setPendingDelete(null);
    track('entry_deleted');
    toast.success('Entrada eliminada.');
  }

  function cancelDelete() {
    setPendingDelete(null);
  }

  function startEdit(entry: DiaryEntry) {
    setEditingId(entry.id);
    setDraft({ mood: entry.mood, emotions: [...entry.emotions], text: entry.text });
    setPendingDelete(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft(null);
  }

  function toggleDraftEmotion(id: Emotion) {
    if (!draft) return;
    setDraft((prev) => {
      if (!prev) return prev;
      const has = prev.emotions.includes(id);
      return {
        ...prev,
        emotions: has ? prev.emotions.filter((e) => e !== id) : [...prev.emotions, id],
      };
    });
  }

  function commitEdit(entry: DiaryEntry) {
    if (!draft) return;
    const updated: DiaryEntry = {
      ...entry,
      mood: draft.mood,
      emotions: draft.emotions,
      text: draft.text.trim(),
    };
    updateEntry(updated);
    setEntries((prev) => prev.map((e) => (e.id === entry.id ? updated : e)));
    setEditingId(null);
    setDraft(null);
    track('entry_edited');
    toast.success('Entrada actualizada.');
  }

  function toggleEmotionFilter(id: Emotion) {
    setEmotionFilter((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      track('historial_filter_used', { emotion: id, active: next.has(id) ? 1 : 0 });
      return next;
    });
  }

  function clearFilters() {
    setSearch('');
    setEmotionFilter(new Set());
  }

  const hasFilter = search.trim().length > 0 || emotionFilter.size > 0;

  const filteredEntries = hasFilter
    ? entries.filter(
        (e) =>
          matchesSearch(e, search.trim()) &&
          matchesEmotionFilter(e, emotionFilter)
      )
    : entries;

  const groups = groupByMonth(filteredEntries);

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

        {/* ── search + filter ── */}
        {entries.length > 0 ? (
          <div className="filter-zone">
            <div className="search-wrap">
              <svg className="search-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="search"
                className="search-input"
                placeholder="Buscar en mis entradas…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Buscar en entradas"
              />
              {search && (
                <button
                  type="button"
                  className="search-clear"
                  onClick={() => setSearch('')}
                  aria-label="Limpiar búsqueda"
                >
                  ×
                </button>
              )}
            </div>
            <div className="emotion-filter" role="group" aria-label="Filtrar por emoción">
              {EMOTIONS.map((emo) => {
                const active = emotionFilter.has(emo.id as Emotion);
                return (
                  <button
                    key={emo.id}
                    type="button"
                    role="checkbox"
                    aria-checked={active}
                    className={`filter-chip ${active ? 'filter-chip-on' : ''}`}
                    onClick={() => toggleEmotionFilter(emo.id as Emotion)}
                  >
                    {emo.label}
                  </button>
                );
              })}
            </div>
            {hasFilter && (
              <div className="filter-summary">
                <span className="filter-count">
                  {filteredEntries.length} de {entries.length}{' '}
                  {entries.length === 1 ? 'entrada' : 'entradas'}
                </span>
                <button
                  type="button"
                  className="filter-reset"
                  onClick={clearFilters}
                >
                  Borrar filtros ×
                </button>
              </div>
            )}
          </div>
        ) : null}

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

        {/* ── no results state ── */}
        {hasFilter && filteredEntries.length === 0 ? (
          <div className="empty">
            <p className="empty-text">
              No hay entradas que coincidan con esa búsqueda.
            </p>
            <button type="button" className="btn btn-outline" onClick={clearFilters}>
              Quitar filtros →
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
                const isEditing = editingId === entry.id;
                const hasText = entry.text.trim().length > 0;

                return (
                  <li key={entry.id} className={`entry-card ${isOpen ? 'open' : ''} ${isEditing ? 'editing' : ''}`}>
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

                    {/* ── expanded — READ view ── */}
                    {isOpen && !isEditing && (
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
                        <button
                          type="button"
                          className="edit-btn"
                          onClick={() => startEdit(entry)}
                        >
                          Editar entrada
                        </button>
                      </div>
                    )}

                    {/* ── expanded — EDIT view ── */}
                    {isOpen && isEditing && draft && (
                      <div className="card-body edit-body">
                        <p className="full-date">{formatFull(entry.createdAt)}</p>

                        {/* mood */}
                        <div className="edit-field">
                          <label className="edit-label" htmlFor={`mood-${entry.id}`}>
                            Ánimo <strong>{draft.mood}</strong> / 10
                          </label>
                          <input
                            id={`mood-${entry.id}`}
                            type="range"
                            min={0} max={10} step={1}
                            value={draft.mood}
                            onChange={(e) => setDraft((p) => p ? { ...p, mood: Number(e.target.value) } : p)}
                            className="slider"
                          />
                        </div>

                        {/* emotions */}
                        <div className="edit-field">
                          <span className="edit-label">Emociones</span>
                          <div className="chips-edit" role="group" aria-label="Emociones">
                            {EMOTIONS.map((emo) => {
                              const active = draft.emotions.includes(emo.id as Emotion);
                              return (
                                <button
                                  key={emo.id}
                                  type="button"
                                  role="checkbox"
                                  aria-checked={active}
                                  className={`chip-edit ${active ? 'chip-edit-on' : ''}`}
                                  onClick={() => toggleDraftEmotion(emo.id as Emotion)}
                                >
                                  {emo.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* text */}
                        <div className="edit-field">
                          <label className="edit-label" htmlFor={`text-${entry.id}`}>Texto</label>
                          <textarea
                            id={`text-${entry.id}`}
                            className="edit-textarea"
                            rows={4}
                            value={draft.text}
                            onChange={(e) => setDraft((p) => p ? { ...p, text: e.target.value } : p)}
                            placeholder="Cuéntalo si quieres…"
                          />
                        </div>

                        <div className="edit-actions">
                          <button type="button" className="btn-save" onClick={() => commitEdit(entry)}>
                            Guardar cambios
                          </button>
                          <button type="button" className="btn-cancel-edit" onClick={cancelEdit}>
                            Cancelar
                          </button>
                        </div>
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

        <div style={{ height: 96 }} />
      </Screen>

      <TabBar />

      <style jsx>{`
        /* ── layout ── */
        .hdr { margin-bottom: 28px; }
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
        .month-group { margin-bottom: 32px; }
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
        .entry-card.open { border-color: rgba(13, 15, 61, 0.2); }
        .entry-card.editing { border-color: var(--cobalto); }

        .card-top { display: flex; align-items: stretch; }
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
        .chips-mini { display: flex; flex-wrap: wrap; gap: 4px; }
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
        .delete-btn svg { width: 16px; height: 16px; }

        /* expanded body */
        .card-body {
          padding: 0 14px 14px 64px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          border-top: 1px solid rgba(13, 15, 61, 0.07);
        }
        .edit-body { padding: 0 14px 16px 14px; }

        .full-date {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          opacity: 0.45;
          margin: 8px 0 0;
        }
        .chips-full { display: flex; flex-wrap: wrap; gap: 5px; }
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
        .edit-btn {
          align-self: flex-start;
          background: none;
          border: 1px solid rgba(13, 15, 61, 0.18);
          padding: 6px 14px;
          border-radius: 99px;
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--ink);
          cursor: pointer;
          opacity: 0.65;
          transition: opacity 0.15s, border-color 0.15s;
        }
        .edit-btn:hover {
          opacity: 1;
          border-color: var(--cobalto);
          color: var(--cobalto);
        }
        .edit-btn:focus-visible {
          outline: 2px solid var(--cobalto);
          outline-offset: 2px;
        }

        /* ── edit form ── */
        .edit-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-top: 10px;
        }
        .edit-label {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          opacity: 0.55;
        }
        .edit-label strong {
          color: var(--cobalto);
          font-style: italic;
          font-family: var(--font-display);
          font-size: 14px;
          letter-spacing: 0;
          text-transform: none;
          opacity: 1;
        }

        /* slider (same style as /diario) */
        .slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 4px;
          background: rgba(13, 15, 61, 0.14);
          border-radius: 999px;
          outline: none;
          margin: 0;
        }
        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--cobalto);
          box-shadow: 0 4px 10px rgba(29, 43, 219, 0.38);
          cursor: pointer;
          border: none;
        }
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--cobalto);
          box-shadow: 0 4px 10px rgba(29, 43, 219, 0.38);
          cursor: pointer;
          border: none;
        }

        /* emotion chips in edit mode */
        .chips-edit { display: flex; flex-wrap: wrap; gap: 7px; }
        .chip-edit {
          font-family: var(--font-body);
          font-size: 12px;
          font-weight: 500;
          padding: 6px 12px;
          border-radius: var(--r-pill);
          border: 1.5px solid rgba(13, 15, 61, 0.18);
          background: transparent;
          color: var(--ink);
          cursor: pointer;
          transition: background 0.12s, color 0.12s, border-color 0.12s;
        }
        .chip-edit-on {
          background: var(--cobalto);
          color: var(--crema);
          border-color: var(--cobalto);
        }

        /* textarea in edit */
        .edit-textarea {
          width: 100%;
          font-family: var(--font-body);
          font-size: 15px;
          line-height: 1.55;
          color: var(--ink);
          background: rgba(255,255,255,0.8);
          border: 1px solid rgba(13, 15, 61, 0.16);
          border-radius: var(--r-md);
          padding: 12px 14px;
          resize: vertical;
          min-height: 84px;
          outline: none;
          transition: border-color 0.15s;
          box-sizing: border-box;
        }
        .edit-textarea:focus { border-color: var(--cobalto); }
        .edit-textarea::placeholder {
          font-family: var(--font-display);
          font-style: italic;
          color: rgba(13, 15, 61, 0.4);
        }

        /* edit actions */
        .edit-actions {
          display: flex;
          gap: 8px;
          margin-top: 4px;
        }
        .btn-save {
          padding: 10px 20px;
          border-radius: 99px;
          background: var(--cobalto);
          color: var(--crema);
          border: none;
          font-family: var(--font-mono);
          font-size: 12px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          cursor: pointer;
          transition: opacity 0.15s;
        }
        .btn-save:hover { opacity: 0.85; }
        .btn-cancel-edit {
          padding: 10px 20px;
          border-radius: 99px;
          background: none;
          border: 1px solid rgba(13, 15, 61, 0.18);
          color: var(--ink);
          font-family: var(--font-mono);
          font-size: 12px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          cursor: pointer;
          opacity: 0.6;
          transition: opacity 0.15s;
        }
        .btn-cancel-edit:hover { opacity: 1; }

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
        .confirm-btns { display: flex; gap: 8px; }
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

        /* ── search + filter zone ── */
        .filter-zone {
          margin-bottom: 24px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .search-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .search-ico {
          position: absolute;
          left: 12px;
          width: 16px;
          height: 16px;
          opacity: 0.4;
          pointer-events: none;
          flex-shrink: 0;
        }
        .search-input {
          width: 100%;
          padding: 11px 36px 11px 36px;
          background: rgba(255,255,255,0.65);
          border: 1px solid rgba(13, 15, 61, 0.15);
          border-radius: var(--r-md);
          font-family: var(--font-body);
          font-size: 14px;
          color: var(--ink);
          outline: none;
          transition: border-color 0.15s;
          box-sizing: border-box;
          -webkit-appearance: none;
        }
        .search-input:focus { border-color: var(--cobalto); }
        .search-input::placeholder { color: rgba(13,15,61,0.38); }
        /* remove native search clear on webkit */
        .search-input::-webkit-search-cancel-button { display: none; }
        .search-clear {
          position: absolute;
          right: 10px;
          background: none;
          border: none;
          font-size: 18px;
          line-height: 1;
          color: rgba(13,15,61,0.45);
          cursor: pointer;
          padding: 4px;
          transition: color 0.15s;
        }
        .search-clear:hover { color: var(--ink); }

        .emotion-filter {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .filter-chip {
          font-family: var(--font-body);
          font-size: 11px;
          font-weight: 500;
          padding: 4px 11px;
          border-radius: 99px;
          border: 1.5px solid rgba(13, 15, 61, 0.16);
          background: transparent;
          color: var(--ink);
          cursor: pointer;
          transition: background 0.12s, color 0.12s, border-color 0.12s;
          opacity: 0.75;
        }
        .filter-chip:hover { opacity: 1; border-color: rgba(29,43,219,0.35); }
        .filter-chip-on {
          background: var(--cobalto);
          color: var(--crema);
          border-color: var(--cobalto);
          opacity: 1;
        }

        .filter-summary {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }
        .filter-count {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--cobalto);
          opacity: 0.8;
        }
        .filter-reset {
          background: none;
          border: none;
          padding: 0;
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--accent);
          cursor: pointer;
          opacity: 0.7;
          transition: opacity 0.15s;
        }
        .filter-reset:hover { opacity: 1; }
      `}</style>
    </>
  );
}
