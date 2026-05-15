'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import styles from './styles.module.css';
import { loadEntries, type DiaryEntry, type Emotion } from '@/lib/storage';

const EMOTIONS_JP: Record<Emotion, { label: string; kanji: string; romaji: string }> = {
  cansancio: { label: 'Cansancio',  kanji: '疲',   romaji: 'Tsukare' },
  calma:     { label: 'Calma',      kanji: '静',   romaji: 'Shizuka' },
  ansiedad:  { label: 'Ansiedad',   kanji: '不安', romaji: 'Fuan' },
  tristeza:  { label: 'Tristeza',   kanji: '悲',   romaji: 'Kanashii' },
  esperanza: { label: 'Esperanza',  kanji: '希',   romaji: 'Kibō' },
  rabia:     { label: 'Rabia',      kanji: '怒',   romaji: 'Ikari' },
  miedo:     { label: 'Miedo',      kanji: '恐',   romaji: 'Kyō' },
  alegria:   { label: 'Alegría',    kanji: '喜',   romaji: 'Yorokobi' },
  verguenza: { label: 'Vergüenza',  kanji: '恥',   romaji: 'Haji' },
  culpa:     { label: 'Culpa',      kanji: '罪',   romaji: 'Tsumi' },
};

const STOP_WORDS = new Set([
  'el','la','los','las','lo','un','una','unos','unas','de','del','al','a','en','y','o','u','que','si','no','me','mi','mis','tu','tus','te','se','le','les','su','sus','es','son','esta','está','estoy','estas','estás','estan','están','fue','era','eran','ser','estar','haber','hacer','tener','he','has','ha','hemos','han','había','hay','por','para','con','sin','sobre','entre','hasta','desde','pero','aunque','porque','cuando','como','donde','esto','eso','aquello','este','ese','aquel','aquella','yo','tú','él','ella','nosotros','vosotros','ellos','ellas','muy','más','menos','tan','también','tampoco','ya','aún','todavía','algo','nada','todo','todos','toda','todas','cada','voy','vas','va','vamos','van','iba','soy','eres','somos','sois','tengo','tienes','tiene','tenemos','tienen','tenía','hago','haces','hace','hacemos','hacen','puede','puedo','puedes','podemos','pueden','sea','sean','creo','crees','cree','siento','sientes','siente','alguien','mismo','misma','así','ahí','aquí','allí','sí','ni','qué','cuál','quién','del','solo'
]);

const AMIGAS = {
  iris: { url: 'https://egoera.es/wp-content/uploads/2026/05/amiga-iris-circle-1.png', voice: 'espera, fíjate en esto.' },
  oli:  { url: 'https://egoera.es/wp-content/uploads/2026/05/amiga-oli-circle-1.png',  voice: 'estás haciendo trabajo importante.' },
  nora: { url: 'https://egoera.es/wp-content/uploads/2026/05/amiga-nora-circle-1.png', voice: 'estás aquí. respira.' },
} as const;

function startOfWeek(d: Date): Date {
  const day = d.getDay() || 7;
  const monday = new Date(d);
  monday.setDate(d.getDate() - (day - 1));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

const DAY_LABELS = ['L','M','X','J','V','S','D'];
const MONTHS_SHORT = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];

