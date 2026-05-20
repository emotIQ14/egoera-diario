'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Screen from '@/components/Screen';
import TabBar from '@/components/TabBar';
import SafetyBar from '@/components/SafetyBar';
import { loadEntries, saveEntry, makeId, streakDays } from '@/lib/storage';
import type { DiaryEntry, Emotion } from '@/lib/storage';
import { EMOTIONS } from '@/lib/types';
import { useToast } from '@/components/toast/ToastProvider';
import { track } from '@/lib/track';

const DEFAULT_MOOD = 7;
const SEED_FEELING_KEY = 'egoera-seed-feeling';
const DRAFT_KEY = 'egoera-diario-draft';
const MILESTONES_KEY = 'egoera-milestones-seen';

const MILESTONE_MSGS: Record<number, string> = {
  1:   '✦ Primera anotación. Ya empezaste.',
  7:   '✦ 7 entradas. Estás creando algo tuyo.',
  10:  '✦ 10 entradas. El hábito ya está aquí.',
  30:  '✦ 30 entradas. Un mes contigo mismo.',
  50:  '✦ 50 entradas. Esto ya es tuyo.',
  100: '✦ 100 entradas. Esto es un diario de verdad.',
};

function getMilestoneSeen(): Set<number> {
  try {
    const raw = window.localStorage.getItem(MILESTONES_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as number[]);
  } catch { return new Set(); }
}

function markMilestoneSeen(n: number): void {
  try {
    const seen = getMilestoneSeen();
    seen.add(n);
    window.localStorage.setItem(MILESTONES_KEY, JSON.stringify([...seen]));
  } catch { /* silencioso */ }
}

function popMilestoneMsg(count: number): string | null {
  const msg = MILESTONE_MSGS[count];
  if (!msg) return null;
  const seen = getMilestoneSeen();
  if (seen.has(count)) return null;
  markMilestoneSeen(count);
  return msg;
}

// Custom types for Web Speech API (not fully typed in this TS/DOM lib version)
interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: Event) => void) | null;
  start(): void;
  stop(): void;
}
interface SpeechRecognitionResultEvent {
  results: { [key: number]: { [key: number]: { transcript: string }; isFinal: boolean }; length: number };
}
interface SpeechRecognitionErrorLike { error: string; }

function emotionLabelDiary(id: string): string {
  return EMOTIONS.find((e) => e.id === id)?.label ?? id;
}

function getMoodLabel(m: number): string {
  if (m >= 9) return 'Muy bien';
  if (m >= 7) return 'Bien';
  if (m >= 5) return 'Regular';
  if (m >= 3) return 'Bajo';
  return 'Muy bajo';
}

function getMoodNumColor(m: number): string {
  if (m >= 7) return 'var(--cobalto)';
  if (m >= 5) return '#b8860b'; // ocre oscuro, buen contraste sobre crema
  return '#c25a3a'; // coral oscuro
}

function pad2D(n: number): string { return n < 10 ? `0${n}` : `${n}`; }

// ─── Prompts de escritura ────────────────────────────────────────────────────

const WRITING_PROMPTS = [
  '¿Qué es lo que más me ha costado hoy?',
  '¿Qué necesito que nadie me ha dado?',
  '¿De qué me alegra haberme dado cuenta?',
  '¿Qué emoción he ignorado esta semana?',
  '¿Qué me digo a mí mismo cuando me equivoco?',
  '¿Qué me cuesta soltar y por qué?',
  '¿Cuándo me he sentido más yo mismo hoy?',
  '¿Qué me genera más ansiedad ahora mismo?',
  '¿A quién le daría más espacio en mi vida?',
  '¿Qué estoy evitando pensar?',
  '¿Qué le diría a la persona que era hace un año?',
  '¿Cómo me trataría si fuera mi mejor amigo?',
  '¿Qué quiero recordar de esta semana?',
  '¿Cuándo fui amable conmigo mismo hoy?',
  '¿Qué he aprendido sobre mí mismo esta semana?',
  '¿Qué me hace sentir más ligero cuando lo hago?',
  '¿Qué me gustaría cambiar de cómo actué hoy?',
  '¿Qué me cuesta pedir y por qué?',
  '¿Hay algo que estoy haciendo por los demás y no por mí?',
  '¿Qué necesito escuchar aunque me cueste?',
] as const;

