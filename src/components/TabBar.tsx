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
    href: '/actividades',
    label: 'Hacer',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3c-3 4-3 7 0 10s3 6 0 8" />
        <path d="M6 13c1.5-1 3-1 4.5 0" />
        <path d="M17.5 13c-1.5-1-3-1-4.5 0" />
      </svg>
    ),
  },
  {
    href: '/cuadernos',
    label: 'Recursos',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h7v16H4z" />
        <path d="M13 4h7v16h-7z" />
        <path d="M11 4v16" />
      </svg>
    ),
  },
  {
    href: '/cartas',
    label: 'Cartas',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="6" width="18" height="13" rx="2" />
        <path d="M3 8 L 12 14 L 21 8" />
      </svg>
    ),
  },
  {
    href: '/suenos',
    label: 'Sueños',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 14a8 8 0 1 1-9-9 6 6 0 0 0 9 9z" />
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
      {/* Estilos en globals.css — styled-jsx no puede aplicar al <Link> de Next */}
    </nav>
  );
}
