/**
 * Tipos compartidos entre pantallas.
 */
export type { DiaryEntry, Emotion, Mood } from './storage';

export type EmotionMeta = {
  id: string;
  label: string;
  color: 'cobalto' | 'accent' | 'cream' | 'ink';
};

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
