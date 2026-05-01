'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type Tab = { href: string; label: string; icon: React.ReactNode };

const TABS: Tab[] = [
  {
    href: '/',
    label: 'Hoy',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="3" fill="currentColor" />
      </svg>
    ),
  },
  {
    href: '/diario',
    label: 'Diario',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <path d="M5 7h14M5 12h14M5 17h10" />
      </svg>
    ),
  },
  {
    href: '/conversa',
    label: 'Conversa',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    href: '/patrones',
    label: 'Patrones',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 17l5-5 4 4 9-9" />
      </svg>
    ),
  },
  {
    href: '/lecturas',
    label: 'Lecturas',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round">
        <path d="M4 19V5a2 2 0 0 1 2-2h12v18l-6-3-6 3z" />
      </svg>
    ),
  },
  {
    href: '/tu',
    label: 'Tú',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4 4-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
];

export default function TabBar() {
  const pathname = usePathname();
  return (
    <nav className="tabbar">
      {TABS.map((t) => {
        const active = pathname === t.href || (t.href !== '/' && pathname.startsWith(t.href));
        return (
          <Link key={t.href} href={t.href} className={`tab ${active ? 'active' : ''}`}>
            <span className="ico">{t.icon}</span>
            <span>{t.label}</span>
          </Link>
        );
      })}
      <style jsx>{`
        .tabbar {
          position: fixed;
          bottom: 14px;
          left: 14px;
          right: 14px;
          background: rgba(13, 15, 61, 0.92);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border-radius: 28px;
          padding: 10px 8px calc(10px + env(safe-area-inset-bottom, 0px));
          display: flex;
          justify-content: space-around;
          align-items: center;
          z-index: 40;
          max-width: 520px;
          margin: 0 auto;
        }
        .tab {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          padding: 6px 4px;
          text-decoration: none;
          color: rgba(241, 234, 216, 0.55);
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          font-weight: 600;
          transition: color 0.15s ease;
        }
        .tab.active { color: var(--accent); }
        .ico {
          width: 22px;
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ico :global(svg) { width: 20px; height: 20px; }
      `}</style>
    </nav>
  );
}
