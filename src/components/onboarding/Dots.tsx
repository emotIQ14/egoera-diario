'use client';

/**
 * Indicador de progreso del onboarding (5 pasos).
 * El paso activo se muestra en cobalto sólido y alargado;
 * los demás quedan tenues sobre el fondo correspondiente.
 */
export default function Dots({
  total,
  current,
  tone = 'ink',
}: {
  total: number;
  current: number;
  tone?: 'ink' | 'cream';
}) {
  const inactive =
    tone === 'cream' ? 'rgba(241, 234, 216, 0.32)' : 'rgba(13, 15, 61, 0.18)';
  const active = tone === 'cream' ? 'var(--crema)' : 'var(--cobalto)';

  return (
    <div className="dots" role="tablist" aria-label="Progreso del onboarding">
      {Array.from({ length: total }).map((_, i) => {
        const isActive = i === current;
        return (
          <span
            key={i}
            role="tab"
            aria-selected={isActive}
            aria-label={`Paso ${i + 1} de ${total}`}
            className={`dot ${isActive ? 'dot-active' : ''}`}
          />
        );
      })}
      <style jsx>{`
        .dots {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .dot {
          width: 6px;
          height: 6px;
          border-radius: 999px;
          background: ${inactive};
          transition: width 0.3s ease, background 0.3s ease, opacity 0.3s ease;
        }
        .dot-active {
          width: 22px;
          background: ${active};
        }
      `}</style>
    </div>
  );
}
