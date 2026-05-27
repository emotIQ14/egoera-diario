/**
 * Datos de los 5 cuadernos-revista de Egoera.
 *
 * Mismo esquema que el motor Python (egoera_workbook_engine.py) — los datos
 * son la fuente única; la web los renderiza como libro flip + interactivo y
 * el motor Python los rendieriza como PDF descargable.
 *
 * Cada cuaderno = { meta, pages[] }
 * Cada página tiene un tipo (cover, editorial, sumario, section, exercise,
 * quote_break, map_table, closing) y su payload.
 */

export type PageCover = {
  type: 'cover';
  title: string;
  accent: string;
  eyebrow?: string;
  lede: string;
  columns?: { h: string; body: string }[];
};

export type PageEditorial = {
  type: 'editorial';
  h: string;
  body: string[];
  quote?: string;
  quote_src?: string;
};

export type PageSumario = {
  type: 'sumario';
  entries: { n: string; h: string; sub: string }[];
};

export type PageSection = {
  type: 'section';
  n: string;
  kicker: string;
  h: string;
  body: string[];
  bullets?: string[];
  color_accent?: 'mostaza' | 'coral' | 'cobalto';
};

export type PageExercise = {
  type: 'exercise';
  n: string;
  kicker: string;
  h: string;
  intro?: string;
  prompts: string[];
  reflection?: string;
};

export type PageQuoteBreak = {
  type: 'quote_break';
  quote: string;
  src?: string;
};

export type PageMapTable = {
  type: 'map_table';
  h: string;
  intro?: string;
  columns: string[];
  rows: string[];
};

export type PageClosing = {
  type: 'closing';
  h: string;
  body: string[];
  cta_text: string;
  cta_url: string;
};

export type CuadernoPage =
  | PageCover
  | PageEditorial
  | PageSumario
  | PageSection
  | PageExercise
  | PageQuoteBreak
  | PageMapTable
  | PageClosing;

export type CuadernoMeta = {
  title: string;
  subtitle: string;
  issue: string;
  slug: string;
  pdfUrl: string;
  duration: string;
  topic: string;
  postUrl?: string;
};

export type Cuaderno = {
  meta: CuadernoMeta;
  pages: CuadernoPage[];
};

// ─── Cuaderno #1 — Hipervigilancia ─────────────────────────────────────────

