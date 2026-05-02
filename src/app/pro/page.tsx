'use client';

import { useState } from 'react';
import Screen from '@/components/Screen';
import TabBar from '@/components/TabBar';

type FaqItem = { q: string; a: string };

const FAQ: FaqItem[] = [
  {
    q: '¿Puedo cancelar?',
    a: 'Sí, en 1 click desde Tú · Privacidad. Cero preguntas.',
  },
  {
    q: '¿Qué pasa con mis entradas si cancelo?',
    a: 'Se quedan en el dispositivo siempre. La nube es solo backup opcional.',
  },
  {
    q: '¿Hay descuento para estudiantes?',
    a: 'Escríbeme: hola@egoera.es',
  },
  {
    q: '¿Quién está detrás?',
    a: 'Ander Bilbao Castejón. People Operations en Bilbao y editor del vlog.',
  },
];

type Testimonial = {
  initial: string;
  name: string;
  city: string;
  quote: string;
  tone: 'cobalto' | 'accent' | 'ink';
};

const TESTIMONIALS: Testimonial[] = [
  {
    initial: 'M',
    name: 'Maialen B.',
    city: 'Bilbao',
    quote: 'Antes lloraba sin saber por qué. Ahora veo el patrón.',
    tone: 'cobalto',
  },
  {
    initial: 'D',
    name: 'Diego R.',
    city: 'Madrid',
    quote: 'La conversa con Egoera me ha quitado 3 sesiones de terapia.',
    tone: 'accent',
  },
  {
    initial: 'A',
    name: 'Aitor L.',
    city: 'Donostia',
    quote: 'Escribir 3 minutos al día. Eso ha cambiado mi semana.',
    tone: 'ink',
  },
];

type Quote = { text: string; author: string; meta: string };

const QUOTES: Quote[] = [
  {
    text: '«Escribir 5 minutos al día reduce ansiedad un 30%.»',
    author: 'Pennebaker',
    meta: '1997',
  },
  {
    text: '«Etiquetar la emoción la regula.»',
    author: 'Lieberman',
    meta: '2007 · UCLA fMRI',
  },
  {
    text: '«La memoria longitudinal de patrones acelera la regulación.»',
    author: 'Watkins',
    meta: '2008',
  },
];

type FeatureRow = { label: string; included: boolean };

const FREE_ROWS: FeatureRow[] = [
  { label: 'Diario ilimitado', included: true },
  { label: 'Mood tracking', included: true },
  { label: 'Patrones semanales', included: true },
  { label: 'Lecturas del vlog', included: true },
  { label: 'Conversa con Egoera (5/día)', included: false },
  { label: 'Voz transcrita', included: false },
  { label: 'Memoria entre sesiones', included: false },
  { label: 'Export PDF/Markdown ilimitado', included: false },
];

const PRO_ROWS: FeatureRow[] = [
  { label: 'Todo lo de Free', included: true },
  { label: 'Conversa con Egoera ILIMITADA', included: true },
  { label: 'Voz transcrita ilimitada (Whisper local)', included: true },
  { label: 'Memoria de 365 días en el AI', included: true },
  { label: 'Patrones de 90 días + predicciones', included: true },
  { label: 'Export profesional (PDF, Markdown, JSON)', included: true },
  { label: 'Soporte prioritario', included: true },
];

