'use client';

import { CuadernoPage } from '@/lib/cuadernos-data';
import { setAnswer } from '@/lib/cuadernos-storage';
import { useState, useEffect } from 'react';

type Props = {
  page: CuadernoPage;
  pageIndex: number;
  totalPages: number;
  slug: string;
  issue: string;
  title: string;
  mode: 'read' | 'work';
  initialAnswers: Record<string, string>;
};

/**
 * Renderiza una página del cuaderno con la identidad visual Egoera.
 * - Modo 'read' → solo lectura, líneas vacías
 * - Modo 'work' → prompts editables, autosave a localStorage
 */
export default function CuadernoPageRender({
  page,
  pageIndex,
  totalPages,
  slug,
  issue,
  title,
  mode,
  initialAnswers,
}: Props) {
  return (
    <div className={`cpage cpage-${page.type}`}>
      {page.type !== 'cover' && (
        <header className="cpage-chrome">
          <span className="cpage-eyebrow">
            EGOERA · {issue.toUpperCase()} · {title.toUpperCase()}
          </span>
          <span className="cpage-folio">
            {String(pageIndex + 1).padStart(2, '0')} / {String(totalPages).padStart(2, '0')}
          </span>
        </header>
      )}

      <div className="cpage-body">
        {renderByType(page, mode, slug, pageIndex, initialAnswers)}
      </div>

      {page.type !== 'cover' && (
        <footer className="cpage-foot">
          <span>egoera · psicología, despacio</span>
          <span className="cpage-foot-link">egoera.es</span>
        </footer>
      )}

      <style jsx>{`
        .cpage {
          width: 100%;
          height: 100%;
          background: #f7eecf;
          background-image:
            radial-gradient(at 90% 8%, rgba(244, 200, 66, 0.18), transparent 40%),
            linear-gradient(180deg, #f7eecf 0%, #f1ead8 100%);
          color: var(--ink);
          padding: 14px 16px 12px;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        }
        @media (min-width: 768px) {
          .cpage {
            padding: 18px 22px 16px;
          }
        }
        .cpage-chrome {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(29, 43, 219, 0.18);
          margin-bottom: 12px;
        }
        .cpage-eyebrow,
        .cpage-folio {
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.18em;
          color: var(--cobalto);
        }
        .cpage-body {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
        }
        .cpage-foot {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 8px;
          border-top: 1px dashed rgba(29, 43, 219, 0.22);
          margin-top: 8px;
          font-family: var(--font-mono);
          font-size: 9.5px;
          color: rgba(13, 15, 61, 0.62);
        }
        .cpage-foot-link {
          color: var(--cobalto);
        }
      `}</style>
    </div>
  );
}

function renderByType(
  page: CuadernoPage,
  mode: 'read' | 'work',
  slug: string,
  pageIndex: number,
  answers: Record<string, string>
) {
  switch (page.type) {
    case 'cover':
      return <CoverPage page={page} />;
    case 'editorial':
      return <EditorialPage page={page} />;
    case 'sumario':
      return <SumarioPage page={page} />;
    case 'section':
      return <SectionPage page={page} />;
    case 'exercise':
      return (
        <ExercisePage
          page={page}
          mode={mode}
          slug={slug}
          pageIndex={pageIndex}
          answers={answers}
        />
      );
    case 'quote_break':
      return <QuoteBreakPage page={page} />;
    case 'map_table':
      return (
        <MapTablePage
          page={page}
          mode={mode}
          slug={slug}
          pageIndex={pageIndex}
          answers={answers}
        />
      );
    case 'closing':
      return <ClosingPage page={page} />;
  }
}

// ─── Cover ──────────────────────────────────────────────────────────────────

