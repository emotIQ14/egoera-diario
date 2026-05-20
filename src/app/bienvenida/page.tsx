'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import OnboardingStep from '@/components/onboarding/OnboardingStep';
import Peep from '@/components/peeps/Peep';
import { useToast } from '@/components/toast/ToastProvider';

const TOTAL_STEPS = 8;     // 7 originales + 1 pantalla "Listo"
const FINAL_STEP_DELAY_MS = 2200;
const NAME_KEY = 'egoera-diario-name';
const ONBOARDED_KEY = 'egoera-diario-onboarded';
const ATTRIBUTION_KEY = 'egoera-attribution';
const RESONANCE_KEY = 'egoera-onboarding-resonance';
const SEED_FEELING_KEY = 'egoera-seed-feeling';   // primera intención capturada vía peep-prompt
const FEELING_MAX_LENGTH = 280;                    // límite anti-spam y para que quepa en una entrada

/**
 * 7 frases relatables, cada una asociada a una amiga (peep)
 * con significado emocional concreto.
 */
type RelatablePhrase = {
  text: string;
  peep: string;       // ruta sin /peeps/amigas/ prefix
  meaning: string;    // qué representa esta amiga
};

const RELATABLE_PHRASES: RelatablePhrase[] = [
  {
    text: 'Vuelvo a la misma frase a las 3 de la mañana.',
    peep: 'iris',
    meaning: 'Iris · la insomne · el bucle nocturno',
  },
  {
    text: 'Si me dejan elegir, prefiero callarme.',
    peep: 'mira',
    meaning: 'Mira · la silenciosa · evitar conflicto',
  },
  {
    text: 'Mando un mensaje y reviso el móvil 40 veces.',
    peep: 'lola',
    meaning: 'Lola · la ansiosa · espera y vigilancia',
  },
  {
    text: 'Confundo cuidar con sostener al otro entero.',
    peep: 'eva',
    meaning: 'Eva · la cuidadora · sobrecarga emocional',
  },
  {
    text: 'Lloro por algo que «no era para tanto».',
    peep: 'zuri',
    meaning: 'Zuri · la sensible · desborde silencioso',
  },
  {
    text: 'Pienso tres veces lo mismo y lo llamo reflexionar.',
    peep: 'june',
    meaning: 'June · la rumiadora · pensar disfrazado de pensar bien',
  },
  {
    text: 'Digo que sí cuando quiero decir que no.',
    peep: 'oli',
    meaning: 'Oli · la complaciente · perder los bordes propios',
  },
];

/**
 * Autoridades — cada una con un arquetipo IFS de fondo:
 * Bowlby = Exiliado (heridas tempranas)
 * Rosenberg = Manager (mediación, lenguaje)
 * Kabat-Zinn = Self (presencia)
 */
type Authority = {
  pill: string;
  name: string;
  quote: string;
  arq: 'exiliado' | 'manager' | 'self';
};

const AUTHORITIES: Authority[] = [
  { pill: '01', name: 'John Bowlby', quote: 'Teoría del apego — 1969', arq: 'exiliado' },
  { pill: '02', name: 'Marshall Rosenberg', quote: 'Comunicación No Violenta — 2003', arq: 'manager' },
  { pill: '03', name: 'Jon Kabat-Zinn', quote: 'Mindfulness clínico — 1979', arq: 'self' },
];

const CHECKLIST: { n: string; text: string }[] = [
  { n: '01', text: 'Identificar tus emociones recurrentes.' },
  { n: '02', text: 'Encontrar tu palabra de la semana.' },
  { n: '03', text: 'Conectar emociones con momentos del día.' },
];

type AttributionOption = {
  slug: string;
  label: string;
};

