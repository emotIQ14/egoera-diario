'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Screen from '@/components/Screen';
import TabBar from '@/components/TabBar';
import SafetyBar from '@/components/SafetyBar';
import { loadEntries } from '@/lib/storage';
import { EMOTIONS } from '@/lib/types';
import { track } from '@/lib/track';
import { EmptyConversa } from '@/components/illustrations/EmptyStates';

function emotionLabelC(id: string): string {
  return EMOTIONS.find((e) => e.id === id)?.label ?? id;
}

type WeekCtx = {
  today: { mood: number; topEmotion: string | null } | null;
  weekAvg: number | null;
  trend: 'rising' | 'falling' | 'stable' | null;
  entryCount: number;
};

function getWeekContext(): WeekCtx {
  if (typeof window === 'undefined') {
    return { today: null, weekAvg: null, trend: null, entryCount: 0 };
  }
  try {
    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0);
    const weekAgo = new Date(todayMidnight);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const all = loadEntries();

    // Entrada de hoy
    const todayEntries = all
      .filter((e) => {
        const d = new Date(e.createdAt);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === todayMidnight.getTime();
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const today =
      todayEntries.length > 0
        ? {
            mood: todayEntries[0].mood,
            topEmotion:
              todayEntries[0].emotions.length > 0
                ? emotionLabelC(todayEntries[0].emotions[0])
                : null,
          }
        : null;

    // Últimos 7 días (excluyendo hoy)
    const weekEntries = all.filter((e) => {
      const d = new Date(e.createdAt);
      d.setHours(0, 0, 0, 0);
      return d.getTime() >= weekAgo.getTime() && d.getTime() < todayMidnight.getTime();
    });

    if (weekEntries.length < 2) {
      return { today, weekAvg: null, trend: null, entryCount: weekEntries.length };
    }

    const weekAvg = weekEntries.reduce((s, e) => s + e.mood, 0) / weekEntries.length;

    // Tendencia: primera mitad vs segunda mitad de la semana
    const sorted = [...weekEntries].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    const mid = Math.floor(sorted.length / 2);
    const firstAvg =
      sorted.slice(0, mid).reduce((s, e) => s + e.mood, 0) / mid;
    const secondAvg =
      sorted.slice(mid).reduce((s, e) => s + e.mood, 0) / (sorted.length - mid);
    const diff = secondAvg - firstAvg;
    const trend: WeekCtx['trend'] =
      diff > 0.8 ? 'rising' : diff < -0.8 ? 'falling' : 'stable';

    return {
      today,
      weekAvg: Math.round(weekAvg * 10) / 10,
      trend,
      entryCount: weekEntries.length,
    };
  } catch {
    return { today: null, weekAvg: null, trend: null, entryCount: 0 };
  }
}

type Message = { role: 'user' | 'assistant'; content: string };

const STORAGE_KEY = 'egoera-diario-conversation-current';
const SESSIONS_KEY = 'egoera-diario-conversations';
const NAME_KEY = 'egoera-diario-name';
const CONV_HISTORY_KEY = 'egoera-conv-history';
const CONV_ENTRY_SEED_KEY = 'egoera-conv-entry-seed';

type EntrySeed = {
  mood: number;
  emotions: string[];
  daysAgo: number;
  preview: string | null;
};

function consumeEntrySeed(): EntrySeed | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(CONV_ENTRY_SEED_KEY);
    if (!raw) return null;
    window.localStorage.removeItem(CONV_ENTRY_SEED_KEY);
    return JSON.parse(raw) as EntrySeed;
  } catch { return null; }
}

type ConvSnippet = { startedAt: string; preview: string; msgCount: number };

function loadConvHistory(): ConvSnippet[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(CONV_HISTORY_KEY);
    if (!raw) return [];
    return (JSON.parse(raw) as ConvSnippet[]).slice(0, 3);
  } catch { return []; }
}

function saveConvToHistory(msgs: Message[]): void {
  if (typeof window === 'undefined') return;
  // Solo guarda si hay al menos 1 mensaje del usuario
  const userMsgs = msgs.filter((m) => m.role === 'user');
  if (userMsgs.length === 0) return;
  try {
    const preview = userMsgs[0].content.slice(0, 60).trim();
    const snippet: ConvSnippet = {
      startedAt: new Date().toISOString(),
      preview: preview.length < userMsgs[0].content.length ? `${preview}…` : preview,
      msgCount: msgs.length,
    };
    const existing = loadConvHistory();
    const updated = [snippet, ...existing].slice(0, 3);
    window.localStorage.setItem(CONV_HISTORY_KEY, JSON.stringify(updated));
  } catch { /* ignore */ }
}

