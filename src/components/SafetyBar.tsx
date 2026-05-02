'use client';

import { useEffect, useRef, useState } from 'react';

const CRISIS_PATTERN =
  /\b(suicid|matarme|acabar con|no quiero seguir|no aguanto m[aá]s|hacerme da[ñn]o)\b/i;

export default function SafetyBar({
  text,
  offsetBottom = 96,
}: {
  text: string;
  offsetBottom?: number;
}): React.ReactElement | null {
  const [visible, setVisible] = useState<boolean>(false);
  // Si el usuario cierra mientras el patrón está activo, dejamos de mostrar
  // hasta que el patrón desaparezca; entonces armamos para volver a mostrarlo
  // si reaparece.
  const dismissedForCurrentMatchRef = useRef<boolean>(false);

  useEffect(() => {
    const match = CRISIS_PATTERN.test(text);
    if (match) {
      if (!dismissedForCurrentMatchRef.current) {
        setVisible(true);
      }
    } else {
      dismissedForCurrentMatchRef.current = false;
      setVisible(false);
    }
  }, [text]);

  function handleClose(): void {
    dismissedForCurrentMatchRef.current = true;
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className="safety"
      role="status"
      aria-live="polite"
      style={{ bottom: `${offsetBottom}px` }}
    >
      <p className="safety-text">
        Si lo necesitas: <strong>024</strong> · línea de atención a la conducta
        suicida (España, 24h).
      </p>
      <a
        href="tel:024"
        className="safety-call"
        aria-label="Llamar al 024"
      >
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      </a>
      <button
        type="button"
        className="safety-close"
        onClick={handleClose}
        aria-label="Cerrar aviso"
      >
        ×
      </button>

      <style jsx>{`
        .safety {
          position: fixed;
          left: 14px;
          right: 14px;
          max-width: 520px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 14px;
          background: var(--crema-soft);
          color: var(--ink);
          border: 1px solid var(--accent);
          border-radius: var(--r-md);
          box-shadow: var(--shadow-sm);
          z-index: 50;
          animation: slideUp 0.28s ease both;
        }
        .safety-text {
          flex: 1;
          font-family: var(--font-body);
          font-size: 13px;
          line-height: 1.4;
          color: var(--ink);
          margin: 0;
        }
        .safety-text strong {
          color: var(--accent-deep);
          font-weight: 700;
        }
        .safety-call {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 999px;
          background: var(--accent);
          color: var(--crema);
          flex-shrink: 0;
          transition: transform 0.15s ease;
        }
        .safety-call:active {
          transform: scale(0.94);
        }
        .safety-close {
          background: none;
          border: none;
          padding: 0;
          width: 28px;
          height: 28px;
          font-size: 22px;
          line-height: 1;
          color: var(--ink);
          opacity: 0.55;
          cursor: pointer;
          flex-shrink: 0;
          transition: opacity 0.15s ease;
        }
        .safety-close:hover {
          opacity: 0.9;
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
