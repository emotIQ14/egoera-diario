/**
 * Storage local del progreso de cuadernos.
 * Schema v1 — todo en localStorage, sin backend.
 */

const KEY = 'egoera-cuadernos-v1';

export type CuadernoState = {
  pageIndex: number;
  answers: Record<string, string>; // key = `${pageIndex}-${promptIndex}` o `${pageIndex}-row-col`
  completedPages: number[];
  startedAt: number;
  updatedAt: number;
  finishedAt?: number;
};

export type CuadernosStore = Record<string, CuadernoState>;

function emptyState(): CuadernoState {
  return {
    pageIndex: 0,
    answers: {},
    completedPages: [],
    startedAt: Date.now(),
    updatedAt: Date.now(),
  };
}

function readStore(): CuadernosStore {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    return JSON.parse(raw) as CuadernosStore;
  } catch {
    return {};
  }
}

function writeStore(store: CuadernosStore): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    // quota / privacy mode → ignore
  }
}

export function getState(slug: string): CuadernoState {
  const store = readStore();
  return store[slug] ?? emptyState();
}

export function setState(slug: string, patch: Partial<CuadernoState>): CuadernoState {
  const store = readStore();
  const current = store[slug] ?? emptyState();
  const next: CuadernoState = {
    ...current,
    ...patch,
    answers: { ...current.answers, ...(patch.answers ?? {}) },
    updatedAt: Date.now(),
  };
  store[slug] = next;
  writeStore(store);
  return next;
}

export function setAnswer(slug: string, key: string, value: string): void {
  const store = readStore();
  const current = store[slug] ?? emptyState();
  current.answers[key] = value;
  current.updatedAt = Date.now();
  store[slug] = current;
  writeStore(store);
}

export function markPageCompleted(slug: string, pageIndex: number, total: number): CuadernoState {
  const store = readStore();
  const current = store[slug] ?? emptyState();
  if (!current.completedPages.includes(pageIndex)) {
    current.completedPages = [...current.completedPages, pageIndex];
  }
  current.updatedAt = Date.now();
  if (current.completedPages.length >= total && !current.finishedAt) {
    current.finishedAt = Date.now();
  }
  store[slug] = current;
  writeStore(store);
  return current;
}

export function progressPct(slug: string, total: number): number {
  const s = getState(slug);
  if (total === 0) return 0;
  return Math.min(100, Math.round((s.completedPages.length / total) * 100));
}

export function resetCuaderno(slug: string): void {
  const store = readStore();
  delete store[slug];
  writeStore(store);
}

export function isStarted(slug: string): boolean {
  const store = readStore();
  const s = store[slug];
  if (!s) return false;
  return Object.keys(s.answers).length > 0 || s.completedPages.length > 0 || s.pageIndex > 0;
}

export function isFinished(slug: string): boolean {
  const store = readStore();
  return Boolean(store[slug]?.finishedAt);
}
