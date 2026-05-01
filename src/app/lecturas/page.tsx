'use client';

import { useCallback, useEffect, useState } from 'react';
import Screen from '@/components/Screen';
import TabBar from '@/components/TabBar';

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

type LecturasResponse = {
  posts: LecturaPost[];
  fallback?: boolean;
};

type FetchState = 'idle' | 'loading' | 'ready' | 'error';

const SKELETON_COUNT = 4;

function openExternal(url: string): void {
  if (typeof window === 'undefined') return;
  window.open(url, '_blank', 'noopener,noreferrer');
}

function categoryLabel(post: LecturaPost): string {
  return post.categories[0] ?? 'Lectura';
}

export default function LecturasPage() {
  const [state, setState] = useState<FetchState>('idle');
  const [posts, setPosts] = useState<LecturaPost[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const load = useCallback(async (signal?: AbortSignal): Promise<void> => {
    setState('loading');
    try {
      const res = await fetch('/api/lecturas', {
        signal,
        next: { revalidate: 3600 },
      } as RequestInit);
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

  const handleRefresh = useCallback(async (): Promise<void> => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const featured = posts[0];
  const rest = posts.slice(1, 6);

  return (
    <Screen background="cream">
      <div className="ptr" aria-hidden="true">
        <span className={`ptr-dot ${refreshing ? 'spin' : ''}`} />
      </div>

      <header className="head">
        <p className="eyebrow">— 05 · Lecturas —</p>
        <h1 className="sec-big">
          Para <em>hoy</em>
          <br />
          te recomiendo…
        </h1>
      </header>

      {state === 'loading' ? (
        <SkeletonList />
      ) : state === 'error' ? (
        <ErrorBlock onRetry={handleRefresh} />
      ) : (
        <>
          {featured ? (
            <button
              type="button"
              className="banner-accent"
              onClick={() => openExternal(featured.link)}
              aria-label={`Abrir lectura del día: ${featured.title}`}
            >
              <span className="pill-num banner-pill">
                — Lectura del día · {featured.readingMinutes} min —
              </span>
              <h2 className="banner-title">«{featured.title}.»</h2>
              <p className="banner-sub">
                {categoryLabel(featured)}.{' '}
                {featured.excerpt || 'Una lectura para hoy.'}
              </p>
            </button>
          ) : null}

          <section className="week" aria-label="Lecturas para tu semana">
            <div className="week-head">
              <p className="eyebrow">— Para tu semana —</p>
              <button
                type="button"
                className="see-all"
                onClick={() => openExternal('https://egoera.es/blog/')}
              >
                Ver todo →
              </button>
            </div>

            <ul className="lib-list">
              {rest.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    className="lib-card"
                    onClick={() => openExternal(p.link)}
                    aria-label={`Abrir lectura: ${p.title}`}
                  >
                    <span className="lib-cat">{categoryLabel(p)}</span>
                    <h3 className="lib-title">{p.title}</h3>
                    <span className="lib-meta">
                      Ander · {p.readingMinutes} min
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <TabBar />

      <style jsx>{`
        .ptr {
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: -10px 0 8px;
        }
        .ptr-dot {
          width: 6px;
          height: 6px;
          border-radius: 999px;
          background: var(--ink);
          opacity: 0.25;
        }
        .ptr-dot.spin {
          animation: ptrPulse 1s ease-in-out infinite;
        }
        @keyframes ptrPulse {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.6); }
        }
        .head {
          margin-bottom: 22px;
        }
        .head .eyebrow {
          margin-bottom: 14px;
        }
        .banner-accent {
          display: block;
          width: 100%;
          text-align: left;
          background: var(--accent);
          color: var(--crema);
          border: none;
          border-radius: var(--r-lg);
          padding: 22px 22px 26px;
          margin-bottom: 28px;
          font: inherit;
          cursor: pointer;
          appearance: none;
          -webkit-tap-highlight-color: transparent;
          transition: transform 0.15s ease;
          box-shadow: var(--shadow-md);
        }
        .banner-accent:active {
          transform: scale(0.985);
        }
        .banner-accent:focus-visible {
          outline: 2px solid var(--ink);
          outline-offset: 3px;
        }
        .banner-pill {
          background: rgba(13, 15, 61, 0.92);
          color: var(--crema);
        }
        .banner-title {
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 700;
          font-size: 30px;
          line-height: 1.05;
          letter-spacing: -0.01em;
          margin-top: 18px;
        }
        .banner-sub {
          font-family: var(--font-body);
          font-size: 13px;
          line-height: 1.5;
          opacity: 0.88;
          margin-top: 10px;
        }
        .week-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 12px;
        }
        .see-all {
          background: none;
          border: none;
          padding: 0;
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          font-weight: 600;
          color: var(--cobalto);
          cursor: pointer;
        }
        .see-all:focus-visible {
          outline: 2px solid var(--cobalto);
          outline-offset: 3px;
          border-radius: 4px;
        }
        .lib-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .lib-card {
          display: block;
          width: 100%;
          text-align: left;
          background: var(--crema-soft);
          color: var(--ink);
          border: 1px solid rgba(13, 15, 61, 0.08);
          border-radius: var(--r-md);
          padding: 16px 18px;
          font: inherit;
          cursor: pointer;
          appearance: none;
          -webkit-tap-highlight-color: transparent;
          transition: transform 0.15s ease, background 0.15s ease;
        }
        .lib-card:active {
          transform: scale(0.99);
          background: var(--crema-dark);
        }
        .lib-card:focus-visible {
          outline: 2px solid var(--cobalto);
          outline-offset: 3px;
        }
        .lib-cat {
          display: block;
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          font-weight: 600;
          color: var(--cobalto);
        }
        .lib-title {
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 600;
          font-size: 16px;
          line-height: 1.3;
          letter-spacing: -0.005em;
          margin-top: 6px;
          color: var(--ink);
        }
        .lib-meta {
          display: block;
          margin-top: 8px;
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          font-weight: 500;
          opacity: 0.55;
        }
      `}</style>
    </Screen>
  );
}

function SkeletonList() {
  return (
    <div className="skeleton-wrap" aria-busy="true" aria-live="polite">
      <div className="sk sk-banner" />
      {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
        <div key={i} className="sk sk-card" />
      ))}
      <style jsx>{`
        .skeleton-wrap {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .sk {
          border-radius: var(--r-md);
          background: linear-gradient(
            90deg,
            rgba(13, 15, 61, 0.06) 0%,
            rgba(13, 15, 61, 0.12) 50%,
            rgba(13, 15, 61, 0.06) 100%
          );
          background-size: 200% 100%;
          animation: shimmer 1.4s ease-in-out infinite;
        }
        .sk-banner {
          height: 180px;
          margin-bottom: 18px;
          border-radius: var(--r-lg);
        }
        .sk-card {
          height: 86px;
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

function ErrorBlock({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="err">
      <p className="err-text">No se pudieron cargar las lecturas.</p>
      <button type="button" className="err-retry" onClick={onRetry}>
        Reintentar
      </button>
      <style jsx>{`
        .err {
          background: var(--crema-soft);
          border: 1px solid rgba(13, 15, 61, 0.08);
          border-radius: var(--r-md);
          padding: 22px;
          text-align: center;
        }
        .err-text {
          font-family: var(--font-body);
          font-size: 14px;
          color: var(--ink);
          opacity: 0.78;
          margin-bottom: 12px;
        }
        .err-retry {
          background: var(--ink);
          color: var(--crema);
          border: none;
          border-radius: var(--r-pill);
          padding: 10px 18px;
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
        }
        .err-retry:focus-visible {
          outline: 2px solid var(--cobalto);
          outline-offset: 3px;
        }
      `}</style>
    </div>
  );
}
