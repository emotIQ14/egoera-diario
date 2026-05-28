/**
 * Catálogo de ejercicios sueltos del Hub Recursos.
 *
 * Ejercicios extraídos de los cuadernos para hacerlos en 3-10 min sin
 * comprometerse al cuaderno entero. Cada uno apunta a su cuaderno padre.
 *
 * Inspirado en HTML "Diario Recurso" sección "Otros recursos".
 */

export type ExerciseCatalogEntry = {
  id: string;
  title: string;
  duration: string;
  type: 'ejercicio' | 'lectura' | 'pausa';
  kicker: string; // tag inicial pequeño
  fromCuaderno: { slug: string; title: string };
  pageIndex: number; // página del cuaderno
  icon: string;
  color: 'cobalto' | 'coral' | 'mostaza';
};

export const EXERCISES_CATALOG: ExerciseCatalogEntry[] = [
  {
    id: 'notar-sin-etiqueta',
    title: 'Notar sin etiqueta',
    duration: '5 min',
    type: 'ejercicio',
    kicker: 'Día 1 · de 5',
    fromCuaderno: { slug: 'hipervigilancia', title: 'Hipervigilancia' },
    pageIndex: 4,
    icon: '·',
    color: 'cobalto',
  },
  {
    id: 'cuerpo-primero',
    title: 'El cuerpo primero',
    duration: '5 min',
    type: 'ejercicio',
    kicker: 'Día 4 · de 5',
    fromCuaderno: { slug: 'hipervigilancia', title: 'Hipervigilancia' },
    pageIndex: 9,
    icon: '◯',
    color: 'mostaza',
  },
  {
    id: 'tu-ratio-personal',
    title: 'Tu ratio personal de pareja',
    duration: '7 días',
    type: 'ejercicio',
    kicker: 'Gottman 5:1',
    fromCuaderno: { slug: 'reparar-gottman', title: 'Reparar · Gottman' },
    pageIndex: 4,
    icon: '5:1',
    color: 'coral',
  },
  {
    id: 'tu-mapa-cuidado',
    title: 'Tu mapa de cuidado',
    duration: '~15 min',
    type: 'ejercicio',
    kicker: 'Lenguajes del amor',
    fromCuaderno: { slug: 'lenguajes-amor', title: 'Los lenguajes del amor' },
    pageIndex: 6,
    icon: '♡',
    color: 'coral',
  },
  {
    id: 'diez-emociones-semana',
    title: 'Las diez de la semana',
    duration: '~10 min',
    type: 'ejercicio',
    kicker: 'Día 1 · de 4',
    fromCuaderno: { slug: 'mapa-emociones', title: 'El mapa de tus emociones' },
    pageIndex: 4,
    icon: '10',
    color: 'mostaza',
  },
  {
    id: 'carta-tres-emociones',
    title: 'Carta a tres emociones',
    duration: '~15 min',
    type: 'ejercicio',
    kicker: 'Día 3 · de 4',
    fromCuaderno: { slug: 'mapa-emociones', title: 'El mapa de tus emociones' },
    pageIndex: 9,
    icon: '✉',
    color: 'cobalto',
  },
  {
    id: 'linea-de-vida',
    title: 'La línea de vida',
    duration: '~20 min',
    type: 'ejercicio',
    kicker: 'Fortalezas',
    fromCuaderno: { slug: 'fortalezas-linea-vida', title: 'Tus fortalezas' },
    pageIndex: 6,
    icon: '⌇',
    color: 'mostaza',
  },
  {
    id: 'pausa-narradora',
    title: 'No estás siendo intensa',
    duration: 'pausa',
    type: 'pausa',
    kicker: 'Cita interna',
    fromCuaderno: { slug: 'hipervigilancia', title: 'Hipervigilancia' },
    pageIndex: 6,
    icon: '"',
    color: 'coral',
  },
];
