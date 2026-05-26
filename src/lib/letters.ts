/**
 * Cartas al futuro — storage + tipos.
 * Inspiración: Future Me / Letterly. Escribes una carta hoy y la app
 * te la "entrega" cuando llega la fecha que tú fijaste.
 *
 * Persistencia: localStorage `egoera-letters-v1`.
 * No hay backend — todo es local. La "entrega" se calcula al cargar
 * la app comparando deliverAt con la fecha actual.
 */

export type LetterStamp =
  | 'cherry-blossom'  // rosa con flores
  | 'butterfly'       // mariposa naranja
  | 'mountain'        // montaña azul
  | 'star'            // estrella mostaza
  | 'wave'            // ola turquesa
  | 'leaf';           // hoja verde

export type LetterColor =
  | '#d97757'  // accent coral
  | '#1d2bdb'  // cobalto
  | '#f4c842'  // mostaza
  | '#0d0f3d'  // ink
  | '#2d8f5f'  // verde
  | '#a8c2f0'; // azul pastel

export type Letter = {
  id: string;
  createdAt: string;     // ISO — cuándo se escribió
  deliverAt: string;     // ISO — cuándo se "abre"
  body: string;
  stamp: LetterStamp;
  color: LetterColor;
  delivered: boolean;    // false = aún programada / true = ya entregada (y leída opcional)
  openedAt?: string;     // ISO cuando el usuario la abrió tras entrega
};

const KEY = 'egoera-letters-v1';

export const STAMPS: { id: LetterStamp; label: string; icon: string }[] = [
  { id: 'cherry-blossom', label: 'Cerezo',    icon: '🌸' },
  { id: 'butterfly',      label: 'Mariposa',  icon: '🦋' },
  { id: 'mountain',       label: 'Montaña',   icon: '⛰️' },
  { id: 'star',           label: 'Estrella',  icon: '✦' },
  { id: 'wave',           label: 'Ola',       icon: '〜' },
  { id: 'leaf',           label: 'Hoja',      icon: '🍃' },
];

export const COLORS: { id: LetterColor; label: string }[] = [
  { id: '#d97757', label: 'Coral'    },
  { id: '#1d2bdb', label: 'Cobalto'  },
  { id: '#f4c842', label: 'Mostaza'  },
  { id: '#0d0f3d', label: 'Tinta'    },
  { id: '#2d8f5f', label: 'Verde'    },
  { id: '#a8c2f0', label: 'Azul pastel' },
];

export function loadLetters(): Letter[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Letter[]) : [];
  } catch {
    return [];
  }
}

export function saveLetter(l: Letter): void {
  if (typeof window === 'undefined') return;
  const all = loadLetters();
  all.unshift(l);
  window.localStorage.setItem(KEY, JSON.stringify(all));
}

export function updateLetter(updated: Letter): void {
  if (typeof window === 'undefined') return;
  const all = loadLetters().map(l => (l.id === updated.id ? updated : l));
  window.localStorage.setItem(KEY, JSON.stringify(all));
}

export function deleteLetter(id: string): void {
  if (typeof window === 'undefined') return;
  const all = loadLetters().filter(l => l.id !== id);
  window.localStorage.setItem(KEY, JSON.stringify(all));
}

export function makeLetterId(): string {
  return `L-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Cartas programadas (futuras), ordenadas por deliverAt ascendente. */
export function scheduledLetters(): Letter[] {
  const now = new Date();
  return loadLetters()
    .filter(l => !l.delivered && new Date(l.deliverAt) > now)
    .sort((a, b) => new Date(a.deliverAt).getTime() - new Date(b.deliverAt).getTime());
}

/** Cartas listas para entregar (deliverAt <= ahora && !delivered). */
export function readyLetters(): Letter[] {
  const now = new Date();
  return loadLetters()
    .filter(l => !l.delivered && new Date(l.deliverAt) <= now)
    .sort((a, b) => new Date(b.deliverAt).getTime() - new Date(a.deliverAt).getTime());
}

/** Cartas ya entregadas (visibles en bandeja). */
export function deliveredLetters(): Letter[] {
  return loadLetters()
    .filter(l => l.delivered)
    .sort((a, b) => new Date(b.deliverAt).getTime() - new Date(a.deliverAt).getTime());
}

/** Marca una carta como entregada (al abrirla). */
export function deliverLetter(id: string): void {
  const all = loadLetters();
  const target = all.find(l => l.id === id);
  if (!target) return;
  target.delivered = true;
  target.openedAt = new Date().toISOString();
  updateLetter(target);
}

/** Mueve automáticamente cartas vencidas a "delivered" (idempotente). */
export function autoDeliverDue(): number {
  const due = readyLetters();
  due.forEach(l => deliverLetter(l.id));
  return due.length;
}

/** Helper: días restantes hasta deliverAt (positivo = futuro, 0 = hoy). */
export function daysUntil(deliverAt: string): number {
  const ms = new Date(deliverAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 86400000));
}

/** Formato fecha amable: "12 oct 2027" / "mañana" / "hoy". */
export function formatDeliveryDate(deliverAt: string): string {
  const d = new Date(deliverAt);
  const diff = daysUntil(deliverAt);
  if (diff === 0) return 'hoy';
  if (diff === 1) return 'mañana';
  if (diff < 30) return `en ${diff} días`;
  const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}
