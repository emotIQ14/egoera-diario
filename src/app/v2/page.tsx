'use client';

/* ═══════════════════════════════════════════════════════════
   EGOERA DIARIO · V2 — Dither + Kanji aesthetic
   Inspirado en @Oriku175 — silent movement, deeper connections
   ═══════════════════════════════════════════════════════════ */

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import styles from './styles.module.css';

const AMIGAS = {
  nora:  { url: 'https://egoera.es/wp-content/uploads/2026/05/amiga-nora-circle-1.png',  voice: 'estás aquí. respira.' },
  lola:  { url: 'https://egoera.es/wp-content/uploads/2026/05/amiga-lola-circle-1.png',  voice: '¡muy bien! sigue.' },
  mau:   { url: 'https://egoera.es/wp-content/uploads/2026/05/amiga-mau-circle-1.png',   voice: 'esto cuesta. te entiendo.' },
  iris:  { url: 'https://egoera.es/wp-content/uploads/2026/05/amiga-iris-circle-1.png',  voice: 'espera, fíjate en esto.' },
  teo:   { url: 'https://egoera.es/wp-content/uploads/2026/05/amiga-teo-circle-1.png',   voice: 'no hay prisa.' },
  june:  { url: 'https://egoera.es/wp-content/uploads/2026/05/amiga-june-circle-1.png',  voice: 'te tengo.' },
  eva:   { url: 'https://egoera.es/wp-content/uploads/2026/05/amiga-eva-circle-1.png',   voice: 'cierra los ojos un momento.' },
  oli:   { url: 'https://egoera.es/wp-content/uploads/2026/05/amiga-oli-circle-1.png',   voice: 'estás haciendo trabajo importante.' },
  mira:  { url: 'https://egoera.es/wp-content/uploads/2026/05/amiga-mira-circle-1.png',  voice: 'te quiero ver acabar esto.' },
  zuri:  { url: 'https://egoera.es/wp-content/uploads/2026/05/amiga-zuri-circle-1.png',  voice: 'sigue. estoy contigo.' },
} as const;

type AmigaSlug = keyof typeof AMIGAS;

interface EmotionCard {
  kanji: string;
  kanjiTitle: string;
  romaji: string;
  titleES: string;
  subEN: string;
  footer: string;
  amiga: AmigaSlug;
  size?: 'large' | 'normal';
}

const CARDS: EmotionCard[] = [
  {
    kanji: '静か',
    kanjiTitle: '内省',
    romaji: 'Naisei',
    titleES: 'Mírate sin prisa',
    subEN: 'Look at yourself without rushing.',
    footer: 'introspección · 内省',
    amiga: 'nora',
    size: 'large',
  },
  {
    kanji: '深く',
    kanjiTitle: '余白',
    romaji: 'Yohaku',
    titleES: 'Hueco para sentir',
    subEN: 'Empty space to feel.',
    footer: 'espacio · 余白',
    amiga: 'eva',
  },
  {
    kanji: '流れ',
    kanjiTitle: '感情',
    romaji: 'Kanjō',
    titleES: 'Nombrar la emoción',
    subEN: 'Name the emotion.',
    footer: 'emoción · 感情',
    amiga: 'iris',
  },
  {
    kanji: '気持ち',
    kanjiTitle: '繋がる',
    romaji: 'Tsunagaru',
    titleES: 'Conectar contigo',
    subEN: 'Connect with yourself.',
    footer: 'conexión · 繋がる',
    amiga: 'mau',
  },
  {
    kanji: '一日',
    kanjiTitle: '記録',
    romaji: 'Kiroku',
    titleES: 'Tu día, en silencio',
    subEN: 'Your day, in silence.',
    footer: 'registro · 記録',
    amiga: 'teo',
  },
];

function todayDayIndex(): number {
  // 0 = lunes, 6 = domingo
  const d = new Date().getDay(); // 0 = domingo
  return d === 0 ? 6 : d - 1;
}

