/**
 * localStorage wrapper para entradas del diario.
 * Cliente-only. Las pantallas deben envolver el uso con typeof window check.
 */

export type Mood = number; // 0-10

export type Emotion =
  | 'cansancio'
  | 'calma'
  | 'ansiedad'
  | 'tristeza'
  | 'esperanza'
  | 'rabia'
  | 'miedo'
  | 'alegria'
  | 'verguenza'
  | 'culpa';

export type DiaryEntry = {
  id: string;
  createdAt: string; // ISO
  mood: Mood;
  emotions: Emotion[];
  text: string;
  voiceTranscript?: string;
};

const KEY = 'egoera-diario-entries-v1';

export function loadEntries(): DiaryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as DiaryEntry[]) : [];
  } catch {
    return [];
  }
}

export function saveEntry(entry: DiaryEntry): void {
  if (typeof window === 'undefined') return;
  const all = loadEntries();
  all.unshift(entry);
  window.localStorage.setItem(KEY, JSON.stringify(all));
}

export function deleteEntry(id: string): void {
  if (typeof window === 'undefined') return;
  const all = loadEntries().filter((e) => e.id !== id);
  window.localStorage.setItem(KEY, JSON.stringify(all));
}

export function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function entriesThisWeek(): DiaryEntry[] {
  const now = new Date();
  const day = now.getDay() || 7; // 1=lun, 7=dom
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day - 1));
  monday.setHours(0, 0, 0, 0);
  return loadEntries().filter((e) => new Date(e.createdAt) >= monday);
}

export function streakDays(): number {
  const entries = loadEntries();
  if (entries.length === 0) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let streak = 0;
  const seen = new Set<string>();
  for (const e of entries) {
    const d = new Date(e.createdAt);
    d.setHours(0, 0, 0, 0);
    seen.add(d.toISOString().slice(0, 10));
  }
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    if (seen.has(d.toISOString().slice(0, 10))) streak++;
    else break;
  }
  return streak;
}