const ATTRIBUTION_OPTIONS: AttributionOption[] = [
  { slug: 'instagram', label: 'Instagram' },
  { slug: 'tiktok', label: 'TikTok' },
  { slug: 'youtube', label: 'YouTube' },
  { slug: 'x', label: 'X (Twitter)' },
  { slug: 'vlog-egoera', label: 'Vlog Egoera (egoera.es)' },
  { slug: 'bidaiatzen', label: 'Bidaiatzen' },
  { slug: 'google', label: 'Buscando en Google' },
  { slug: 'amigo', label: 'Me lo dijo alguien' },
  { slug: 'otro', label: 'Otro' },
];

/* ---------- Página ---------- */

export default function BienvenidaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [name, setName] = useState<string>('');
  const [attribution, setAttribution] = useState<string | null>(null);
  const fromPeepPrompt = searchParams?.get('from') === 'peep-prompt';

  /**
   * Captura el `feeling` del query param cuando viene de un peep-spawn.
   * Lo persiste en localStorage como "primera intención" para que la
   * primera entrada del diario lo lleve pre-rellenado en /diario.
   * Limpia el query param de la URL tras capturarlo (UX limpia y
   * evita que se reactive si el usuario recarga).
   */
  const rawFeeling = searchParams?.get('feeling') ?? '';
  const seedFeeling = rawFeeling
    .trim()
    .slice(0, FEELING_MAX_LENGTH);

  useEffect(() => {
    if (!fromPeepPrompt || !seedFeeling) return;
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(
        SEED_FEELING_KEY,
        JSON.stringify({
          text: seedFeeling,
          source: 'peep-prompt',
          ts: new Date().toISOString(),
        }),
      );
    } catch {
      // localStorage puede fallar en modo privado iOS — fail silently
    }
    // Limpiar el ?feeling= de la URL para no exponerlo en el address bar
    if (window.history?.replaceState) {
      const url = new URL(window.location.href);
      url.searchParams.delete('feeling');
      window.history.replaceState({}, '', url.toString());
    }
  }, [fromPeepPrompt, seedFeeling]);

  const goNext = useCallback(() => {
    setCurrentStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  }, []);

  /**
   * Persiste estado y navega al home. Si `viaFinalStep`, asume que ya
   * estamos en la pantalla #8 y muestra un toast de bienvenida al llegar
   * al home; si no (skip), navega directo sin celebración.
   */
  const finishOnboarding = useCallback(
    (saveName: boolean, viaFinalStep: boolean = false) => {
      if (typeof window !== 'undefined') {
        let storedName = '';
        if (saveName) {
          const trimmed = name.trim();
          if (trimmed.length > 0) {
            window.localStorage.setItem(NAME_KEY, trimmed);
            storedName = trimmed;
          }
        }
        window.localStorage.setItem(ONBOARDED_KEY, 'true');
        if (viaFinalStep) {
          // Toast de bienvenida cuando aterrice en el home.
          const greet = storedName
            ? `Bienvenida, ${storedName}. 5 min/día, tu ritmo.`
            : 'Bienvenida a egoera. 5 min/día, tu ritmo.';
          window.setTimeout(() => toast.success(greet, { duration: 4000 }), 400);
        }
      }
      router.push('/');
    },
    [name, router, toast],
  );

  const handleSkip = useCallback(() => {
    finishOnboarding(false, false);
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

  const handleResonance = useCallback(
    (level: 'high' | 'low') => {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(RESONANCE_KEY, level);
      }
      goNext();
    },
    [goNext],
  );

  /**
   * En el paso 7 (atribución), avanzamos al paso 8 (pantalla "Listo, [nombre]")
   * en lugar de cerrar el onboarding. El cierre lo hace un setTimeout en
   * el efecto del paso 7.
   */
  const handleFinishFromAttribution = useCallback(() => {
    goNext();
  }, [goNext]);

  // Cuando el usuario llega al paso 7 (índice 7 = pantalla final), arrancamos
  // un timer para auto-cerrar tras FINAL_STEP_DELAY_MS.
  useEffect(() => {
    if (currentStep !== 7) return;
    const id = window.setTimeout(() => {
      finishOnboarding(true, true);
    }, FINAL_STEP_DELAY_MS);
    return () => window.clearTimeout(id);
  }, [currentStep, finishOnboarding]);

  return (
    <>
      {/* 01 — Bienvenida · NORA da la bienvenida */}
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
            Sin gamificación. Sin métricas raras.
            <br />
            Sin atajos. Solo tú escuchándote.
          </p>
          <div className="peep-stage peep-stage-solo">
            <Peep name="nora" size={180} alt="" />
            <p className="peep-caption">
              <em>Hola.</em> Soy Nora.
              <br />
              Esto va a tu ritmo.
            </p>
          </div>
          {fromPeepPrompt ? (
            <div className="from-peep-prompt" aria-live="polite">
              {seedFeeling ? (
                <>
                  <p className="seed-meta">— LO QUE ESCRIBISTE —</p>
                  <p className="seed-text">«{seedFeeling}»</p>
                  <p className="seed-hint">
                    Lo guardo para tu primera entrada. Sigue cuando quieras.
                  </p>
                </>
              ) : (
                <p>
                  ¿Vienes desde un artículo? Empieza por anotar la frase que te resonó.
                </p>
              )}
            </div>
          ) : null}
        </div>
      </OnboardingStep>

      {/* 02 — Relatable · cada frase con su amiga */}
      <OnboardingStep
        index={1}
        total={TOTAL_STEPS}
        active={currentStep === 1}
        background="cream"
        onSkip={handleSkip}
        onNext={() => handleResonance('high')}
        ctaLabel="Sí, varias me suenan →"
        ctaTone="cobalto"
      >
        <div className="hero hero-cream">
          <p className="eyebrow">— ¿TE SUENA? —</p>
          <h1 className="display relatable-display">
            Si lo lees y dices «<em>sí</em>»,
            <br />
            esto es para ti.
          </h1>
          <ul className="relatable-list" aria-label="Frases que pueden sonarte">
            {RELATABLE_PHRASES.map((phrase, i) => (
              <li key={phrase.text} className="relatable-item">
                <span className="relatable-peep">
                  <Peep name={phrase.peep} size={56} alt={phrase.meaning} delay={i * 60} />
                </span>
                <p className="relatable-text">«{phrase.text}»</p>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="relatable-secondary"
            onClick={() => handleResonance('low')}
          >
            No tanto, sigo →
          </button>
        </div>
      </OnboardingStep>

      {/* 03 — Authority · cada autor con arquetipo IFS */}
      <OnboardingStep
        index={2}
        total={TOTAL_STEPS}
        active={currentStep === 2}
        background="cobalto"
        onSkip={handleSkip}
        onNext={goNext}
        ctaLabel="Continuar"
        ctaTone="cream"
      >
        <div className="authority">
          <p className="eyebrow eyebrow-cream">— BASADO EN —</p>
          <ul className="auth-list">
            {AUTHORITIES.map((a, i) => (
              <li key={a.name} className="auth-card">
                <span className="auth-portrait">
                  <Peep
                    name={a.arq}
                    folder="arquetipos"
                    size={64}
                    alt={`Arquetipo ${a.arq}`}
                    delay={i * 120}
                  />
                </span>
                <div className="auth-text">
                  <span className="auth-pill">{a.pill}</span>
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

      {/* 04 — Promesa · TEO acompaña la lista */}
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
          <p className="eyebrow">— EN 30 DÍAS —</p>
          <h1 className="display">
            Verás patrones
            <br />
            que llevan <em className="accent">años</em>
            <br />
            escondidos.
          </h1>
          <div className="check-block">
            <div className="check-peep">
              <Peep name="teo" size={96} alt="Teo · el estructurado" />
              <p className="check-peep-caption">
                <em>Teo</em> ordena.
              </p>
            </div>
            <ul className="check-list" aria-label="Lo que verás">
              {CHECKLIST.map((item) => (
                <li key={item.n} className="check-item">
                  <span className="check-n">{item.n}</span>
                  <span className="check-text">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </OnboardingStep>

      {/* 05 — Timeline · LOLA al inicio (D7), MAU al final (D30) */}
      <OnboardingStep
        index={4}
        total={TOTAL_STEPS}
        active={currentStep === 4}
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

          <div className="curve-stage">
            <span className="curve-peep curve-peep-start">
              <Peep name="lola" size={64} alt="Lola · ansiosa al inicio" />
            </span>
            <span className="curve-peep curve-peep-end">
              <Peep name="mau" size={64} alt="Mau · calmada al final" delay={400} />
            </span>
            <svg
              className="curve"
              viewBox="0 0 320 180"
              role="img"
              aria-label="Curva descendente de ansiedad a lo largo de 30 días"
            >
              <line x1="36" y1="148" x2="304" y2="148" stroke="var(--ink)" strokeOpacity="0.18" strokeWidth="1" />
              <line x1="36" y1="20" x2="36" y2="148" stroke="var(--ink)" strokeOpacity="0.18" strokeWidth="1" />
              <path d="M36 50 C 110 70, 180 110, 304 130 L 304 148 L 36 148 Z" fill="var(--accent)" fillOpacity="0.18" />
              <path d="M36 50 C 110 70, 180 110, 304 130" fill="none" stroke="var(--cobalto)" strokeWidth="2.4" strokeLinecap="round" />
              <circle cx="92" cy="68" r="4" fill="var(--cobalto)" />
              <circle cx="156" cy="92" r="4" fill="var(--cobalto)" />
              <circle cx="304" cy="130" r="4" fill="var(--cobalto)" />
              <text x="22" y="28" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="var(--ink)" opacity="0.55" textAnchor="end">7</text>
              <text x="22" y="152" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="var(--ink)" opacity="0.55" textAnchor="end">3</text>
              <text x="22" y="92" fontFamily="JetBrains Mono, monospace" fontSize="8" fill="var(--ink)" opacity="0.55" textAnchor="end" transform="rotate(-90 22 92)">ANSIEDAD</text>
              <text x="92" y="164" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="var(--ink)" opacity="0.55" textAnchor="middle">D7</text>
              <text x="156" y="164" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="var(--ink)" opacity="0.55" textAnchor="middle">D14</text>
              <text x="304" y="164" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="var(--ink)" opacity="0.55" textAnchor="middle">D30</text>
            </svg>
          </div>

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

      {/* 06 — Setup nombre · NORA acompaña */}
      <OnboardingStep
        index={5}
        total={TOTAL_STEPS}
        active={currentStep === 5}
        background="cream"
        onSkip={handleSkip}
        onNext={handleSubmitName}
        ctaLabel="Continuar →"
        ctaTone="cobalto"
      >
        <div className="hero hero-cream">
          <p className="eyebrow">— PARA TERMINAR —</p>
          <div className="name-stage">
            <Peep name="nora" size={96} alt="Nora te saluda" />
            <h1 className="display name-display">
              ¿Cómo
              <br />
              te <em>llamas</em>?
            </h1>
          </div>
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
              autoFocus={currentStep === 5}
              maxLength={40}
              aria-label="Tu nombre"
            />
          </form>
          {name.trim().length > 0 ? (
            <p className="name-confirm">
              Encantada, <em>{name.trim()}</em>.
            </p>
          ) : null}
        </div>
      </OnboardingStep>

      {/* 07 — Atribución · MIRA agradece tras seleccionar */}
      <OnboardingStep
        index={6}
        total={TOTAL_STEPS}
        active={currentStep === 6}
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
                  <span className="attr-chip-label">{opt.label}</span>
                </button>
              );
            })}
          </div>

          {attribution ? (
            <div className="attr-thanks" aria-live="polite">
              <Peep name="mira" size={64} alt="Mira agradece" />
              <p className="attr-confirm">
                Gracias. Apuntado: <strong>{attribution}</strong>.
              </p>
            </div>
          ) : null}
        </div>
      </OnboardingStep>

      {/* 08 — Cierre · MAU respira · pantalla auto-cierre 2.2 s */}
      <OnboardingStep
        index={7}
        total={TOTAL_STEPS}
        active={currentStep === 7}
        background="cream"
        onSkip={handleSkip}
        hideSkip
        ctaLabel=""
      >
        <div className="hero hero-cream final-stage">
          <p className="eyebrow">— LISTO —</p>
          <h1 className="display final-display">
            {name.trim().length > 0 ? (
              <>
                {name.trim()},<br />
                tu diario te <em>espera</em>.
              </>
            ) : (
              <>
                Tu diario te
                <br />
                <em>espera</em>.
              </>
            )}
          </h1>
          <div className="final-peep">
            <Peep name="mau" size={200} alt="Mau respira" priority />
          </div>
          <p className="final-caption">
            <em>5 minutos al día.</em>
            <br />
            Tu ritmo. Sin presión.
          </p>
          <p className="final-fine" aria-live="polite">
            Entrando…
          </p>
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
          font-size: clamp(52px, 13vw, 72px);
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

        /* Stage solo (paso 1) */
        .peep-stage-solo {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          margin-top: 6px;
        }
        .peep-caption {
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 400;
          font-size: 18px;
          line-height: 1.3;
          color: var(--ink);
          opacity: 0.7;
          text-align: center;
        }
        .peep-caption em {
          color: var(--cobalto);
          font-style: italic;
        }
        .from-peep-prompt {
          margin-top: 18px;
          padding: 14px 16px;
          background: rgba(29, 43, 219, 0.08);
          border-left: 3px solid var(--cobalto);
          border-radius: var(--r-md);
          font-family: var(--font-body);
          font-size: 14px;
          line-height: 1.5;
          color: var(--ink);
          opacity: 0.95;
          max-width: 360px;
          text-align: left;
        }
        .from-peep-prompt p {
          margin: 0;
        }
        .from-peep-prompt .seed-meta {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--cobalto);
          opacity: 0.7;
          margin-bottom: 6px;
        }
        .from-peep-prompt .seed-text {
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 500;
          font-size: 18px;
          line-height: 1.35;
          color: var(--ink);
          margin-bottom: 8px;
        }
        .from-peep-prompt .seed-hint {
          font-size: 13px;
          line-height: 1.45;
          color: var(--ink);
          opacity: 0.72;
        }

        /* Authority */
        .authority {
          display: flex;
          flex-direction: column;
          gap: 22px;
          max-width: 380px;
          margin: 0 auto;
        }
        .auth-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 14px;
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
        .auth-portrait {
          flex-shrink: 0;
          width: 64px;
          height: 64px;
          background: rgba(241, 234, 216, 0.14);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .auth-pill {
          display: inline-block;
          padding: 2px 8px;
          background: var(--crema);
          color: var(--cobalto);
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.18em;
          font-weight: 700;
          border-radius: var(--r-pill);
          margin-bottom: 4px;
        }
        .auth-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }
        .auth-name {
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 600;
          font-size: 18px;
          line-height: 1.1;
          color: var(--crema);
          margin: 0;
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
          font-size: clamp(24px, 6vw, 32px);
          line-height: 1.1;
          color: var(--crema);
          margin-top: 4px;
        }
        .auth-foot em {
          color: var(--crema);
          font-style: italic;
          text-decoration: underline;
          text-underline-offset: 6px;
          text-decoration-thickness: 1.5px;
        }
        .eyebrow-cream {
          color: var(--crema);
          opacity: 0.85;
        }

        /* Promesa · checklist con peep */
        .check-block {
          display: flex;
          gap: 16px;
          align-items: flex-start;
          margin-top: 6px;
        }
        .check-peep {
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding-top: 4px;
        }
        .check-peep-caption {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--ink);
          opacity: 0.55;
        }
        .check-peep-caption em {
          color: var(--cobalto);
          font-style: italic;
          text-transform: none;
          letter-spacing: 0;
          font-family: var(--font-display);
          font-size: 14px;
        }
        .check-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
          flex: 1;
          min-width: 0;
        }
        .check-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-family: var(--font-body);
          font-size: 14px;
          line-height: 1.45;
          color: var(--ink);
          padding: 12px 14px;
          background: rgba(13, 15, 61, 0.04);
          border: 1px solid rgba(13, 15, 61, 0.08);
          border-radius: var(--r-md);
        }
        .check-n {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.16em;
          color: var(--cobalto);
          font-weight: 700;
          padding-top: 2px;
          flex-shrink: 0;
        }

        /* Curve stage */
        .curve-stage {
          position: relative;
          width: 100%;
          max-width: 380px;
          margin-top: 4px;
        }
        .curve {
          width: 100%;
          height: auto;
          display: block;
        }
        .curve-peep {
          position: absolute;
          top: 0;
          z-index: 2;
          pointer-events: none;
        }
        .curve-peep-start {
          left: 6%;
          top: 4%;
        }
        .curve-peep-end {
          right: 0;
          top: 38%;
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

        /* Name */
        .name-stage {
          display: flex;
          align-items: flex-end;
          gap: 12px;
          margin-top: -8px;
        }
        .name-display {
          font-size: clamp(48px, 12vw, 64px);
          margin: 0;
        }
        .name-form {
          margin-top: 8px;
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
        .name-confirm {
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 400;
          font-size: 18px;
          color: var(--ink);
          opacity: 0.7;
        }
        .name-confirm em {
          color: var(--cobalto);
          font-style: italic;
          font-weight: 600;
        }

        /* Atribución */
        .attr-display {
          font-size: clamp(40px, 10vw, 56px);
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
        .attr-thanks {
          margin-top: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .attr-confirm {
          font-family: var(--font-body);
          font-size: 13px;
          line-height: 1.45;
          color: var(--ink);
          opacity: 0.75;
          margin: 0;
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

        /* Relatable */
        .relatable-display {
          font-size: clamp(38px, 7vw, 56px);
          line-height: 1.02;
        }
        .relatable-list {
          list-style: none;
          padding: 0;
          margin: 4px 0 0;
          display: flex;
          flex-direction: column;
        }
        .relatable-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 10px 4px;
          border-bottom: 1px dashed rgba(13, 15, 61, 0.18);
        }
        .relatable-item:last-child {
          border-bottom: none;
        }
        .relatable-peep {
          flex-shrink: 0;
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .relatable-text {
          font-family: var(--font-hand);
          font-style: italic;
          font-weight: 500;
          font-size: clamp(20px, 5vw, 26px);
          line-height: 1.22;
          color: var(--ink);
          letter-spacing: 0;
          margin: 0;
        }
        .relatable-secondary {
          align-self: flex-start;
          margin-top: 14px;
          background: transparent;
          border: none;
          padding: 6px 2px;
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--ink);
          opacity: 0.55;
          cursor: pointer;
          transition: opacity 0.15s ease;
        }
        .relatable-secondary:hover,
        .relatable-secondary:focus-visible {
          opacity: 0.9;
          outline: none;
        }

        /* Paso 8 · Cierre */
        .final-stage {
          align-items: center;
          text-align: center;
          gap: 24px;
        }
        .final-display {
          font-size: clamp(48px, 12vw, 68px);
          line-height: 1.0;
          margin: 0;
        }
        .final-peep {
          margin: 14px 0 8px;
          animation: breath 2.6s ease-in-out infinite;
        }
        @keyframes breath {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @media (prefers-reduced-motion: reduce) {
          .final-peep { animation: none; }
        }
        .final-caption {
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 400;
          font-size: 22px;
          line-height: 1.4;
          color: var(--ink);
          opacity: 0.78;
          margin: 0;
        }
        .final-caption em {
          color: var(--cobalto);
          font-style: italic;
          font-weight: 600;
        }
        .final-fine {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: var(--ink);
          opacity: 0.45;
          margin-top: 12px;
        }
      `}</style>
    </>
  );
}