type Subtitle = { pre: string; em: string };

const SUBTITLES_MORNING: Subtitle[] = [
  { pre: 'Cómo empiezas', em: 'el día' },
  { pre: 'Lo que traes', em: 'esta mañana' },
  { pre: 'Con lo que', em: 'llegas hoy' },
];
const SUBTITLES_AFTERNOON: Subtitle[] = [
  { pre: 'Cómo va', em: 'el día' },
  { pre: 'Lo que', em: 'está pasando' },
  { pre: 'Un momento', em: 'para parar' },
];
const SUBTITLES_NIGHT: Subtitle[] = [
  { pre: 'Cómo termina', em: 'el día' },
  { pre: 'Lo que se queda', em: 'esta noche' },
  { pre: 'Antes de', em: 'descansar' },
];

function pickSubtitle(): Subtitle {
  const h = new Date().getHours();
  const pool =
    h >= 6 && h < 13 ? SUBTITLES_MORNING
    : h >= 13 && h < 21 ? SUBTITLES_AFTERNOON
    : SUBTITLES_NIGHT;
  return pool[Math.floor(Math.random() * pool.length)];
}

function buildInitialMessage(
  name?: string,
  weekCtx?: WeekCtx | null,
  entrySeed?: EntrySeed | null,
): Message {
  const greeting = name && name.trim() ? `Hola, ${name.trim()}` : 'Hola';

  // Viene de una entrada del historial → contextualizar con esa entrada
  if (entrySeed) {
    const emotionList = entrySeed.emotions.length > 0
      ? entrySeed.emotions.join(', ')
      : null;
    const when = entrySeed.daysAgo === 0
      ? 'hoy'
      : entrySeed.daysAgo === 1
      ? 'ayer'
      : `hace ${entrySeed.daysAgo} días`;
    const emoText = emotionList ? ` y sentiste ${emotionList}` : '';
    return {
      role: 'assistant',
      content: `${greeting}. Viniste desde una entrada de ${when}: anotaste un ${entrySeed.mood}/10${emoText}. ¿Qué quieres explorar de eso?`,
    };
  }

  if (weekCtx?.today) {
    const emoText = weekCtx.today.topEmotion
      ? ` y sientes ${weekCtx.today.topEmotion}`
      : '';
    return {
      role: 'assistant',
      content: `${greeting}. Hoy anotaste un ${weekCtx.today.mood}/10${emoText}. ¿Qué hay detrás?`,
    };
  }

  if (weekCtx != null && weekCtx.weekAvg !== null && weekCtx.entryCount >= 2) {
    const trendLine =
      weekCtx.trend === 'rising'
        ? ', y ha ido subiendo.'
        : weekCtx.trend === 'falling'
        ? ', aunque ha bajado hacia el final.'
        : '.';
    return {
      role: 'assistant',
      content: `${greeting}. Esta semana tu estado medio ha sido un ${weekCtx.weekAvg}/10${trendLine} ¿Cómo llegas hoy?`,
    };
  }

  return {
    role: 'assistant',
    content: `${greeting}. ¿Cómo estás llegando aquí hoy?`,
  };
}

const INITIAL_MESSAGE: Message = buildInitialMessage();

const QUICK_PROMPTS = [
  'Algo me está pesando',
  'No sé bien cómo empezar',
  'Me siento…',
  'Hay algo que me da vueltas',
] as const;

function loadConversation(): Message[] {
  if (typeof window === 'undefined') return [INITIAL_MESSAGE];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [INITIAL_MESSAGE];
    const parsed = JSON.parse(raw) as Message[];
    return parsed.length > 0 ? parsed : [INITIAL_MESSAGE];
  } catch {
    return [INITIAL_MESSAGE];
  }
}

function saveConversation(msgs: Message[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs));
  } catch {
    /* ignore */
  }
}

function loadSessionCount(): number {
  if (typeof window === 'undefined') return 1;
  try {
    const raw = window.localStorage.getItem(SESSIONS_KEY);
    if (!raw) return 1;
    const arr = JSON.parse(raw) as unknown[];
    return Array.isArray(arr) ? Math.max(arr.length, 1) : 1;
  } catch {
    return 1;
  }
}