const HIPERVIGILANCIA: Cuaderno = {
  meta: {
    title: 'Hipervigilancia',
    subtitle: '7 días contigo',
    issue: 'Cuaderno nº 1',
    slug: 'hipervigilancia',
    pdfUrl: '/cuadernos/egoera-cuaderno-01-hipervigilancia.pdf',
    duration: '7 días · 5 min/día',
    topic: 'Sistema nervioso',
    postUrl: 'https://egoera.es/hipervigilancia-pendiente-todo-personalidad/',
  },
  pages: [
    {
      type: 'cover',
      title: 'Hipervigilancia.',
      accent: 'contigo.',
      eyebrow: '— EGOERA · CUADERNO Nº 1 · MAYO 2026 —',
      lede:
        'Un cuaderno de siete días para notar — sin juzgar — los momentos en los que tu sistema escanea y los espacios en los que ya puede descansar.',
      columns: [
        { h: 'NOTAR', body: 'Cinco minutos al día. Sin orden. Cinco días con prompts breves.' },
        { h: 'NOMBRAR', body: 'Dos páginas teóricas para entender qué hace tu sistema nervioso.' },
        { h: 'CERRAR', body: 'Un mapa semanal de cierre y un enlace al diario emocional.' },
      ],
    },
    {
      type: 'editorial',
      h: 'Antes de empezar.',
      body: [
        'La hipervigilancia no es un rasgo de carácter. Es una respuesta del sistema nervioso que tu cuerpo aprendió cuando no podía permitirse no mirar. La amígdala se quedó con el dial en «quizá» — el peor de los tres ajustes posibles.',
        'Veinte años después sigues escaneando habitaciones que ya son seguras. Lo confundes con sensibilidad, con detallismo, con ser empática. Pero la sensibilidad descansa cuando hay seguridad. La hipervigilancia no descansa nunca.',
        'Lo que vas a hacer estas páginas no es curar nada. Es notar. Notar es el primer paso de los tres que importan: notar · nombrar · regular. En ese orden. Sin saltarse el primero.',
        'Lo que escribas aquí no tiene que sonar bonito. No tiene que ser cierto del todo. Tiene que ser tuyo.',
      ],
      quote: 'Notar es desactivar la alarma sin discutirla.',
      quote_src: 'REGLA INTERNA',
    },
    {
      type: 'sumario',
      entries: [
        { n: '01', h: 'Qué es la hipervigilancia', sub: 'No un rasgo; una respuesta del sistema nervioso.' },
        { n: '02', h: 'Día 1 · Notar sin etiqueta', sub: 'Frecuencia antes que significado.' },
        { n: '03', h: 'Día 2 · Reconocer la voz', sub: 'La narradora interna del escaneo.' },
        { n: '04', h: 'La amígdala en «quizá»', sub: 'Por qué el dial no descansa nunca.' },
        { n: '05', h: 'Día 3 · Nombrar al sistema', sub: 'Distancia entre tú y la respuesta.' },
        { n: '06', h: 'Día 4 · El cuerpo primero', sub: 'Cinco minutos antes que cualquier idea.' },
        { n: '07', h: 'Día 5 · Lo que no es tuyo', sub: 'Cargas heredadas y prestadas.' },
        { n: '08', h: 'Mapa de la semana', sub: 'Una tabla para mirar el conjunto.' },
      ],
    },
    {
      type: 'section',
      n: '01',
      kicker: 'TEORÍA · DE 7',
      h: 'Qué es la hipervigilancia.',
      color_accent: 'mostaza',
      body: [
        'La hipervigilancia es un estado mantenido de alerta del sistema nervioso autónomo. No es ansiedad — aunque a veces vienen juntas. No es estrés — aunque el estrés crónico la alimenta. Es un patrón de escaneo: el cuerpo busca señales de amenaza incluso cuando no las hay.',
        'Tres cosas la activaron en algún momento de tu vida: necesidad de predecir el estado de ánimo de alguien importante; vivir en un entorno donde la calma podía romperse sin aviso; o aprender, muy pronto, que era más seguro mirar el contexto que mirarte a ti.',
      ],
      bullets: [
        'No es debilidad — es eficiencia mal calibrada.',
        'No se discute con argumentos: se desactiva con experiencia repetida de seguridad.',
        'Los tres pasos son notar · nombrar · regular. En ese orden.',
      ],
    },
    {
      type: 'exercise',
      n: '02',
      kicker: 'DÍA 1 · DE 5',
      h: 'Notar sin etiqueta.',
      intro:
        'Hoy no buscas significado. Buscas frecuencia. Cuenta — con palitos, con un widget en el móvil, en una libreta — cuántas veces te das cuenta de que tu cuerpo está escaneando. No las anules. No las celebres. Solo cuenta.',
      prompts: [
        'Apunta tres momentos de escaneo de hoy:',
        '¿Qué disparó cada uno? (persona · lugar · pensamiento)',
        'Mood al despertar / al acostarte (0-10):',
      ],
      reflection:
        'Si solo te llevas un dato de este día, que sea este: una cifra aproximada de cuántas veces escaneaste sin que pasara nada.',
    },
    {
      type: 'exercise',
      n: '03',
      kicker: 'DÍA 2 · DE 5',
      h: 'Reconocer la voz del escaneo.',
      intro:
        'El escaneo tiene una narradora. Su trabajo es construir historias que justifiquen la alarma. Hoy la escuchas sin discutir. Le pones nombre. Reconoces su tono.',
      prompts: [
        '¿Cómo suena tu narradora del escaneo? (frase típica)',
        '¿De quién aprendió esa voz? (familia · entorno · cultura)',
        '¿Qué le diría una persona segura a esa voz?',
      ],
    },
    {
      type: 'quote_break',
      quote: 'No estás siendo intensa. Estás siendo vigilante. Y eso cansa.',
      src: 'EGOERA · MAYO 2026',
    },
    {
      type: 'section',
      n: '04',
      kicker: 'TEORÍA · DE 7',
      h: 'La amígdala en «quizá».',
      color_accent: 'coral',
      body: [
        'El sistema nervioso tiene tres ajustes para decidir si hay amenaza: sí, no, quizá. El «sí» activa la respuesta de lucha o huida y se apaga cuando la amenaza pasa. El «no» permite descansar. El «quizá» es el peor: mantiene el sistema en alerta media durante horas, meses o años. No se apaga porque nunca confirma.',
        'La hipervigilancia es vivir en «quizá». El cuerpo no decide. Y porque no decide, no descansa.',
        'Lo que el cuerpo necesita para soltar el «quizá» no es razón — es experiencia repetida de seguridad. Repetida significa: muchas veces. Sin atajos. Sin fast-track. Y por eso este cuaderno es de siete días y no de uno.',
      ],
      bullets: [
        'Quizá es alarma sin objeto: alarma sin manera de apagarse.',
        'La razón no apaga el quizá. La experiencia sí.',
        'Lo opuesto a hipervigilancia no es relajación: es presencia.',
      ],
    },
    {
      type: 'exercise',
      n: '05',
      kicker: 'DÍA 3 · DE 5',
      h: 'Nombrar al sistema, no a ti.',
      intro:
        'No es «yo soy hipervigilante» — es «mi sistema está escaneando». Esa distancia, mínima en palabras, enorme en cuerpo, te separa de la respuesta. Hoy escribes en tercera persona.',
      prompts: [
        'Tres frases en tercera persona sobre tu escaneo:',
        'Qué le pasa a tu sistema cuando se enciende (cuerpo · pensamiento):',
        'Una cosa que tu sistema teme — y por qué hace lo que hace:',
      ],
    },
    {
      type: 'exercise',
      n: '06',
      kicker: 'DÍA 4 · DE 5',
      h: 'El cuerpo primero.',
      intro:
        'Antes de cualquier idea — qué siente el cuerpo. Hoy paras tres veces y haces un scan corporal de un minuto. No interpretas. No corriges. Solo escuchas.',
      prompts: [
        'Scan 1 — qué notabas (cabeza · pecho · estómago · espalda):',
        'Scan 2 — qué notabas:',
        'Scan 3 — qué notabas:',
      ],
    },
    {
      type: 'exercise',
      n: '07',
      kicker: 'DÍA 5 · DE 5',
      h: 'Lo que no te corresponde.',
      intro:
        'Una parte del escaneo es tuyo. Otra parte la cargas por otra persona — un padre, una madre, una pareja, un sistema. Hoy separas. No es ejercicio de culpa: es de inventario.',
      prompts: [
        'Una preocupación recurrente que no es tuya (de quién es):',
        '¿Qué pasaría si la devolvieras?',
        'Una cosa de las que cargas que sí quieres seguir mirando:',
      ],
    },
    {
      type: 'map_table',
      h: 'El mapa de la semana.',
      intro:
        'Una tabla para mirar el conjunto. Marca con una cruz, una palabra, un mood (0-10) — lo que necesites para verlo todo de un golpe. Sin interpretar.',
      columns: ['DÍA', 'ESCANEOS', 'CUERPO', 'MOOD'],
      rows: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
    },
    {
      type: 'closing',
      h: 'Hasta aquí, contigo.',
      body: [
        'Lo que has notado esta semana no se borra. Se queda en el cuerpo como un patrón que ya conoces. Conocerlo no es lo mismo que curarlo — pero es la única forma de empezar.',
        'Si la semana te ha mostrado algo más grande de lo que cabe en este cuaderno, considera buscar acompañamiento. La hipervigilancia sostenida muchos años se acompaña mejor con otra persona delante.',
      ],
      cta_text: 'Sigue en el diario emocional',
      cta_url: 'https://diario.egoera.es',
    },
  ],
};

