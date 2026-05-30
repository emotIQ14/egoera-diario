'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Screen from '@/components/Screen';
import TabBar from '@/components/TabBar';
import { EmptyLecturas } from '@/components/illustrations/EmptyStates';
import { CUADERNOS } from '@/lib/cuadernos-data';
import { DotsGrid } from '@/components/cuaderno/EgoeraPatterns';

/**
 * Lecturas · vista tipo "news app" (rediseño mayo 2026).
 *
 * Inspiración: refs de news app (categorías circulares tipo stories +
 * tarjetas oscuras con título + secciones Destacados/Últimos + nav flotante).
 * Adaptado a la identidad Egoera: cobalto/crema/coral/mostaza, Fraunces +
 * JetBrains Mono. Conecta artículos del vlog (WP) + docs/cuadernos.
 */

type LecturaPost = {
  id: number;
  title: string;
  slug: string;
  link: string;
  excerpt: string;
  date: string;
  categories: string[];
  readingMinutes: number;
};

type LecturasResponse = { posts: LecturaPost[]; fallback?: boolean };
type FetchState = 'idle' | 'loading' | 'ready' | 'error';

const EGO_COLORS = ['#1d2bdb', '#d97757', '#f4c842', '#0d0f3d', '#3845e8'];

function openExternal(url: string): void {
  if (typeof window === 'undefined') return;
  window.open(url, '_blank', 'noopener,noreferrer');
}

function categoryLabel(post: LecturaPost): string {
  return post.categories[0] ?? 'Lectura';
}

/** Color determinista por nombre de categoría (hash → paleta Egoera). */
function colorForCategory(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return EGO_COLORS[h % EGO_COLORS.length];
}

function fgForBg(bg: string): string {
  return bg === '#f4c842' ? '#0d0f3d' : '#f1ead8';
}

function formatShortDate(iso: string): string {
  try {
    const d = new Date(iso);
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    return `${d.getDate()} ${months[d.getMonth()]}`;
  } catch {
    return '';
  }
}

