/**
 * Dream Catcher — storage + visual params.
 *
 * Concepto: el usuario describe un sueño al despertar (texto + colores
 * percibidos + emociones + sensaciones físicas). La app "recrea" el
 * sueño con un visual generativo (gradient orgánico animado en canvas
 * + partículas) basado en los parámetros.
 *
 * No usa IA real (no hay backend ni API key). El "build" del sueño se
 * hace en local — un seed determinístico desde el texto produce siempre
 * el mismo visual para el mismo input. Esto convierte el texto en una
 * "huella visual" estable de cada sueño.
 *
 * Persistencia: localStorage `egoera-dreams-v1`.
 */

export type DreamFeeling =
  | 'serenidad' | 'angustia' | 'curiosidad' | 'nostalgia'
  | 'miedo' | 'placer' | 'extrañeza' | 'libertad';

export type DreamPalette =
  | 'aurora'      // rosa + violeta + azul (PlantCare-style aurora)
  | 'sunset'      // naranja + mostaza + coral
  | 'underwater'  // turquesa + azul profundo + cyan
  | 'forest'      // verdes + amarillos suaves
  | 'fog'         // grises + lavanda + crema
  | 'fire'        // rojo + ámbar + negro
  | 'snow'        // blanco + azul pálido + plata
  | 'cosmos';     // morado + azul profundo + dorado

export type Dream = {
  id: string;
  createdAt: string;             // ISO — cuándo se anotó
  occurredAt: string;            // ISO — cuándo se soñó (típicamente noche anterior)
  text: string;                  // descripción libre del sueño
  feelings: DreamFeeling[];      // emociones sentidas
  palette: DreamPalette;         // paleta visual elegida
  intensity: number;             // 1..5 (cuán vívido fue)
  recurring: boolean;            // ¿es recurrente?
  seed: string;                  // string usado para generar el visual
  render: DreamRender;           // parámetros computados del visual
  ready: boolean;                // false = "recreating..." / true = ya listo
  readyAt?: string;              // ISO cuando se completó el render
};

/** Parámetros derivados del seed que el canvas usa para pintar. */
export type DreamRender = {
  blobs: { x: number; y: number; r: number; hue: number; alpha: number }[];
  particles: number;
  blur: number;          // px
  rotation: number;      // grados rotación lenta
  pulseMs: number;       // duración del pulso
};

const KEY = 'egoera-dreams-v1';

export const PALETTES: { id: DreamPalette; label: string; stops: string[] }[] = [
  { id: 'aurora',     label: 'Aurora',     stops: ['#f5b89a', '#c089d4', '#7a9ee0'] },
  { id: 'sunset',     label: 'Atardecer',  stops: ['#f4c842', '#d97757', '#9d3f3f'] },
  { id: 'underwater', label: 'Bajo agua',  stops: ['#7ad3d3', '#3a7cb8', '#142b4c'] },
  { id: 'forest',     label: 'Bosque',     stops: ['#c8d49b', '#7a9573', '#3d5a3e'] },
  { id: 'fog',        label: 'Niebla',     stops: ['#e6dcc9', '#b8b0c2', '#85839a'] },
  { id: 'fire',       label: 'Fuego',      stops: ['#f4c842', '#d97757', '#1a0a0a'] },
  { id: 'snow',       label: 'Nieve',      stops: ['#ffffff', '#d6e3f8', '#a8c2f0'] },
  { id: 'cosmos',     label: 'Cosmos',     stops: ['#f4c842', '#7a4fb8', '#0a0a40'] },
];

export const FEELINGS: { id: DreamFeeling; label: string }[] = [
  { id: 'serenidad',  label: 'Serenidad' },
  { id: 'angustia',   label: 'Angustia' },
  { id: 'curiosidad', label: 'Curiosidad' },
  { id: 'nostalgia',  label: 'Nostalgia' },
  { id: 'miedo',      label: 'Miedo' },
  { id: 'placer',     label: 'Placer' },
  { id: 'extrañeza',  label: 'Extrañeza' },
  { id: 'libertad',   label: 'Libertad' },
];

// ─── Seed / hash determinista ─────────────────────────────────────────
function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Computa los parámetros visuales del sueño a partir de un seed. */
export function computeRender(seed: string, intensity: number = 3): DreamRender {
  const rnd = mulberry32(hashString(seed));
  const blobCount = 3 + Math.floor(rnd() * 3); // 3-5 blobs
  const blobs = Array.from({ length: blobCount }, (_, i) => ({
    x: 20 + rnd() * 60,             // % horizontal
    y: 20 + rnd() * 60,             // % vertical
    r: 30 + rnd() * 30,             // radio %
    hue: i / blobCount,             // posición en gradient (0-1)
    alpha: 0.55 + rnd() * 0.35,     // opacidad
  }));
  return {
    blobs,
    particles: 12 + Math.floor(intensity * 8),  // 20-52 partículas según intensidad
    blur: 38 + Math.floor(rnd() * 24),
    rotation: rnd() * 30 - 15,
    pulseMs: 4200 + Math.floor(rnd() * 2400),   // 4.2-6.6s
  };
}

// ─── Storage ──────────────────────────────────────────────────────────
export function loadDreams(): Dream[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Dream[]) : [];
  } catch {
    return [];
  }
}

export function saveDream(d: Dream): void {
  if (typeof window === 'undefined') return;
  const all = loadDreams();
  all.unshift(d);
  window.localStorage.setItem(KEY, JSON.stringify(all));
}

export function updateDream(updated: Dream): void {
  if (typeof window === 'undefined') return;
  const all = loadDreams().map(d => (d.id === updated.id ? updated : d));
  window.localStorage.setItem(KEY, JSON.stringify(all));
}

export function deleteDream(id: string): void {
  if (typeof window === 'undefined') return;
  const all = loadDreams().filter(d => d.id !== id);
  window.localStorage.setItem(KEY, JSON.stringify(all));
}

export function makeDreamId(): string {
  return `D-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function dreamNumber(): number {
  // ID "Dream #2481" — pseudo-secuencial por hash de timestamp
  const all = loadDreams();
  return 2481 + all.length;
}

/** Marca un dream como ready tras un "build" simulado. */
export function markReady(id: string): void {
  const all = loadDreams();
  const d = all.find(x => x.id === id);
  if (!d) return;
  d.ready = true;
  d.readyAt = new Date().toISOString();
  updateDream(d);
}

export function unreadyDreams(): Dream[] {
  return loadDreams().filter(d => !d.ready);
}

export function readyDreams(): Dream[] {
  return loadDreams().filter(d => d.ready);
}

/** Formato fecha estilo "Last night 03:17 AM" / "May 18". */
export function formatDreamTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffH = diffMs / 3600000;
  if (diffH < 14) {
    const time = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true });
    return `Anoche · ${time}`;
  }
  const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

export function paletteStops(p: DreamPalette): string[] {
  return PALETTES.find(x => x.id === p)?.stops ?? PALETTES[0].stops;
}