function bumpSessionCount(): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem(SESSIONS_KEY);
    const arr = raw ? (JSON.parse(raw) as unknown[]) : [];
    const next = Array.isArray(arr) ? arr : [];
    next.push({ startedAt: new Date().toISOString() });
    window.localStorage.setItem(SESSIONS_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export default function ConversaPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionN, setSessionN] = useState(1);
  const [subtitle] = useState<Subtitle>(() => pickSubtitle());
  const [hydrated, setHydrated] = useState(false);
  const [convHistory, setConvHistory] = useState<ConvSnippet[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Hydrate from localStorage on mount.
  useEffect(() => {
    const loaded = loadConversation();
    // If the conversation only has the placeholder initial message, replace it
    // with one that uses the real stored name + week context.
    const storedName = typeof window !== 'undefined'
      ? (window.localStorage.getItem(NAME_KEY) ?? undefined)
      : undefined;
    const weekCtx = getWeekContext();
    const entrySeed = consumeEntrySeed();
    const personalised = buildInitialMessage(storedName ?? undefined, weekCtx, entrySeed);
    if (
      loaded.length === 1 &&
      loaded[0].role === 'assistant' &&
      loaded[0].content.startsWith('Hola')
    ) {
      setMessages([personalised]);
    } else {
      setMessages(loaded);
    }

    let n = loadSessionCount();
    // First time ever -> register first session.
    if (typeof window !== 'undefined' && !window.localStorage.getItem(SESSIONS_KEY)) {
      bumpSessionCount();
      n = 1;
    }
    setSessionN(n);
    setConvHistory(loadConvHistory());
    setHydrated(true);
  }, []);

  // Persist conversation.
  useEffect(() => {
    if (hydrated) saveConversation(messages);
  }, [messages, hydrated]);

  // Auto-scroll on new message.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  async function send(): Promise<void> {
    const text = input.trim();
    if (!text || loading) return;

    const next: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setInput('');
    setLoading(true);
    track('conversa_message_sent', { session: sessionN, turn: next.filter((m) => m.role === 'user').length });

    try {
      const recentEntries = loadEntries().slice(0, 7);
      const last = recentEntries[0];
      const wCtx = getWeekContext();
      const res = await fetch('/api/conversa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next,
          userContext: {
            recentEntries,
            mood: last?.mood,
            emotions: last?.emotions,
            weekAvg: wCtx.weekAvg ?? undefined,
            trend: wCtx.trend ?? undefined,
          },
        }),
      });

      const data = (await res.json()) as { message?: string; error?: string };
      const reply =
        res.ok && data.message
          ? data.message
          : 'No puedo conectar ahora mismo. Volvamos a intentarlo en un momento.';
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'No puedo conectar ahora mismo. Volvamos a intentarlo en un momento.',
        },
      ]);
    } finally {
      setLoading(false);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }

  function resetConversation(): void {
    // Guardar la conversación actual al historial antes de limpiar
    saveConvToHistory(messages);
    setConvHistory(loadConvHistory());
    setShowHistory(false);

    const storedName = typeof window !== 'undefined'
      ? (window.localStorage.getItem(NAME_KEY) ?? undefined)
      : undefined;
    const weekCtx = getWeekContext();
    setMessages([buildInitialMessage(storedName ?? undefined, weekCtx, null)]);
    bumpSessionCount();
    setSessionN(loadSessionCount());
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>): void {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  }

  return (
    <Screen background="ink">
      <header className="head">
        <div className="head-row">
          <span className="eyebrow head-eyebrow">— 03 · Conversa —</span>
          <div className="head-actions">
            {messages.filter((m) => m.role === 'user').length >= 1 ? (
              <button
                type="button"
                className="to-diary-btn"
                onClick={() => {
                  track('conversa_to_diary_clicked', { msgs: messages.length });
                  router.push('/diario');
                }}
                aria-label="Llevar al diario"
                title="Llevar al diario"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              </button>
            ) : null}
            <button
              type="button"
              onClick={resetConversation}
              className="reset"
              aria-label="Nueva conversación"
              title="Nueva conversación"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-3.5-7.1" />
                <path d="M21 4v5h-5" />
              </svg>
            </button>
          </div>
        </div>
        <h1 className="title">
          {subtitle.pre}
          <br />
          <em>{subtitle.em}</em>.
        </h1>
        <div className="session-row">
          <span className="eyebrow session">— Sesión {sessionN} —</span>
          {convHistory.length > 0 ? (
            <button
              type="button"
              className="history-toggle"
              onClick={() => setShowHistory((v) => !v)}
              aria-expanded={showHistory}
              aria-label={showHistory ? 'Ocultar sesiones anteriores' : 'Ver sesiones anteriores'}
            >
              {showHistory ? '▲' : '▼'} Anteriores
            </button>
          ) : null}
        </div>
        {showHistory && convHistory.length > 0 ? (
          <div className="history-list" aria-label="Sesiones anteriores">
            {convHistory.map((s, i) => {
              const d = new Date(s.startedAt);
              const rel = new Date();
              const daysDiff = Math.floor((rel.getTime() - d.getTime()) / 86_400_000);
              const when = daysDiff === 0 ? 'Hoy' : daysDiff === 1 ? 'Ayer' : `Hace ${daysDiff} días`;
              return (
                <div key={i} className="history-item">
                  <span className="history-when">{when}</span>
                  <span className="history-preview">«{s.preview}»</span>
                  <span className="history-count">{s.msgCount} msg</span>
                </div>
              );
            })}
          </div>
        ) : null}
      </header>

      <div ref={scrollRef} className="chat">
        {messages.map((m, i) => (
          <div key={i} className={`row ${m.role}`}>
            <span className="who">{m.role === 'assistant' ? 'EGOERA' : 'TÚ'}</span>
            <div className={`bubble ${m.role}`}>{m.content}</div>
          </div>
        ))}
        {messages.length === 1 && !loading ? (
          <div className="conv-empty-illu" aria-hidden="true">
            <EmptyConversa size={150} />
          </div>
        ) : null}
        {loading && (
          <div className="row assistant">
            <span className="who">EGOERA</span>
            <div className="bubble assistant typing">
              <span />
              <span />
              <span />
            </div>
          </div>
        )}
      </div>

      <div className="composer">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Escribe lo que sientes…"
          disabled={loading}
          className="composer-input"
        />
        <button
          type="button"
          onClick={() => void send()}
          disabled={loading || !input.trim()}
          className="composer-send"
          aria-label="Enviar"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="M13 6l6 6-6 6" />
          </svg>
        </button>
      </div>

      {messages.length === 1 && !loading && !input.trim() ? (
        <div className="quick-prompts" role="group" aria-label="Sugerencias para empezar">
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p}
              type="button"
              className="quick-chip"
              onClick={() => { setInput(p); inputRef.current?.focus(); }}
            >
              {p}
            </button>
          ))}
        </div>
      ) : null}

      <SafetyBar text={input} offsetBottom={156} />

      <TabBar />

      <style jsx>{`
        .head {
          padding-top: 4px;
          margin-bottom: 18px;
        }
        .head-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }
        .head-eyebrow { opacity: 0.45; }
        .head-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .to-diary-btn {
          width: 32px;
          height: 32px;
          border-radius: 999px;
          background: rgba(241, 234, 216, 0.08);
          border: 1px solid rgba(241, 234, 216, 0.16);
          color: var(--crema);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          padding: 0;
          transition: background 0.15s ease, transform 0.15s ease;
        }
        .to-diary-btn:active { transform: scale(0.94); }
        .to-diary-btn:hover { background: rgba(241, 234, 216, 0.14); }
        .to-diary-btn svg { width: 15px; height: 15px; }
        .reset {
          width: 32px;
          height: 32px;
          border-radius: 999px;
          background: rgba(241, 234, 216, 0.08);
          border: 1px solid rgba(241, 234, 216, 0.16);
          color: var(--crema);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          padding: 0;
          transition: background 0.15s ease, transform 0.15s ease;
        }
        .reset:active { transform: scale(0.94); }
        .reset:hover { background: rgba(241, 234, 216, 0.14); }
        .reset svg { width: 16px; height: 16px; }

        .title {
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 600;
          font-size: 38px;
          line-height: 1.04;
          letter-spacing: -0.01em;
          color: var(--crema);
        }
        .title em {
          color: var(--accent);
          font-style: italic;
        }
        .session-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 14px;
        }
        .session {
          opacity: 0.55;
        }
        .history-toggle {
          background: none;
          border: none;
          padding: 0;
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          font-weight: 600;
          color: var(--crema);
          opacity: 0.4;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
          transition: opacity 0.15s;
        }
        .history-toggle:hover { opacity: 0.7; }

        .history-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 10px;
          padding: 12px;
          background: rgba(241, 234, 216, 0.06);
          border: 1px solid rgba(241, 234, 216, 0.1);
          border-radius: 12px;
        }
        .history-item {
          display: flex;
          align-items: baseline;
          gap: 8px;
          min-width: 0;
        }
        .history-when {
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--accent-soft);
          flex-shrink: 0;
        }
        .history-preview {
          font-family: var(--font-display);
          font-style: italic;
          font-size: 12px;
          color: var(--crema);
          opacity: 0.55;
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .history-count {
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.1em;
          color: var(--crema);
          opacity: 0.3;
          flex-shrink: 0;
        }

        .chat {
          display: flex;
          flex-direction: column;
          gap: 22px;
          padding: 8px 0 140px;
          overflow-y: auto;
        }

        .conv-empty-illu {
          align-self: center;
          margin-top: 8px;
          opacity: 0.92;
        }

        .row { display: flex; flex-direction: column; gap: 6px; }
        .row.user { align-items: flex-end; }
        .row.assistant { align-items: flex-start; }

        .who {
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          font-weight: 600;
          color: var(--accent-soft);
          padding: 0 4px;
        }
        .row.user .who { color: rgba(241, 234, 216, 0.55); }

        .bubble {
          max-width: 78%;
          padding: 14px 18px;
          font-size: 15px;
          line-height: 1.5;
          color: var(--crema);
          border-radius: 18px;
          word-wrap: break-word;
          white-space: pre-wrap;
        }
        .bubble.assistant {
          background: rgba(241, 234, 216, 0.12);
          border-bottom-left-radius: 6px;
        }
        .bubble.user {
          background: var(--cobalto);
          border-bottom-right-radius: 6px;
        }

        .typing {
          display: inline-flex;
          gap: 6px;
          padding: 16px 18px;
        }
        .typing span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--crema);
          opacity: 0.4;
          animation: blink 1.2s infinite ease-in-out;
        }
        .typing span:nth-child(2) { animation-delay: 0.18s; }
        .typing span:nth-child(3) { animation-delay: 0.36s; }
        @keyframes blink {
          0%, 80%, 100% { opacity: 0.25; transform: translateY(0); }
          40% { opacity: 1; transform: translateY(-2px); }
        }

        .composer {
          position: fixed;
          left: 14px;
          right: 14px;
          bottom: 86px;
          max-width: 520px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 8px 8px 18px;
          background: rgba(241, 234, 216, 0.08);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border: 1px solid rgba(241, 234, 216, 0.14);
          border-radius: 999px;
          z-index: 30;
        }
        .composer-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: var(--crema);
          font-family: var(--font-display);
          font-style: italic;
          font-size: 15px;
          padding: 8px 0;
        }
        .composer-input::placeholder {
          color: rgba(241, 234, 216, 0.45);
          font-family: var(--font-display);
          font-style: italic;
        }
        .composer-send {
          width: 32px;
          height: 32px;
          border-radius: 999px;
          background: var(--cobalto);
          color: var(--crema);
          border: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          padding: 0;
          flex-shrink: 0;
          transition: transform 0.15s ease, opacity 0.15s ease;
        }
        .composer-send:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .composer-send:not(:disabled):active { transform: scale(0.94); }
        .composer-send svg { width: 16px; height: 16px; }

        /* ── quick start prompts ── */
        .quick-prompts {
          position: fixed;
          left: 14px;
          right: 14px;
          bottom: 144px;
          max-width: 520px;
          margin: 0 auto;
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 7px;
          z-index: 28;
          padding: 2px 4px 4px;
          animation: fadeUp 0.24s ease both;
        }
        .quick-chip {
          white-space: nowrap;
          flex-shrink: 0;
          background: rgba(241, 234, 216, 0.09);
          border: 1px solid rgba(241, 234, 216, 0.18);
          border-radius: 999px;
          color: var(--crema);
          font-family: var(--font-display);
          font-style: italic;
          font-size: 13px;
          padding: 7px 15px;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
          -webkit-tap-highlight-color: transparent;
        }
        .quick-chip:hover {
          background: rgba(241, 234, 216, 0.16);
          border-color: rgba(241, 234, 216, 0.3);
        }
        .quick-chip:active { transform: scale(0.96); }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Screen>
  );
}
