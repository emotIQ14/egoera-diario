'use client';

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Screen from '@/components/Screen';
import TabBar from '@/components/TabBar';
import { loadEntries, streakDays } from '@/lib/storage';
import type { DiaryEntry } from '@/lib/storage';
import { EMOTIONS } from '@/lib/types';
import { useToast } from '@/components/toast/ToastProvider';
import { track } from '@/lib/track';

const NAME_KEY = 'egoera-diario-name';
const LANG_KEY = 'egoera-lang';
const ENTRIES_KEY = 'egoera-diario-entries-v1';
const REMINDER_KEY = 'egoera-reminder-time'; // "HH:MM" o null
const APP_VERSION = '0.1.0';

type Lang = 'ES' | 'EU';

function isLang(value: string | null): value is Lang {
  return value === 'ES' || value === 'EU';
}

function initialsFrom(name: string): string {
  const clean = name.trim();
  if (!clean) return 'AB';
  const parts = clean.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? '';
  const second = parts[1]?.[0] ?? (parts[0]?.[1] ?? '');
  return (first + second).toUpperCase().slice(0, 2) || 'AB';
}

function emotionLabel(id: string): string {
  return EMOTIONS.find((e) => e.id === id)?.label ?? id;
}

// ── sparkline helpers ─────────────────────────────────────────────────────────
type SparkDot = { dayOffset: number; avgMood: number };

function buildSparkDots(entries: DiaryEntry[], days = 14): SparkDot[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const buckets = new Map<number, { sum: number; count: number }>();
  for (const e of entries) {
    const d = new Date(e.createdAt);
    d.setHours(0, 0, 0, 0);
    const offset = Math.round((today.getTime() - d.getTime()) / 86400000);
    if (offset < 0 || offset >= days) continue;
    const prev = buckets.get(offset) ?? { sum: 0, count: 0 };
    buckets.set(offset, { sum: prev.sum + e.mood, count: prev.count + 1 });
  }
  return Array.from(buckets.entries())
    .map(([dayOffset, { sum, count }]) => ({ dayOffset, avgMood: sum / count }))
    .sort((a, b) => b.dayOffset - a.dayOffset); // oldest first
}

const SPARK_W = 280;
const SPARK_H = 44;
const SPARK_PAD = 4;
const SPARK_DAYS = 14;

function buildSparkSvg(dots: SparkDot[]): { line: string; area: string; dotPts: Array<{ cx: number; cy: number; mood: number }> } {
  if (dots.length < 2) return { line: '', area: '', dotPts: [] };
  const toX = (offset: number) =>
    SPARK_PAD + ((SPARK_DAYS - 1 - offset) / (SPARK_DAYS - 1)) * (SPARK_W - SPARK_PAD * 2);
  const toY = (mood: number) =>
    SPARK_PAD + (1 - mood / 10) * (SPARK_H - SPARK_PAD * 2);
  const pts = dots.map((d) => ({ cx: toX(d.dayOffset), cy: toY(d.avgMood), mood: d.avgMood }));
  const line = pts
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.cx.toFixed(1)},${p.cy.toFixed(1)}`)
    .join(' ');
  const baseY = (SPARK_H - SPARK_PAD).toFixed(1);
  const area = `${line} L${pts[pts.length - 1].cx.toFixed(1)},${baseY} L${pts[0].cx.toFixed(1)},${baseY}Z`;
  return { line, area, dotPts: pts };
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function allTimeStreakDays(entries: DiaryEntry[]): number {
  if (entries.length === 0) return 0;
  const seen = new Set<string>();
  for (const e of entries) {
    const d = new Date(e.createdAt);
    d.setHours(0, 0, 0, 0);
    seen.add(d.toISOString().slice(0, 10));
  }
  const sorted = Array.from(seen).sort();
  let max = 1;
  let cur = 1;
  for (let i = 1; i < sorted.length; i++) {
    const diff = (new Date(sorted[i]).getTime() - new Date(sorted[i - 1]).getTime()) / 86_400_000;
    if (diff === 1) { cur++; if (cur > max) max = cur; }
    else cur = 1;
  }
  return max;
}

function isoDate(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function exportToMarkdown(entries: DiaryEntry[]): string {
  const lines: string[] = [];
  lines.push('# Egoera Diario');
  lines.push('');
  lines.push(`> Exportación · ${new Date().toISOString()}`);
  lines.push(`> Total entradas: ${entries.length}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  const sorted = [...entries].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  for (const entry of sorted) {
    const date = new Date(entry.createdAt);
    const emotionLabels = entry.emotions.map(emotionLabel);
    lines.push('---');
    lines.push(`id: ${entry.id}`);
    lines.push(`date: ${date.toISOString()}`);
    lines.push(`mood: ${entry.mood}`);
    lines.push(`emotions: [${emotionLabels.join(', ')}]`);
    lines.push('---');
    lines.push('');
    lines.push(`## ${isoDate(date)} · ${pad2(date.getHours())}:${pad2(date.getMinutes())}`);
    lines.push('');
    lines.push(`**Estado de ánimo:** ${entry.mood}/10`);
    if (emotionLabels.length > 0) {
      lines.push(`**Emociones:** ${emotionLabels.join(' · ')}`);
    }
    lines.push('');
    if (entry.text.trim().length > 0) {
      lines.push(entry.text.trim());
      lines.push('');
    }
    if (entry.voiceTranscript && entry.voiceTranscript.trim().length > 0) {
      lines.push(`> Voz: ${entry.voiceTranscript.trim()}`);
      lines.push('');
    }
  }
  return lines.join('\n');
}