export default function LecturasPage() {
  const [state, setState] = useState<FetchState>('idle');
  const [posts, setPosts] = useState<LecturaPost[]>([]);
  const [activeCat, setActiveCat] = useState<string | null>(null);

  const load = useCallback(async (signal?: AbortSignal): Promise<void> => {
    setState('loading');
    try {
      const res = await fetch('/api/lecturas', { signal, next: { revalidate: 3600 } } as RequestInit);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as LecturasResponse;
      setPosts(data.posts);
      setState('ready');
    } catch (err) {
      if ((err as { name?: string })?.name === 'AbortError') return;
      console.error('[lecturas] load error', err);
      setState('error');
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  // Categorías únicas (para la fila de "stories")
  const categories = useMemo(() => {
    const set = new Map<string, number>();
    posts.forEach((p) => {
      const c = categoryLabel(p);
      set.set(c, (set.get(c) ?? 0) + 1);
    });
    return [...set.entries()].sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }));
  }, [posts]);

  const filtered = useMemo(
    () => (activeCat ? posts.filter((p) => categoryLabel(p) === activeCat) : posts),
    [posts, activeCat]
  );

  const featured = filtered.slice(0, 2);
  const latest = filtered.slice(2);

  return (
    <Screen background="cream">
      <header className="lx-head">
        <span className="lx-eyebrow">— EGOERA · LECTURAS —</span>
        <h1 className="lx-h">
          Lo que escribimos <em>despacio</em>.
        </h1>
        <p className="lx-sub">
          Artículos del vlog y cuadernos para trabajar. Pulsa una categoría para filtrar.
        </p>
      </header>

      {state === 'loading' ? (
        <SkeletonNews />
      ) : state === 'error' ? (
        <ErrorBlock onRetry={() => load()} />
      ) : posts.length === 0 ? (
        <div className="lx-empty">
          <EmptyLecturas />
          <p>Pronto habrá lecturas aquí.</p>
        </div>
      ) : (
        <>
          {/* ─── CATEGORÍAS CIRCULARES (stories) ─── */}
          <nav className="lx-stories" aria-label="Categorías">
            <button
              className={`lx-story ${activeCat === null ? 'active' : ''}`}
              onClick={() => setActiveCat(null)}
            >
              <span className="lx-story-disc lx-story-all" aria-hidden>
                ✦
              </span>
              <span className="lx-story-label">Todo</span>
            </button>
            {categories.map((c) => {
              const bg = colorForCategory(c.name);
              return (
                <button
                  key={c.name}
                  className={`lx-story ${activeCat === c.name ? 'active' : ''}`}
                  onClick={() => setActiveCat(activeCat === c.name ? null : c.name)}
                >
                  <span
                    className="lx-story-disc"
                    style={{ background: bg, color: fgForBg(bg) }}
                    aria-hidden
                  >
                    {c.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="lx-story-label">{c.name}</span>
                </button>
              );
            })}
          </nav>

          {/* ─── DESTACADOS (Hottest) ─── */}
          {featured.length > 0 && (
            <section className="lx-section" aria-label="Destacados">
              <div className="lx-section-head">
                <span className="lx-section-title">Destacados</span>
                <span className="lx-section-arrow" aria-hidden>→</span>
              </div>
              <div className="lx-feat-grid">
                {featured.map((p, i) => {
                  const bg = i === 0 ? '#1d2bdb' : '#0d0f3d';
                  return (
                    <button
                      key={p.id}
                      className="lx-feat-card"
                      style={{ background: bg }}
                      onClick={() => openExternal(p.link)}
                      aria-label={`Abrir: ${p.title}`}
                    >
                      <DotsGrid color="rgba(241,234,216,0.10)" size={16} dot={1} className="lx-feat-dots" />
                      <span className="lx-feat-cat">{categoryLabel(p)}</span>
                      <h2 className="lx-feat-title">{p.title}</h2>
                      <div className="lx-feat-foot">
                        <span>Ander · {p.readingMinutes} min</span>
                        <span>{formatShortDate(p.date)}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* ─── ÚLTIMOS (Latest) ─── */}
          {latest.length > 0 && (
            <section className="lx-section" aria-label="Últimos artículos">
              <div className="lx-section-head">
                <span className="lx-section-title">Últimos</span>
                <button className="lx-see-all" onClick={() => openExternal('https://egoera.es/blog/')}>
                  Ver todo →
                </button>
              </div>
              <ul className="lx-list">
                {latest.map((p) => {
                  const bg = colorForCategory(categoryLabel(p));
                  return (
                    <li key={p.id}>
                      <button className="lx-row" onClick={() => openExternal(p.link)} aria-label={`Abrir: ${p.title}`}>
                        <span className="lx-row-ic" style={{ background: bg, color: fgForBg(bg) }} aria-hidden>
                          {categoryLabel(p).charAt(0).toUpperCase()}
                        </span>
                        <span className="lx-row-body">
                          <span className="lx-row-cat">
                            {categoryLabel(p)} · {p.readingMinutes} min
                          </span>
                          <span className="lx-row-title">{p.title}</span>
                        </span>
                        <span className="lx-row-arrow" aria-hidden>›</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {/* ─── DOCS / CUADERNOS ─── */}
          <section className="lx-section lx-docs" aria-label="Cuadernos descargables">
            <div className="lx-section-head">
              <span className="lx-section-title">Cuadernos · para trabajar</span>
              <Link href="/cuadernos" className="lx-see-all">
                Ver todos →
              </Link>
            </div>
            <div className="lx-docs-scroll">
              {CUADERNOS.map((c, i) => {
                const bg = EGO_COLORS[i % EGO_COLORS.length];
                return (
                  <Link key={c.meta.slug} href={`/cuadernos/${c.meta.slug}`} className="lx-doc-card" style={{ background: bg, color: fgForBg(bg) }}>
                    <span className="lx-doc-num">{String(i + 1).padStart(2, '0')}</span>
                    <span className="lx-doc-title">{c.meta.title}.</span>
                    <span className="lx-doc-meta">{c.meta.duration}</span>
                  </Link>
                );
              })}
            </div>
          </section>
        </>
      )}

      <TabBar />

      <style jsx>{`
        /* ─── HEAD ─── */
        .lx-head {
          margin-bottom: 18px;
        }
        .lx-eyebrow {
          font-family: var(--font-mono);
          font-size: 10.5px;
          letter-spacing: 0.24em;
          color: var(--cobalto);
          opacity: 0.85;
        }
        .lx-h {
          font-family: var(--font-display);
          font-weight: 600;
          font-style: italic;
          font-size: clamp(28px, 6.5vw, 40px);
          line-height: 1.05;
          color: var(--ink);
          margin: 8px 0 8px;
          letter-spacing: -0.01em;
        }
        .lx-h em {
          color: var(--coral, #d97757);
        }
        .lx-sub {
          font-family: var(--font-body);
          font-size: 13.5px;
          line-height: 1.5;
          color: var(--ink-soft);
          margin: 0;
        }

        /* ─── STORIES (categorías circulares) ─── */
        .lx-stories {
          display: flex;
          gap: 14px;
          overflow-x: auto;
          padding: 4px 2px 14px;
          margin: 0 -4px 8px;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
        }
        .lx-stories::-webkit-scrollbar { display: none; }
        .lx-story {
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          width: 64px;
        }
        .lx-story-disc {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 600;
          font-size: 22px;
          box-shadow: 0 4px 12px -6px rgba(13, 15, 61, 0.4);
          border: 2px solid transparent;
          transition: transform 0.18s, border-color 0.18s;
        }
        .lx-story-all {
          background: var(--crema-card, #ede0bd);
          color: var(--cobalto);
        }
        .lx-story.active .lx-story-disc {
          border-color: var(--ink);
          transform: scale(1.06);
        }
        .lx-story-label {
          font-family: var(--font-mono);
          font-size: 8.5px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--ink-soft);
          max-width: 64px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          text-align: center;
        }
        .lx-story.active .lx-story-label {
          color: var(--cobalto);
          font-weight: 600;
        }

        /* ─── SECTION HEAD ─── */
        .lx-section {
          margin-bottom: 26px;
        }
        .lx-section-head {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 12px;
        }
        .lx-section-title {
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 600;
          font-size: 19px;
          color: var(--ink);
        }
        .lx-section-arrow {
          font-family: var(--font-mono);
          color: var(--cobalto);
          opacity: 0.5;
        }
        .lx-see-all {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--cobalto);
          background: none;
          border: none;
          cursor: pointer;
          text-decoration: none;
        }

        /* ─── FEATURED (tarjetas oscuras) ─── */
        .lx-feat-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }
        @media (min-width: 600px) {
          .lx-feat-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        .lx-feat-card {
          position: relative;
          overflow: hidden;
          text-align: left;
          border: none;
          cursor: pointer;
          border-radius: 18px;
          padding: 20px 18px 16px;
          min-height: 180px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          color: var(--crema);
          box-shadow: 0 10px 26px -16px rgba(13, 15, 61, 0.5);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .lx-feat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 18px 38px -16px rgba(13, 15, 61, 0.6);
        }
        .lx-feat-dots {
          position: absolute;
          inset: 0;
          opacity: 0.6;
          pointer-events: none;
        }
        .lx-feat-cat {
          position: relative;
          z-index: 1;
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #f4c842;
          margin-bottom: 8px;
        }
        .lx-feat-title {
          position: relative;
          z-index: 1;
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 500;
          font-size: 18px;
          line-height: 1.2;
          margin: 0 0 12px;
          color: var(--crema);
        }
        .lx-feat-foot {
          position: relative;
          z-index: 1;
          display: flex;
          justify-content: space-between;
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(241, 234, 216, 0.6);
        }

        /* ─── LATEST (filas) ─── */
        .lx-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .lx-row {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 8px;
          background: none;
          border: none;
          border-bottom: 1px solid rgba(13, 15, 61, 0.06);
          cursor: pointer;
          text-align: left;
          border-radius: 8px;
          transition: background 0.15s;
        }
        .lx-row:hover {
          background: rgba(29, 43, 219, 0.04);
        }
        .lx-row-ic {
          width: 42px;
          height: 42px;
          border-radius: 11px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 600;
          font-size: 18px;
        }
        .lx-row-body {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .lx-row-cat {
          font-family: var(--font-mono);
          font-size: 8.5px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--cobalto);
        }
        .lx-row-title {
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 400;
          font-size: 15px;
          line-height: 1.2;
          color: var(--ink);
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        .lx-row-arrow {
          flex-shrink: 0;
          font-family: var(--font-mono);
          color: var(--ink-soft);
          font-size: 18px;
          opacity: 0.4;
        }

        /* ─── DOCS / CUADERNOS scroll horizontal ─── */
        .lx-docs-scroll {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding: 2px 2px 10px;
          margin: 0 -4px;
          scrollbar-width: none;
        }
        .lx-docs-scroll::-webkit-scrollbar { display: none; }
        .lx-doc-card {
          flex-shrink: 0;
          width: 140px;
          min-height: 130px;
          border-radius: 16px;
          padding: 16px 14px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          text-decoration: none;
          box-shadow: 0 8px 20px -14px rgba(13, 15, 61, 0.4);
          transition: transform 0.2s;
        }
        .lx-doc-card:hover {
          transform: translateY(-3px);
        }
        .lx-doc-num {
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 600;
          font-size: 28px;
          line-height: 1;
          opacity: 0.85;
        }
        .lx-doc-title {
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 500;
          font-size: 16px;
          line-height: 1.1;
          margin-top: auto;
        }
        .lx-doc-meta {
          font-family: var(--font-mono);
          font-size: 8.5px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          opacity: 0.7;
          margin-top: 6px;
        }

        /* ─── EMPTY / SKELETON ─── */
        .lx-empty {
          text-align: center;
          padding: 40px 20px;
          color: var(--ink-soft);
          font-family: var(--font-body);
          font-style: italic;
        }
      `}</style>
    </Screen>
  );
}

function SkeletonNews() {
  return (
    <div className="sk">
      <div className="sk-stories">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="sk-story" />
        ))}
      </div>
      <div className="sk-feat" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="sk-row" />
      ))}
      <style jsx>{`
        .sk { animation: pulse 1.4s ease-in-out infinite; }
        @keyframes pulse { 0%,100% { opacity: 0.5 } 50% { opacity: 0.85 } }
        .sk-stories { display: flex; gap: 14px; margin-bottom: 20px; }
        .sk-story { width: 56px; height: 56px; border-radius: 50%; background: rgba(13,15,61,0.08); flex-shrink: 0; }
        .sk-feat { height: 180px; border-radius: 18px; background: rgba(13,15,61,0.08); margin-bottom: 20px; }
        .sk-row { height: 60px; border-radius: 10px; background: rgba(13,15,61,0.06); margin-bottom: 8px; }
      `}</style>
    </div>
  );
}

function ErrorBlock({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="err">
      <p>No se pudieron cargar las lecturas.</p>
      <button onClick={onRetry}>Reintentar</button>
      <style jsx>{`
        .err {
          text-align: center;
          padding: 40px 20px;
          font-family: var(--font-body);
          color: var(--ink-soft);
        }
        .err button {
          margin-top: 12px;
          padding: 10px 20px;
          background: var(--cobalto);
          color: var(--crema);
          border: none;
          border-radius: 999px;
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
