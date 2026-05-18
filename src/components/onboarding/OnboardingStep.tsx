'use client';

import type { ReactNode } from 'react';
import Dots from './Dots';

type Background = 'cream' | 'cobalto' | 'ink';

/**
 * Wrapper común a todas las pantallas del onboarding.
 * - Sin TabBar (estamos antes del login).
 * - Header fijo con dots indicator + botón Saltar.
 * - Hero centrado verticalmente.
 * - CTA pill anclado al fondo.
 * - Fade entre pantallas mediante `data-active`.
 */
export default function OnboardingStep({
  index,
  total,
  active,
  background,
  onSkip,
  onNext,
  ctaLabel,
  ctaTone,
  hideSkip = false,
  children,
}: {
  index: number;
  total: number;
  active: boolean;
  background: Background;
  onSkip: () => void;
  onNext?: () => void;
  ctaLabel: string;
  ctaTone?: 'cobalto' | 'accent' | 'cream';
  hideSkip?: boolean;
  children: ReactNode;
}) {
  const bg =
    background === 'ink'
      ? 'var(--ink)'
      : background === 'cobalto'
        ? 'var(--cobalto)'
        : 'var(--crema)';
  const fg = background === 'cream' ? 'var(--ink)' : 'var(--crema)';
  const dotsTone: 'ink' | 'cream' = background === 'cream' ? 'ink' : 'cream';

  const ctaClass =
    ctaTone === 'accent'
      ? 'cta cta-accent'
      : ctaTone === 'cream'
        ? 'cta cta-cream'
        : 'cta cta-cobalto';

  return (
    <section
      className="step"
      data-active={active}
      aria-hidden={!active}
      style={{ background: bg, color: fg }}
    >
      <header className="head">
        <Dots total={total} current={index} tone={dotsTone} />
        {!hideSkip ? (
          <button
            type="button"
            className="skip"
            onClick={onSkip}
            aria-label="Saltar onboarding"
          >
            Saltar →
          </button>
        ) : (
          <span aria-hidden="true" />
        )}
      </header>

      <div className="body">{children}</div>

      {onNext ? (
        <div className="cta-wrap">
          <button
            type="button"
            className={ctaClass}
            onClick={onNext}
            aria-label={ctaLabel}
          >
            {ctaLabel}
          </button>
        </div>
      ) : null}

      <style jsx>{`
        .step {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          padding: 24px 22px calc(28px + env(safe-area-inset-bottom, 0px));
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease;
        }
        .step[data-active='true'] {
          opacity: 1;
          pointer-events: auto;
        }
        .head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 520px;
          width: 100%;
          margin: 0 auto;
          padding-top: env(safe-area-inset-top, 0px);
        }
        .skip {
          font-family: var(--font-mono);
          font-size: 12px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          font-weight: 600;
          opacity: 0.85;
          /* Tap target ≥44px tall, padding generoso para pulgar derecho */
          min-height: 44px;
          min-width: 44px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 10px 14px;
          background: none;
          border: none;
          color: inherit;
          cursor: pointer;
          border-radius: 8px;
          transition: opacity 0.15s ease, background 0.15s ease;
        }
        .skip:hover,
        .skip:focus-visible {
          opacity: 1;
          outline: none;
          background: rgba(13, 15, 61, 0.06);
        }
        @media (max-width: 480px) {
          .skip { font-size: 11.5px; }
        }
        .body {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          max-width: 520px;
          width: 100%;
          margin: 0 auto;
          padding: 28px 0;
        }
        .cta-wrap {
          max-width: 520px;
          width: 100%;
          margin: 0 auto;
        }
        .cta {
          display: block;
          width: 100%;
          font-family: var(--font-body);
          font-weight: 600;
          font-size: 16px;
          letter-spacing: 0.01em;
          padding: 20px 28px;
          border-radius: var(--r-pill);
          border: none;
          cursor: pointer;
          transition: transform 0.15s ease, opacity 0.15s ease;
        }
        .cta:active {
          transform: scale(0.985);
          opacity: 0.95;
        }
        .cta:focus-visible {
          outline: 2px solid currentColor;
          outline-offset: 3px;
        }
        .cta-cobalto {
          background: var(--cobalto);
          color: var(--crema);
        }
        .cta-accent {
          background: var(--accent);
          color: var(--crema);
        }
        .cta-cream {
          background: var(--crema);
          color: var(--ink);
        }
      `}</style>
    </section>
  );
}
