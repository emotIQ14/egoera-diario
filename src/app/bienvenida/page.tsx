'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingStep from '@/components/onboarding/OnboardingStep';

const TOTAL_STEPS = 6;
const NAME_KEY = 'egoera-diario-name';
const ONBOARDED_KEY = 'egoera-diario-onboarded';
const ATTRIBUTION_KEY = 'egoera-attribution';

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

type AttributionOption = {
  slug: string;
  label: string;
  icon: React.ReactElement;
};

const ATTRIBUTION_OPTIONS: AttributionOption[] = [
  {
    slug: 'instagram',
    label: 'Instagram',
    icon: (
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
      </svg>
    ),
  },
  {
    slug: 'tiktok',
    label: 'TikTok',
    icon: (
      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden>
        <path d="M14.5 3v10.5a2.5 2.5 0 1 1-2.5-2.5h.5V8.5h-.5a5.5 5.5 0 1 0 5.5 5.5V8a5 5 0 0 0 4 1.95V7a3 3 0 0 1-3-3h-4z" />
      </svg>
    ),
  },
  {
    slug: 'youtube',
    label: 'YouTube',
    icon: (
      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden>
        <path d="M21.6 7.2c-.2-1-1-1.7-2-2C17.7 5 12 5 12 5s-5.7 0-7.6.2c-1 .3-1.8 1-2 2C2 9.1 2 12 2 12s0 2.9.4 4.8c.2 1 1 1.7 2 2 1.9.2 7.6.2 7.6.2s5.7 0 7.6-.2c1-.3 1.8-1 2-2 .4-1.9.4-4.8.4-4.8s0-2.9-.4-4.8zM10 15.5v-7l6 3.5-6 3.5z" />
      </svg>
    ),
  },
  {
    slug: 'x',
    label: 'X (Twitter)',
    icon: (
      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden>
        <path d="M18.3 3h3l-6.6 7.6L22.5 21h-6.1l-4.8-6.2L6.1 21H3l7.1-8.1L2.5 3h6.2l4.3 5.7L18.3 3zm-1.1 16.2h1.7L7 4.7H5.2l12 14.5z" />
      </svg>
    ),
  },
  {
    slug: 'vlog-egoera',
    label: 'Vlog Egoera (egoera.es)',
    icon: (
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M10 9l5 3-5 3z" fill="currentColor" />
      </svg>
    ),
  },
  {
    slug: 'bidaiatzen',
    label: 'Bidaiatzen (alguien me lo recomendó allí)',
    icon: (
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <path d="M12 2l1.7 5.2H19l-4.4 3.2 1.7 5.2L12 12.4 7.7 15.6l1.7-5.2L5 7.2h5.3z" />
      </svg>
    ),
  },
  {
    slug: 'google',
    label: 'Buscando en Google',
    icon: (
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <circle cx="11" cy="11" r="6" />
        <path d="M16 16l4 4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    slug: 'amigo',
    label: 'Un amigo me lo dijo',
    icon: (
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
      </svg>
    ),
  },
  {
    slug: 'otro',
    label: 'Otro',
    icon: (
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7M12 17.2v.1" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function BienvenidaPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [name, setName] = useState<string>('');
  const [attribution, setAttribution] = useState<string | null>(null);

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
    goNext();
  }, [goNext]);

  const handleSelectAttribution = useCallback((slug: string) => {
    setAttribution(slug);
    if (typeof window !== 'undefined') {
      const payload = JSON.stringify({ slug, ts: new Date().toISOString() });
      window.localStorage.setItem(ATTRIBUTION_KEY, payload);
    }
  }, []);

  const handleFinishFromAttribution = useCallback(() => {
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

          <div className="claim-stat">
            <p className="claim-stat-text">
              El <strong>87 %</strong> de quienes escriben 5 minutos al día durante
              4 semanas reportan menos rumiación.
            </p>
            <p className="claim-stat-source">
              — Pennebaker &amp; Smyth, 2016 (meta-análisis 200+ estudios).
            </p>
          </div>
        </div>
      </OnboardingStep>

      {/* 05 — Setup nombre */}
      <OnboardingStep
        index={4}
        total={TOTAL_STEPS}
        active={currentStep === 4}
        background="cream"
        onSkip={handleSkip}
        onNext={handleSubmitName}
        ctaLabel="Continuar →"
        ctaTone="cobalto"
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

      {/* 06 — Atribución */}
      <OnboardingStep
        index={5}
        total={TOTAL_STEPS}
        active={currentStep === 5}
        background="cream"
        onSkip={handleSkip}
        onNext={handleFinishFromAttribution}
        ctaLabel="Empezar →"
        ctaTone="accent"
      >
        <div className="hero hero-cream">
          <p className="eyebrow">— ÚLTIMA PREGUNTA —</p>
          <h1 className="display attr-display">
            ¿Cómo nos
            <br />
            <em>conociste</em>?
          </h1>
          <p className="attr-sub">
            No es para vendértelo. Es para cuidar el sitio del que llegas.
          </p>

          <div className="attr-grid" role="radiogroup" aria-label="¿Cómo nos conociste?">
            {ATTRIBUTION_OPTIONS.map((opt) => {
              const selected = attribution === opt.slug;
              return (
                <button
                  key={opt.slug}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  className={`attr-chip ${selected ? 'selected' : ''}`}
                  onClick={() => handleSelectAttribution(opt.slug)}
                >
                  <span className="attr-chip-ico" aria-hidden>
                    {opt.icon}
                  </span>
                  <span className="attr-chip-label">{opt.label}</span>
                </button>
              );
            })}
          </div>

          {attribution ? (
            <p className="attr-confirm" aria-live="polite">
              Gracias. Toma nota: <strong>{attribution}</strong>.
            </p>
          ) : null}
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
        .claim-stat {
          margin-top: 4px;
          padding: 14px 16px;
          background: rgba(29, 43, 219, 0.06);
          border: 1px solid rgba(29, 43, 219, 0.16);
          border-radius: var(--r-md);
        }
        .claim-stat-text {
          font-family: var(--font-body);
          font-size: 14px;
          line-height: 1.5;
          color: var(--ink);
        }
        .claim-stat-text strong {
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 700;
          color: var(--cobalto);
          font-size: 18px;
        }
        .claim-stat-source {
          margin-top: 6px;
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--ink);
          opacity: 0.55;
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

        /* Atribución */
        .attr-display {
          font-size: clamp(44px, 11vw, 60px);
        }
        .attr-sub {
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 400;
          font-size: 16px;
          line-height: 1.45;
          color: var(--ink);
          opacity: 0.72;
          max-width: 380px;
        }
        .attr-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 6px;
        }
        .attr-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: var(--crema-soft);
          color: var(--ink);
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          font-weight: 600;
          padding: 8px 12px;
          border: 1px solid rgba(13, 15, 61, 0.1);
          border-radius: var(--r-pill);
          cursor: pointer;
          transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
        }
        .attr-chip:hover,
        .attr-chip:focus-visible {
          background: var(--cobalto);
          color: var(--crema);
          border-color: var(--cobalto);
          outline: none;
        }
        .attr-chip.selected {
          background: var(--cobalto);
          color: var(--crema);
          border-color: var(--cobalto);
        }
        .attr-chip-ico {
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .attr-confirm {
          margin-top: 10px;
          font-family: var(--font-body);
          font-size: 13px;
          line-height: 1.45;
          color: var(--ink);
          opacity: 0.75;
        }
        .attr-confirm strong {
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 600;
          color: var(--cobalto);
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