// ─── Cuaderno #2 — Reparar (Gottman 5:1) ───────────────────────────────────

const GOTTMAN: Cuaderno = {
  meta: {
    title: 'Reparar',
    subtitle: 'después de la pelea',
    issue: 'Cuaderno nº 2',
    slug: 'reparar-gottman',
    pdfUrl: '/cuadernos/egoera-cuaderno-02-reparar-gottman.pdf',
    duration: '7 días · pareja',
    topic: 'Relaciones',
    postUrl: 'https://egoera.es/reparar-pareja-gottman-5a1/',
  },
  pages: [
    {
      type: 'cover',
      title: 'Reparar.',
      accent: 'después.',
      eyebrow: '— EGOERA · CUADERNO Nº 2 · MAYO 2026 —',
      lede:
        'Un cuaderno sobre la proporción 5:1, los Cuatro Jinetes y los rituales que mantienen vivo lo que parecía roto. Para parejas que no quieren dejar de discutir — quieren saber repararlo.',
      columns: [
        { h: '5:1', body: 'La proporción que separa las parejas que duran de las que no.' },
        { h: 'JINETES', body: 'Los cuatro hábitos que erosionan el vínculo sin que lo notes.' },
        { h: 'RITUAL', body: 'Cómo construir tu propio gesto de reparación, breve y repetible.' },
      ],
    },
    {
      type: 'editorial',
      h: 'Por qué reparar.',
      body: [
        'Las parejas que duran no son las que pelean menos. Son las que reparan mejor. John Gottman pasó cuatro décadas observando parejas en su «Love Lab» y llegó a una proporción casi numérica: por cada interacción negativa hacen falta cinco positivas para sostener la salud del vínculo. 5:1.',
        'Pero el dato no es lo importante. Lo importante es lo que implica: no peleéis menos — reparad más. Reparar es lo que separa una discusión cualquiera de una herida acumulada.',
        'Lo que vas a hacer en estas páginas es identificar tus patrones antes de que el dolor decida por ti.',
      ],
      quote: 'Reparar no es ganar la discusión. Es proteger el vínculo de la discusión.',
      quote_src: 'GOTTMAN · ADAPTADO',
    },
    {
      type: 'sumario',
      entries: [
        { n: '01', h: 'La proporción 5:1', sub: 'Por qué el balance del vínculo no es simétrico.' },
        { n: '02', h: 'Tu ratio personal', sub: 'Una semana de rastreo realista.' },
        { n: '03', h: 'Los Cuatro Jinetes', sub: 'Crítica, desprecio, defensividad, bloqueo.' },
        { n: '04', h: 'Cazar al jinete', sub: 'Identificar el patrón antes de discutirlo.' },
        { n: '05', h: 'Rituales de reparación', sub: 'El gesto breve que cambia la curva.' },
        { n: '06', h: 'Tu ritual', sub: 'Diseñar el propio, no copiar un manual.' },
        { n: '07', h: 'Reparación retroactiva', sub: 'Volver a una herida sin reabrirla.' },
        { n: '08', h: 'Mapa de la semana', sub: 'Para mirar juntos lo que ha pasado.' },
      ],
    },
    {
      type: 'section',
      n: '01',
      kicker: 'TEORÍA · DE 7',
      h: 'La proporción 5:1.',
      color_accent: 'mostaza',
      body: [
        'En el laboratorio de Gottman se observó que las parejas saludables mantienen una proporción mínima de cinco interacciones positivas por cada una negativa, en tiempo de no-conflicto. En conflicto el ratio se mantiene cerca de 5:1 también, aunque las negativas se concentran.',
        'No hablamos solo de palabras. Una mirada cómplice cuenta. Una mano apoyada en la espalda cuenta. Una respuesta que llegue. Lo que se cuenta como positivo es lo que la otra persona percibe como positivo — no lo que tú crees que es.',
        'Lo radical de Gottman no es la cifra. Es entender que el balance no es simétrico: lo negativo pesa más. Por eso hacen falta cinco.',
      ],
      bullets: [
        'No es matemática — es masa crítica.',
        'Las micro-positivas valen tanto como las grandes.',
        'Lo cuenta quien lo recibe, no quien lo emite.',
      ],
    },
    {
      type: 'exercise',
      n: '02',
      kicker: 'EJERCICIO · DE 4',
      h: 'Tu ratio personal.',
      intro:
        'Una semana de rastreo realista. No es un test — es un diario. Cada día apuntas, de memoria, cuántas interacciones positivas y cuántas negativas notaste con tu pareja. Sin contar las que no recordaste.',
      prompts: [
        'Tres positivas que recuerdes de hoy (qué fueron):',
        'Una negativa de hoy (qué fue · qué pasó después):',
        'Estimación 0-10 de cómo se sintió el día contigo:',
      ],
      reflection:
        'Hazlo siete días. La cifra final no importa tanto como el patrón que verás aparecer.',
    },
    {
      type: 'section',
      n: '03',
      kicker: 'TEORÍA · DE 7',
      h: 'Los Cuatro Jinetes.',
      color_accent: 'coral',
      body: [
        'Gottman identificó cuatro hábitos de comunicación que, repetidos, predicen con un 94% de fiabilidad la ruptura de una pareja. Los llamó los Cuatro Jinetes del Apocalipsis del vínculo.',
      ],
      bullets: [
        'Crítica · atacar el carácter en lugar de la conducta («siempre eres así» en lugar de «esto me dolió»).',
        'Desprecio · sarcasmo, desdén, burla. El más letal de los cuatro.',
        'Defensividad · responder al reproche con otro reproche o con victimismo.',
        'Bloqueo · cerrarse, callar, salirse de la conversación.',
      ],
    },
    {
      type: 'exercise',
      n: '04',
      kicker: 'EJERCICIO · DE 4',
      h: 'Cazar al jinete.',
      intro:
        'Hoy no es para juzgarte. Es para identificarte. Todos hacemos los cuatro en algún momento. Lo problemático es cuando uno se vuelve tu lenguaje principal de conflicto.',
      prompts: [
        'Tu jinete habitual (cuál y cómo suena en tu boca):',
        'Tu jinete en tu pareja (cuál y cómo lo recibes):',
        'Una conversación reciente donde apareció — qué pasó después:',
      ],
    },
    {
      type: 'quote_break',
      quote: 'El conflicto no rompe parejas. La ausencia de reparación, sí.',
      src: 'EGOERA · ADAPTADO DE GOTTMAN',
    },
    {
      type: 'section',
      n: '05',
      kicker: 'TEORÍA · DE 7',
      h: 'Rituales de reparación.',
      color_accent: 'cobalto',
      body: [
        'Un ritual de reparación es un gesto breve, acordado, repetible, que sirve para cortar la escalada en mitad de la discusión. No resuelve el contenido — interrumpe la forma. Y eso es suficiente para que puedas volver al contenido sin haber roto algo más.',
        'Los rituales son personales. Cada pareja construye los suyos. Pueden ser una palabra clave («pausa»), un gesto (mano sobre el corazón), una pregunta («¿podemos volver dentro de diez minutos?»), un tono compartido. Lo importante es que sea reconocible.',
      ],
      bullets: [
        'Tiene que ser pactado fuera del conflicto, no inventado en mitad de él.',
        'Tiene que ser barato — algo que se pueda usar muchas veces.',
        'Tiene que respetarse: cuando se invoca, se respeta. Aunque escueza.',
      ],
    },
    {
      type: 'exercise',
      n: '06',
      kicker: 'EJERCICIO · DE 4',
      h: 'Construye tu ritual.',
      intro:
        'No copies. Lo que funciona para una pareja puede ser ridículo para otra. Diseñad el vuestro entre los dos — y pactadlo cuando no esté pasando nada.',
      prompts: [
        'Una palabra o gesto que podría servir de pausa:',
        'Qué pasa después de invocarlo (tiempo · espacio · quién habla primero):',
        'Una condición innegociable del ritual (algo que no se vale hacer):',
      ],
    },
    {
      type: 'exercise',
      n: '07',
      kicker: 'EJERCICIO · DE 4',
      h: 'Reparación retroactiva.',
      intro:
        'Hay heridas viejas que no se cerraron. No para reabrirlas — para nombrarlas. A veces una pareja necesita volver a una discusión de hace meses con esta frase: «aquello me dolió más de lo que dije en el momento».',
      prompts: [
        'Una discusión sin cerrar que sigue pesando (cuál fue):',
        'Qué te habría hecho falta entonces (con la calma de ahora):',
        'Cómo nombrarla a tu pareja hoy, sin abrirla del todo:',
      ],
    },
    {
      type: 'map_table',
      h: 'El mapa de la semana.',
      intro:
        'Una tabla para mirar juntos. Si lo hacéis los dos por separado y luego comparáis, suele aparecer información muy útil.',
      columns: ['DÍA', 'POSITIVAS', 'NEGATIVAS', 'REPARACIÓN'],
      rows: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
    },
    {
      type: 'closing',
      h: 'No reparar también es una decisión.',
      body: [
        'Si tu pareja y tú habéis llegado hasta el final del cuaderno, ya habéis hecho algo importante: nombrar el patrón. Lo siguiente es sostenerlo. Y sostenerlo no es fácil — pero es más fácil de lo que parece cuando se hace a dos.',
        'Si os habéis encontrado con algo más grande, considerad terapia de pareja. No para arreglar nada — para no estar solos delante de algo que merece atención.',
      ],
      cta_text: 'Más herramientas en el diario',
      cta_url: 'https://diario.egoera.es',
    },
  ],
};

