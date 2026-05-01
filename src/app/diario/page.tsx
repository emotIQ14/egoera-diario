'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Screen from '@/components/Screen';
import TabBar from '@/components/TabBar';
import { saveEntry, makeId } from '@/lib/storage';
import type { DiaryEntry, Emotion } from '@/lib/storage';
import { EMOTIONS } from '@/lib/types';

const DEFAULT_MOOD = 7;

export default function DiarioPage() {
  const router = useRouter();
  const [mood, setMood] = useState<number>(DEFAULT_MOOD);
  const [moodTouched, setMoodTouched] = useState<boolean>(false);
  const [emotions, setEmotions] = useState<Emotion[]>([]);
  const [text, setText] = useState<string>('');

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
    if (!canSave) return;
    const entry: DiaryEntry = {
      id: makeId(),
      createdAt: new Date().toISOString(),
      mood,
      emotions,
      text: text.trim(),
    };
    saveEntry(entry);
    router.push('/');
  }

  function handleVoice() {
    alert('Próximamente');
  }

  return (
    <>
      <Screen background="cream">
        <header className="hdr">
          <span className="eyebrow">— 02 · Diario —</span>
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
          <label htmlFor="diary-text" className="sr-only">
            Cuéntalo si quieres
          </label>
          <textarea
            id="diary-text"
            className="diary-text"
            placeholder="Cuéntalo si quieres…"
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
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
          disabled={!canSave}
        >
          Guardar entrada
        </button>
      </Screen>

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
          transition: border-color 0.15s ease;
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
          /* deja hueco al FAB de voz */
          margin-bottom: 24px;
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