function CheckIcon({ ok }: { ok: boolean }): React.ReactElement {
  if (ok) {
    return (
      <svg
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M4 12.5l5 5 11-11" />
      </svg>
    );
  }
  return (
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
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function Spark({
  top,
  left,
  size,
  color,
  rotate,
}: {
  top: string;
  left: string;
  size: number;
  color: string;
  rotate: number;
}): React.ReactElement {
  return (
    <span
      className="spark"
      style={{
        top,
        left,
        width: size,
        height: size,
        transform: `rotate(${rotate}deg)`,
      }}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" fill={color}>
        <path d="M12 0 L13.8 10.2 L24 12 L13.8 13.8 L12 24 L10.2 13.8 L0 12 L10.2 10.2 Z" />
      </svg>
      <style jsx>{`
        .spark {
          position: absolute;
          display: block;
          opacity: 0.85;
          pointer-events: none;
        }
        .spark :global(svg) {
          width: 100%;
          height: 100%;
        }
      `}</style>
    </span>
  );
}

export default function ProPage(): React.ReactElement {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  function handleCta(): void {
    if (typeof window !== 'undefined') {
      window.alert('Próximamente. Mientras, todo está gratis.');
    }
  }

  return (
    <>
      {/* === 1. HERO === */}
      <Screen background="ink">
        <div className="hero" aria-label="Egoera Pro">
          <Spark top="6%" left="8%" size={22} color="var(--cobalto-light)" rotate={12} />
          <Spark top="18%" left="86%" size={16} color="var(--accent)" rotate={-22} />
          <Spark top="62%" left="4%" size={14} color="var(--accent-soft)" rotate={36} />
          <Spark top="78%" left="88%" size={20} color="var(--cobalto-light)" rotate={-8} />

          <p className="eyebrow hero-eyebrow">— EGOERA PRO —</p>

          <h1 className="hero-title">
            Tus patrones
            <br />
            <em className="hero-x">4×</em>{' '}
            <span className="hero-tail">más claros.</span>
          </h1>

          <p className="hero-sub">
            Memoria infinita, voz ilimitada, exports profesionales y la ciencia
            detrás de cada insight.
          </p>

          <button type="button" className="cta-pill cta-big" onClick={handleCta}>
            Empezar 7 días gratis →
          </button>

          <p className="pill-num pill-trust">— Sin compromiso · Cancela cuando quieras —</p>
        </div>

        <style jsx>{`
          .hero {
            position: relative;
            min-height: calc(100vh - 24px - 110px);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: flex-start;
            padding: 48px 0 32px;
            background:
              radial-gradient(120% 80% at 100% 0%, rgba(29, 43, 219, 0.32), transparent 60%),
              radial-gradient(90% 60% at 0% 100%, rgba(230, 100, 58, 0.16), transparent 65%);
            border-radius: var(--r-lg);
            overflow: hidden;
            animation: fadeUp 0.6s ease both;
          }
          .hero-eyebrow {
            color: var(--crema);
            opacity: 0.6;
            margin-bottom: 28px;
            padding-left: 4px;
          }
          .hero-title {
            font-family: var(--font-display);
            font-style: italic;
            font-weight: 700;
            font-size: 56px;
            line-height: 0.96;
            letter-spacing: -0.02em;
            color: var(--crema);
            padding: 0 4px;
          }
          .hero-x {
            display: inline-block;
            color: var(--accent);
            font-style: italic;
            font-weight: 700;
            font-size: 120px;
            line-height: 0.85;
            letter-spacing: -0.04em;
            margin: 6px 6px -10px 0;
            vertical-align: -10px;
            text-shadow: 0 0 60px rgba(230, 100, 58, 0.35);
          }
          .hero-tail {
            display: inline;
          }
          .hero-sub {
            font-family: var(--font-body);
            font-size: 15px;
            line-height: 1.5;
            color: var(--crema);
            opacity: 0.78;
            margin: 28px 4px 36px;
            max-width: 460px;
          }
          .cta-pill {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background: var(--accent);
            color: var(--crema);
            font-family: var(--font-body);
            font-weight: 600;
            font-size: 17px;
            letter-spacing: 0;
            padding: 18px 28px;
            border-radius: var(--r-pill);
            border: none;
            cursor: pointer;
            box-shadow: 0 14px 40px rgba(230, 100, 58, 0.45);
            transition: transform 0.15s ease, box-shadow 0.15s ease;
            margin-left: 4px;
          }
          .cta-big {
            font-size: 18px;
            padding: 20px 32px;
          }
          .cta-pill:active {
            transform: scale(0.97);
            box-shadow: 0 8px 20px rgba(230, 100, 58, 0.4);
          }
          .pill-trust {
            margin-top: 18px;
            margin-left: 4px;
            background: rgba(241, 234, 216, 0.08);
            color: var(--crema);
            opacity: 0.75;
          }
          @media (min-width: 480px) {
            .hero-title {
              font-size: 64px;
            }
            .hero-x {
              font-size: 140px;
            }
          }
          @keyframes fadeUp {
            from {
              opacity: 0;
              transform: translateY(12px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </Screen>

      {/* === 2. NUMERIC PROOF === */}
      <Screen background="cream">
        <div className="proof">
          <p className="eyebrow">— LA EVIDENCIA —</p>
          <div className="proof-grid">
            <div className="proof-cell" style={{ animationDelay: '0.05s' }}>
              <div className="proof-num">4×</div>
              <p className="proof-label">
                más rápido encontrar tu patrón <span className="proof-vs">(vs sin Egoera)</span>
              </p>
            </div>
            <div className="proof-cell" style={{ animationDelay: '0.15s' }}>
              <div className="proof-num">3×</div>
              <p className="proof-label">menos rumiación reportada en 30 días</p>
            </div>
            <div className="proof-cell" style={{ animationDelay: '0.25s' }}>
              <div className="proof-num">30 días</div>
              <p className="proof-label">para ver el primer cambio</p>
            </div>
          </div>
          <p className="proof-disclaimer">
            Basado en estudios de Pennebaker (1997), Lieberman (2007), Watkins (2008).
          </p>
        </div>

        <style jsx>{`
          .proof {
            padding: 32px 0 8px;
          }
          .proof .eyebrow {
            margin-bottom: 24px;
          }
          .proof-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 36px;
          }
          .proof-cell {
            opacity: 0;
            animation: fadeUp 0.55s ease forwards;
          }
          .proof-num {
            font-family: var(--font-display);
            font-style: italic;
            font-weight: 700;
            font-size: 88px;
            line-height: 0.92;
            letter-spacing: -0.03em;
            color: var(--cobalto);
          }
          .proof-label {
            font-family: var(--font-body);
            font-size: 14px;
            line-height: 1.45;
            color: var(--ink);
            opacity: 0.85;
            margin-top: 8px;
            max-width: 320px;
          }
          .proof-vs {
            opacity: 0.55;
          }
          .proof-disclaimer {
            margin-top: 28px;
            font-family: var(--font-mono);
            font-size: 11px;
            letter-spacing: 0.08em;
            color: var(--ink);
            opacity: 0.55;
          }
          @media (min-width: 480px) {
            .proof-grid {
              grid-template-columns: repeat(3, 1fr);
              gap: 18px;
            }
            .proof-num {
              font-size: 72px;
            }
          }
          @keyframes fadeUp {
            from {
              opacity: 0;
              transform: translateY(12px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </Screen>

      {/* === 3. COMPARISON FREE / PRO === */}
      <Screen background="ink">
        <div className="cmp">
          <p className="eyebrow cmp-eyebrow">— COMPARA —</p>
          <h2 className="cmp-title">
            Dos versiones.
            <br />
            <em>Misma raíz.</em>
          </h2>

          <div className="cmp-grid">
            {/* Free card */}
            <article className="plan plan-free">
              <span className="pill-num">— GRATIS —</span>
              <h3 className="plan-title">Empezar</h3>
              <p className="plan-current">Tu plan actual</p>
              <ul className="plan-list">
                {FREE_ROWS.map((row) => (
                  <li
                    key={row.label}
                    className={`plan-row ${row.included ? 'ok' : 'off'}`}
                  >
                    <span className="row-ico">
                      <CheckIcon ok={row.included} />
                    </span>
                    <span className="row-label">{row.label}</span>
                  </li>
                ))}
              </ul>
            </article>

            {/* Pro card */}
            <article className="plan plan-pro">
              <span className="pill-yellow">— PRO —</span>
              <h3 className="plan-title">Más profundo</h3>
              <div className="plan-price">
                <span className="price-strike">€59</span>
                <span className="price-now">€39/año</span>
                <span className="price-month">o €4,99/mes</span>
              </div>
              <ul className="plan-list">
                {PRO_ROWS.map((row) => (
                  <li key={row.label} className="plan-row ok">
                    <span className="row-ico row-ico-green">
                      <CheckIcon ok />
                    </span>
                    <span className="row-label">{row.label}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="cta-pill plan-cta"
                onClick={handleCta}
              >
                Probar 7 días →
              </button>
            </article>
          </div>
        </div>

        <style jsx>{`
          .cmp {
            padding: 24px 0 8px;
          }
          .cmp-eyebrow {
            color: var(--crema);
            opacity: 0.6;
            margin-bottom: 14px;
          }
          .cmp-title {
            font-family: var(--font-display);
            font-style: italic;
            font-weight: 700;
            font-size: 38px;
            line-height: 1;
            letter-spacing: -0.01em;
            color: var(--crema);
            margin-bottom: 28px;
          }
          .cmp-title em {
            color: var(--accent);
            font-style: italic;
          }
          .cmp-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .plan {
            position: relative;
            border-radius: var(--r-lg);
            padding: 22px 20px 24px;
          }
          .plan-free {
            background: var(--crema);
            color: var(--ink);
            border: 1px solid rgba(13, 15, 61, 0.06);
          }
          .plan-pro {
            background: var(--cobalto);
            color: var(--crema);
            box-shadow: 0 30px 60px rgba(29, 43, 219, 0.45);
            transform: translateY(-2px);
          }
          .plan-title {
            font-family: var(--font-display);
            font-style: italic;
            font-weight: 700;
            font-size: 32px;
            line-height: 1;
            letter-spacing: -0.01em;
            margin-top: 18px;
          }
          .plan-current {
            font-family: var(--font-mono);
            font-size: 11px;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            opacity: 0.55;
            margin-top: 10px;
          }
          .plan-price {
            display: flex;
            align-items: baseline;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 14px;
            margin-bottom: 4px;
          }
          .price-strike {
            font-family: var(--font-display);
            font-style: italic;
            font-size: 18px;
            opacity: 0.55;
            text-decoration: line-through;
            text-decoration-thickness: 1.5px;
          }
          .price-now {
            font-family: var(--font-display);
            font-style: italic;
            font-weight: 700;
            font-size: 32px;
            line-height: 1;
            color: var(--pill-yellow);
            letter-spacing: -0.01em;
          }
          .price-month {
            font-family: var(--font-mono);
            font-size: 11px;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            opacity: 0.7;
          }
          .plan-list {
            list-style: none;
            padding: 0;
            margin: 18px 0 0;
            display: flex;
            flex-direction: column;
            gap: 10px;
          }
          .plan-row {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            font-family: var(--font-body);
            font-size: 14px;
            line-height: 1.4;
          }
          .plan-row.off {
            opacity: 0.4;
          }
          .row-ico {
            flex-shrink: 0;
            width: 22px;
            height: 22px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 999px;
            margin-top: 1px;
          }
          .plan-free .plan-row.ok .row-ico {
            color: var(--cobalto);
          }
          .plan-free .plan-row.off .row-ico {
            color: var(--ink);
          }
          .plan-pro .row-ico-green {
            background: rgba(232, 212, 95, 0.18);
            color: var(--pill-yellow);
          }
          .row-label {
            flex: 1;
          }
          .plan-cta {
            margin-top: 22px;
            width: 100%;
            background: var(--accent);
            color: var(--crema);
            box-shadow: 0 12px 32px rgba(230, 100, 58, 0.45);
          }
          .plan-cta:active {
            transform: scale(0.98);
          }
          .cta-pill {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-family: var(--font-body);
            font-weight: 600;
            font-size: 16px;
            padding: 16px 24px;
            border-radius: var(--r-pill);
            border: none;
            cursor: pointer;
            transition: transform 0.15s ease, box-shadow 0.15s ease;
          }
          @media (min-width: 480px) {
            .cmp-grid {
              grid-template-columns: 1fr 1fr;
              gap: 14px;
              align-items: stretch;
            }
            .plan {
              display: flex;
              flex-direction: column;
            }
            .plan-list {
              flex: 1;
            }
          }
        `}</style>
      </Screen>

      {/* === 4. SCIENTIFIC QUOTES === */}
      <Screen background="cream">
        <div className="quotes">
          <p className="eyebrow">— LA CIENCIA —</p>
          <h2 className="sec-big quotes-title">
            No es magia.
            <br />
            <em>Es evidencia.</em>
          </h2>

          <div className="quote-list">
            {QUOTES.map((q, i) => (
              <article key={q.author} className={`quote q-${i}`}>
                <p className="quote-text">{q.text}</p>
                <p className="quote-author">
                  — {q.author}, <span className="quote-meta">{q.meta}</span>
                </p>
              </article>
            ))}
          </div>
        </div>

        <style jsx>{`
          .quotes {
            padding: 32px 0 8px;
          }
          .quotes .eyebrow {
            margin-bottom: 14px;
          }
          .quotes-title {
            margin-bottom: 28px;
          }
          .quote-list {
            display: flex;
            flex-direction: column;
            gap: 14px;
          }
          .quote {
            border-radius: var(--r-md);
            padding: 18px 20px;
            background: var(--crema-soft);
            border: 1px solid rgba(13, 15, 61, 0.08);
          }
          .quote.q-0 {
            background: var(--cobalto);
            color: var(--crema);
            border-color: transparent;
          }
          .quote.q-1 {
            background: var(--accent);
            color: var(--crema);
            border-color: transparent;
          }
          .quote-text {
            font-family: var(--font-display);
            font-style: italic;
            font-weight: 600;
            font-size: 19px;
            line-height: 1.3;
            letter-spacing: -0.005em;
          }
          .quote-author {
            font-family: var(--font-mono);
            font-size: 11px;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            margin-top: 12px;
            opacity: 0.85;
          }
          .quote-meta {
            opacity: 0.7;
          }
        `}</style>
      </Screen>

      {/* === 5. SOCIAL PROOF === */}
      <Screen background="cream">
        <div className="testi">
          <p className="eyebrow">— QUIÉN LA USA —</p>
          <h2 className="sec-big testi-title">
            Gente que ahora
            <br />
            <em>se entiende mejor.</em>
          </h2>

          <div className="testi-list">
            {TESTIMONIALS.map((t) => (
              <article key={t.name} className={`tcard tone-${t.tone}`}>
                <div className="tavatar">{t.initial}</div>
                <div className="tbody">
                  <p className="tquote">«{t.quote}»</p>
                  <p className="tmeta">
                    {t.name} · <span className="tcity">{t.city}</span>
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <style jsx>{`
          .testi {
            padding: 28px 0 8px;
          }
          .testi .eyebrow {
            margin-bottom: 14px;
          }
          .testi-title {
            margin-bottom: 24px;
          }
          .testi-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }
          .tcard {
            display: flex;
            gap: 14px;
            align-items: flex-start;
            padding: 16px 18px;
            border-radius: var(--r-md);
            border: 1px solid rgba(13, 15, 61, 0.08);
            background: var(--crema-soft);
          }
          .tcard.tone-cobalto .tavatar {
            background: var(--cobalto);
            color: var(--crema);
          }
          .tcard.tone-accent .tavatar {
            background: var(--accent);
            color: var(--crema);
          }
          .tcard.tone-ink .tavatar {
            background: var(--ink);
            color: var(--crema);
          }
          .tavatar {
            width: 44px;
            height: 44px;
            border-radius: 999px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: var(--font-display);
            font-style: italic;
            font-weight: 700;
            font-size: 22px;
            flex-shrink: 0;
          }
          .tbody {
            flex: 1;
          }
          .tquote {
            font-family: var(--font-display);
            font-style: italic;
            font-weight: 500;
            font-size: 16px;
            line-height: 1.35;
            letter-spacing: -0.005em;
            color: var(--ink);
          }
          .tmeta {
            font-family: var(--font-mono);
            font-size: 10px;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            margin-top: 8px;
            color: var(--ink);
            opacity: 0.6;
          }
          .tcity {
            opacity: 0.85;
          }
        `}</style>
      </Screen>

      {/* === 6. FINAL CTA === */}
      <Screen background="ink">
        <div className="final">
          <Spark top="14%" left="84%" size={18} color="var(--accent)" rotate={20} />
          <Spark top="68%" left="6%" size={14} color="var(--cobalto-light)" rotate={-12} />

          <h2 className="final-title">
            ¿Listo para
            <br />
            <em>ver más profundo?</em>
          </h2>

          <button type="button" className="cta-pill cta-big" onClick={handleCta}>
            Empezar 7 días gratis →
          </button>

          <p className="pill-num pill-trust">— €4,99/mes después · Cancela en 1 click —</p>
        </div>

        <style jsx>{`
          .final {
            position: relative;
            padding: 56px 4px 32px;
            text-align: left;
            background:
              radial-gradient(80% 60% at 100% 100%, rgba(230, 100, 58, 0.18), transparent 60%),
              radial-gradient(60% 50% at 0% 0%, rgba(29, 43, 219, 0.28), transparent 65%);
            border-radius: var(--r-lg);
            overflow: hidden;
          }
          .final-title {
            font-family: var(--font-display);
            font-style: italic;
            font-weight: 700;
            font-size: 42px;
            line-height: 1;
            letter-spacing: -0.01em;
            color: var(--crema);
            margin-bottom: 28px;
          }
          .final-title em {
            color: var(--accent);
            font-style: italic;
          }
          .cta-pill {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background: var(--accent);
            color: var(--crema);
            font-family: var(--font-body);
            font-weight: 600;
            font-size: 17px;
            padding: 18px 28px;
            border-radius: var(--r-pill);
            border: none;
            cursor: pointer;
            box-shadow: 0 14px 40px rgba(230, 100, 58, 0.45);
            transition: transform 0.15s ease;
          }
          .cta-big {
            font-size: 18px;
            padding: 20px 32px;
          }
          .cta-pill:active {
            transform: scale(0.97);
          }
          .pill-trust {
            display: inline-block;
            margin-top: 18px;
            background: rgba(241, 234, 216, 0.08);
            color: var(--crema);
            opacity: 0.75;
          }
        `}</style>
      </Screen>

      {/* === 7. FAQ === */}
      <Screen background="cream">
        <div className="faq">
          <p className="eyebrow">— PREGUNTAS —</p>
          <h2 className="sec-big faq-title">
            Lo que <em>te preguntas</em>.
          </h2>

          <ul className="faq-list">
            {FAQ.map((item, i) => {
              const open = openIdx === i;
              return (
                <li key={item.q} className={`faq-item ${open ? 'open' : ''}`}>
                  <button
                    type="button"
                    className="faq-q"
                    onClick={() => setOpenIdx(open ? null : i)}
                    aria-expanded={open}
                  >
                    <span className="faq-q-text">{item.q}</span>
                    <span className="faq-q-ico" aria-hidden>
                      {open ? '−' : '+'}
                    </span>
                  </button>
                  {open ? <p className="faq-a">{item.a}</p> : null}
                </li>
              );
            })}
          </ul>
        </div>

        <TabBar />

        <style jsx>{`
          .faq {
            padding: 28px 0 16px;
          }
          .faq .eyebrow {
            margin-bottom: 14px;
          }
          .faq-title {
            margin-bottom: 22px;
          }
          .faq-list {
            list-style: none;
            padding: 0;
            margin: 0;
            display: flex;
            flex-direction: column;
            gap: 10px;
          }
          .faq-item {
            border-radius: var(--r-md);
            background: var(--crema-soft);
            border: 1px solid rgba(13, 15, 61, 0.08);
            overflow: hidden;
            transition: background 0.15s ease;
          }
          .faq-item.open {
            background: var(--crema);
            border-color: rgba(13, 15, 61, 0.16);
          }
          .faq-q {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            padding: 16px 18px;
            background: none;
            border: none;
            cursor: pointer;
            text-align: left;
            font-family: var(--font-display);
            font-style: italic;
            font-weight: 600;
            font-size: 17px;
            line-height: 1.25;
            color: var(--ink);
          }
          .faq-q-ico {
            font-family: var(--font-mono);
            font-size: 22px;
            font-weight: 400;
            opacity: 0.55;
            line-height: 1;
          }
          .faq-a {
            padding: 0 18px 16px;
            font-family: var(--font-body);
            font-size: 14px;
            line-height: 1.5;
            color: var(--ink);
            opacity: 0.78;
          }
        `}</style>
      </Screen>
    </>
  );
}