// ─── Cuaderno #3 — Lenguajes del amor ──────────────────────────────────────

const LENGUAJES: Cuaderno = {
  meta: {
    title: 'Los lenguajes del amor',
    subtitle: 'desmitificados',
    issue: 'Cuaderno nº 3',
    slug: 'lenguajes-amor',
    pdfUrl: '/cuadernos/egoera-cuaderno-03-lenguajes-amor.pdf',
    duration: '~30 min · solo o en pareja',
    topic: 'Relaciones',
    postUrl: 'https://egoera.es/lenguajes-amor-mito-desmitificado/',
  },
  pages: [
    {
      type: 'cover',
      title: 'Los lenguajes.',
      accent: 'tuyos.',
      eyebrow: '— EGOERA · CUADERNO Nº 3 · MAYO 2026 —',
      lede:
        'Por qué la teoría más viral de las relaciones falla en la vida real — y qué herramienta sí funciona. Un cuaderno para descubrir lo que pides cuando pides amor.',
      columns: [
        { h: 'EL MITO', body: 'Por qué los cinco lenguajes no son cinco — y por qué eso importa.' },
        { h: 'LA VERDAD', body: 'Lo que pides cuando pides amor no es un estilo. Es una necesidad.' },
        { h: 'PEDIR', body: 'Cómo pedir cuidado sin lenguaje de manual y sin esperar adivinación.' },
      ],
    },
    {
      type: 'editorial',
      h: 'Por qué la teoría falla.',
      body: [
        'En 1992 Gary Chapman publicó «Los 5 lenguajes del amor». La teoría es elegante: cada persona tiene un canal preferente para recibir amor — palabras, tiempo, regalos, actos de servicio o contacto físico — y la clave de una relación sana es identificar el de la otra persona y darle lo suyo.',
        'Funcionó en los talleres parroquiales. Funcionó en libros de autoayuda. Funciona menos en la vida real. Las investigaciones posteriores — Egbert, Polk, Impett — no encuentran correlación entre conocer el «lenguaje» de la pareja y la satisfacción a largo plazo.',
        'Lo que sí funciona es algo más incómodo: aprender a pedir de manera concreta lo que necesitas, sin esperar adivinación, sin convertir el cuidado en gimnasia.',
      ],
      quote: 'Pedir cuidado no es romántico. Es responsable.',
      quote_src: 'EGOERA',
    },
    {
      type: 'sumario',
      entries: [
        { n: '01', h: 'Lo que el mito tapa', sub: 'Por qué la teoría se viralizó pese a fallar.' },
        { n: '02', h: '¿Qué pides cuando pides?', sub: 'Descifrar la necesidad detrás del gesto.' },
        { n: '03', h: 'Las necesidades reales', sub: 'Cuatro familias, no cinco lenguajes.' },
        { n: '04', h: 'Mapa de cuidado', sub: 'Tus necesidades concretas, no estilos abstractos.' },
        { n: '05', h: 'Pedir sin manual', sub: 'La fórmula breve que cambia la respuesta.' },
        { n: '06', h: 'Pedir concreto', sub: 'Tres peticiones bien escritas.' },
        { n: '07', h: 'Mapa de la semana', sub: 'Una tabla para ver cómo te has cuidado.' },
      ],
    },
    {
      type: 'section',
      n: '01',
      kicker: 'TEORÍA · DE 6',
      h: 'Lo que el mito tapa.',
      color_accent: 'mostaza',
      body: [
        'Tres razones por las que los cinco lenguajes se viralizaron: simplifican lo complejo, son fáciles de recordar (¡un test!), y quitan responsabilidad — si no te cuida bien, es que no sabe tu idioma.',
        'Tres razones por las que la teoría falla: las necesidades no son estables (cambian con el contexto), no son cinco (son al menos doce), y no funcionan en ausencia de algo más básico: poder pedirlas.',
      ],
      bullets: [
        'Las taxonomías cómodas suelen tapar la pregunta incómoda.',
        'La pregunta incómoda aquí es: «¿sabes pedir lo que necesitas?».',
        'Si la respuesta es no, ningún manual de lenguajes ayuda.',
      ],
    },
    {
      type: 'exercise',
      n: '02',
      kicker: 'EJERCICIO · DE 3',
      h: '¿Qué pides cuando pides?',
      intro:
        'Una petición no es nunca solo lo que pone. Cuando le dices a tu pareja «¿me das un abrazo?» probablemente no estás pidiendo un abrazo: estás pidiendo presencia, contención, calma, prueba de que tu malestar importa. Hoy desempaquetas.',
      prompts: [
        'Una petición habitual tuya (literal):',
        'Qué hay debajo (necesidad de fondo):',
        'Qué pasaría si pidieras la necesidad directamente:',
      ],
    },
    {
      type: 'section',
      n: '03',
      kicker: 'TEORÍA · DE 6',
      h: 'Las necesidades reales.',
      color_accent: 'coral',
      body: [
        'En lugar de cinco lenguajes hay cuatro grandes familias de necesidades en una relación adulta. No son estancos — se solapan, se complementan, y la importancia relativa cambia con la fase de la pareja y con el día.',
      ],
      bullets: [
        'Seguridad · saber que la persona va a estar, predeciblemente, sin condiciones cambiantes.',
        'Reconocimiento · ser vista y nombrada — no solo querida.',
        'Autonomía · que la relación no te coma, que sigas siendo tú.',
        'Cuidado concreto · gestos materiales que reducen carga: tareas, presencia física, mensajes, contacto.',
      ],
    },
    {
      type: 'exercise',
      n: '04',
      kicker: 'EJERCICIO · DE 3',
      h: 'Tu mapa de cuidado.',
      intro:
        'No buscamos tu estilo — buscamos tus necesidades concretas hoy. Las cuatro familias son una guía. Lo importante es cómo se traducen en tu vida.',
      prompts: [
        '¿Cómo se manifiesta tu necesidad de seguridad? (qué te tranquiliza):',
        '¿Cómo se manifiesta tu necesidad de reconocimiento? (qué te hace sentir vista):',
        '¿Y la de autonomía y la de cuidado concreto? (ejemplo de cada una):',
      ],
    },
    {
      type: 'quote_break',
      quote: 'Las parejas que duran no adivinan. Pactan.',
      src: 'EGOERA',
    },
    {
      type: 'section',
      n: '05',
      kicker: 'TEORÍA · DE 6',
      h: 'Pedir sin lengua de manual.',
      color_accent: 'cobalto',
      body: [
        'Pedir bien no es pedir bonito. Es pedir concreto. Hay una fórmula breve que cambia drásticamente la respuesta que recibes: situación + sentimiento + petición específica + plazo.',
        'Ejemplo malo: «nunca me prestas atención». Ejemplo bueno: «cuando cenamos con el móvil en la mesa (situación) me siento sola (sentimiento). ¿Podemos cenar sin móvil al menos tres días por semana (petición concreta y plazo)?».',
      ],
      bullets: [
        'Concreto · pedir un comportamiento, no un cambio de carácter.',
        'Acotado · con plazo o frecuencia para que se pueda evaluar.',
        'Repetible · si funciona, se vuelve a usar. Si no, se ajusta.',
      ],
    },
    {
      type: 'exercise',
      n: '06',
      kicker: 'EJERCICIO · DE 3',
      h: 'Tres peticiones bien escritas.',
      intro:
        'Coge tres situaciones reales de las últimas dos semanas. Reescríbelas con la fórmula. No es para mandárselas — es para entrenarte a pensar así.',
      prompts: [
        'Situación 1 (sit. + sent. + pet. + plazo):',
        'Situación 2:',
        'Situación 3:',
      ],
    },
    {
      type: 'map_table',
      h: 'El mapa de la semana.',
      intro:
        'Una tabla para ver dónde te has cuidado y dónde no te has atrevido a pedir. Sin culpa — con curiosidad.',
      columns: ['DÍA', 'NECESIDAD', 'LA PEDÍ', 'LA RECIBÍ'],
      rows: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
    },
    {
      type: 'closing',
      h: 'No hay lenguaje secreto.',
      body: [
        'Lo que tu pareja necesita no es descifrable por test. Es preguntable. Lo que tú necesitas tampoco es un código — es una petición que todavía no te has atrevido a hacer en voz alta.',
        'Si has llegado hasta aquí con tres peticiones bien escritas, ya tienes lo que la mayoría de los manuales no te dieron: una manera concreta de empezar mañana.',
      ],
      cta_text: 'Practica pedir en el diario',
      cta_url: 'https://diario.egoera.es',
    },
  ],
};