const WEEK_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export default function DiarioV2() {
  const [now, setNow] = useState<Date | null>(null);
  const [streak, setStreak] = useState<number>(0);
  const [weekFilled, setWeekFilled] = useState<boolean[]>(new Array(7).fill(false));
  const [friendVisible, setFriendVisible] = useState<AmigaSlug | null>(null);
  const [bubbleHide, setBubbleHide] = useState(false);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 60000);

    // Lee datos del localStorage (compatible con la app actual)
    try {
      const raw = localStorage.getItem('egoera-diario-entries');
      if (raw) {
        const entries = JSON.parse(raw) as Array<{ ts: number }>;
        // Streak simple: días consecutivos hasta hoy
        const dayKeys = new Set<string>();
        entries.forEach((e) => {
          const d = new Date(e.ts);
          dayKeys.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
        });
        let s = 0;
        const cursor = new Date();
        while (true) {
          const k = `${cursor.getFullYear()}-${cursor.getMonth()}-${cursor.getDate()}`;
          if (dayKeys.has(k)) { s++; cursor.setDate(cursor.getDate() - 1); }
          else break;
        }
        setStreak(s);

        // Semana actual (lunes a domingo)
        const filled = new Array(7).fill(false);
        const monday = new Date();
        const dayOfWeek = monday.getDay();
        const diff = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
        monday.setDate(monday.getDate() + diff);
        for (let i = 0; i < 7; i++) {
          const d = new Date(monday);
          d.setDate(monday.getDate() + i);
          const k = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
          if (dayKeys.has(k)) filled[i] = true;
        }
        setWeekFilled(filled);
      }
    } catch {}

    // Spawn amiga después de 1.2s
    const friendTimer = setTimeout(() => {
      const slugs = Object.keys(AMIGAS) as AmigaSlug[];
      // Elegir amiga según hora del día
      const h = new Date().getHours();
      let chosen: AmigaSlug = 'nora';
      if (h >= 6 && h < 11) chosen = 'lola';      // mañana → celebra
      else if (h >= 11 && h < 14) chosen = 'iris'; // mediodía → curiosa
      else if (h >= 14 && h < 19) chosen = 'teo';  // tarde → sereno
      else if (h >= 19 && h < 23) chosen = 'mau';  // noche → entiende
      else chosen = 'nora';                         // madrugada → respira
      setFriendVisible(chosen);
    }, 1200);

    return () => { clearInterval(t); clearTimeout(friendTimer); };
  }, []);

  const dateLine = useMemo(() => {
    if (!now) return '';
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const wd = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    return `${wd[now.getDay()]} · ${now.getDate()} ${months[now.getMonth()]} · ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  }, [now]);

  const today = todayDayIndex();
  const totalThisWeek = weekFilled.filter(Boolean).length;

  return (
    <div className={styles.wrap}>

      {/* SVG filter para dither cobalto — se aplica a todas las amigas */}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <filter id="dither-cobalto" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="1.8" numOctaves="2" stitchTiles="stitch" seed="2" />
          <feColorMatrix type="matrix" values="
            0 0 0 0 0.11
            0 0 0 0 0.17
            0 0 0 0 0.86
            0 0 0 1.2 -0.2"/>
          <feComposite operator="in" in2="SourceGraphic" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </svg>

      {/* HERO */}
      <header className={styles.hero}>
        <div className={`${styles.heroEyebrow} ${styles.fadeIn}`}>
          <span className={styles.dot}></span>
          Egoera diario · 静かに動き、深く繋がる
        </div>
        <p className={`${styles.heroJP} ${styles.fadeIn}`}>静かに、自分を見つめる。</p>
        <h1 className={`${styles.heroTitle} ${styles.fadeIn} ${styles.fadeIn1}`}>
          Cómo te cuidas tú, despacio.
        </h1>
        <p className={`${styles.heroSub} ${styles.fadeIn} ${styles.fadeIn2}`}>
          {dateLine || 'cargando...'}. Un diario emocional que no compite por tu atención —
          espera, escucha, cuenta lo que necesita ser contado.
        </p>

        <div className={`${styles.heroMeta} ${styles.fadeIn} ${styles.fadeIn3}`}>
          <div>
            <div className={styles.key}>Sesión</div>
            {now ? now.toISOString().split('T')[0] : '—'}
          </div>
          <div>
            <div className={styles.key}>Sentir : Nombrar : Soltar</div>
            ESCUCHAR : NOTAR : ANOTAR : SEGUIR
          </div>
        </div>
      </header>

      {/* SECTION TAG */}
      <div className={`${styles.sectionTag} ${styles.fadeIn} ${styles.fadeIn2}`}>
        <span className={styles.sectionTagJP}>静かな動き</span>
        <span className={styles.sectionTagText}>cinco gestos para hoy</span>
        <span className={styles.sectionTagLine}></span>
      </div>

      {/* GRID DE TARJETAS EMOCIONALES */}
      <main className={styles.grid}>
        {CARDS.map((c, i) => (
          <Link
            key={c.kanji + i}
            href="/diario"
            className={`${styles.card} ${c.size === 'large' ? styles.cardLarge : ''} ${styles.fadeIn} ${styles[`fadeIn${Math.min(i + 1, 5)}` as keyof typeof styles] || ''}`}
          >
            <div className={styles.cardKanji}>金<br/>銀<br/>花</div>
            <div className={styles.cardKanjiRomaji}>Kingin<br/>Hana</div>
            <div className={styles.cardKanjiTitle}>{c.kanjiTitle}</div>

            <div className={styles.illustrationWrap}>
              <div className={styles.illustration}>
                <img
                  src={AMIGAS[c.amiga].url}
                  alt={c.titleES}
                  loading="lazy"
                />
              </div>
            </div>

            <div className={styles.cardBody}>
              <div className={styles.cardTitleES}>{c.titleES}</div>
              <div className={styles.cardSubEN}>{c.subEN}</div>
            </div>

            <div className={styles.cardSubFooter}>{c.footer}</div>
          </Link>
        ))}
      </main>

      {/* SECTION TAG */}
      <div className={styles.sectionTag}>
        <span className={styles.sectionTagJP}>一週間</span>
        <span className={styles.sectionTagText}>esta semana</span>
        <span className={styles.sectionTagLine}></span>
      </div>

      {/* SEMANA */}
      <div className={styles.weekStripWrap}>
        <div className={styles.weekStrip}>
          <div className={styles.weekStripHead}>
            <div className={styles.weekStripTitle}>
              {totalThisWeek} {totalThisWeek === 1 ? 'entrada' : 'entradas'} esta semana
            </div>
            <div className={styles.weekStripJP}>今週の記録</div>
          </div>
          <div className={styles.weekDots}>
            {WEEK_LABELS.map((label, i) => (
              <div key={label + i} className={styles.weekDay}>
                <div className={styles.weekDayLabel}>{label}</div>
                <div className={`${styles.weekDayMark} ${weekFilled[i] ? styles.filled : ''} ${i === today ? styles.today : ''}`} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statKanji}>連</div>
          <div className={styles.statNum}>{streak}</div>
          <div className={styles.statLabel}>racha · días</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statKanji}>週</div>
          <div className={styles.statNum}>{totalThisWeek}</div>
          <div className={styles.statLabel}>esta semana</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statKanji}>静</div>
          <div className={styles.statNum}>3</div>
          <div className={styles.statLabel}>min sugeridos</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statKanji}>心</div>
          <div className={styles.statNum}>—</div>
          <div className={styles.statLabel}>cómo estás hoy</div>
        </div>
      </div>

      {/* CTA */}
      <div className={styles.ctaWrap}>
        <Link href="/diario" className={styles.ctaButton}>
          <div className={styles.left}>
            <div className={styles.ctaJP}>新しい記録 · empezar nueva entrada</div>
            <div className={styles.ctaTitle}>Cuenta tu día en tres minutos</div>
          </div>
          <div className={styles.arrow}>→</div>
        </Link>
      </div>

      {/* FOOTER meta */}
      <footer className={styles.footer}>
        <div><span className={styles.key}>Egoera Psikologia</span> · diario v2</div>
        <div>Silent movement · 静かな動き</div>
        <div>made by Ander Bilbao · 2026</div>
      </footer>

      {/* AMIGA FLOTANTE — spawn al cargar */}
      {friendVisible && (
        <div
          className={`${styles.friendFloater} ${styles.spawned}`}
          onClick={() => setBubbleHide(true)}
          role="button"
          aria-label="Toca para esconder bocadillo"
        >
          <img
            src={AMIGAS[friendVisible].url}
            alt={friendVisible}
            loading="eager"
          />
          <div className={`${styles.friendBubble} ${bubbleHide ? styles.hide : ''}`}>
            {AMIGAS[friendVisible].voice}
          </div>
        </div>
      )}

    </div>
  );
}
