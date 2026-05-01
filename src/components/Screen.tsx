import type { ReactNode } from 'react';

/**
 * Wrapper común para todas las pantallas.
 * Aplica padding superior, padding inferior para tab bar, max-width móvil.
 */
export default function Screen({
  children,
  background = 'cream',
}: {
  children: ReactNode;
  background?: 'cream' | 'ink' | 'cobalto';
}) {
  const bg =
    background === 'ink'
      ? 'var(--ink)'
      : background === 'cobalto'
        ? 'var(--cobalto)'
        : 'var(--crema)';
  const fg = background === 'cream' ? 'var(--ink)' : 'var(--crema)';
  return (
    <main style={{ background: bg, color: fg }} className="screen-root">
      <div className="screen-inner">{children}</div>
      <style jsx>{`
        .screen-root {
          min-height: 100vh;
          padding: 24px 22px 110px;
        }
        .screen-inner {
          max-width: 520px;
          margin: 0 auto;
        }
      `}</style>
    </main>
  );
}
