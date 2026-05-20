'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Screen from '@/components/Screen';
import TabBar from '@/components/TabBar';
import SafetyBar from '@/components/SafetyBar';
import { saveEntry, makeId } from '@/lib/storage';
import type { DiaryEntry, Emotion } from '@/lib/storage';
import { EMOTIONS } from '@/lib/types';
import { useToast } from '@/components/toast/ToastProvider';
import { track } from '@/lib/track';

const DEFAULT_MOOD = 7;
const SEED_FEELING_KEY = 'egoera-seed-feeling';
const DRAFT_KEY = 'egoera-diario-draft';

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

  // Auto-guardar borrador cada vez que cambia el contenido
  useEffect(() => {
    // No guardar el estado inicial vacío
    if (!moodTouched && emotions.length === 0 && !text.trim()) return;
    saveDraft({ mood, moodTouched, emotions, text });
  }, [mood, moodTouched, emotions, text]);

  const canSave = moodTouched || emotions.length > 0 || text.trim().length > 0;

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
      toast.success('Entrada guardada · escucharte cuenta.');
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
    toast.info('La voz llega pronto. Te avisamos cuando esté.');
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

        <section className="mood-hero" aria-labelledby="mood-label">
          <div className="mood-num" aria-hidden="true">
            {mood}
          </div>
          <div className="mood-of">— de 10 —</div>

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
          <div className="slider-legend">
            <span>Mal</span>
            <span>Regular</span>
            <span>Bien</span>
          </div>
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
            Cuéntalo si quieres
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
          />
        </section>

        <section
          className="m-card m-card-cobalto voice-card"
          role="button"
          tabIndex={0}
          onClick={handleVoice}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleVoice();
            }
          }}
          aria-label="Cuéntalo en alto, próximamente"
        >
          <span className="pill-num">Voz · 2 min</span>
          <h3 className="card-title">«Cuéntalo en alto»</h3>
          <p className="card-sub">
            Si te cuesta escribir, habla. Lo transcribimos en privado.
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
        className="voice-fab"
        onClick={handleVoice}
        aria-label="Grabar voz, próximamente"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="9" y="3" width="6" height="12" rx="3" />
          <path d="M5 11a7 7 0 0 0 14 0" />
          <path d="M12 18v3" />
        </svg>
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
          margin-bottom: 24px;
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
        .slider-legend {
          display: flex;
          justify-content: space-between;
          width: 100%;
          margin-top: 12px;
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          opacity: 0.55;
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

        /* === Voice card === */
        .voice-card {
          margin: 0 0 24px;
          cursor: pointer;
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
          transition: transform 0.15s ease;
        }
        .voice-fab:active {
          transform: translateX(-50%) scale(0.94);
        }
        .voice-fab svg {
          width: 30px;
          height: 30px;
        }
      `}</style>
    </>
  );
}
