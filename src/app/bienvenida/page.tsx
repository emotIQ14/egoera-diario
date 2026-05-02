'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingStep from '@/components/onboarding/OnboardingStep';

const TOTAL_STEPS = 5;
const NAME_KEY = 'egoera-diario-name';
const ONBOARDED_KEY = 'egoera-diario-onboarded';

type Authority = {
  pill: string;
  name: string;
  quote: string;
};

const AUTHORITIES: Authority[] = [
  { pill: '01', name: 'John Bowlby', quote: 'Teoría del apego — 1969' },
  { pill: '02', name: 'Marshall Rosenberg', quote: 'Comunicación No Violenta — 2003' },
  { pill: '03', name: 'Jon Kabat-Zinn', quote: 'Mindfulness clínico — 1979' },
];

const CHECKLIST = [
  '01 · Identificar tus emociones recurrentes.',
  '02 · Encontrar tu palabra de la semana.',
  '03 · Conectar emociones con momentos del día.',
] as const;

export default function BienvenidaPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [name, setName] = useState<string>('');

  const goNext = useCallback(() => {
    setCurrentStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  }, []);

  const finishOnboarding = useCallback(
    (saveName: boolean) => {
      if (typeof window !== 'undefined') {
        if (saveName) {
          const trimmed = name.trim();
          if (trimmed.length > 0) {
            window.localStorage.setItem(NAME_KEY, trimmed);
          }
        }
        window.localStorage.setItem(ONBOARDED_KEY, 'true');
      }
      router.push('/');
    },
    [name, router],
  );

  const handleSkip = useCallback(() => {
    finishOnboarding(false);
  }, [finishOnboarding]);

  const handleSubmitName = useCallback(() => {
    finishOnboarding(true);
  }, [finishOnboarding]);

  return (
    <>
      {/* 01 — Bienvenida */}
      <OnboardingStep
        index={0}
        total={TOTAL_STEPS}
        active={currentStep === 0}
        background="cream"
        onSkip={handleSkip}
        onNext={goNext}
        ctaLabel="Empezar →"
        ctaTone="cobalto"
      >
        <div className="hero hero-cream">
          <p className="eyebrow">— EGOERA DIARIO —</p>
          <h1 className="display">
            Diario emocional
            <br />
            <em>despacio</em>.
          </h1>
          <p className="lede">
            Sin gamificación. Sin métricas raras. Sin atajos. Solo tú escuchándote.
          </p>
          <svg
            className="brain-tree"
            viewBox="0 0 200 140"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path
              d="M100 130 C100 100, 100 70, 100 30"
              stroke="var(--cobalto)"
            />
            <path
              d="M100 60 C 80 45, 60 50, 50 30"
              stroke="var(--cobalto)"
              opacity="0.75"
            />
            <path
              d="M100 75 C 120 60, 145 65, 155 45"
              stroke="var(--cobalto)"
              opacity="0.75"
            />
            <path
              d="M100 95 C 85 85, 70 90, 60 80"
              stroke="var(--cobalto)"
              opacity="0.45"
            />
            <path
              d="M100 95 C 115 85, 130 90, 140 80"
              stroke="var(--cobalto)"
              opacity="0.45"
            />
            <circle cx="100" cy="28" r="3" fill="var(--cobalto)" />
            <circle cx="50" cy="30" r="2.5" fill="var(--cobalto)" opacity="0.75" />
            <circle cx="155" cy="45" r="2.5" fill="var(--cobalto)" opacity="0.75" />
          </svg>
        </div>
      </OnboardingStep>

      {/* 02 — Authority / Ciencia */}
      <OnboardingStep
        index={1}
        total={TOTAL_STEPS}
        active={currentStep === 1}
        background="cobalto"
        onSkip={handleSkip}
        onNext={goNext}
        ctaLabel="Continuar"
        ctaTone="cream"
      >
        <div className="authority">
          <p className="eyebrow eyebrow-cream">— BASADO EN —</p>
          <ul className="auth-list">
            {AUTHORITIES.map((a) => (
              <li key={a.name} className="auth-card">
                <span className="auth-pill">{a.pill}</span>
                <div className="auth-text">
                  <h3 className="auth-name">{a.name}</h3>
                  <p className="auth-quote">{a.quote}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="auth-foot">
            <em>40 años</em> de investigación,
            <br />
            en una app de bolsillo.
          </p>
        </div>
      </OnboardingStep>

      {/* 03 — Promesa concreta */}
      <OnboardingStep
        index={2}
        total={TOTAL_STEPS}
        active={currentStep === 2}
        background="cream"
        onSkip={handleSkip}
        onNext={goNext}
        ctaLabel="Continuar"
        ctaTone="cobalto"
      >
        <div className="hero hero-cream">
          <p className="eyebrow">— EN 30 DÍAS —</p>
          <h1 className="display">
            Verás patrones
            <br />
            que llevan <em className="accent">años</em>
            <br />
            escondidos.
          </h1>
          <ul className="check-list" aria-label="Lo que verás">
            {CHECKLIST.map((item) => (
              <li key={item} className="check-item">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </OnboardingStep>

      {/* 04 — Timeline visualizado */}
      <OnboardingStep
        index={3}
        total={TOTAL_STEPS}
        active={currentStep === 3}
        background="cream"
        onSkip={handleSkip}
        onNext={goNext}
        ctaLabel="Continuar"
        ctaTone="cobalto"
      >
        <div className="hero hero-cream">
          <p className="eyebrow">— LO QUE TE ESPERA —</p>
          <h1 className="display">
            Más calma.
            <br />
            Menos <em className="accent">rumiación</em>.
          </h1>

          <svg
            className="curve"
            viewBox="0 0 320 180"
            role="img"
            aria-label="Curva descendente de ansiedad a lo largo de 30 días"
          >
            {/* Eje X */}
            <line
              x1="36"
              y1="148"
              x2="304"
              y2="148"
              stroke="var(--ink)"
              strokeOpacity="0.18"
              strokeWidth="1"
            />
            {/* Eje Y */}
            <line
              x1="36"
              y1="20"
              x2="36"
              y2="148"
              stroke="var(--ink)"
              strokeOpacity="0.18"
              strokeWidth="1"
            />
            {/* Banda accent translúcida */}
            <path
              d="M36 50 C 110 70, 180 110, 304 130 L 304 148 L 36 148 Z"
              fill="var(--accent)"
              fillOpacity="0.18"
            />
            {/* Línea principal */}
            <path
              d="M36 50 C 110 70, 180 110, 304 130"
              fill="none"
              stroke="var(--cobalto)"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            {/* Hitos */}
            <circle cx="92" cy="68" r="4" fill="var(--cobalto)" />
            <circle cx="156" cy="92" r="4" fill="var(--cobalto)" />
            <circle cx="304" cy="130" r="4" fill="var(--cobalto)" />
            {/* Etiquetas eje Y */}
            <text
              x="22"
              y="28"
              fontFamily="JetBrains Mono, monospace"
              fontSize="9"
              fill="var(--ink)"
              opacity="0.55"
              textAnchor="end"
            >
              7
            </text>
            <text
              x="22"
              y="152"
              fontFamily="JetBrains Mono, monospace"
              fontSize="9"
              fill="var(--ink)"
              opacity="0.55"
              textAnchor="end"
            >
              3
            </text>
            <text
              x="22"
              y="92"
              fontFamily="JetBrains Mono, monospace"
              fontSize="8"
              fill="var(--ink)"
              opacity="0.55"
              textAnchor="end"
              transform="rotate(-90 22 92)"
            >
              ANSIEDAD
            </text>
            {/* Etiquetas eje X */}
            <text
              x="92"
              y="164"
              fontFamily="JetBrains Mono, monospace"
              fontSize="9"
              fill="var(--ink)"
              opacity="0.55"
              textAnchor="middle"
            >
              D7
            </text>
            <text
              x="156"
              y="164"
              fontFamily="JetBrains Mono, monospace"
              fontSize="9"
              fill="var(--ink)"
              opacity="0.55"
              textAnchor="middle"
            >
              D14
            </text>
            <text
              x="304"
              y="164"
              fontFamily="JetBrains Mono, monospace"
              fontSize="9"
              fill="var(--ink)"
              opacity="0.55"
              textAnchor="middle"
            >
              D30
            </text>
          </svg>

          <p className="caption">
            Estudios muestran que escribir 5 min/día reduce ansiedad un 30 % en
            4 semanas. — <em>Pennebaker, 1997</em>.
          </p>
        </div>
      </OnboardingStep>

      {/* 05 — Setup ligero */}
      <OnboardingStep
        index={4}
        total={TOTAL_STEPS}
        active={currentStep === 4}
        background="cream"
        onSkip={handleSkip}
        onNext={handleSubmitName}
        ctaLabel="Empezar mi diario →"
        ctaTone="accent"
      >
        <div className="hero hero-cream">
          <p className="eyebrow">— PARA TERMINAR —</p>
          <h1 className="display">
            ¿Cómo
            <br />
            te <em>llamas</em>?
          </h1>
          <form
            className="name-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmitName();
            }}
          >
            <label htmlFor="ob-name" className="visually-hidden">
              Tu nombre
            </label>
            <input
              id="ob-name"
              className="name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre…"
              autoComplete="given-name"
              autoFocus={currentStep === 4}
              maxLength={40}
              aria-label="Tu nombre"
            />
          </form>
        </div>
      </OnboardingStep>

      <style jsx>{`
        .hero {
          display: flex;
          flex-direction: column;
          gap: 22px;
          max-width: 380px;
          margin: 0 auto;
        }
        .display {
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 600;
          font-size: clamp(56px, 14vw, 78px);
          line-height: 0.96;
          letter-spacing: -0.02em;
          color: var(--ink);
        }
        .display em {
          color: var(--cobalto);
          font-style: italic;
        }
        .display em.accent {
          color: var(--accent);
        }
        .lede {
          font-family: var(--font-body);
          font-size: 16px;
          line-height: 1.55;
          color: var(--ink);
          opacity: 0.78;
          max-width: 380px;
        }
        .brain-tree {
          width: 180px;
          height: 130px;
          margin: 8px auto 0;
          color: var(--ink);
          opacity: 0.92;
        }
        .eyebrow-cream {
          color: var(--crema);
          opacity: 0.85;
        }

        /* Authority */
        .authority {
          display: flex;
          flex-direction: column;
          gap: 24px;
          max-width: 380px;
          margin: 0 auto;
        }
        .auth-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .auth-card {
          display: flex;
          align-items: center;
          gap: 14px;
          background: rgba(241, 234, 216, 0.08);
          border: 1px solid rgba(241, 234, 216, 0.18);
          border-radius: var(--r-md);
          padding: 14px 16px;
        }
        .auth-pill {
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 30px;
          height: 22px;
          padding: 0 8px;
          background: var(--crema);
          color: var(--cobalto);
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.18em;
          font-weight: 700;
          border-radius: var(--r-pill);
        }
        .auth-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .auth-name {
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 600;
          font-size: 18px;
          line-height: 1.1;
          color: var(--crema);
        }
        .auth-quote {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--crema);
          opacity: 0.65;
        }
        .auth-foot {
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 500;
          font-size: clamp(28px, 7vw, 36px);
          line-height: 1.05;
          color: var(--crema);
          margin-top: 8px;
        }
        .auth-foot em {
          color: var(--crema);
          font-style: italic;
          text-decoration: underline;
          text-underline-offset: 6px;
          text-decoration-thickness: 1.5px;
        }

        /* Checklist */
        .check-list {
          list-style: none;
          padding: 0;
          margin: 8px 0 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .check-item {
          font-family: var(--font-mono);
          font-size: 12px;
          letter-spacing: 0.06em;
          line-height: 1.55;
          color: var(--ink);
          padding: 12px 14px;
          background: rgba(13, 15, 61, 0.04);
          border: 1px solid rgba(13, 15, 61, 0.08);
          border-radius: var(--r-md);
        }

        /* Curve / Caption */
        .curve {
          width: 100%;
          height: auto;
          max-width: 380px;
          margin-top: 6px;
        }
        .caption {
          font-family: var(--font-body);
          font-size: 13px;
          line-height: 1.55;
          color: var(--ink);
          opacity: 0.7;
          max-width: 380px;
        }
        .caption em {
          font-style: italic;
        }

        /* Name input */
        .name-form {
          margin-top: 12px;
        }
        .name-input {
          width: 100%;
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 500;
          font-size: clamp(40px, 10vw, 56px);
          line-height: 1.1;
          color: var(--ink);
          background: transparent;
          border: none;
          border-bottom: 2px dashed var(--cobalto);
          padding: 8px 0 12px;
          outline: none;
          caret-color: var(--cobalto);
        }
        .name-input::placeholder {
          color: var(--ink);
          opacity: 0.32;
          font-style: italic;
        }
        .name-input:focus-visible {
          border-bottom-color: var(--accent);
        }

        .visually-hidden {
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
      `}</style>
    </>
  );
}