export default function PatronesV2() {
  const [now, setNow] = useState<Date | null>(null);
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [bubbleHide, setBubbleHide] = useState(false);

  useEffect(() => {
    setNow(new Date());
    setEntries(loadEntries());
  }, []);

  const stats = useMemo(() => {
    if (!now) return null;
    const monday = startOfWeek(now);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const weekEntries = entries.filter((e) => {
      const t = new Date(e.createdAt).getTime();
      return t >= monday.getTime() && t <= sunday.getTime();
    });

    // Mood promedio por día de la semana
    const moodByDay: Array<number | null> = new Array(7).fill(null);
    const countByDay: number[] = new Array(7).fill(0);
    const sumByDay: number[] = new Array(7).fill(0);
    weekEntries.forEach((e) => {
      const d = new Date(e.createdAt);
      const dayIdx = (d.getDay() || 7) - 1; // 0=L, 6=D
      countByDay[dayIdx] += 1;
      sumByDay[dayIdx] += e.mood;
    });
    for (let i = 0; i < 7; i++) {
      moodByDay[i] = countByDay[i] > 0 ? sumByDay[i] / countByDay[i] : null;
    }

    // Top emociones
    const emotionCount: Record<string, number> = {};
    weekEntries.forEach((e) => {
      e.emotions.forEach((em) => {
        emotionCount[em] = (emotionCount[em] || 0) + 1;
      });
    });
    const topEmotions = Object.entries(emotionCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5) as Array<[Emotion, number]>;
    const maxEmotionCount = topEmotions.length ? topEmotions[0][1] : 0;

    // Mood promedio total
    const moodAvg = weekEntries.length
      ? weekEntries.reduce((s, e) => s + e.mood, 0) / weekEntries.length
      : null;

    // Streak
    const dayKeys = new Set<string>();
    entries.forEach((e) => {
      const d = new Date(e.createdAt);
      dayKeys.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
    });
    let streak = 0;
    const cursor = new Date();
    while (true) {
      const k = `${cursor.getFullYear()}-${cursor.getMonth()}-${cursor.getDate()}`;
      if (dayKeys.has(k)) { streak++; cursor.setDate(cursor.getDate() - 1); }
      else break;
    }

    // Top palabras
    const wordsCount: Record<string, number> = {};
    weekEntries.forEach((e) => {
      const words = (e.text || '').toLowerCase().split(/\s+/);
      words.forEach((w) => {
        const clean = w.replace(/[^\wáéíóúñü]/g, '');
        if (clean.length < 4 || STOP_WORDS.has(clean)) return;
        wordsCount[clean] = (wordsCount[clean] || 0) + 1;
      });
    });
    const topWords = Object.entries(wordsCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 24);
    const maxWordCount = topWords.length ? topWords[0][1] : 0;

    const todayIdx = (now.getDay() || 7) - 1;

    return {
      monday, sunday,
      weekCount: weekEntries.length,
      moodByDay, countByDay,
      topEmotions, maxEmotionCount,
      moodAvg,
      streak,
      topWords, maxWordCount,
      todayIdx,
    };
  }, [now, entries]);

  if (!now) {
    return <div className={styles.wrap}><div className={styles.section} /></div>;
  }

  // Vacío
  if (!stats || stats.weekCount === 0) {
    return (
      <div className={styles.wrap}>
        <header className={styles.header}>
          <Link href="/v2" className={styles.headerBack}>← Volver</Link>
          <div className={styles.headerEyebrow}>
            <span>03 · Patrones</span>
            <span className={styles.jp}>· 自分のリズム</span>
          </div>
          <h1 className={styles.headerTitle}>Tu <em>ritmo</em>.</h1>
          <p className={styles.headerJP}>自分のリズムを知る。</p>
          <div className={styles.headerKanji}>律</div>
        </header>

        <div className={styles.emptyState}>
          <div className={styles.ekanji}>静</div>
          <div className={styles.etitle}>Aún sin entradas esta semana.</div>
          <div className={styles.esub}>
            Vuelve cuando hayas escrito unos días. Los patrones se ven después de varias entradas.
          </div>
          <Link href="/v2/diario" className={styles.ecta}>
            <span>Empezar la primera</span>
            <span>→</span>
          </Link>
        </div>

        {/* Friend */}
        <div
          className={`${styles.friendBox} ${styles.spawned}`}
          onClick={() => setBubbleHide(!bubbleHide)}
          role="button"
          aria-label="amiga"
        >
          <img src={AMIGAS.nora.url} alt="nora" loading="eager" />
          <div className={`${styles.friendBubble} ${bubbleHide ? styles.hide : ''}`}>
            {AMIGAS.nora.voice}
          </div>
        </div>
      </div>
    );
  }

  // Con datos
  const rangeLabel = `${stats.monday.getDate()} ${MONTHS_SHORT[stats.monday.getMonth()]} — ${stats.sunday.getDate()} ${MONTHS_SHORT[stats.sunday.getMonth()]} · ${stats.sunday.getFullYear()}`;

  return (
    <div className={styles.wrap}>
      {/* HEADER */}
      <header className={styles.header}>
        <Link href="/v2" className={styles.headerBack}>← Volver</Link>
        <div className={styles.headerEyebrow}>
          <span>03 · Patrones</span>
          <span className={styles.jp}>· 自分のリズム</span>
        </div>
        <h1 className={styles.headerTitle}>Tu <em>ritmo</em>.</h1>
        <p className={styles.headerJP}>自分のリズムを知る。</p>
        <div className={styles.headerKanji}>律</div>
      </header>

      {/* STATS 3 */}
      <section className={styles.section}>
        <div className={styles.sectionLabel}>
          <span className={styles.number}>01</span>
          <span className={styles.jp}>今週 · Konshū</span>
          <span className={styles.text}>esta semana</span>
          <span className={styles.line}></span>
        </div>

        <div className={styles.statsGrid}>
          <div className={`${styles.card} ${styles.fadeIn}`}>
            <div className={styles.cardKanji}>連</div>
            <div className={styles.cardLabel}>RACHA</div>
            <div className={styles.cardHero}>{stats.streak}</div>
            <div className={styles.cardSub}>{stats.streak === 1 ? 'día consecutivo' : 'días consecutivos'}</div>
          </div>
          <div className={`${styles.card} ${styles.fadeIn} ${styles.fadeIn1}`}>
            <div className={styles.cardKanji}>記</div>
            <div className={styles.cardLabel}>ENTRADAS</div>
            <div className={styles.cardHero}>{stats.weekCount}</div>
            <div className={styles.cardSub}>{stats.weekCount === 1 ? 'esta semana' : 'esta semana'}</div>
          </div>
          <div className={`${styles.card} ${styles.fadeIn} ${styles.fadeIn2}`}>
            <div className={styles.cardKanji}>気</div>
            <div className={styles.cardLabel}>MOOD MEDIO</div>
            <div className={styles.cardHero}>{stats.moodAvg !== null ? stats.moodAvg.toFixed(1) : '—'}</div>
            <div className={styles.cardSub}>de 10</div>
          </div>
        </div>
      </section>

      {/* WEEK BARS */}
      <section className={styles.section} style={{ paddingTop: 0 }}>
        <div className={styles.sectionLabel}>
          <span className={styles.number}>02</span>
          <span className={styles.jp}>気分の流れ · Kibun no nagare</span>
          <span className={styles.text}>el flujo de tu mood</span>
          <span className={styles.line}></span>
        </div>

        <div className={`${styles.weekChart} ${styles.fadeIn}`}>
          <div className={styles.weekRange}>
            <span>{rangeLabel}</span>
            <span className={styles.jp}>一週間 · Isshūkan</span>
          </div>
          <div className={styles.weekBars}>
            {stats.moodByDay.map((m, i) => {
              const height = m !== null ? `${Math.max(8, (m / 10) * 100)}%` : '4px';
              const cls = m === null
                ? styles.empty
                : m < 4 ? styles.low
                : m < 7 ? styles.mid
                : styles.high;
              return (
                <div key={i} className={styles.weekBarCol}>
                  <div className={`${styles.weekBar} ${cls}`} style={{ height }}>
                    {m !== null && (
                      <div className={styles.weekBarValue}>{m.toFixed(1)}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className={styles.weekBarLabels}>
            {DAY_LABELS.map((label, i) => (
              <div
                key={i}
                className={`${styles.weekBarLabel} ${i === stats.todayIdx ? styles.today : ''}`}
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TOP EMOTIONS */}
      <section className={styles.section} style={{ paddingTop: 0 }}>
        <div className={styles.sectionLabel}>
          <span className={styles.number}>03</span>
          <span className={styles.jp}>感情の地図 · Kanjō no chizu</span>
          <span className={styles.text}>mapa de emociones</span>
          <span className={styles.line}></span>
        </div>

        <div className={`${styles.emotionsTop} ${styles.fadeIn}`}>
          {stats.topEmotions.length === 0 ? (
            <div className={styles.emotionsEmpty}>
              Aún no has marcado emociones esta semana.
            </div>
          ) : (
            <div className={styles.emotionsList}>
              {stats.topEmotions.map(([id, count]) => {
                const meta = EMOTIONS_JP[id as Emotion];
                const pct = (count / stats.maxEmotionCount) * 100;
                return (
                  <div key={id} className={styles.emotionRow}>
                    <div className={styles.emotionRowKanji}>{meta.kanji}</div>
                    <div className={styles.emotionRowMid}>
                      <div className={styles.emotionRowLabel}>
                        <span className={styles.emotionRowName}>{meta.label}</span>
                        <span className={styles.emotionRowRomaji}>{meta.romaji}</span>
                      </div>
                      <div className={styles.emotionRowBar}>
                        <div className={styles.emotionRowBarFill} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <div className={styles.emotionRowCount}>{count}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* WORDS CLOUD */}
      {stats.topWords.length > 0 && (
        <section className={styles.section} style={{ paddingTop: 0 }}>
          <div className={styles.sectionLabel}>
            <span className={styles.number}>04</span>
            <span className={styles.jp}>言葉 · Kotoba</span>
            <span className={styles.text}>tus palabras</span>
            <span className={styles.line}></span>
          </div>

          <div className={`${styles.wordsCloud} ${styles.fadeIn}`}>
            <div className={styles.cardLabel}>LO QUE MÁS HAS ESCRITO</div>
            <div className={styles.wordsList}>
              {stats.topWords.map(([w, c]) => {
                const size = Math.ceil((c / stats.maxWordCount) * 5);
                const sizeClass = styles[`wordSize${Math.max(1, Math.min(5, size))}`];
                return <span key={w} className={`${styles.word} ${sizeClass}`}>{w}</span>;
              })}
            </div>
          </div>
        </section>
      )}

      {/* Friend */}
      <div
        className={`${styles.friendBox} ${styles.spawned}`}
        onClick={() => setBubbleHide(!bubbleHide)}
        role="button"
        aria-label="amiga"
      >
        <img src={AMIGAS.iris.url} alt="iris" loading="eager" />
        <div className={`${styles.friendBubble} ${bubbleHide ? styles.hide : ''}`}>
          {AMIGAS.iris.voice}
        </div>
      </div>
    </div>
  );
}
