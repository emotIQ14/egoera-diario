/**
 * Catálogo de actividades de trabajo personal + helpers de progreso.
 * Persistencia en localStorage, alineado con storage.ts.
 */

export type ActivityKind = 'respiracion' | 'cuerpo' | 'escritura' | 'ritual';

export type Activity = {
  id: string;
  title: string;
  kind: ActivityKind;
  minutes: number;
  body: string;          // descripción / instrucción
  region?: string;       // estructura cerebral asociada (informativo)
  intent: string;        // qué se trabaja (chip corto)
};

export const ACTIVITY_KINDS: { id: ActivityKind; label: string; tone: string }[] = [
  { id: 'respiracion', label: 'Respiración', tone: 'cobalto' },
  { id: 'cuerpo',      label: 'Cuerpo',      tone: 'accent'  },
  { id: 'escritura',   label: 'Escritura',   tone: 'cream'   },
  { id: 'ritual',      label: 'Ritual',      tone: 'ink'     },
];

export const ACTIVITIES: Activity[] = [
  // ── Respiración ─────────────────────────────────────────────
  {
    id: 'respiracion-478',
    title: 'Respiración 4-7-8',
    kind: 'respiracion',
    minutes: 3,
    intent: 'calmar el sistema',
    region: 'amígdala',
    body: 'Inhala por la nariz contando hasta 4. Retén el aire 7 segundos. Exhala lentamente por la boca contando hasta 8. Tres ciclos completos. Ralentiza el sistema nervioso sin medicación.',
  },
  {
    id: 'box-breathing',
    title: 'Caja 4-4-4-4',
    kind: 'respiracion',
    minutes: 4,
    intent: 'volver al centro',
    region: 'amígdala',
    body: 'Inhala 4 · sostén 4 · exhala 4 · sostén 4. Cinco ciclos visualizando un cuadrado. Lo usan los Navy SEAL antes de operaciones — funciona porque sincroniza ritmo y atención.',
  },
  {
    id: 'suspiro-fisiologico',
    title: 'Suspiro fisiológico',
    kind: 'respiracion',
    minutes: 2,
    intent: 'soltar tensión rápida',
    region: 'sistema autónomo',
    body: 'Dos inhalaciones cortas por la nariz, una exhalación larga por la boca. Tres veces. Es el atajo que el cuerpo usa cuando llora; lo provocas consciente y baja el cortisol en 1 minuto.',
  },

  // ── Cuerpo ──────────────────────────────────────────────────
  {
    id: 'anclaje-54321',
    title: 'Anclaje 5-4-3-2-1',
    kind: 'cuerpo',
    minutes: 4,
    intent: 'salir del bucle mental',
    region: 'corteza sensorial',
    body: 'Cinco cosas que ves. Cuatro que tocas. Tres que oyes. Dos que hueles. Una que saboreas. Devuelve el sistema nervioso al presente cuando la rumiación se desborda.',
  },
  {
    id: 'cubito-hielo',
    title: 'El cubito de hielo',
    kind: 'cuerpo',
    minutes: 2,
    intent: 'cortar disociación',
    region: 'ínsula',
    body: 'Sostén un cubito de hielo en la mano hasta que el frío sea lo único que ocupe tu cabeza. Atajo somático cuando la cabeza se va a un sitio donde no quieres estar.',
  },
  {
    id: 'escaneo-corporal',
    title: 'Escaneo corporal',
    kind: 'cuerpo',
    minutes: 10,
    intent: 'escuchar al cuerpo',
    region: 'ínsula',
    body: 'Tumbado o tumbada, recorre el cuerpo desde la coronilla a los pies. No corriges, no juzgas. Solo notas dónde hay tensión y dónde no. Diez minutos.',
  },
  {
    id: 'movimiento-minimo',
    title: 'Movimiento mínimo',
    kind: 'cuerpo',
    minutes: 5,
    intent: 'reconectar',
    region: 'cerebelo',
    body: 'Pon una canción que te guste. Cierra los ojos. Deja que el cuerpo se mueva como necesite, no como creas que debería. Cinco minutos. El cuerpo recuerda lo que la cabeza olvida.',
  },

  // ── Escritura ───────────────────────────────────────────────
  {
    id: 'carta-yo-cinco-anos',
    title: 'Carta al yo de hace 5 años',
    kind: 'escritura',
    minutes: 15,
    intent: 'integrar el pasado',
    region: 'hipocampo',
    body: 'Una hoja, sin pensar. Lo que te hubiera gustado saber entonces. Cuando termines, léela en voz alta. Vas a oírte distinto.',
  },
  {
    id: 'tres-valores-traicion',
    title: 'Tres valores y una traición',
    kind: 'escritura',
    minutes: 10,
    intent: 'verte sin juzgarte',
    region: 'corteza prefrontal',
    body: 'Nombra tres valores que te definen y una vez en que los traicionaste sin darte cuenta. No es para flagelarte: es para verlos.',
  },
  {
    id: 'carta-sin-enviar',
    title: 'Carta sin enviar',
    kind: 'escritura',
    minutes: 20,
    intent: 'cerrar bucles',
    region: 'corteza prefrontal',
    body: 'Escribe lo que no le has podido decir a alguien. Guárdala 24 horas. Pasado ese tiempo, decides si enviar, romper o conservar. Pero escríbela hoy.',
  },
  {
    id: 'mapa-vinculo',
    title: 'Mapa del vínculo',
    kind: 'escritura',
    minutes: 15,
    intent: 'ver tu red',
    region: 'núcleo accumbens',
    body: 'Dibuja un círculo y sitúa dentro a las personas que te sostienen, fuera a las que te tensan. Mira quién está en el borde. Suele decir mucho.',
  },

  // ── Ritual ──────────────────────────────────────────────────
  {
    id: 'testigo-silencioso',
    title: 'El testigo silencioso',
    kind: 'ritual',
    minutes: 10,
    intent: 'observar sin reaccionar',
    region: 'corteza prefrontal',
    body: 'Diez minutos observando tus pensamientos como nubes que pasan. No los persigues, no los empujas. Solo miras de qué color son hoy.',
  },
  {
    id: 'ritual-cierre',
    title: 'Ritual de cierre del día',
    kind: 'ritual',
    minutes: 5,
    intent: 'cerrar el día',
    region: 'cerebelo',
    body: 'Tres cosas que solo haces cuando termina el día (apagar la pantalla, anotar lo que sentiste, una respiración larga). Avisas al cuerpo de que puede descansar.',
  },
  {
    id: 'micro-rutina',
    title: 'Micro-rutina de 5 minutos',
    kind: 'ritual',
    minutes: 5,
    intent: 'anclaje matinal',
    region: 'cerebelo',
    body: 'Tres gestos pequeños que harás cada mañana esta semana. Estirar un minuto, beber un vaso de agua, abrir la ventana. Repetidos, importan.',
  },
  {
    id: 'paseo-lento',
    title: 'Paseo lento',
    kind: 'ritual',
    minutes: 10,
    intent: 'regular sin esfuerzo',
    region: 'sistema autónomo',
    body: 'Diez minutos al sol, sin móvil, sin objetivo. Caminar despacio. El sistema nervioso lo agradece como pocas cosas.',
  },
  {
    id: 'tres-cosas-propias',
    title: 'Tres cosas que te das tú',
    kind: 'ritual',
    minutes: 8,
    intent: 'autoacompañarte',
    region: 'núcleo accumbens',
    body: 'Lista tres formas en que te acompañas sin necesitar a nadie. Si no encuentras tres, escribe una y comprométete a inventar las otras dos esta semana.',
  },
];

