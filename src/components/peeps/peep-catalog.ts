/**
 * Catálogo de ilustraciones del diario.
 *
 * Tres familias:
 *  - amigas   → 10 personajes recurrentes con personalidad emocional
 *  - ifs      → 10 partes IFS (estados internos concretos)
 *  - arq      → 4 arquetipos IFS (estructura: Self, Manager, Firefighter, Exiliado)
 *
 * Cada entrada documenta:
 *  - id       → nombre del archivo (sin extensión) en /public/peeps/<folder>/
 *  - label    → nombre legible
 *  - tagline  → 1 línea de personalidad / significado
 *  - emotions → emociones para las que es buen avatar
 *  - context  → en qué pantallas del diario usarla
 */

export type PeepFolder = 'amigas' | 'ifs' | 'arquetipos';

export interface PeepEntry {
  id: string;
  folder: PeepFolder;
  label: string;
  tagline: string;
  emotions: string[];
  context: string[];
}

export const AMIGAS: Record<string, PeepEntry> = {
  nora: {
    id: 'nora',
    folder: 'amigas',
    label: 'Nora',
    tagline: 'La curiosa que da la bienvenida.',
    emotions: ['curiosidad', 'apertura', 'esperanza'],
    context: ['onboarding paso 1', 'onboarding paso 6 (nombre)', 'empty state /diario'],
  },
  lola: {
    id: 'lola',
    folder: 'amigas',
    label: 'Lola',
    tagline: 'La ansiosa que revisa el móvil 40 veces.',
    emotions: ['ansiedad', 'urgencia', 'inquietud'],
    context: ['onboarding paso 2', 'onboarding paso 5 (D7)', 'pattern card de ansiedad anticipatoria'],
  },
  mau: {
    id: 'mau',
    folder: 'amigas',
    label: 'Mau',
    tagline: 'La que llegó al final del viaje y respira.',
    emotions: ['calma', 'integración', 'descanso'],
    context: ['onboarding paso 5 (D30)', 'cierre de sesión diaria', 'logro de racha'],
  },
  iris: {
    id: 'iris',
    folder: 'amigas',
    label: 'Iris',
    tagline: 'La insomne. La misma frase a las 3 AM.',
    emotions: ['insomnio', 'pensamiento intrusivo', 'noche'],
    context: ['onboarding paso 2', 'entrada del diario nocturna', 'patrón de rumiación nocturna'],
  },
  teo: {
    id: 'teo',
    folder: 'amigas',
    label: 'Teo',
    tagline: 'El estructurado que pone orden a la lista.',
    emotions: ['claridad', 'método', 'pausa'],
    context: ['onboarding paso 4 (checklist)', 'pantalla de patrones', 'ajustes / orden'],
  },
  june: {
    id: 'june',
    folder: 'amigas',
    label: 'June',
    tagline: 'La rumiadora que llama reflexionar a darle vueltas.',
    emotions: ['rumiación', 'duda', 'sobreanálisis'],
    context: ['onboarding paso 2', 'patrón de rumiación', 'recordatorio "ya pensaste esto ayer"'],
  },
  eva: {
    id: 'eva',
    folder: 'amigas',
    label: 'Eva',
    tagline: 'La cuidadora que sostiene al otro entero.',
    emotions: ['hiperresponsabilidad', 'cuidado', 'cansancio empático'],
    context: ['onboarding paso 2', 'patrón de cuidador compulsivo'],
  },
  oli: {
    id: 'oli',
    folder: 'amigas',
    label: 'Oli',
    tagline: 'La complaciente que dice sí queriendo decir no.',
    emotions: ['complacencia', 'límites borrosos', 'evitación'],
    context: ['onboarding paso 2', 'patrón de complacencia', 'práctica de decir no'],
  },
  mira: {
    id: 'mira',
    folder: 'amigas',
    label: 'Mira',
    tagline: 'La silenciosa que prefiere callar a discutir.',
    emotions: ['retraimiento', 'cierre', 'gratitud silenciosa'],
    context: ['onboarding paso 2', 'onboarding paso 7 (agradecimiento)', 'modo silencio'],
  },
  zuri: {
    id: 'zuri',
    folder: 'amigas',
    label: 'Zuri',
    tagline: 'La sensible que llora por algo «que no era para tanto».',
    emotions: ['sensibilidad alta', 'desborde', 'ternura'],
    context: ['onboarding paso 2', 'entrada del diario con desborde', 'autocompasión'],
  },
};

