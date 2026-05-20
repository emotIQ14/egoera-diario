/**
 * Tipos compartidos entre pantallas.
 */
export type { DiaryEntry, Emotion, Mood, ContextTag } from './storage';

export type EmotionMeta = {
  id: string;
  label: string;
  color: 'cobalto' | 'accent' | 'cream' | 'ink';
};

export type ContextMeta = { id: string; label: string };

export const CONTEXTS: ContextMeta[] = [
  { id: 'trabajo',  label: 'Trabajo' },
  { id: 'familia',  label: 'Familia' },
  { id: 'pareja',   label: 'Pareja' },
  { id: 'salud',    label: 'Salud' },
  { id: 'social',   label: 'Social' },
  { id: 'personal', label: 'Personal' },
];

export const EMOTIONS: EmotionMeta[] = [
  { id: 'cansancio', label: 'Cansancio', color: 'cream' },
  { id: 'calma', label: 'Calma', color: 'cobalto' },
  { id: 'ansiedad', label: 'Ansiedad', color: 'accent' },
  { id: 'tristeza', label: 'Tristeza', color: 'ink' },
  { id: 'esperanza', label: 'Esperanza', color: 'cobalto' },
  { id: 'rabia', label: 'Rabia', color: 'accent' },
  { id: 'miedo', label: 'Miedo', color: 'ink' },
  { id: 'alegria', label: 'Alegría', color: 'cobalto' },
  { id: 'verguenza', label: 'Vergüenza', color: 'cream' },
  { id: 'culpa', label: 'Culpa', color: 'ink' },
];