// ── Storage ──────────────────────────────────────────────────────

const KEY = 'egoera-activities-completions-v1';

export type ActivityCompletion = {
  activityId: string;
  completedAt: string; // ISO
};

export function loadCompletions(): ActivityCompletion[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ActivityCompletion[]) : [];
  } catch {
    return [];
  }
}

export function markActivityDone(activityId: string): ActivityCompletion {
  const c: ActivityCompletion = { activityId, completedAt: new Date().toISOString() };
  if (typeof window === 'undefined') return c;
  const all = loadCompletions();
  all.unshift(c);
  window.localStorage.setItem(KEY, JSON.stringify(all));
  return c;
}

export function undoActivity(activityId: string, completedAt: string): void {
  if (typeof window === 'undefined') return;
  const all = loadCompletions().filter(
    (c) => !(c.activityId === activityId && c.completedAt === completedAt)
  );
  window.localStorage.setItem(KEY, JSON.stringify(all));
}

export function completionsThisWeek(): ActivityCompletion[] {
  const now = new Date();
  const day = now.getDay() || 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day - 1));
  monday.setHours(0, 0, 0, 0);
  return loadCompletions().filter((c) => new Date(c.completedAt) >= monday);
}

export function totalMinutesThisWeek(): number {
  const ids = completionsThisWeek().map((c) => c.activityId);
  return ids.reduce((sum, id) => {
    const a = ACTIVITIES.find((x) => x.id === id);
    return sum + (a?.minutes ?? 0);
  }, 0);
}

export function isCompletedToday(activityId: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return loadCompletions().some((c) => {
    if (c.activityId !== activityId) return false;
    const d = new Date(c.completedAt);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  });
}

export function timesCompleted(activityId: string): number {
  return loadCompletions().filter((c) => c.activityId === activityId).length;
}