function triggerDownload(content: string, filename: string, mimeType = 'text/markdown;charset=utf-8'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function isValidEntry(value: unknown): value is DiaryEntry {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    typeof v.createdAt === 'string' &&
    typeof v.mood === 'number' &&
    Array.isArray(v.emotions) &&
    v.emotions.every((e) => typeof e === 'string') &&
    typeof v.text === 'string'
  );
}

function importFromJson(file: File): Promise<DiaryEntry[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));
    reader.onload = () => {
      try {
        const result = reader.result;
        if (typeof result !== 'string') {
          reject(new Error('Formato no válido.'));
          return;
        }
        const parsed: unknown = JSON.parse(result);
        const list = Array.isArray(parsed)
          ? parsed
          : typeof parsed === 'object' && parsed !== null && Array.isArray((parsed as { entries?: unknown }).entries)
            ? (parsed as { entries: unknown[] }).entries
            : null;
        if (!list) {
          reject(new Error('El JSON no contiene un array de entradas.'));
          return;
        }
        const valid = list.filter(isValidEntry);
        if (valid.length === 0) {
          reject(new Error('Ninguna entrada válida en el archivo.'));
          return;
        }
        window.localStorage.setItem(ENTRIES_KEY, JSON.stringify(valid));
        resolve(valid);
      } catch {
        reject(new Error('JSON malformado.'));
      }
    };
    reader.readAsText(file);
  });
}

