'use client';

/**
 * Toast que aparece al terminar el cuaderno o al avanzar a un sello clave.
 *
 * Inspiración: pantalla "Sello + puente al diario" del diseño Egoera
 * Cuaderno-Diario-Recurso. Convierte el progreso del cuaderno en una
 * entrada del diario emocional con un solo click.
 */

import { useEffect, useState } from 'react';
import { saveEntry, makeId, DiaryEntry, Emotion } from '@/lib/storage';
import { track } from '@/lib/track';

type Props = {
  open: boolean;
  cuadernoTitle: string;
  cuadernoSlug: string;
  sealLabel: string; // ej. "Flow", "Hipervigilancia", "Cuaderno completado"
  suggestedText?: string;
  suggestedEmotions?: Emotion[];
  suggestedMood?: number;
  onClose: () => void;
};

export default function CuadernoBridgeToast({
  open,
  cuadernoTitle,
  cuadernoSlug,
  sealLabel,
  suggestedText = '',
  suggestedEmotions = [],
  suggestedMood = 6,
  onClose,
}: Props) {
  const [text, setText] = useState(suggestedText);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (open) {
      setText(suggestedText);
      setSaved(false);
    }
  }, [open, suggestedText]);

  if (!open) return null;

  const save = () => {
    const entry: DiaryEntry = {
      id: makeId(),
      createdAt: new Date().toISOString(),
      mood: suggestedMood,
      emotions: suggestedEmotions,
      text: text.trim() || `Desde el cuaderno · ${cuadernoTitle} · sello ${sealLabel}.`,
      context: ['personal'],
    };
    saveEntry(entry);
    setSaved(true);
    track('cuaderno_finished', { slug: cuadernoSlug, bridged: 1 });
    window.setTimeout(() => {
      onClose();
    }, 1400);
  };

  return (
    <div className="bridge-bg" onClick={onClose} role="dialog" aria-label="Guardar en el diario">
      <div className="bridge" onClick={(e) => e.stopPropagation()}>
        <header className="bridge-head">
          <div className="bridge-seal" aria-hidden>
            <span>{sealLabel.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <span className="bridge-eyebrow">+1 sello</span>
            <h2 className="bridge-title">
              <em>{sealLabel}.</em>
            </h2>
            <p className="bridge-sub">Desde el cuaderno «{cuadernoTitle}»</p>
          </div>
        </header>

        {!saved ? (
          <>
            <div className="bridge-prompt">¿Te llevas algo del ejercicio a tu diario? →</div>
            <textarea
              className="bridge-textarea"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={`Escribe lo que te quedas del ejercicio "${sealLabel}"…`}
              rows={4}
              autoFocus
            />
            <div className="bridge-actions">
              <button className="bridge-btn bridge-btn-ghost" onClick={onClose}>
                Saltar
              </button>
              <button className="bridge-btn bridge-btn-primary" onClick={save}>
                Guardar en mi diario →
              </button>
            </div>
            <p className="bridge-foot">
              Sin obligación. Lo guarda en privado en este dispositivo.
            </p>
          </>
        ) : (
          <div className="bridge-saved">
            <div className="bridge-check">✓</div>
            <p>Entrada añadida a tu diario.</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .bridge-bg {
          position: fixed;
          inset: 0;
          background: rgba(13, 15, 61, 0.65);
          backdrop-filter: blur(8px);
          z-index: 100;
          display: grid;
          place-items: center;
          padding: 20px;
          animation: fadeIn 0.18s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .bridge {
          background: linear-gradient(135deg, #1d2bdb 0%, #0f1a9c 100%);
          color: var(--crema);
          border-radius: 22px;
          padding: 26px 22px 22px;
          max-width: 460px;
          width: 100%;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
          position: relative;
          animation: slideUp 0.28s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .bridge-head {
          display: flex;
          gap: 14px;
          align-items: flex-start;
          margin-bottom: 16px;
        }
        .bridge-seal {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #d97757;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          transform: rotate(-6deg);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 600;
          font-size: 26px;
          color: var(--crema);
        }
        .bridge-eyebrow {
          display: block;
          font-family: var(--font-mono);
          font-size: 9.5px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #f4c842;
          margin-bottom: 2px;
        }
        .bridge-title {
          font-family: var(--font-display);
          font-weight: 300;
          font-size: 26px;
          margin: 0;
          line-height: 1.05;
          letter-spacing: -0.01em;
        }
        .bridge-title em {
          font-style: italic;
          font-weight: 600;
          color: #f4c842;
        }
        .bridge-sub {
          font-family: var(--font-body);
          font-size: 12px;
          color: rgba(241, 234, 216, 0.7);
          margin: 4px 0 0;
          font-style: italic;
        }
        .bridge-prompt {
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 300;
          font-size: 16px;
          color: var(--crema);
          margin: 14px 0 10px;
        }
        .bridge-textarea {
          width: 100%;
          min-height: 100px;
          padding: 14px 14px;
          background: rgba(241, 234, 216, 0.08);
          border: 1px solid rgba(241, 234, 216, 0.2);
          border-radius: 12px;
          font-family: var(--font-hand, 'Caveat'), cursive;
          font-size: 18px;
          line-height: 1.35;
          color: var(--crema);
          resize: vertical;
          outline: none;
        }
        .bridge-textarea:focus {
          border-color: #f4c842;
          background: rgba(244, 200, 66, 0.08);
        }
        .bridge-textarea::placeholder {
          color: rgba(241, 234, 216, 0.4);
          font-family: var(--font-body);
          font-size: 13px;
          font-style: italic;
        }
        .bridge-actions {
          display: flex;
          gap: 10px;
          margin-top: 14px;
          justify-content: flex-end;
        }
        .bridge-btn {
          font-family: var(--font-mono);
          font-size: 10.5px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          padding: 12px 18px;
          border-radius: 999px;
          cursor: pointer;
          border: 1px solid transparent;
          font-weight: 600;
        }
        .bridge-btn-ghost {
          background: transparent;
          color: rgba(241, 234, 216, 0.7);
          border-color: rgba(241, 234, 216, 0.22);
        }
        .bridge-btn-ghost:hover {
          color: var(--crema);
          border-color: rgba(241, 234, 216, 0.45);
        }
        .bridge-btn-primary {
          background: #f4c842;
          color: #0d0f3d;
        }
        .bridge-btn-primary:hover {
          background: #f7d35a;
        }
        .bridge-foot {
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(241, 234, 216, 0.45);
          margin: 14px 0 0;
          text-align: center;
        }
        .bridge-saved {
          padding: 24px 0 12px;
          text-align: center;
        }
        .bridge-check {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: #f4c842;
          color: #0d0f3d;
          display: grid;
          place-items: center;
          margin: 0 auto 12px;
          font-size: 36px;
          font-weight: 700;
          font-family: var(--font-body);
          animation: pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes pop {
          0% { transform: scale(0); }
          60% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
        .bridge-saved p {
          font-family: var(--font-display);
          font-style: italic;
          font-size: 18px;
          margin: 0;
          color: var(--crema);
        }
      `}</style>
    </div>
  );
}
