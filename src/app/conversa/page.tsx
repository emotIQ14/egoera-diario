'use client';

import { useEffect, useRef, useState } from 'react';
import Screen from '@/components/Screen';
import TabBar from '@/components/TabBar';
import SafetyBar from '@/components/SafetyBar';
import { loadEntries } from '@/lib/storage';

type Message = { role: 'user' | 'assistant'; content: string };

const STORAGE_KEY = 'egoera-diario-conversation-current';
const SESSIONS_KEY = 'egoera-diario-conversations';
const INITIAL_MESSAGE: Message = {
  role: 'assistant',
  content: 'Hola Ander. ¿Cómo estás llegando aquí hoy?',
};

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
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionN, setSessionN] = useState(1);
  const [hydrated, setHydrated] = useState(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Hydrate from localStorage on mount.
  useEffect(() => {
    const loaded = loadConversation();
    setMessages(loaded);
    let n = loadSessionCount();
    // First time ever -> register first session.
    if (typeof window !== 'undefined' && !window.localStorage.getItem(SESSIONS_KEY)) {
      bumpSessionCount();
      n = 1;
    }
    setSessionN(n);
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

    try {
      const recentEntries = loadEntries().slice(0, 5);
      const last = recentEntries[0];
      const res = await fetch('/api/conversa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next,
          userContext: {
            recentEntries,
            mood: last?.mood,
            emotions: last?.emotions,
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
    setMessages([INITIAL_MESSAGE]);
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
        <h1 className="title">
          Hoy hablamos
          <br />
          de <em>la calma</em>.
        </h1>
        <span className="eyebrow session">— Sesión {sessionN} —</span>
      </header>

      <div ref={scrollRef} className="chat">
        {messages.map((m, i) => (
          <div key={i} className={`row ${m.role}`}>
            <span className="who">{m.role === 'assistant' ? 'EGOERA' : 'TÚ'}</span>
            <div className={`bubble ${m.role}`}>{m.content}</div>
          </div>
        ))}
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
        .session {
          display: block;
          margin-top: 14px;
          opacity: 0.55;
        }

        .chat {
          display: flex;
          flex-direction: column;
          gap: 22px;
          padding: 8px 0 140px;
          overflow-y: auto;
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
      `}</style>
    </Screen>
  );
}