function getDailyPromptIdx(): number {
  if (typeof window === 'undefined') return 0;
  return Math.floor(Date.now() / 86_400_000) % WRITING_PROMPTS.length;
}

type LastCtx = { mood: number; topEmotion: string | null; daysAgo: number };

type Draft = { mood: number; moodTouched: boolean; emotions: string[]; text: string };

function saveDraft(draft: Draft): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch { /* silencioso */ }
}

function loadDraft(): Draft | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Draft;
  } catch { return null; }
}

function clearDraft(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(DRAFT_KEY);
}

export default function DiarioPage() {
  const router = useRouter();
  const toast = useToast();
  const [mood, setMood] = useState<number>(DEFAULT_MOOD);
  const [moodTouched, setMoodTouched] = useState<boolean>(false);
  const [emotions, setEmotions] = useState<Emotion[]>([]);
  const [text, setText] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [seededFromPeep, setSeededFromPeep] = useState<boolean>(false);
  const [draftRestored, setDraftRestored] = useState<boolean>(false);
  const [lastCtx, setLastCtx] = useState<LastCtx | null>(null);
  const [recording, setRecording] = useState<boolean>(false);
  const [voiceInterim, setVoiceInterim] = useState<string>('');
  const [todayCtx, setTodayCtx] = useState<{ count: number; lastTime: string } | null>(null);
  const [promptIdx, setPromptIdx] = useState<number>(0);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  /**
   * Si el usuario llegó vía peep-prompt y escribió algo en la mini-modal
   * del post, lo capturamos como "seed" para pre-rellenar el textarea
   * de la primera entrada. Lo consumimos UNA vez (lo borramos tras leer)
   * para que no aparezca en siguientes entradas.
   */
  // Inicializar prompt del día al montar (client-side, evita hidratación SSR)
  useEffect(() => {
    setPromptIdx(getDailyPromptIdx());
  }, []);

  /**
   * Si el usuario llegó vía peep-prompt y escribió algo en la mini-modal
   * del post, lo capturamos como "seed" para pre-rellenar el textarea
   * de la primera entrada. Lo consumimos UNA vez (lo borramos tras leer)
   * para que no aparezca en siguientes entradas.
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(SEED_FEELING_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { text?: string; source?: string };
      if (parsed?.text && typeof parsed.text === 'string') {
        setText(parsed.text);
        setSeededFromPeep(true);
        // Consumir: borrar para que no se rellene de nuevo en próximas entradas
        window.localStorage.removeItem(SEED_FEELING_KEY);
      }
    } catch {
      // JSON corrupto u otro fallo: ignorar
    }
  }, []);

  // Restaurar borrador (después del seed, para que el seed tenga prioridad)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Si ya hay un seed del peep, no restauramos borrador (el seed tiene preferencia)
    const hasSeed = !!window.localStorage.getItem(SEED_FEELING_KEY);
    if (hasSeed) return;
    const draft = loadDraft();
    if (!draft) return;
    // Solo restaurar si hay contenido real
    if (!draft.moodTouched && draft.emotions.length === 0 && !draft.text.trim()) return;
    setMood(draft.mood);
    setMoodTouched(draft.moodTouched);
    setEmotions(draft.emotions as Emotion[]);
    setText(draft.text);
    setDraftRestored(true);
  }, []);

  // Contexto última entrada (ayer o entre 2-7 días atrás) + entradas de hoy
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const all = loadEntries();
      if (all.length === 0) return;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Entradas de hoy
      const todayEntries = all.filter((e) => {
        const d = new Date(e.createdAt);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === today.getTime();
      });
      if (todayEntries.length > 0) {
        const latest = todayEntries.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];
        const d = new Date(latest.createdAt);
        setTodayCtx({ count: todayEntries.length, lastTime: `${pad2D(d.getHours())}:${pad2D(d.getMinutes())}` });
      }

      // Última entrada de días anteriores (1-7 días atrás)
      const sorted = [...all].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      const last = sorted[0];
      const lastDate = new Date(last.createdAt);
      lastDate.setHours(0, 0, 0, 0);
      const daysAgo = Math.round((today.getTime() - lastDate.getTime()) / 86400000);
      if (daysAgo < 1 || daysAgo > 7) return;
      const topEmotion = last.emotions.length > 0
        ? emotionLabelDiary(last.emotions[0])
        : null;
      setLastCtx({ mood: last.mood, topEmotion, daysAgo });
    } catch { /* silencioso */ }
  }, []);

  // Auto-guardar borrador cada vez que cambia el contenido
  useEffect(() => {
    // No guardar el estado inicial vacío
    if (!moodTouched && emotions.length === 0 && !text.trim()) return;
    saveDraft({ mood, moodTouched, emotions, text });
  }, [mood, moodTouched, emotions, text]);

  const canSave = moodTouched || emotions.length > 0 || text.trim().length > 0;
  const wordCount = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;

  function toggleEmotion(id: Emotion) {
    setEmotions((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  }

  function handleMoodChange(value: number) {
    setMood(value);
    setMoodTouched(true);
  }

  function handleSave() {
    if (!canSave) {
      toast.info('Cuando quieras: mueve el ánimo, marca una emoción o escribe algo. Lo que sea.');
      return;
    }
    setSaving(true);
    const entry: DiaryEntry = {
      id: makeId(),
      createdAt: new Date().toISOString(),
      mood,
      emotions,
      text: text.trim(),
    };
    try {
      saveEntry(entry);
      clearDraft();
      track('entry_saved', { mood: entry.mood, emotions: entry.emotions.length, has_text: entry.text.length > 0 ? 1 : 0 });
      const totalNow = loadEntries().length;
      const milestone = popMilestoneMsg(totalNow);
      if (milestone) {
        toast.success(milestone);
      } else {
        // Mensaje contextual según racha y longitud del texto
        const currentStreak = streakDays();
        const wc = entry.text.trim() ? entry.text.trim().split(/\s+/).filter(Boolean).length : 0;
        let msg = 'Entrada guardada · escucharte cuenta.';
        if (currentStreak >= 7) {
          msg = `Guardado · ${currentStreak} días seguidos. Sigue.`;
        } else if (currentStreak >= 2) {
          msg = `Guardado · Día ${currentStreak} de racha.`;
        } else if (wc > 100) {
          msg = `Guardado · ${wc} palabras. Bien dicho.`;
        }
        toast.success(msg);
      }
      router.push('/');
    } catch (err) {
      console.error('saveEntry failed', err);
      setSaving(false);
      toast.error('No se pudo guardar. Tu texto sigue aquí.', {
        retry: handleSave,
      });
    }
  }

  function handleVoice() {
    if (typeof window === 'undefined') return;

    // Detener si ya está grabando
    if (recording) {
      recognitionRef.current?.stop();
      setRecording(false);
      setVoiceInterim('');
      return;
    }

    // Detectar soporte de la API
    type RecognitionCtor = new () => SpeechRecognitionLike;
    const w = window as unknown as Record<string, unknown>;
    const RecognitionClass = (w['SpeechRecognition'] || w['webkitSpeechRecognition']) as RecognitionCtor | undefined;

    if (!RecognitionClass) {
      toast.info('Tu navegador no soporta dictado. Prueba Chrome o Safari.');
      return;
    }

    const lang = window.localStorage.getItem('egoera-lang') === 'EU' ? 'eu-ES' : 'es-ES';
    const recognition = new RecognitionClass();
    recognition.lang = lang;
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onresult = (event: SpeechRecognitionResultEvent) => {
      const last = event.results[event.results.length - 1];
      const transcript = last[0].transcript;
      if (last.isFinal) {
        setText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setVoiceInterim('');
        setMoodTouched((t) => t); // trigger draft save
      } else {
        setVoiceInterim(transcript);
      }
    };

    recognition.onend = () => {
      setRecording(false);
      setVoiceInterim('');
      recognitionRef.current = null;
    };

    recognition.onerror = (event: Event) => {
      const e = event as unknown as SpeechRecognitionErrorLike;
      setRecording(false);
      setVoiceInterim('');
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        toast.error('Permiso de micrófono denegado. Actívalo en ajustes del navegador.');
      } else if (e.error === 'no-speech') {
        toast.info('No detecté nada. Habla cuando estés listo y pulsa el micro.');
      } else if (e.error !== 'aborted') {
        toast.error('Error de dictado. Inténtalo de nuevo.');
      }
    };

    try {
      recognition.start();
      setRecording(true);
    } catch {
      toast.error('No se pudo iniciar el dictado. Inténtalo de nuevo.');
    }
  }

  return (
    <>
      <Screen background="cream">
        <header className="hdr">
          <div className="hdr-row">
            <span className="eyebrow">— 02 · Diario —</span>
            <button
              type="button"
              className="historial-link"
              onClick={() => router.push('/diario/historial')}
              aria-label="Ver historial de entradas"
            >
              Historial →
            </button>
          </div>
          <h1 className="s-greet">
            ¿Cómo lo
            <br />
            estás <em>llevando</em>?
          </h1>
        </header>

        {todayCtx ? (
          <div className="today-ctx" role="status" aria-label="Ya escribiste hoy">
            <span className="today-ctx-dot" aria-hidden="true" />
            <span className="today-ctx-text">
              {todayCtx.count === 1
                ? `1 entrada hoy · ${todayCtx.lastTime}`
                : `${todayCtx.count} entradas hoy · última a las ${todayCtx.lastTime}`}
            </span>
          </div>
        ) : null}

        {lastCtx ? (
          <div className="last-ctx" role="status" aria-label="Tu última entrada">
            <span className="last-ctx-time">
              {lastCtx.daysAgo === 1 ? 'Ayer' : `Hace ${lastCtx.daysAgo} días`}
            </span>
            <span className="last-ctx-sep" aria-hidden>·</span>
            <span className="last-ctx-mood">
              {lastCtx.mood}
              <span aria-hidden>/10</span>
            </span>
            {lastCtx.topEmotion && (
              <>
                <span className="last-ctx-sep" aria-hidden>·</span>
                <span className="last-ctx-emo">{lastCtx.topEmotion}</span>
              </>
            )}
          </div>
        ) : null}

        <section className="mood-hero" aria-labelledby="mood-label">
          <div
            className="mood-num"
            aria-hidden="true"
            style={{ color: getMoodNumColor(mood), transition: 'color 0.25s ease' }}
          >
            {mood}
          </div>
          <div
            className="mood-label-dyn"
            aria-live="polite"
            aria-atomic="true"
            style={{ color: getMoodNumColor(mood) }}
          >
            {getMoodLabel(mood)}
          </div>

          <label htmlFor="mood-range" id="mood-label" className="sr-only">
            Estado de ánimo (0 a 10)
          </label>
          <input
            id="mood-range"
            type="range"
            min={0}
            max={10}
            step={1}
            value={mood}
            onChange={(e) => handleMoodChange(Number(e.target.value))}
            className="slider"
          />
        </section>

        <section className="emo-section" aria-labelledby="emo-eyebrow">
          <span id="emo-eyebrow" className="eyebrow">
            — ¿Qué se siente? —
          </span>
          <div className="chips" role="group" aria-label="Emociones">
            {EMOTIONS.map((emo) => {
              const active = emotions.includes(emo.id as Emotion);
              return (
                <button
                  key={emo.id}
                  type="button"
                  role="checkbox"
                  aria-checked={active}
                  className={`chip ${active ? 'chip-on' : ''}`}
                  onClick={() => toggleEmotion(emo.id as Emotion)}
                >
                  {emo.label}
                </button>
              );
            })}
          </div>
        </section>

        <section className="text-section">
          {seededFromPeep ? (
            <p className="seed-note" aria-live="polite">
              — Lo que escribiste en el artículo está abajo. Puedes editarlo, borrarlo
              o sumar a partir de ahí.
            </p>
          ) : draftRestored ? (
            <div className="seed-note draft-note" role="status" aria-live="polite">
              <span>— Tenías un borrador guardado. Lo he recuperado.</span>
              <button
                type="button"
                className="draft-discard"
                onClick={() => {
                  clearDraft();
                  setMood(DEFAULT_MOOD);
                  setMoodTouched(false);
                  setEmotions([]);
                  setText('');
                  setDraftRestored(false);
                }}
              >
                Descartar ×
              </button>
            </div>
          ) : null}
          <label htmlFor="diary-text" className="sr-only">
            Cuéntalo si quieres (Cmd+Enter o Ctrl+Enter para guardar)
          </label>
          <textarea
            id="diary-text"
            className={`diary-text ${seededFromPeep ? 'seeded' : ''}`}
            placeholder="Cuéntalo si quieres…"
            rows={4}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (seededFromPeep && e.target.value !== text) {
                setSeededFromPeep(false); // ya editó, dejar de mostrarlo como seed
              }
            }}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                e.preventDefault();
                handleSave();
              }
            }}
          />
          {wordCount > 0 && (
            <div className="word-count" aria-live="polite" aria-atomic="true">
              {wordCount} {wordCount === 1 ? 'palabra' : 'palabras'}
            </div>
          )}
          {!text.trim() && (
            <div className="prompt-row">
              <button
                type="button"
                className="prompt-sugg"
                onClick={() => setText(WRITING_PROMPTS[promptIdx])}
                aria-label="Usar este prompt de escritura"
              >
                <span className="prompt-icon" aria-hidden="true">✎</span>
                <span className="prompt-text">{WRITING_PROMPTS[promptIdx]}</span>
              </button>
              <button
                type="button"
                className="prompt-shuffle"
                onClick={() =>
                  setPromptIdx((i) => (i + 1) % WRITING_PROMPTS.length)
                }
                aria-label="Ver otro prompt de escritura"
                title="Otro prompt"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M17 1l4 4-4 4" />
                  <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                  <path d="M7 23l-4-4 4-4" />
                  <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                </svg>
              </button>
            </div>
          )}
        </section>

        {voiceInterim ? (
          <div className="voice-interim" role="status" aria-live="polite">
            <span className="voice-dot" aria-hidden>●</span>
            <span className="voice-interim-text">{voiceInterim}</span>
          </div>
        ) : null}

        <section
          className={`m-card m-card-cobalto voice-card ${recording ? 'voice-card-active' : ''}`}
          role="button"
          tabIndex={0}
          onClick={handleVoice}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleVoice();
            }
          }}
          aria-label={recording ? 'Detener grabación' : 'Hablar para transcribir'}
          aria-pressed={recording}
        >
          <span className="pill-num">{recording ? '● Grabando…' : 'Voz · 2 min'}</span>
          <h3 className="card-title">
            {recording ? '«Escuchándote…»' : '«Cuéntalo en alto»'}
          </h3>
          <p className="card-sub">
            {recording
              ? 'Habla tranquilamente. Pulsa para parar.'
              : 'Si te cuesta escribir, habla. Lo transcribimos en privado.'}
          </p>
        </section>

        <button
          type="button"
          className="btn btn-outline save-btn"
          onClick={handleSave}
          aria-busy={saving}
          disabled={saving}
        >
          {saving ? 'Guardando…' : 'Guardar entrada'}
        </button>
      </Screen>

      <SafetyBar text={text} />

      <button
        type="button"
        className={`voice-fab ${recording ? 'voice-fab-active' : ''}`}
        onClick={handleVoice}
        aria-label={recording ? 'Detener grabación de voz' : 'Iniciar dictado de voz'}
        aria-pressed={recording}
      >
        {recording ? (
          /* Stop icon when recording */
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
        ) : (
          /* Mic icon when idle */
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="9" y="3" width="6" height="12" rx="3" />
            <path d="M5 11a7 7 0 0 0 14 0" />
            <path d="M12 18v3" />
          </svg>
        )}
      </button>

      <TabBar />

      <style jsx>{`
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }

        .hdr {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 28px;
        }
        .hdr-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .historial-link {
          background: none;
          border: none;
          padding: 0;
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--cobalto);
          cursor: pointer;
          opacity: 0.65;
          transition: opacity 0.15s;
        }
        .historial-link:hover { opacity: 1; }
        .historial-link:focus-visible {
          outline: 2px solid var(--cobalto);
          outline-offset: 2px;
          border-radius: 3px;
        }

        /* === Today context banner === */
        .today-ctx {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          margin-bottom: 10px;
          background: rgba(29, 43, 219, 0.06);
          border: 1px solid rgba(29, 43, 219, 0.14);
          border-radius: var(--r-md);
        }
        .today-ctx-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--cobalto);
          flex-shrink: 0;
          opacity: 0.7;
        }
        .today-ctx-text {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--cobalto);
          opacity: 0.75;
        }

        /* === Word count === */
        .word-count {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--ink);
          opacity: 0.35;
          text-align: right;
          padding-top: 4px;
          user-select: none;
        }

        /* === Last context bar === */
        .last-ctx {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 9px 14px;
          margin-bottom: 14px;
          background: rgba(13, 15, 61, 0.04);
          border: 1px solid rgba(13, 15, 61, 0.09);
          border-radius: var(--r-md);
          flex-wrap: wrap;
        }
        .last-ctx-time {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          opacity: 0.45;
        }
        .last-ctx-sep {
          font-size: 10px;
          opacity: 0.28;
        }
        .last-ctx-mood {
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 700;
          font-size: 18px;
          line-height: 1;
          color: var(--cobalto);
        }
        .last-ctx-mood span {
          font-family: var(--font-mono);
          font-style: normal;
          font-weight: 400;
          font-size: 10px;
          letter-spacing: 0.1em;
          opacity: 0.55;
        }
        .last-ctx-emo {
          font-family: var(--font-display);
          font-style: italic;
          font-size: 14px;
          color: var(--ink);
          opacity: 0.6;
        }

        /* === Mood hero === */
        .mood-hero {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin: 8px 0 28px;
        }
        .mood-num {
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 800;
          font-size: 140px;
          line-height: 0.95;
          letter-spacing: -0.04em;
          color: var(--cobalto);
          font-variant-numeric: tabular-nums;
        }
        .mood-of {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          opacity: 0.55;
          margin-top: 2px;
          margin-bottom: 8px;
        }
        .mood-label-dyn {
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 600;
          font-size: 18px;
          line-height: 1;
          letter-spacing: -0.01em;
          margin-bottom: 20px;
          transition: color 0.25s ease;
          user-select: none;
        }

        /* === Slider === */
        .slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 4px;
          background: rgba(13, 15, 61, 0.14);
          border-radius: 999px;
          outline: none;
          margin: 0;
        }
        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: var(--cobalto);
          box-shadow: 0 6px 14px rgba(29, 43, 219, 0.42);
          cursor: pointer;
          border: none;
        }
        .slider::-moz-range-thumb {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: var(--cobalto);
          box-shadow: 0 6px 14px rgba(29, 43, 219, 0.42);
          cursor: pointer;
          border: none;
        }
        .slider:focus-visible::-webkit-slider-thumb {
          outline: 2px solid var(--accent);
          outline-offset: 2px;
        }

        /* === Emociones === */
        .emo-section {
          margin: 8px 0 28px;
        }
        .emo-section .eyebrow {
          display: block;
          margin-bottom: 14px;
        }
        .chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .chip {
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 500;
          padding: 7px 14px;
          border-radius: var(--r-pill);
          border: 1.5px solid rgba(13, 15, 61, 0.18);
          background: transparent;
          color: var(--ink);
          cursor: pointer;
          transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease, transform 0.1s ease;
        }
        .chip:active {
          transform: scale(0.97);
        }
        .chip-on {
          background: var(--cobalto);
          color: var(--crema);
          border-color: var(--cobalto);
        }

        /* === Textarea === */
        .text-section {
          margin: 0 0 24px;
        }
        .seed-note {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.06em;
          line-height: 1.45;
          color: var(--cobalto);
          opacity: 0.72;
          margin: 0 0 8px;
          padding: 8px 12px;
          background: rgba(29, 43, 219, 0.06);
          border-left: 2px solid var(--cobalto);
          border-radius: 6px;
        }
        .diary-text {
          width: 100%;
          font-family: var(--font-body);
          font-size: 15px;
          line-height: 1.55;
          color: var(--ink);
          background: transparent;
          border: 1px solid rgba(13, 15, 61, 0.16);
          border-radius: var(--r-md);
          padding: 14px 16px;
          resize: vertical;
          min-height: 88px;
          outline: none;
          transition: border-color 0.15s ease, background 0.15s ease;
        }
        .draft-note {
          background: rgba(13, 15, 61, 0.04);
          border-left-color: rgba(13, 15, 61, 0.3);
          color: var(--ink);
          opacity: 0.65;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }
        .draft-discard {
          background: none;
          border: none;
          padding: 0;
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--ink);
          cursor: pointer;
          opacity: 0.55;
          white-space: nowrap;
          flex-shrink: 0;
          transition: opacity 0.15s;
        }
        .draft-discard:hover { opacity: 1; }
        .diary-text.seeded {
          background: rgba(29, 43, 219, 0.04);
          border-color: rgba(29, 43, 219, 0.32);
          font-family: var(--font-display);
          font-style: italic;
        }
        .diary-text::placeholder {
          font-family: var(--font-display);
          font-style: italic;
          color: rgba(13, 15, 61, 0.42);
        }
        .diary-text:focus {
          border-color: var(--cobalto);
        }

        /* === Prompt sugerido === */
        .prompt-row {
          display: flex;
          align-items: stretch;
          gap: 6px;
          margin-top: 8px;
        }
        .prompt-sugg {
          display: flex;
          align-items: flex-start;
          gap: 7px;
          padding: 9px 12px;
          background: none;
          border: 1px dashed rgba(13, 15, 61, 0.2);
          border-radius: var(--r-md);
          cursor: pointer;
          flex: 1;
          text-align: left;
          font: inherit;
          -webkit-tap-highlight-color: transparent;
          transition: border-color 0.15s, background 0.15s;
        }
        .prompt-sugg:hover {
          border-color: var(--cobalto);
          background: rgba(29, 43, 219, 0.04);
        }
        .prompt-icon {
          font-size: 12px;
          opacity: 0.4;
          flex-shrink: 0;
          margin-top: 1px;
          color: var(--ink);
        }
        .prompt-text {
          font-family: var(--font-display);
          font-style: italic;
          font-size: 13px;
          line-height: 1.45;
          color: var(--ink);
          opacity: 0.55;
        }
        .prompt-shuffle {
          flex-shrink: 0;
          width: 36px;
          border: 1px dashed rgba(13, 15, 61, 0.2);
          border-radius: var(--r-md);
          background: none;
          color: var(--ink);
          opacity: 0.38;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          -webkit-tap-highlight-color: transparent;
          transition: opacity 0.15s, border-color 0.15s, transform 0.15s;
          padding: 0;
        }
        .prompt-shuffle:hover {
          opacity: 0.75;
          border-color: var(--cobalto);
        }
        .prompt-shuffle:active {
          transform: rotate(180deg);
          opacity: 1;
        }
        .prompt-shuffle svg {
          width: 14px;
          height: 14px;
        }

        /* === Voice interim === */
        .voice-interim {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 10px 14px;
          margin-bottom: 12px;
          background: rgba(29, 43, 219, 0.07);
          border: 1px solid rgba(29, 43, 219, 0.18);
          border-radius: var(--r-md);
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .voice-dot {
          color: var(--cobalto);
          font-size: 10px;
          animation: pulse 1s ease-in-out infinite;
          flex-shrink: 0;
          margin-top: 2px;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .voice-interim-text {
          font-family: var(--font-display);
          font-style: italic;
          font-size: 15px;
          line-height: 1.5;
          color: var(--cobalto);
          opacity: 0.85;
        }

        /* === Voice card === */
        .voice-card {
          margin: 0 0 24px;
          cursor: pointer;
        }
        .voice-card-active {
          background: var(--accent) !important;
          animation: voicePulse 1.5s ease-in-out infinite;
        }
        @keyframes voicePulse {
          0%, 100% { box-shadow: 0 6px 20px rgba(29, 43, 219, 0.3); }
          50% { box-shadow: 0 6px 32px rgba(29, 43, 219, 0.55); }
        }
        .voice-card:focus-visible {
          outline: 2px solid var(--accent);
          outline-offset: 3px;
        }

        /* === Save button === */
        .save-btn {
          display: flex;
          width: 100%;
          justify-content: center;
          padding: 14px 22px;
          font-size: 14px;
          font-weight: 600;
          /* deja hueco al FAB de voz + tab bar */
          margin-bottom: 96px;
        }
        .save-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        /* === Voice FAB === */
        .voice-fab {
          position: fixed;
          bottom: 104px;
          left: 50%;
          transform: translateX(-50%);
          width: 74px;
          height: 74px;
          border-radius: 50%;
          background: var(--cobalto);
          color: var(--crema);
          border: none;
          cursor: pointer;
          box-shadow: 0 18px 40px rgba(29, 43, 219, 0.5), 0 4px 12px rgba(13, 15, 61, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 30;
          transition: transform 0.15s ease, background 0.2s ease, box-shadow 0.2s ease;
        }
        .voice-fab:active {
          transform: translateX(-50%) scale(0.94);
        }
        .voice-fab-active {
          background: var(--accent) !important;
          box-shadow: 0 18px 50px rgba(217, 119, 87, 0.55), 0 4px 12px rgba(13, 15, 61, 0.15) !important;
          animation: fabPulse 1.4s ease-in-out infinite;
        }
        @keyframes fabPulse {
          0%, 100% { box-shadow: 0 18px 40px rgba(217, 119, 87, 0.45); }
          50% { box-shadow: 0 18px 60px rgba(217, 119, 87, 0.7); }
        }
        .voice-fab svg {
          width: 30px;
          height: 30px;
        }
      `}</style>
    </>
  );
}
