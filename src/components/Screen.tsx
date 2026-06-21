import type { ReactNode, CSSProperties } from 'react';

/**
 * Wrapper común para todas las pantallas.
 * Aplica padding superior, padding inferior para tab bar, max-width móvil.
 *
 * `maxWidth` permite ampliar el ancho para pantallas tipo dashboard /
 * catálogo (ej. /cuadernos). Default 520px (mobile-first del diario).
 *
 * `padding` permite reducir el padding lateral cuando el componente hijo
 * ya gestiona su propio padding (útil para layouts complejos).
 */
export default function Screen({
  children,
  background = 'cream',
  maxWidth = '520px',
  padding = '24px 22px 110px',
}: {
  children: ReactNode;
  background?: 'cream' | 'ink' | 'cobalto';
  maxWidth?: string;
  padding?: string;
}) {
  const bg =
    background === 'ink'
      ? 'var(--ink)'
      : background === 'cobalto'
        ? 'var(--cobalto)'
        : 'var(--crema)';
  const fg = background === 'cream' ? 'var(--ink)' : 'var(--crema)';
  // Centrado inline (no depende de styled-jsx, que en el build desplegado no emitía la regla
  // .screen-inner{margin:0 auto} → la columna quedaba anclada a la izquierda en móvil).
  const innerStyle: CSSProperties = { maxWidth, marginInline: 'auto', width: '100%' };
  return (
    <main style={{ background: bg, color: fg, padding }} className="screen-root">
      <div className="screen-inner" style={innerStyle}>
        {children}
      </div>
      <style jsx>{`
        .screen-root {
          min-height: 100vh;
        }
        .screen-inner {
          margin: 0 auto;
          width: 100%;
        }
      `}</style>
    </main>
  );
}