export default function TuPage() {
  const router = useRouter();
  const toast = useToast();
  const [name, setName] = useState<string>('Ander Bilbao');
  const [editingName, setEditingName] = useState<boolean>(false);
  const [draftName, setDraftName] = useState<string>('');
  const [lang, setLang] = useState<Lang>('ES');
  const [totalEntries, setTotalEntries] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(0);
  const [daysSinceFirst, setDaysSinceFirst] = useState<number>(0);
  const [avgMood, setAvgMood] = useState<number | null>(null);
  const [topEmotion, setTopEmotion] = useState<string | null>(null);
  const [sparkDots, setSparkDots] = useState<SparkDot[]>([]);
  const [reminderTime, setReminderTime] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const storedName = window.localStorage.getItem(NAME_KEY);
    if (storedName && storedName.trim().length > 0) setName(storedName.trim());

    const storedLang = window.localStorage.getItem(LANG_KEY);
    if (isLang(storedLang)) setLang(storedLang);

    const entries = loadEntries();
    setTotalEntries(entries.length);
    setStreak(streakDays());
    setBestStreak(allTimeStreakDays(entries));

    if (entries.length > 0) {
      const sorted = [...entries].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      const first = new Date(sorted[0].createdAt);
      first.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const diff = Math.max(
        0,
        Math.round((today.getTime() - first.getTime()) / (1000 * 60 * 60 * 24))
      );
      setDaysSinceFirst(diff);

      // average mood
      const moodSum = entries.reduce((acc, e) => acc + e.mood, 0);
      setAvgMood(Math.round((moodSum / entries.length) * 10) / 10);

      // top emotion
      const freq = new Map<string, number>();
      for (const e of entries) {
        for (const emo of e.emotions) {
          freq.set(emo, (freq.get(emo) ?? 0) + 1);
        }
      }
      if (freq.size > 0) {
        const [topId] = Array.from(freq.entries()).sort((a, b) => b[1] - a[1])[0];
        setTopEmotion(emotionLabel(topId));
      }

      // sparkline
      setSparkDots(buildSparkDots(entries));
    }

    const storedReminder = window.localStorage.getItem(REMINDER_KEY);
    if (storedReminder) setReminderTime(storedReminder);

    setHydrated(true);
  }, []);

  useEffect(() => {
    if (editingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [editingName]);

  const initials = useMemo(() => initialsFrom(name), [name]);
  const spark = useMemo(() => buildSparkSvg(sparkDots), [sparkDots]);

  function startEditingName() {
    setDraftName(name);
    setEditingName(true);
  }

  function commitName() {
    const trimmed = draftName.trim();
    if (trimmed.length > 0) {
      setName(trimmed);
      window.localStorage.setItem(NAME_KEY, trimmed);
    }
    setEditingName(false);
  }

  function cancelEditName() {
    setEditingName(false);
    setDraftName('');
  }

  function handleEditNamePrompt() {
    const next = window.prompt('¿Cómo te llamas?', name);
    if (next === null) return;
    const trimmed = next.trim();
    if (trimmed.length === 0) return;
    setName(trimmed);
    window.localStorage.setItem(NAME_KEY, trimmed);
  }

  async function handleReminderToggle(): Promise<void> {
    if (reminderTime) {
      // desactivar
      setReminderTime(null);
      window.localStorage.removeItem(REMINDER_KEY);
      toast.success('Recordatorio desactivado.');
    } else {
      // activar con hora por defecto 20:00
      const defaultTime = '20:00';
      setReminderTime(defaultTime);
      window.localStorage.setItem(REMINDER_KEY, defaultTime);
      toast.success('Recordatorio activado para las 20:00. Cámbialo abajo si quieres.');

      // Solicitar permiso de notificaciones del navegador
      if (typeof window !== 'undefined' && 'Notification' in window) {
        try {
          if (Notification.permission === 'default') {
            const perm = await Notification.requestPermission();
            if (perm === 'granted') {
              new Notification('Egoera · Recordatorio activado', {
                body: 'Cuando abras la app a partir de las 20:00 sin haber escrito, te lo recordaremos.',
              });
            }
          } else if (Notification.permission === 'granted') {
            new Notification('Egoera · Recordatorio activado', {
              body: `A las ${defaultTime} te esperamos aquí.`,
            });
          }
        } catch { /* silencioso */ }
      }
    }
  }

  function handleReminderTimeChange(value: string) {
    setReminderTime(value);
    window.localStorage.setItem(REMINDER_KEY, value);
  }

  function toggleLang() {
    const next: Lang = lang === 'ES' ? 'EU' : 'ES';
    setLang(next);
    window.localStorage.setItem(LANG_KEY, next);
    toast.success(next === 'ES' ? 'Idioma: español.' : 'Hizkuntza: euskara.');
  }

  function handleExport() {
    const entries = loadEntries();
    if (entries.length === 0) {
      toast.info('Aún no hay entradas que exportar. Empieza por una.');
      return;
    }
    const md = exportToMarkdown(entries);
    const today = isoDate(new Date());
    triggerDownload(md, `egoera-diario-${today}.md`);
    track('export_markdown', { entries: entries.length });
    toast.success(`${entries.length} entradas exportadas a .md.`);
  }

  function handleExportJson() {
    const entries = loadEntries();
    if (entries.length === 0) {
      toast.info('Aún no hay entradas que exportar. Empieza por una.');
      return;
    }
    const payload = {
      version: '1',
      exportedAt: new Date().toISOString(),
      entries,
    };
    const content = JSON.stringify(payload, null, 2);
    const today = isoDate(new Date());
    triggerDownload(content, `egoera-diario-${today}.json`, 'application/json;charset=utf-8');
    track('export_json', { entries: entries.length });
    toast.success(`${entries.length} entradas exportadas a .json (para backup / importar).`);
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  async function handleImportFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const imported = await importFromJson(file);
      setTotalEntries(imported.length);
      setStreak(streakDays());
      setBestStreak(allTimeStreakDays(imported));
      toast.success(`${imported.length} entradas importadas. Recarga para verlas.`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'No se pudo importar.';
      toast.error(msg);
    }
  }

  function handleDangerDelete() {
    const confirmation = window.prompt(
      'Esto borrará todas tus entradas de este dispositivo. Escribe BORRAR para confirmar.'
    );
    if (confirmation === null) return;
    if (confirmation.trim().toUpperCase() !== 'BORRAR') {
      toast.info('Cancelado. No se borró nada.');
      return;
    }
    // Backup en memoria para permitir undo durante 5.5s
    const backup = window.localStorage.getItem(ENTRIES_KEY);
    window.localStorage.removeItem(ENTRIES_KEY);
    setTotalEntries(0);
    toast.action('Diario borrado.', {
      actionLabel: 'Deshacer',
      onAction: () => {
        if (backup !== null) {
          window.localStorage.setItem(ENTRIES_KEY, backup);
          setTotalEntries(loadEntries().length);
          toast.success('Restaurado. Nada se ha perdido.');
        }
      },
    });
  }

  return (
    <Screen background="cream">
      <header className="hdr">
        <p className="eyebrow">— Tú —</p>

        <div className="profile">
          <div className="avatar" aria-label={`Avatar de ${name}`}>
            <span aria-hidden="true">{initials}</span>
          </div>

          {editingName ? (
            <div className="name-edit">
              <label htmlFor="name-input" className="sr-only">
                Tu nombre
              </label>
              <input
                ref={nameInputRef}
                id="name-input"
                type="text"
                className="name-input"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                onBlur={commitName}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    commitName();
                  } else if (e.key === 'Escape') {
                    e.preventDefault();
                    cancelEditName();
                  }
                }}
                maxLength={48}
                autoComplete="off"
                spellCheck={false}
              />
            </div>
          ) : (
            <button
              type="button"
              className="name-btn"
              onClick={startEditingName}
              aria-label="Editar nombre"
            >
              <span className="sec-big italic">{name}</span>
            </button>
          )}
        </div>

        <div className="stats" role="group" aria-label="Tus números">
          <div className="stat">
            <div className="stat-num">{hydrated ? totalEntries : 0}</div>
            <div className="eyebrow stat-eyebrow">— Entradas —</div>
          </div>
          <div className="stat">
            <div className="stat-num">{hydrated ? streak : 0}</div>
            <div className="eyebrow stat-eyebrow">— Racha · días —</div>
          </div>
          <div className="stat">
            <div className="stat-num">{hydrated ? daysSinceFirst : 0}</div>
            <div className="eyebrow stat-eyebrow">— Desde ello —</div>
          </div>
          <div className="stat">
            <div className="stat-num">
              {hydrated && avgMood !== null ? avgMood.toFixed(1) : '—'}
            </div>
            <div className="eyebrow stat-eyebrow">— Ánimo medio —</div>
          </div>
          <div className="stat">
            <div className="stat-num stat-num-emo">
              {hydrated && topEmotion ? topEmotion : '—'}
            </div>
            <div className="eyebrow stat-eyebrow">— Más frecuente —</div>
          </div>
          <div className="stat">
            <div className="stat-num">{hydrated ? bestStreak : 0}</div>
            <div className="eyebrow stat-eyebrow">— Récord racha —</div>
          </div>
        </div>

        {hydrated && spark.line ? (
          <div className="sparkline-wrap" aria-label="Curva de ánimo últimos 14 días">
            <span className="sparkline-eyebrow">— 14 días —</span>
            <svg
              className="sparkline-svg"
              viewBox={`0 0 ${SPARK_W} ${SPARK_H}`}
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path d={spark.area} fill="var(--cobalto)" fillOpacity="0.1" />
              <path
                d={spark.line}
                fill="none"
                stroke="var(--cobalto)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {spark.dotPts.map((p, i) => (
                <circle
                  key={i}
                  cx={p.cx}
                  cy={p.cy}
                  r="3.5"
                  fill="var(--cobalto)"
                  stroke="var(--crema)"
                  strokeWidth="1.5"
                />
              ))}
            </svg>
          </div>
        ) : null}
      </header>

      <section className="block" aria-labelledby="acc-eyebrow">
        <span id="acc-eyebrow" className="eyebrow block-eyebrow">
          — Tu cuenta —
        </span>
        <ul className="link-list">
          <li>
            <button
              type="button"
              className="link-card"
              onClick={handleEditNamePrompt}
            >
              <span className="link-label">Editar nombre</span>
              <span className="link-value">{name}</span>
            </button>
          </li>
          <li className="reminder-row">
            <button
              type="button"
              className="link-card reminder-toggle"
              onClick={handleReminderToggle}
              aria-pressed={!!reminderTime}
            >
              <span className="link-label">Recordatorio diario</span>
              <span className={`reminder-badge ${reminderTime ? 'on' : ''}`}>
                {reminderTime ? 'ON' : 'OFF'}
              </span>
            </button>
            {reminderTime ? (
              <div className="reminder-time-row">
                <label htmlFor="reminder-time" className="reminder-time-label">
                  Hora
                </label>
                <input
                  id="reminder-time"
                  type="time"
                  className="reminder-time-input"
                  value={reminderTime}
                  onChange={(e) => handleReminderTimeChange(e.target.value)}
                  aria-label="Hora del recordatorio"
                />
                <p className="reminder-note">
                  Cuando abras la app después de esta hora sin haber escrito, te lo recordamos.
                </p>
              </div>
            ) : null}
          </li>
          <li>
            <button type="button" className="link-card" onClick={toggleLang}>
              <span className="link-label">Idioma</span>
              <span className="link-toggle" aria-label={`Idioma actual ${lang}`}>
                <span className={`tog ${lang === 'ES' ? 'on' : ''}`}>ES</span>
                <span className={`tog ${lang === 'EU' ? 'on' : ''}`}>EU</span>
              </span>
            </button>
          </li>
        </ul>
      </section>

      <section className="block" aria-labelledby="priv-eyebrow">
        <span id="priv-eyebrow" className="eyebrow block-eyebrow">
          — Privacidad —
        </span>

        <div className="m-card m-card-cream privacy-card">
          <span className="pill-num privacy-pill">— Local —</span>
          <h3 className="privacy-title">
            Tus entradas están solo en este dispositivo.
          </h3>
          <p className="privacy-sub">
            Egoera no envía tus textos a ningún servidor.
          </p>
        </div>

        <ul className="link-list">
          <li>
            <button type="button" className="link-card" onClick={handleExport}>
              <span className="link-label">Exportar a Markdown</span>
              <span className="link-value">.md</span>
            </button>
          </li>
          <li>
            <button type="button" className="link-card" onClick={handleExportJson}>
              <span className="link-label">Exportar a JSON</span>
              <span className="link-value">.json</span>
            </button>
          </li>
          <li>
            <button
              type="button"
              className="link-card"
              onClick={handleImportClick}
            >
              <span className="link-label">Importar desde backup</span>
              <span className="link-value">.json</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              className="sr-only"
              onChange={handleImportFile}
              aria-hidden="true"
              tabIndex={-1}
            />
          </li>
        </ul>
      </section>

      <section className="block" aria-labelledby="more-eyebrow">
        <span id="more-eyebrow" className="eyebrow block-eyebrow">
          — Más —
        </span>
        <button
          type="button"
          className="pro-card"
          onClick={() => router.push('/pro')}
          aria-label="Egoera Pro"
        >
          <span className="pro-pill">— PRO —</span>
          <span className="pro-title">Egoera Pro</span>
          <span className="pro-sub">
            Conversa ilimitada · memoria 365 días · export profesional
          </span>
        </button>
        <ul className="link-list">
          <li>
            <button
              type="button"
              className="link-card"
              onClick={() => router.push('/bienvenida')}
            >
              <span className="link-label">Volver al inicio guiado</span>
              <span className="link-value">→</span>
            </button>
          </li>
          <li>
            <a
              className="link-card link-card-anchor"
              href="https://egoera.es/sobre-nosotros/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="link-label">Sobre Egoera</span>
              <span className="link-value">↗</span>
            </a>
          </li>
          <li>
            <a
              className="link-card link-card-anchor"
              href="https://egoera.es/blog/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="link-label">Vlog</span>
              <span className="link-value">↗</span>
            </a>
          </li>
          <li>
            <a
              className="link-card link-card-anchor"
              href="mailto:hola@egoera.es"
            >
              <span className="link-label">Contacto</span>
              <span className="link-value">hola@egoera.es</span>
            </a>
          </li>
        </ul>
      </section>

      <section className="block" aria-labelledby="danger-eyebrow">
        <span id="danger-eyebrow" className="eyebrow block-eyebrow danger-eyebrow">
          — Zona peligrosa —
        </span>
        <ul className="link-list">
          <li>
            <button
              type="button"
              className="link-card link-card-danger"
              onClick={handleDangerDelete}
            >
              <span className="link-label">Borrar todas mis entradas</span>
              <span className="link-value">×</span>
            </button>
          </li>
        </ul>
      </section>

      <footer className="foot">
        Egoera Diario · v{APP_VERSION} · made with care en Bilbao.
      </footer>

      <TabBar />

      <style jsx>{`
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }

        .hdr {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 14px;
          margin-bottom: 28px;
        }

        .profile {
          display: flex;
          flex-direction: column;
          gap: 14px;
          width: 100%;
          align-items: flex-start;
        }

        .avatar {
          width: 96px;
          height: 96px;
          border-radius: 50%;
          background: var(--cobalto);
          color: var(--crema);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 700;
          font-size: 38px;
          letter-spacing: -0.02em;
          box-shadow: var(--shadow-md);
          user-select: none;
        }

        .name-btn {
          background: none;
          border: none;
          padding: 0;
          margin: 0;
          font: inherit;
          color: var(--ink);
          cursor: pointer;
          text-align: left;
          -webkit-tap-highlight-color: transparent;
        }
        .name-btn:focus-visible {
          outline: 2px solid var(--cobalto);
          outline-offset: 4px;
          border-radius: 4px;
        }

        .name-edit {
          width: 100%;
        }
        .name-input {
          width: 100%;
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 700;
          font-size: 34px;
          line-height: 1;
          letter-spacing: -0.01em;
          color: var(--ink);
          background: transparent;
          border: none;
          border-bottom: 1.5px solid var(--cobalto);
          padding: 2px 0 6px;
          outline: none;
        }

        .stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          width: 100%;
          margin-top: 10px;
        }
        .stat {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;
        }
        .stat-num {
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 700;
          font-size: 44px;
          line-height: 1;
          letter-spacing: -0.02em;
          color: var(--cobalto);
          font-variant-numeric: tabular-nums;
        }
        .stat-num-emo {
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 700;
          font-size: 22px;
          line-height: 1.1;
          letter-spacing: -0.01em;
          color: var(--cobalto);
          text-transform: lowercase;
        }
        /* stat-emo-cell removed: emotion stat is now a regular cell in the 6-cell grid */
        .stat-eyebrow {
          font-size: 9.5px;
          opacity: 0.55;
        }

        .block {
          margin-bottom: 28px;
        }
        .block-eyebrow {
          display: block;
          margin-bottom: 12px;
        }

        .link-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .link-card {
          display: flex;
          width: 100%;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 14px 16px;
          background: var(--crema-soft);
          color: var(--ink);
          border: 1px solid rgba(13, 15, 61, 0.08);
          border-radius: var(--r-md);
          font: inherit;
          text-align: left;
          cursor: pointer;
          text-decoration: none;
          transition: transform 0.12s ease, border-color 0.15s ease, background 0.15s ease;
          -webkit-tap-highlight-color: transparent;
        }
        .link-card:active {
          transform: scale(0.99);
        }
        .link-card:hover {
          border-color: rgba(13, 15, 61, 0.18);
        }
        .link-card:focus-visible {
          outline: 2px solid var(--cobalto);
          outline-offset: 2px;
        }
        .link-card-anchor { display: flex; }
        .link-label {
          font-family: var(--font-body);
          font-size: 14px;
          font-weight: 500;
        }
        .link-value {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          opacity: 0.6;
          max-width: 55%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          text-align: right;
        }

        .link-toggle {
          display: inline-flex;
          gap: 4px;
          background: rgba(13, 15, 61, 0.08);
          border-radius: var(--r-pill);
          padding: 3px;
        }
        .tog {
          font-family: var(--font-mono);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.18em;
          padding: 4px 10px;
          border-radius: var(--r-pill);
          color: var(--ink);
          opacity: 0.55;
        }
        .tog.on {
          background: var(--cobalto);
          color: var(--crema);
          opacity: 1;
        }

        .privacy-card {
          margin-bottom: 10px;
          padding: 18px 20px;
        }
        .privacy-pill {
          background: var(--cobalto);
          color: var(--crema);
        }
        .privacy-title {
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 600;
          font-size: 20px;
          line-height: 1.2;
          margin-top: 14px;
          color: var(--cobalto);
        }
        .privacy-sub {
          font-family: var(--font-body);
          font-size: 13px;
          line-height: 1.45;
          opacity: 0.75;
          margin-top: 6px;
        }

        .pro-card {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 6px;
          width: 100%;
          padding: 18px 20px;
          margin-bottom: 12px;
          background: var(--cobalto);
          color: var(--crema);
          border: none;
          border-radius: var(--r-md);
          text-align: left;
          cursor: pointer;
          box-shadow: 0 18px 40px rgba(29, 43, 219, 0.32);
          transition: transform 0.12s ease, box-shadow 0.15s ease;
          -webkit-tap-highlight-color: transparent;
        }
        .pro-card:active {
          transform: scale(0.99);
        }
        .pro-card:focus-visible {
          outline: 2px solid var(--accent);
          outline-offset: 3px;
        }
        .pro-pill {
          position: absolute;
          top: 14px;
          right: 14px;
          background: var(--pill-yellow);
          color: var(--ink);
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: var(--r-pill);
          font-weight: 700;
        }
        .pro-title {
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 700;
          font-size: 20px;
          line-height: 1.1;
          letter-spacing: -0.01em;
          color: var(--crema);
          padding-right: 70px;
        }
        .pro-sub {
          font-family: var(--font-body);
          font-size: 12px;
          line-height: 1.45;
          color: var(--crema);
          opacity: 0.82;
        }

        .danger-eyebrow {
          color: var(--accent-deep);
          opacity: 0.7;
        }
        .link-card-danger {
          background: transparent;
          border: 1px dashed rgba(184, 74, 38, 0.4);
          color: var(--accent-deep);
        }
        .link-card-danger:hover {
          border-color: var(--accent);
        }
        .link-card-danger .link-value {
          color: var(--accent-deep);
          opacity: 0.8;
        }

        .foot {
          margin-top: 8px;
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--ink);
          opacity: 0.5;
          text-align: center;
        }

        /* ── sparkline ── */
        .sparkline-wrap {
          width: 100%;
          margin-top: 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .sparkline-eyebrow {
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          opacity: 0.4;
        }
        .sparkline-svg {
          width: 100%;
          height: 44px;
          display: block;
          overflow: visible;
        }

        /* ── reminder ── */
        .reminder-row { list-style: none; }
        .reminder-toggle { width: 100%; }
        .reminder-badge {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.16em;
          padding: 3px 9px;
          border-radius: 99px;
          background: rgba(13, 15, 61, 0.08);
          color: rgba(13, 15, 61, 0.45);
          transition: background 0.15s, color 0.15s;
        }
        .reminder-badge.on {
          background: var(--cobalto);
          color: var(--crema);
        }
        .reminder-time-row {
          padding: 10px 14px 12px;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 10px;
          border-top: 1px solid rgba(13, 15, 61, 0.08);
          background: rgba(29, 43, 219, 0.03);
        }
        .reminder-time-label {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          opacity: 0.55;
        }
        .reminder-time-input {
          font-family: var(--font-mono);
          font-size: 14px;
          padding: 6px 10px;
          border: 1.5px solid rgba(13, 15, 61, 0.18);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.7);
          color: var(--ink);
          outline: none;
          transition: border-color 0.15s;
        }
        .reminder-time-input:focus { border-color: var(--cobalto); }
        .reminder-note {
          width: 100%;
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.06em;
          line-height: 1.45;
          opacity: 0.5;
          margin: 0;
        }
      `}</style>
    </Screen>
  );
}