function CoverPage({ page }: { page: Extract<CuadernoPage, { type: 'cover' }> }) {
  return (
    <div className="cover">
      <div className="cover-band-top" />
      <div className="cover-sticker" />
      <div className="cover-inner">
        <span className="cover-eyebrow">{page.eyebrow ?? '— EGOERA · CUADERNO —'}</span>
        <h1 className="cover-title">{page.title}</h1>
        <span className="cover-accent">{page.accent}</span>
        <p className="cover-lede">{page.lede}</p>
        {page.columns && (
          <div className="cover-cols">
            {page.columns.map((c, i) => (
              <div key={i} className="cover-col">
                <span className="cover-col-h">{c.h}</span>
                <p>{c.body}</p>
              </div>
            ))}
          </div>
        )}
        <div className="cover-author">
          <span>Ander Bilbao Castejón · Bilbao · Mayo 2026</span>
          <span className="cover-meta">PSICÓLOGO · UPV-EHU · EXPERTO IEPP</span>
        </div>
      </div>
      <div className="cover-band-bot" />

      <style jsx>{`
        .cover {
          position: absolute;
          inset: 0;
          background: #f1ead8;
          display: flex;
          flex-direction: column;
        }
        .cover-band-top {
          height: 18px;
          background: var(--cobalto);
        }
        .cover-band-bot {
          height: 14px;
          background: var(--cobalto);
        }
        .cover-sticker {
          position: absolute;
          top: 8px;
          right: 14px;
          width: 70px;
          height: 70px;
          border-radius: 50%;
          background: radial-gradient(circle, #f4c842 55%, rgba(217, 119, 87, 0.22) 56%, rgba(217, 119, 87, 0) 75%);
          box-shadow: 0 6px 16px -6px rgba(29, 43, 219, 0.2);
        }
        @media (min-width: 768px) {
          .cover-sticker {
            top: 12px;
            right: 22px;
            width: 90px;
            height: 90px;
          }
        }
        .cover-sticker::after {
          content: '';
          position: absolute;
          top: 50%;
          right: 12px;
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: var(--coral, #d97757);
        }
        .cover-inner {
          flex: 1;
          padding: 18px 18px 12px;
          display: flex;
          flex-direction: column;
        }
        @media (min-width: 768px) {
          .cover-inner {
            padding: 24px 28px 14px;
          }
        }
        .cover-eyebrow {
          font-family: var(--font-mono);
          font-size: 10.5px;
          letter-spacing: 0.22em;
          color: var(--cobalto);
          margin-bottom: 22px;
        }
        .cover-title {
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 600;
          font-size: clamp(26px, 7vw, 52px);
          line-height: 1.02;
          letter-spacing: -0.01em;
          color: var(--ink);
          margin: 0;
          word-break: break-word;
        }
        .cover-accent {
          font-family: var(--font-hand, 'Caveat'), cursive;
          font-size: clamp(44px, 12vw, 96px);
          line-height: 0.9;
          color: var(--coral, #d97757);
          margin: 4px 0 22px;
        }
        .cover-lede {
          font-family: var(--font-body);
          font-size: 12.5px;
          line-height: 1.55;
          color: var(--ink-soft, #1c1f4a);
          max-width: 100%;
          margin: 0 0 auto;
        }
        @media (min-width: 768px) {
          .cover-lede {
            font-size: 13px;
            max-width: 28em;
          }
        }
        .cover-cols {
          display: grid;
          grid-template-columns: 1fr;
          gap: 8px;
          margin: 16px 0 12px;
        }
        @media (min-width: 520px) {
          .cover-cols {
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
          }
        }
        .cover-col {
          padding: 0 6px;
          border-left: 1px solid rgba(29, 43, 219, 0.22);
        }
        .cover-col:first-child {
          border-left: none;
          padding-left: 0;
        }
        @media (max-width: 519px) {
          .cover-col {
            border-left: none;
            border-top: 1px dashed rgba(29, 43, 219, 0.18);
            padding: 8px 0 0;
          }
          .cover-col:first-child {
            border-top: none;
            padding-top: 0;
          }
        }
        .cover-col-h {
          display: block;
          font-family: var(--font-body);
          font-weight: 700;
          font-size: 9.5px;
          letter-spacing: 0.16em;
          color: var(--cobalto);
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        .cover-col p {
          font-family: var(--font-body);
          font-size: 11px;
          line-height: 1.5;
          color: var(--ink);
          margin: 0;
        }
        .cover-author {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-family: var(--font-body);
          font-size: 11px;
          color: var(--ink-soft);
        }
        .cover-meta {
          font-family: var(--font-mono);
          font-size: 9.5px;
          letter-spacing: 0.16em;
          color: var(--cobalto);
        }
      `}</style>
    </div>
  );
}