// ─── Cuaderno #4 — Mapa de emociones ───────────────────────────────────────

const EMOCIONES: Cuaderno = {
  meta: {
    title: 'El mapa de tus emociones',
    subtitle: 'una semana de rastreo',
    issue: 'Cuaderno nº 4',
    slug: 'mapa-emociones',
    pdfUrl: '/cuadernos/egoera-cuaderno-04-mapa-emociones.pdf',
    duration: '7 días · 5 min/día',
    topic: 'Alfabeto emocional',
  },
  pages: [
    {
      type: 'cover',
      title: 'El mapa.',
      accent: 'sentir.',
      eyebrow: '— EGOERA · CUADERNO Nº 4 · MAYO 2026 —',
      lede:
        'Sentir no es síntoma. Cada emoción trae información — y casi siempre, una petición. Este cuaderno te ayuda a distinguir cuál es cuál.',
      columns: [
        { h: 'NOMBRAR', body: 'No hay diez emociones — hay matices. Aprende a distinguirlos.' },
        { h: 'ESCUCHAR', body: 'Lo que cada emoción te está pidiendo. Y por qué.' },
        { h: 'RESPONDER', body: 'No reprimir, no exagerar — responder. Que es otra cosa.' },
      ],
    },
    {
      type: 'editorial',
      h: 'Sentir no es síntoma.',
      body: [
        'Buena parte de la cultura terapéutica reciente ha empujado a las personas a categorizar lo que sienten como bueno (positivo) o malo (negativo). Pero las emociones no son ni buenas ni malas. Son información del sistema sobre algo que está pasando.',
        'La tristeza te dice que algo se ha perdido. La ira, que algo se ha cruzado. El miedo, que algo importa. La vergüenza, que algo del vínculo está en riesgo. Si las apagas, no las apagas — las desplazas. Si las miras, se ordenan.',
        'Este cuaderno es una semana de rastreo emocional sin filtro de positividad. No vamos a buscar gratitudes — vamos a mirar lo que hay.',
      ],
      quote: 'Una emoción que no se nombra, se actúa.',
      quote_src: 'REGLA EGOERA',
    },
    {
      type: 'sumario',
      entries: [
        { n: '01', h: 'Más allá de positivo/negativo', sub: 'Por qué la dicotomía limita.' },
        { n: '02', h: 'Las diez de la semana', sub: 'Inventario inicial sin censura.' },
        { n: '03', h: 'La rueda emocional', sub: 'Primarias, secundarias, matices.' },
        { n: '04', h: 'Primario o secundario', sub: 'Distinguir la emoción que tapa.' },
        { n: '05', h: 'Lo que pide cada una', sub: 'Cuatro grandes traducciones.' },
        { n: '06', h: 'Carta a tres emociones', sub: 'Ejercicio de escucha activa.' },
        { n: '07', h: 'Mapa diario de la semana', sub: 'Una imagen del conjunto.' },
      ],
    },
    {
      type: 'section',
      n: '01',
      kicker: 'TEORÍA · DE 6',
      h: 'Más allá de positivo/negativo.',
      color_accent: 'mostaza',
      body: [
        'La psicología positiva — útil en muchos contextos — ha generado un efecto colateral incómodo: una división entre emociones «buenas» (las que conviene tener) y emociones «malas» (las que conviene evitar). Ese filtro daña.',
        'Daña porque las emociones llamadas negativas son las más informativas. Daña porque convierte el sentirlas en señal de fracaso. Daña porque distorsiona el lenguaje interno — y sin lenguaje, no hay cuidado.',
      ],
      bullets: [
        'No hay emociones malas — hay emociones intensas y emociones poco frecuentadas.',
        'Las dolorosas suelen pedir más cuidado que las cómodas — por eso duelen.',
        'El objetivo no es alegrarse: es sentir con detalle.',
      ],
    },
    {
      type: 'exercise',
      n: '02',
      kicker: 'DÍA 1 · DE 4',
      h: 'Las diez de la semana.',
      intro:
        'Inventario inicial sin censura. Apunta diez emociones que recuerdes haber sentido en los últimos siete días. No jerarquices. No expliques. Solo lista. Si te salen menos de diez, deja líneas vacías.',
      prompts: [
        'Diez emociones recientes — sin orden:',
        '¿Cuál te ha costado más nombrar?',
        '¿Cuál apareció con más frecuencia?',
      ],
    },
    {
      type: 'section',
      n: '03',
      kicker: 'TEORÍA · DE 6',
      h: 'La rueda emocional.',
      color_accent: 'coral',
      body: [
        'Robert Plutchik propuso una rueda con ocho emociones primarias (alegría, tristeza, miedo, ira, sorpresa, asco, confianza, anticipación) y muchísimos matices alrededor. Otras escuelas reducen las primarias a cuatro o seis. No importa la taxonomía exacta — importa la práctica de buscar el matiz.',
        'Decir «me siento mal» es como decir «hace mal tiempo» — no sirve. Decir «me siento sola, con un poso de rabia que no acabo de entender» es información accionable.',
      ],
      bullets: [
        'Detrás de la rabia suele haber miedo o dolor. Detrás de la tristeza, pérdida.',
        'Detrás de la ansiedad suele haber una pregunta no resuelta.',
        'Detrás de la culpa, una norma — propia o heredada — que no estás cumpliendo.',
      ],
    },
    {
      type: 'exercise',
      n: '04',
      kicker: 'DÍA 2 · DE 4',
      h: 'Primario o secundario.',
      intro:
        'Las emociones secundarias suelen tapar las primarias. La rabia tapa miedo, la ironía tapa tristeza, la frialdad tapa vergüenza. Hoy revisas tres emociones recientes y buscas qué hay debajo.',
      prompts: [
        'Emoción 1 — qué fue · qué hay debajo:',
        'Emoción 2 — qué fue · qué hay debajo:',
        'Emoción 3 — qué fue · qué hay debajo:',
      ],
    },
    {
      type: 'quote_break',
      quote: 'Saber lo que sientes es la mitad de saber lo que necesitas.',
      src: 'EGOERA',
    },
    {
      type: 'section',
      n: '05',
      kicker: 'TEORÍA · DE 6',
      h: 'Lo que pide cada emoción.',
      color_accent: 'cobalto',
      body: [
        'Cada emoción trae una petición implícita. Si la escuchas, la emoción se ordena; si no, se intensifica. Esto no es magia — es biología.',
      ],
      bullets: [
        'Tristeza · pide compañía silenciosa, tiempo, llorar sin justificar.',
        'Ira · pide límite, voz, acción correctora del daño.',
        'Miedo · pide cuidado, predictibilidad, datos que reduzcan la incertidumbre.',
        'Vergüenza · pide reparación del vínculo, no aislamiento.',
      ],
    },
    {
      type: 'exercise',
      n: '06',
      kicker: 'DÍA 3 · DE 4',
      h: 'Carta a tres emociones.',
      intro:
        'Elige tres emociones presentes en tu vida ahora. Escríbele una carta breve a cada una — como si fueran personajes — preguntándoles qué necesitan. Y déjalas responder.',
      prompts: [
        'Carta a la emoción 1 (nombre + qué necesita):',
        'Carta a la emoción 2:',
        'Carta a la emoción 3:',
      ],
    },
    {
      type: 'map_table',
      h: 'El mapa diario de la semana.',
      intro:
        'Una tabla para mirar de un vistazo el paisaje emocional de siete días. Marca con palabras, con un emoji, con un mood — lo que te valga.',
      columns: ['DÍA', 'MAÑANA', 'TARDE', 'NOCHE'],
      rows: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
    },
    {
      type: 'closing',
      h: 'Sentir con detalle.',
      body: [
        'Lo que has hecho esta semana no es terapia. Es una habilidad — sentir con detalle — que se entrena igual que cualquier otra. Cada vez que sustituyes «me siento mal» por una descripción concreta, el sistema se calma un poco.',
        'Si una emoción se ha hecho más grande durante el cuaderno y no tiene un sitio claro donde aterrizar, busca acompañamiento. No hay debilidad en pedirlo — hay cuidado.',
      ],
      cta_text: 'Sigue rastreando en el diario',
      cta_url: 'https://diario.egoera.es',
    },
  ],
};

