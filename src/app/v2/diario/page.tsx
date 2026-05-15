'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './styles.module.css';
import { saveEntry, makeId } from '@/lib/storage';
import type { DiaryEntry, Emotion } from '@/lib/storage';

// 10 emociones canónicas con kanji + romaji
const EMOTIONS_JP: Array<{ id: Emotion; label: string; kanji: string; romaji: string }> = [
  { id: 'cansancio', label: 'Cansancio',  kanji: '疲',   romaji: 'Tsukare' },
  { id: 'calma',     label: 'Calma',      kanji: '静',   romaji: 'Shizuka' },
  { id: 'ansiedad',  label: 'Ansiedad',   kanji: '不安', romaji: 'Fuan' },
  { id: 'tristeza',  label: 'Tristeza',   kanji: '悲',   romaji: 'Kanashii' },
  { id: 'esperanza', label: 'Esperanza',  kanji: '希',   romaji: 'Kibō' },
  { id: 'rabia',     label: 'Rabia',      kanji: '怒',   romaji: 'Ikari' },
  { id: 'miedo',     label: 'Miedo',      kanji: '恐',   romaji: 'Kyō' },
  { id: 'alegria',   label: 'Alegría',    kanji: '喜',   romaji: 'Yorokobi' },
  { id: 'verguenza', label: 'Vergüenza',  kanji: '恥',   romaji: 'Haji' },
  { id: 'culpa',     label: 'Culpa',      kanji: '罪',   romaji: 'Tsumi' },
];

const AMIGAS = {
  mira:  { url: 'https://egoera.es/wp-content/uploads/2026/05/amiga-mira-circle-1.png',  voice: 'te quiero ver acabar esto.' },
  lola:  { url: 'https://egoera.es/wp-content/uploads/2026/05/amiga-lola-circle-1.png',  voice: '¡muy bien! sigue.' },
  oli:   { url: 'https://egoera.es/wp-content/uploads/2026/05/amiga-oli-circle-1.png',   voice: 'estás haciendo trabajo importante.' },
  nora:  { url: 'https://egoera.es/wp-content/uploads/2026/05/amiga-nora-circle-1.png',  voice: 'estás aquí. respira.' },
} as const;

const DEFAULT_MOOD = 7;