export const IFS_PARTS: Record<string, PeepEntry> = {
  'critico-interno': {
    id: 'critico-interno',
    folder: 'ifs',
    label: 'Crítico interno',
    tagline: 'La voz que mide, juzga, exige.',
    emotions: ['autocrítica', 'exigencia', 'vergüenza'],
    context: ['pattern card crítico', 'pillar /partes-protectoras-ifs/'],
  },
  perfeccionista: {
    id: 'perfeccionista',
    folder: 'ifs',
    label: 'Perfeccionista',
    tagline: 'Si no es perfecto, no vale.',
    emotions: ['perfeccionismo', 'parálisis', 'control'],
    context: ['pattern card perfeccionismo'],
  },
  complaciente: {
    id: 'complaciente',
    folder: 'ifs',
    label: 'Complaciente',
    tagline: 'Primero los demás, siempre.',
    emotions: ['complacencia', 'pérdida de borde'],
    context: ['pattern card complaciente'],
  },
  'cuidadora-compulsiva': {
    id: 'cuidadora-compulsiva',
    folder: 'ifs',
    label: 'Cuidadora compulsiva',
    tagline: 'Cuidar para no sentir lo propio.',
    emotions: ['hipercuidado', 'evitación'],
    context: ['pattern card cuidadora'],
  },
  'come-para-calmar': {
    id: 'come-para-calmar',
    folder: 'ifs',
    label: 'Come para calmar',
    tagline: 'La emoción se tapa con comida.',
    emotions: ['emotional eating', 'autorregulación oral'],
    context: ['pattern card hambre emocional'],
  },
  procrastinadora: {
    id: 'procrastinadora',
    folder: 'ifs',
    label: 'Procrastinadora',
    tagline: 'Aplazar para no enfrentar.',
    emotions: ['procrastinación', 'parálisis', 'evitación'],
    context: ['pattern card procrastinación'],
  },
  volcan: {
    id: 'volcan',
    folder: 'ifs',
    label: 'Volcán',
    tagline: 'La rabia que estalla cuando ya no cabe.',
    emotions: ['rabia', 'estallido', 'desborde'],
    context: ['pattern card rabia explosiva'],
  },
  'la-que-esta-sola': {
    id: 'la-que-esta-sola',
    folder: 'ifs',
    label: 'La que está sola',
    tagline: 'Mejor sola que mal acompañada — y aun así, duele.',
    emotions: ['soledad', 'autoexilio'],
    context: ['pattern card soledad elegida'],
  },
  'nina-pequena': {
    id: 'nina-pequena',
    folder: 'ifs',
    label: 'Niña pequeña',
    tagline: 'La parte tierna que aún espera ser vista.',
    emotions: ['herida temprana', 'ternura', 'necesidad'],
    context: ['exiliado · pillar IFS', 'práctica de reparentaje'],
  },
  'nino-asustado': {
    id: 'nino-asustado',
    folder: 'ifs',
    label: 'Niño asustado',
    tagline: 'El miedo que se activó hace mucho y sigue ahí.',
    emotions: ['miedo', 'hipervigilancia'],
    context: ['exiliado · pillar IFS', 'pattern card miedo activado'],
  },
};

export const ARQ: Record<string, PeepEntry> = {
  self: {
    id: 'self',
    folder: 'arquetipos',
    label: 'Self',
    tagline: 'El testigo amable. Curioso, calmado, con compasión.',
    emotions: ['presencia', 'centrado', 'curiosidad amable'],
    context: ['onboarding paso 3 (Kabat-Zinn)', 'estado meta de la práctica', 'logro de integración'],
  },
  manager: {
    id: 'manager',
    folder: 'arquetipos',
    label: 'Manager',
    tagline: 'La parte que organiza y previene daños.',
    emotions: ['control proactivo', 'planificación', 'prevención'],
    context: ['onboarding paso 3 (Rosenberg)', 'pattern card managers'],
  },
  firefighter: {
    id: 'firefighter',
    folder: 'arquetipos',
    label: 'Firefighter',
    tagline: 'La parte que apaga el dolor como sea.',
    emotions: ['evasión reactiva', 'impulso', 'numbing'],
    context: ['pattern card firefighter', 'pillar IFS sección firefighter'],
  },
  exiliado: {
    id: 'exiliado',
    folder: 'arquetipos',
    label: 'Exiliado',
    tagline: 'La parte tierna que se mantiene fuera de la vista.',
    emotions: ['herida no integrada', 'vulnerabilidad'],
    context: ['onboarding paso 3 (Bowlby)', 'pillar IFS sección exiliados'],
  },
};

/**
 * Lookup: emoción → peep recomendado.
 * Usado por /diario para sugerir avatar según la emoción que la persona registra.
 */
export const EMOTION_TO_PEEP: Record<string, { folder: PeepFolder; id: string }> = {
  ansiedad: { folder: 'amigas', id: 'lola' },
  insomnio: { folder: 'amigas', id: 'iris' },
  rumiacion: { folder: 'amigas', id: 'june' },
  calma: { folder: 'amigas', id: 'mau' },
  sensibilidad: { folder: 'amigas', id: 'zuri' },
  retraimiento: { folder: 'amigas', id: 'mira' },
  complacencia: { folder: 'amigas', id: 'oli' },
  cuidado: { folder: 'amigas', id: 'eva' },
  curiosidad: { folder: 'amigas', id: 'nora' },
  orden: { folder: 'amigas', id: 'teo' },
  autocritica: { folder: 'ifs', id: 'critico-interno' },
  perfeccionismo: { folder: 'ifs', id: 'perfeccionista' },
  rabia: { folder: 'ifs', id: 'volcan' },
  soledad: { folder: 'ifs', id: 'la-que-esta-sola' },
  miedo: { folder: 'ifs', id: 'nino-asustado' },
  ternura: { folder: 'ifs', id: 'nina-pequena' },
  procrastinacion: { folder: 'ifs', id: 'procrastinadora' },
  hambre_emocional: { folder: 'ifs', id: 'come-para-calmar' },
  presencia: { folder: 'arquetipos', id: 'self' },
};