// ─── Cuaderno #5 — Fortalezas ──────────────────────────────────────────────

const FORTALEZAS: Cuaderno = {
  meta: {
    title: 'Tus fortalezas',
    subtitle: 'línea de vida',
    issue: 'Cuaderno nº 5',
    slug: 'fortalezas-linea-vida',
    pdfUrl: '/cuadernos/egoera-cuaderno-05-fortalezas.pdf',
    duration: '~45 min · pausado',
    topic: 'Autoconocimiento',
  },
  pages: [
    {
      type: 'cover',
      title: 'Fortalezas.',
      accent: 'tuyas.',
      eyebrow: '— EGOERA · CUADERNO Nº 5 · MAYO 2026 —',
      lede:
        'Una fortaleza no es positividad. Es una capacidad propia que ya has usado muchas veces — y que probablemente no llamas así. Este cuaderno la nombra.',
      columns: [
        { h: 'IDENTIFICAR', body: 'Las 5 que te aparecen en tres momentos distintos de tu vida.' },
        { h: 'TRAZAR', body: 'Línea de vida — cuándo apareció cada fortaleza por primera vez.' },
        { h: 'USAR', body: 'Plan semanal de uso consciente, una fortaleza por día.' },
      ],
    },
    {
      type: 'editorial',
      h: 'La fortaleza no es positividad.',
      body: [
        'En psicología positiva se ha extendido un concepto útil: las fortalezas de carácter. Son rasgos relativamente estables que funcionan como recursos cuando la vida aprieta. El catálogo más usado es el de Peterson y Seligman — 24 fortalezas agrupadas en seis virtudes.',
        'Pero hay una trampa. La cultura del «descubre tus fortalezas» ha convertido el ejercicio en autobombo: dime tres cosas buenas de ti. Eso no funciona. Funciona buscar las pruebas — los momentos en los que esa cualidad se manifestó sin que la planearas.',
        'Una fortaleza es algo que ya has hecho. Muchas veces. Probablemente sin nombrarla.',
      ],
      quote: 'No la inventas. La encuentras.',
      quote_src: 'EGOERA',
    },
    {
      type: 'sumario',
      entries: [
        { n: '01', h: 'Qué es una fortaleza', sub: 'Diferencia con habilidad y con talento.' },
        { n: '02', h: 'Test rápido', sub: 'Tus cinco fortalezas más visibles hoy.' },
        { n: '03', h: 'Cuándo apareció', sub: 'Línea de vida con tres momentos.' },
        { n: '04', h: 'Cuando esquivas', sub: 'La sombra de tus fortalezas.' },
        { n: '05', h: 'Esencia positiva', sub: 'Lo que queda cuando quitas las máscaras.' },
        { n: '06', h: 'Plan semanal', sub: 'Una fortaleza por día, sin forzarlas.' },
        { n: '07', h: 'Mapa de uso', sub: 'Para mirar el conjunto al final.' },
      ],
    },
    {
      type: 'section',
      n: '01',
      kicker: 'TEORÍA · DE 6',
      h: 'Qué es una fortaleza.',
      color_accent: 'mostaza',
      body: [
        'Tres distinciones útiles para no confundir conceptos: una habilidad es algo que has aprendido (programar, conducir, cocinar). Un talento es una facilidad innata para algo (oído musical, orientación espacial). Una fortaleza es una cualidad de carácter que aparece de manera estable en cómo te relacionas con el mundo.',
        'Las 24 fortalezas del catálogo VIA agrupan rasgos como curiosidad, gratitud, valentía, perspectiva, amabilidad, justicia, humor, humildad, perseverancia, amor por aprender. No son universales en el mismo grado — cada persona tiene un patrón propio.',
      ],
      bullets: [
        'Lo que la diferencia de una habilidad es la repetición sin entrenamiento explícito.',
        'Lo que la diferencia de un talento es el componente moral o relacional.',
        'Las 5 fortalezas «top» de una persona son sus «fortalezas firma».',
      ],
    },
    {
      type: 'exercise',
      n: '02',
      kicker: 'EJERCICIO · DE 5',
      h: 'Test rápido.',
      intro:
        'Cinco minutos. Sin pensar mucho. Para cada par, marca con qué mitad te identificas más — o escribe una palabra alternativa que te describa mejor.',
      prompts: [
        'Curiosidad o Cautela · Amabilidad o Justicia · Humor o Profundidad:',
        'Perseverancia o Adaptabilidad · Valentía o Prudencia:',
        'Tres fortalezas que destacan en ti (escríbelas):',
      ],
    },
    {
      type: 'section',
      n: '03',
      kicker: 'TEORÍA · DE 6',
      h: 'Cuándo apareció.',
      color_accent: 'coral',
      body: [
        'Las fortalezas no nacen — emergen. Casi siempre hay un momento identificable en el que esa cualidad fue necesaria por primera vez y tu sistema la activó. Saber cuándo apareció te da contexto sobre por qué la tienes y para qué la usaste.',
        'Algunas fortalezas son herencia familiar evidente. Otras son reacción contra algo. Otras son resultado de una persona concreta que te las modeló. Todas son útiles.',
      ],
      bullets: [
        'Mirar el origen no es buscar trauma — es comprender la función.',
        'Las fortalezas reactivas (las que aparecieron contra algo) son tan válidas como las heredadas.',
        'Saber el origen ayuda a ajustar el uso adulto.',
      ],
    },
    {
      type: 'exercise',
      n: '03',
      kicker: 'EJERCICIO · DE 5',
      h: 'La línea de vida.',
      intro:
        'Dibuja mentalmente — o aquí — tres momentos de tu vida en los que una de tus fortalezas se hizo visible. Pueden ser de infancia, adolescencia, edad adulta. Una por etapa, si puedes.',
      prompts: [
        'Momento 1 (etapa · qué pasó · qué fortaleza apareció):',
        'Momento 2 (etapa · qué pasó · qué fortaleza apareció):',
        'Momento 3 (etapa · qué pasó · qué fortaleza apareció):',
      ],
    },
    {
      type: 'quote_break',
      quote: 'Nadie te enseñó a ser eso. Lo eras ya.',
      src: 'EGOERA',
    },
    {
      type: 'section',
      n: '04',
      kicker: 'TEORÍA · DE 6',
      h: 'Cuando esquivas tu fortaleza.',
      color_accent: 'cobalto',
      body: [
        'Una fortaleza usada en exceso se convierte en su contrario. La amabilidad excesiva se convierte en evitación de conflicto. La perseverancia excesiva se convierte en obstinación. La humildad excesiva se convierte en invisibilidad. La curiosidad excesiva, en dispersión.',
        'Conocer la sombra de tus fortalezas no es debilitarlas. Es calibrarlas. Una fortaleza calibrada es la que sabes cuándo usar — y cuándo soltar.',
      ],
      bullets: [
        'La sombra es la versión inflada, no la opuesta.',
        'Calibrar no es renunciar — es elegir.',
        'Las fortalezas se cansan: descansarlas también es parte del cuidado.',
      ],
    },
    {
      type: 'exercise',
      n: '04',
      kicker: 'EJERCICIO · DE 5',
      h: 'Plan semanal de uso.',
      intro:
        'Una fortaleza por día durante una semana. No la fuerces — identifícala cada noche en una situación cotidiana donde apareció. Si no apareció ninguna que esperabas, también es información.',
      prompts: [
        'Lunes — fortaleza prevista · cuándo apareció:',
        'Martes — fortaleza prevista · cuándo apareció:',
        'Miércoles — fortaleza prevista · cuándo apareció:',
      ],
    },
    {
      type: 'map_table',
      h: 'El mapa de uso.',
      intro: 'Una tabla para ver dónde han aparecido tus fortalezas esta semana. Sin forzar — solo registrar.',
      columns: ['DÍA', 'FORTALEZA', 'CONTEXTO', '¿USO O SOMBRA?'],
      rows: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
    },
    {
      type: 'closing',
      h: 'Lo que ya eras.',
      body: [
        'Lo que has nombrado esta semana no lo has fabricado. Estaba ahí. Lo que cambia con este cuaderno es que ahora sabes cómo se llama — y eso te permite usarlo a propósito en lugar de por inercia.',
        'Si una fortaleza nueva ha aparecido en alguna línea, esa es probablemente la que está pidiendo más espacio en tu próxima etapa.',
      ],
      cta_text: 'Sigue identificándolas en el diario',
      cta_url: 'https://diario.egoera.es',
    },
  ],
};

export const CUADERNOS: Cuaderno[] = [
  HIPERVIGILANCIA,
  GOTTMAN,
  LENGUAJES,
  EMOCIONES,
  FORTALEZAS,
];

export function getCuaderno(slug: string): Cuaderno | undefined {
  return CUADERNOS.find((c) => c.meta.slug === slug);
}