export default function DiarioV2() {
  const router = useRouter();
  const [mood, setMood] = useState<number>(DEFAULT_MOOD);
  const [moodTouched, setMoodTouched] = useState<boolean>(false);
  const [emotions, setEmotions] = useState<Emotion[]>([]);
  const [text, setText] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [friend, setFriend] = useState<keyof typeof AMIGAS>('mira');
  const [bubbleHide, setBubbleHide] = useState(false);
  const [confetti, setConfetti] = useState(false);

  const canSave = moodTouched || emotions.length > 0 || text.trim().length > 0;
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  useEffect(() => {
    // Spawn Mira tras 800ms
    const t = setTimeout(() => setFriend('mira'), 800);
    return () => clearTimeout(t);
  }, []);

  // Cambia amiga según contenido
  useEffect(() => {
    if (text.length > 100) setFriend('oli');
    else if (emotions.length > 2) setFriend('mira');
    else setFriend('mira');
  }, [text, emotions]);

  function toggleEmotion(id: Emotion) {
    setEmotions((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  }

  function handleMoodChange(value: number) {
    setMood(value);
    setMoodTouched(true);
  }

  function fireConfetti() {
    setConfetti(true);
    setTimeout(() => setConfetti(false), 3200);
  }

  function handleSave() {
    if (!canSave || saving) return;
    setSaving(true);
    const entry: DiaryEntry = {
      id: makeId(),
      createdAt: new Date().toISOString(),
      mood,
      emotions,
      text: text.trim(),
    };
    saveEntry(entry);

    // Switch a Lola y confetti
    setFriend('lola');
    setBubbleHide(false);
    fireConfetti();

    setTimeout(() => {
      router.push('/v2');
    }, 2400);
  }

  const moodNumClass = mood <= 3
    ? styles.moodNumLow
    : mood >= 7
    ? styles.moodNumHigh
    : '';

  return (
    <div className={styles.wrap}>
      {/* HEADER */}
      <header className={styles.header}>
        <Link href="/v2" className={styles.headerBack}>← Volver</Link>
        <div className={styles.headerEyebrow}>
          <span>02 · Diario</span>
          <span className={styles.jp}>· 心を書く</span>
        </div>
        <h1 className={styles.headerTitle}>
          ¿Cómo lo estás <em>llevando</em>?
        </h1>
        <p className={styles.headerJP}>今、どんな気持ち？</p>
        <div className={styles.headerKanji}>心</div>
      </header>

      {/* MOOD */}
      <section className={styles.section}>
        <div className={styles.sectionLabel}>
          <span className={styles.number}>01</span>
          <span className={styles.jp}>気分 · Kibun</span>
          <span className={styles.text}>tu nivel de hoy</span>
          <span className={styles.line}></span>
        </div>

        <div className={styles.moodCard}>
          <div className={`${styles.moodNum} ${moodNumClass}`}>{mood}</div>
          <div className={styles.moodOf}>— de 10 —</div>

          <input
            type="range"
            min={0}
            max={10}
            step={1}
            value={mood}
            onChange={(e) => handleMoodChange(Number(e.target.value))}
            className={styles.slider}
            aria-label="Estado de ánimo"
          />
          <div className={styles.sliderTicks}>
            <span>0</span><span>1</span><span>2</span><span>3</span>
            <span>4</span><span>5</span><span>6</span><span>7</span>
            <span>8</span><span>9</span><span>10</span>
          </div>
        </div>
      </section>

      {/* EMOTIONS */}
      <section className={styles.section} style={{ paddingTop: 0 }}>
        <div className={styles.sectionLabel}>
          <span className={styles.number}>02</span>
          <span className={styles.jp}>感情 · Kanjō</span>
          <span className={styles.text}>nombra lo que sientes</span>
          <span className={styles.line}></span>
        </div>

        <div className={styles.emotionsGrid}>
          {EMOTIONS_JP.map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={() => toggleEmotion(e.id)}
              className={`${styles.emotionChip} ${emotions.includes(e.id) ? styles.active : ''}`}
            >
              <div className={styles.emotionChipKanji}>{e.kanji}</div>
              <div className={styles.emotionChipLabel}>{e.label}</div>
              <div className={styles.emotionChipRomaji}>{e.romaji}</div>
            </button>
          ))}
        </div>
      </section>

      {/* TEXT */}
      <section className={styles.section} style={{ paddingTop: 0 }}>
        <div className={styles.sectionLabel}>
          <span className={styles.number}>03</span>
          <span className={styles.jp}>記録 · Kiroku</span>
          <span className={styles.text}>tu día, en silencio</span>
          <span className={styles.line}></span>
        </div>

        <div className={styles.textWrap}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="cuéntate el día. sin filtros. tres minutos."
            className={styles.textarea}
            rows={6}
          />
          <div className={styles.textCounter}>
            <span>{wordCount} {wordCount === 1 ? 'palabra' : 'palabras'}</span>
            <span>静かに · sin prisa</span>
          </div>
        </div>
      </section>

      {/* AMIGA */}
      <div
        className={`${styles.friendBox} ${styles.spawned}`}
        onClick={() => setBubbleHide(!bubbleHide)}
        role="button"
        aria-label="amiga acompañante"
      >
        <img src={AMIGAS[friend].url} alt={friend} loading="eager" />
        <div className={`${styles.friendBubble} ${bubbleHide ? styles.hide : ''}`}>
          {AMIGAS[friend].voice}
        </div>
      </div>

      {/* CONFETTI */}
      {confetti && (
        <div className={`${styles.confetti} ${styles.active}`}>
          {Array.from({ length: 60 }).map((_, i) => {
            const colors = ['#1d2bdb', '#d97757', '#f4c842', '#0a0a18', '#fafaf7'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            return (
              <div
                key={i}
                className={styles.confettiPiece}
                style={{
                  left: `${Math.random() * 100}%`,
                  background: color,
                  animationDelay: `${Math.random() * 0.6}s`,
                  animationDuration: `${2.5 + Math.random() * 1.2}s`,
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
              />
            );
          })}
        </div>
      )}

      {/* SAVE BAR */}
      <div className={styles.saveBar}>
        <div className={styles.saveBarInner}>
          <Link href="/v2" className={styles.cancelButton}>Cancelar</Link>
          <button
            className={styles.saveButton}
            disabled={!canSave || saving}
            onClick={handleSave}
          >
            <span>
              <span className={styles.jp}>保存 · </span>
              {saving ? 'Guardado · cerrando…' : 'Guardar entrada'}
            </span>
            <span className={styles.arrow}>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