// ─── Editorial ──────────────────────────────────────────────────────────────

function EditorialPage({ page }: { page: Extract<CuadernoPage, { type: 'editorial' }> }) {
  return (
    <div className="ed">
      <h2>{page.h}</h2>
      {page.body.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
      {page.quote && (
        <aside className="ed-quote">
          <span className="ed-quote-mark">«</span>
          <span className="ed-quote-text">{page.quote}</span>
          <span className="ed-quote-mark">»</span>
          {page.quote_src && <small>— {page.quote_src} —</small>}
        </aside>
      )}
      <style jsx>{`
        .ed h2 {
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 600;
          font-size: clamp(26px, 4vw, 36px);
          color: var(--cobalto);
          margin: 8px 0 16px;
          border-bottom: 2px solid var(--coral, #d97757);
          padding-bottom: 4px;
          display: inline-block;
        }
        .ed p {
          font-family: var(--font-body);
          font-size: 13.5px;
          line-height: 1.62;
          color: var(--ink-soft);
          margin: 0 0 12px;
        }
        .ed-quote {
          margin: 18px 0 0;
          padding: 18px 20px 16px;
          background: rgba(244, 200, 66, 0.42);
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .ed-quote-text {
          font-family: var(--font-hand, 'Caveat'), cursive;
          font-size: clamp(26px, 4vw, 34px);
          color: var(--cobalto);
          line-height: 1.05;
        }
        .ed-quote-mark {
          display: none;
        }
        .ed-quote small {
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.18em;
          color: var(--cobalto);
        }
      `}</style>
    </div>
  );
}

// ─── Sumario ────────────────────────────────────────────────────────────────

function SumarioPage({ page }: { page: Extract<CuadernoPage, { type: 'sumario' }> }) {
  return (
    <div className="su">
      <h2>SUMARIO</h2>
      <ol className="su-list">
        {page.entries.map((e, i) => (
          <li key={i}>
            <span className="su-num">{e.n}</span>
            <div className="su-meta">
              <strong>{e.h}</strong>
              <small>{e.sub}</small>
            </div>
          </li>
        ))}
      </ol>
      <style jsx>{`
        .su h2 {
          font-family: var(--font-body);
          font-weight: 800;
          font-size: clamp(34px, 5vw, 46px);
          letter-spacing: -0.01em;
          color: var(--ink);
          margin: 6px 0 22px;
        }
        .su-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px 22px;
        }
        @media (max-width: 480px) {
          .su-list {
            grid-template-columns: 1fr;
          }
        }
        .su-list li {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }
        .su-num {
          font-family: var(--font-display);
          font-size: clamp(28px, 3.6vw, 36px);
          line-height: 0.95;
          color: var(--cobalto);
          font-weight: 500;
          letter-spacing: -0.02em;
        }
        .su-meta strong {
          display: block;
          font-family: var(--font-body);
          font-weight: 700;
          font-size: 13.5px;
          color: var(--ink);
          margin-bottom: 2px;
        }
        .su-meta small {
          display: block;
          font-family: var(--font-body);
          font-size: 11.5px;
          color: var(--ink-soft);
          line-height: 1.45;
        }
      `}</style>
    </div>
  );
}

// ─── Section ────────────────────────────────────────────────────────────────

function SectionPage({ page }: { page: Extract<CuadernoPage, { type: 'section' }> }) {
  const accentColor =
    page.color_accent === 'coral' ? '#d97757' : page.color_accent === 'cobalto' ? '#1d2bdb' : '#f4c842';
  return (
    <div className="se">
      <header className="se-head">
        <span className="se-bullet" style={{ background: accentColor }}>
          <span style={{ color: page.color_accent === 'mostaza' ? '#0d0f3d' : '#f1ead8' }}>
            {page.n}
          </span>
        </span>
        <div>
          <span className="se-kicker">{page.kicker}</span>
          <h2>{page.h}</h2>
        </div>
      </header>
      {page.body.map((p, i) => (
        <p key={i} className="se-body">
          {p}
        </p>
      ))}
      {page.bullets && (
        <ul className="se-bullets">
          {page.bullets.map((b, i) => (
            <li key={i}>
              <span className="se-arrow">→</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}
      <style jsx>{`
        .se-head {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          margin-bottom: 14px;
        }
        .se-bullet {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 600;
          font-size: 18px;
        }
        .se-kicker {
          display: block;
          font-family: var(--font-mono);
          font-size: 9.5px;
          letter-spacing: 0.18em;
          color: var(--cobalto);
          margin-bottom: 4px;
        }
        .se-head h2 {
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 600;
          font-size: clamp(22px, 3.4vw, 30px);
          color: var(--ink);
          margin: 0;
          line-height: 1.05;
        }
        .se-body {
          font-family: var(--font-body);
          font-size: 13px;
          line-height: 1.6;
          color: var(--ink-soft);
          margin: 0 0 10px;
        }
        .se-bullets {
          list-style: none;
          padding: 0;
          margin: 12px 0 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .se-bullets li {
          display: flex;
          gap: 10px;
          font-family: var(--font-body);
          font-size: 12.5px;
          line-height: 1.5;
          color: var(--ink);
        }
        .se-arrow {
          color: var(--coral, #d97757);
          font-weight: 700;
        }
      `}</style>
    </div>
  );
}

// ─── Exercise ───────────────────────────────────────────────────────────────

function ExercisePage({
  page,
  mode,
  slug,
  pageIndex,
  answers,
}: {
  page: Extract<CuadernoPage, { type: 'exercise' }>;
  mode: 'read' | 'work';
  slug: string;
  pageIndex: number;
  answers: Record<string, string>;
}) {
  return (
    <div className="ex">
      <div className="ex-band" />
      <header className="ex-head">
        <span className="ex-circle">{page.n}</span>
        <div>
          <span className="ex-kicker">{page.kicker}</span>
          <h2>{page.h}</h2>
        </div>
      </header>
      {page.intro && <p className="ex-intro">{page.intro}</p>}
      <ol className="ex-prompts">
        {page.prompts.map((p, i) => {
          const key = `${pageIndex}-${i}`;
          return (
            <li key={i}>
              <span className="ex-num">{String(i + 1).padStart(2, '0')}.</span>
              <div className="ex-prompt-body">
                <span className="ex-prompt-text">{p}</span>
                {mode === 'work' ? (
                  <AnswerArea slug={slug} k={key} initial={answers[key] ?? ''} />
                ) : (
                  <div className="ex-lines">
                    <span />
                    <span />
                    <span />
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
      {page.reflection && (
        <aside className="ex-reflect">
          <span className="ex-reflect-h">— PARA CERRAR —</span>
          <p>{page.reflection}</p>
        </aside>
      )}
      <style jsx>{`
        .ex {
          position: relative;
        }
        .ex-band {
          height: 6px;
          background: #f4c842;
          margin: -4px -22px 14px;
          border-radius: 0;
        }
        .ex-head {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }
        .ex-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #f4c842;
          display: grid;
          place-items: center;
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 600;
          font-size: 18px;
          color: var(--ink);
        }
        .ex-kicker {
          display: block;
          font-family: var(--font-mono);
          font-size: 9.5px;
          letter-spacing: 0.18em;
          color: var(--cobalto);
          margin-bottom: 2px;
        }
        .ex-head h2 {
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 600;
          font-size: clamp(22px, 3.4vw, 28px);
          color: var(--ink);
          margin: 0;
          line-height: 1.05;
        }
        .ex-intro {
          font-family: var(--font-body);
          font-size: 12.5px;
          line-height: 1.6;
          color: var(--ink-soft);
          margin: 0 0 14px;
        }
        .ex-prompts {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .ex-prompts li {
          display: flex;
          gap: 8px;
        }
        .ex-num {
          font-family: var(--font-mono);
          font-size: 10px;
          color: var(--cobalto);
          padding-top: 4px;
        }
        .ex-prompt-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .ex-prompt-text {
          font-family: var(--font-body);
          font-size: 12.5px;
          color: var(--ink);
          line-height: 1.5;
        }
        .ex-lines {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-top: 4px;
        }
        .ex-lines span {
          display: block;
          height: 1px;
          background: rgba(29, 43, 219, 0.32);
        }
        .ex-reflect {
          margin-top: 18px;
          padding: 12px 14px;
          background: rgba(237, 224, 189, 0.72);
          border-radius: 10px;
        }
        .ex-reflect-h {
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.18em;
          color: var(--cobalto);
          display: block;
          margin-bottom: 6px;
        }
        .ex-reflect p {
          font-family: var(--font-body);
          font-size: 11.5px;
          line-height: 1.5;
          color: var(--ink);
          margin: 0;
        }
      `}</style>
    </div>
  );
}

function AnswerArea({ slug, k, initial }: { slug: string; k: string; initial: string }) {
  const [val, setVal] = useState(initial);
  useEffect(() => {
    setVal(initial);
  }, [initial]);
  return (
    <>
      <textarea
        value={val}
        onChange={(e) => {
          setVal(e.target.value);
          setAnswer(slug, k, e.target.value);
        }}
        placeholder="Escribe aquí…"
        rows={3}
      />
      <style jsx>{`
        textarea {
          width: 100%;
          min-height: 64px;
          padding: 8px 10px;
          font-family: var(--font-hand, 'Caveat'), cursive;
          font-size: 18px;
          line-height: 1.35;
          color: var(--ink);
          background: rgba(255, 255, 255, 0.55);
          border: 1px dashed rgba(29, 43, 219, 0.35);
          border-radius: 8px;
          resize: vertical;
          outline: none;
        }
        textarea:focus {
          background: #fff;
          border-color: var(--cobalto);
          box-shadow: 0 0 0 3px rgba(29, 43, 219, 0.12);
        }
        textarea::placeholder {
          color: rgba(13, 15, 61, 0.32);
          font-family: var(--font-body);
          font-size: 12px;
          font-style: italic;
        }
      `}</style>
    </>
  );
}

// ─── Quote break ────────────────────────────────────────────────────────────

function QuoteBreakPage({ page }: { page: Extract<CuadernoPage, { type: 'quote_break' }> }) {
  return (
    <div className="qb">
      <div className="qb-rail" />
      <blockquote>
        <span>«{page.quote}»</span>
        {page.src && <small>— {page.src} —</small>}
      </blockquote>
      <style jsx>{`
        .qb {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .qb-rail {
          position: absolute;
          left: -22px;
          top: 0;
          bottom: 0;
          width: 8px;
          background: var(--coral, #d97757);
        }
        blockquote {
          max-width: 22em;
          padding: 0 12px;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 18px;
          align-items: flex-start;
        }
        blockquote span {
          font-family: var(--font-hand, 'Caveat'), cursive;
          font-size: clamp(36px, 6vw, 56px);
          line-height: 1.1;
          color: var(--cobalto);
        }
        blockquote small {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.18em;
          color: var(--cobalto);
        }
      `}</style>
    </div>
  );
}

// ─── Map table ──────────────────────────────────────────────────────────────

function MapTablePage({
  page,
  mode,
  slug,
  pageIndex,
  answers,
}: {
  page: Extract<CuadernoPage, { type: 'map_table' }>;
  mode: 'read' | 'work';
  slug: string;
  pageIndex: number;
  answers: Record<string, string>;
}) {
  return (
    <div className="mp">
      <h2>{page.h}</h2>
      {page.intro && <p className="mp-intro">{page.intro}</p>}
      <div className="mp-table" style={{ gridTemplateColumns: `1fr repeat(${page.columns.length - 1}, 1fr)` }}>
        {page.columns.map((c) => (
          <span key={c} className="mp-th">
            {c}
          </span>
        ))}
        {page.rows.map((row, ri) =>
          page.columns.map((_, ci) => {
            const key = `${pageIndex}-r${ri}-c${ci}`;
            if (ci === 0) {
              return (
                <span key={key} className="mp-row-label">
                  {row}
                </span>
              );
            }
            if (mode === 'work') {
              return (
                <CellInput key={key} slug={slug} k={key} initial={answers[key] ?? ''} />
              );
            }
            return <span key={key} className="mp-cell" />;
          })
        )}
      </div>
      <style jsx>{`
        h2 {
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 600;
          font-size: clamp(22px, 3.4vw, 30px);
          color: var(--cobalto);
          margin: 0 0 8px;
        }
        .mp-intro {
          font-family: var(--font-body);
          font-size: 12px;
          color: var(--ink-soft);
          line-height: 1.5;
          margin: 0 0 14px;
        }
        .mp-table {
          display: grid;
          gap: 0;
          border-top: 2px solid var(--cobalto);
        }
        .mp-th {
          font-family: var(--font-mono);
          font-size: 9.5px;
          letter-spacing: 0.16em;
          color: var(--cobalto);
          padding: 8px 6px;
          border-bottom: 1px solid rgba(29, 43, 219, 0.4);
        }
        .mp-row-label {
          font-family: var(--font-body);
          font-weight: 700;
          font-size: 11.5px;
          color: var(--ink);
          padding: 10px 6px;
          border-bottom: 1px dashed rgba(29, 43, 219, 0.18);
          border-right: 1px dashed rgba(29, 43, 219, 0.18);
        }
        .mp-cell {
          height: 32px;
          border-bottom: 1px dashed rgba(29, 43, 219, 0.18);
          border-right: 1px dashed rgba(29, 43, 219, 0.18);
        }
        .mp-cell:last-child {
          border-right: none;
        }
      `}</style>
    </div>
  );
}

function CellInput({ slug, k, initial }: { slug: string; k: string; initial: string }) {
  const [val, setVal] = useState(initial);
  useEffect(() => {
    setVal(initial);
  }, [initial]);
  return (
    <>
      <input
        type="text"
        value={val}
        onChange={(e) => {
          setVal(e.target.value);
          setAnswer(slug, k, e.target.value);
        }}
      />
      <style jsx>{`
        input {
          width: 100%;
          min-height: 32px;
          padding: 4px 8px;
          background: transparent;
          border: none;
          border-bottom: 1px dashed rgba(29, 43, 219, 0.22);
          border-right: 1px dashed rgba(29, 43, 219, 0.18);
          font-family: var(--font-hand, 'Caveat'), cursive;
          font-size: 17px;
          color: var(--ink);
          outline: none;
        }
        input:focus {
          background: rgba(255, 255, 255, 0.6);
          border-bottom-color: var(--cobalto);
        }
      `}</style>
    </>
  );
}

// ─── Closing ────────────────────────────────────────────────────────────────

function ClosingPage({ page }: { page: Extract<CuadernoPage, { type: 'closing' }> }) {
  return (
    <div className="cl">
      <h2>{page.h}</h2>
      {page.body.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
      <a className="cl-cta" href={page.cta_url} target="_blank" rel="noopener">
        <span className="cl-cta-eyebrow">— SI QUIERES SEGUIR —</span>
        <span className="cl-cta-text">{page.cta_text}</span>
        <span className="cl-cta-url">{page.cta_url}</span>
      </a>
      <style jsx>{`
        h2 {
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 600;
          font-size: clamp(26px, 4vw, 36px);
          color: var(--cobalto);
          margin: 8px 0 16px;
          line-height: 1.05;
        }
        p {
          font-family: var(--font-body);
          font-size: 13px;
          line-height: 1.6;
          color: var(--ink-soft);
          margin: 0 0 12px;
        }
        .cl-cta {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-top: 18px;
          padding: 16px 18px;
          background: #f4c842;
          border-radius: 12px;
          text-decoration: none;
          color: var(--ink);
        }
        .cl-cta-eyebrow {
          font-family: var(--font-mono);
          font-size: 9.5px;
          letter-spacing: 0.18em;
          color: var(--cobalto);
        }
        .cl-cta-text {
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 600;
          font-size: 18px;
        }
        .cl-cta-url {
          font-family: var(--font-mono);
          font-size: 10.5px;
          color: var(--cobalto);
        }
      `}</style>
    </div>
  );
}
