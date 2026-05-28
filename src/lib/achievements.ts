/**
 * Sistema de logros del Hub Recursos.
 *
 * Cada logro lee del storage existente (sin tabla nueva). Se calcula al vuelo
 * basado en entries del diario, cuadernos completados, cartas escritas, etc.
 *
 * Diseño: 8 logros visibles (4×2 grid), 5 desbloqueables hoy, 3 aspiracionales.
 */

import { loadEntries, streakDays } from './storage';
import { CUADERNOS } from './cuadernos-data';
import { getState as getCuadernoState, isFinished } from './cuadernos-storage';

export type Achievement = {
  id: string;
  label: string;
  desc: string;
  icon: string; // 1-3 caracteres unicode
  unlocked: boolean;
  progress?: { current: number; total: number };
  color: 'cobalto' | 'coral' | 'mostaza' | 'crema';
};

export type AchievementsSummary = {
  unlocked: number;
  total: number;
  pct: number;
  xp: number; // 10 por logro desbloqueado
  achievements: Achievement[];
};

function safeLocalStorage(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function countLetters(): number {
  const raw = safeLocalStorage('egoera-letters-v1');
  if (!raw) return 0;
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.length : 0;
  } catch {
    return 0;
  }
}

function countCuadernosFinished(): number {
  return CUADERNOS.filter((c) => isFinished(c.meta.slug)).length;
}

function countCuadernosStarted(): number {
  return CUADERNOS.filter((c) => {
    const s = getCuadernoState(c.meta.slug);
    return s.pageIndex > 0 || s.completedPages.length > 0;
  }).length;
}

function countCuadernosBridgedEntries(): number {
  const entries = loadEntries();
  return entries.filter((e) => e.text && e.text.toLowerCase().includes('desde el cuaderno')).length;
}

export function computeAchievements(): AchievementsSummary {
  const entries = loadEntries();
  const totalEntries = entries.length;
  const streak = streakDays();
  const letters = countLetters();
  const finished = countCuadernosFinished();
  const started = countCuadernosStarted();
  const bridges = countCuadernosBridgedEntries();

  const achievements: Achievement[] = [
    {
      id: 'first-entry',
      label: 'Primera vez',
      desc: 'Has escrito tu primera entrada del diario.',
      icon: '·',
      color: 'cobalto',
      unlocked: totalEntries >= 1,
    },
    {
      id: 'week-streak',
      label: 'Una semana',
      desc: '7 días seguidos escribiendo.',
      icon: '7',
      color: 'mostaza',
      unlocked: streak >= 7,
      progress: { current: Math.min(streak, 7), total: 7 },
    },
    {
      id: 'first-letter',
      label: 'Carta enviada',
      desc: 'Has escrito una carta a tu yo futuro.',
      icon: '✉',
      color: 'coral',
      unlocked: letters >= 1,
    },
    {
      id: 'cuaderno-started',
      label: 'Abriste cuaderno',
      desc: 'Has empezado a leer un cuaderno.',
      icon: '◇',
      color: 'cobalto',
      unlocked: started >= 1,
    },
    {
      id: 'cuaderno-finished',
      label: 'Cuaderno completo',
      desc: 'Has terminado un cuaderno entero.',
      icon: '✓',
      color: 'mostaza',
      unlocked: finished >= 1,
    },
    {
      id: 'cuaderno-bridge',
      label: 'Puente',
      desc: 'Has guardado en tu diario algo del cuaderno.',
      icon: '↗',
      color: 'coral',
      unlocked: bridges >= 1,
    },
    {
      id: 'three-cuadernos',
      label: 'Tres cuadernos',
      desc: 'Has terminado tres cuadernos diferentes.',
      icon: '3',
      color: 'cobalto',
      unlocked: finished >= 3,
      progress: { current: Math.min(finished, 3), total: 3 },
    },
    {
      id: 'thirty-entries',
      label: 'Un mes contigo',
      desc: '30 entradas escritas en total.',
      icon: '30',
      color: 'mostaza',
      unlocked: totalEntries >= 30,
      progress: { current: Math.min(totalEntries, 30), total: 30 },
    },
  ];

  const unlocked = achievements.filter((a) => a.unlocked).length;
  return {
    unlocked,
    total: achievements.length,
    pct: Math.round((unlocked / achievements.length) * 100),
    xp: unlocked * 10,
    achievements,
  };
}
