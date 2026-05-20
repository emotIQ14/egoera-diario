import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// La página usa useSearchParams para detectar ?from=peep-prompt,
// y todo el estado vive en localStorage (cliente). No hace falta SSG.
// Forzar dynamic rendering evita el error de Suspense boundary en Next 15.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Bienvenida · Egoera Diario',
  description: 'Empieza tu diario emocional. Sin gamificación, sin métricas raras. Solo tú escuchándote.',
  openGraph: {
    title: 'Bienvenida a Egoera Diario',
    description: 'Tu diario emocional, despacio.',
    type: 'website',
  },
};

/**
 * Layout del flujo de onboarding.
 * Queda fuera del TabBar a propósito: este flujo va antes del login.
 * Las pantallas se posicionan en absoluto sobre este contenedor para
 * permitir el fade cruzado entre pasos.
 */
export default function BienvenidaLayout({ children }: { children: ReactNode }) {
  return (
    <div className="onboarding-root">
      {children}
      <style>
        {`
          .onboarding-root {
            position: relative;
            width: 100%;
            min-height: 100vh;
            min-height: 100dvh;
            overflow: hidden;
          }
        `}
      </style>
    </div>
  );
}
