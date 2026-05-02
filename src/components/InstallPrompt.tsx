'use client';

import { useEffect, useState } from 'react';

const VISITS_KEY = 'egoera-install-visits';
const DISMISSED_KEY = 'egoera-install-dismissed';
const VISITS_THRESHOLD = 3;
const DISMISS_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 días

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

function isDismissed(): boolean {
  try {
    const raw = window.localStorage.getItem(DISMISSED_KEY);
    if (!raw) return false;
    const ts = Number.parseInt(raw, 10);
    if (!Number.isFinite(ts)) return false;
    return Date.now() - ts < DISMISS_TTL_MS;
  } catch {
    return false;
  }
}

function bumpVisits(): number {
  try {
    const raw = window.localStorage.getItem(VISITS_KEY);
    const current = raw ? Number.parseInt(raw, 10) : 0;
    const next = (Number.isFinite(current) ? current : 0) + 1;
    window.localStorage.setItem(VISITS_KEY, String(next));
    return next;
  } catch {
    return 0;
  }
}

export default function InstallPrompt(): React.ReactElement | null {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const visits = bumpVisits();
    const eligible = visits > VISITS_THRESHOLD && !isDismissed();

    function onBeforeInstall(e: Event): void {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      if (eligible) setVisible(true);
    }

    function onInstalled(): void {
      setVisible(false);
      setDeferred(null);
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  async function handleInstall(): Promise<void> {
    if (!deferred) return;
    try {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice.outcome === 'dismissed') {
        window.localStorage.setItem(DISMISSED_KEY, String(Date.now()));
      }
    } catch {
      /* ignore */
    } finally {
      setVisible(false);
      setDeferred(null);
    }
  }

  function handleClose(): void {
    try {
      window.localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
    setVisible(false);
  }

  if (!visible || !deferred) return null;

  return (
    <div className="install" role="status" aria-live="polite">
      <button
        type="button"
        className="install-cta"
        onClick={() => void handleInstall()}
      >
        <span className="install-text">
          Instala Egoera en tu pantalla de inicio
        </span>
        <span className="install-arrow" aria-hidden>
          →
        </span>
      </button>
      <button
        type="button"
        className="install-close"
        onClick={handleClose}
        aria-label="Cerrar"
      >
        ×
      </button>

      <style jsx>{`
        .install {
          position: fixed;
          left: 14px;
          right: 14px;
          bottom: 96px;
          max-width: 520px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          background: var(--ink);
          color: var(--crema);
          border-radius: var(--r-md);
          box-shadow: var(--shadow-md);
          z-index: 45;
          animation: slideUp 0.3s ease both;
        }
        .install-cta {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 8px 6px;
          background: none;
          border: none;
          color: var(--crema);
          cursor: pointer;
          font: inherit;
          text-align: left;
        }
        .install-text {
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 500;
          line-height: 1.3;
        }
        .install-arrow {
          font-family: var(--font-mono);
          font-size: 16px;
          color: var(--accent);
          flex-shrink: 0;
        }
        .install-close {
          background: none;
          border: none;
          padding: 0;
          width: 28px;
          height: 28px;
          font-size: 22px;
          line-height: 1;
          color: var(--crema);
          opacity: 0.6;
          cursor: pointer;
          flex-shrink: 0;
          transition: opacity 0.15s ease;
        }
        .install-close:hover {
          opacity: 1;
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
