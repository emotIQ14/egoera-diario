import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Patrones · Egoera',
  description:
    'Observa tus patrones emocionales. Insights claros, sin métricas raras.',
  openGraph: {
    title: 'Patrones · Egoera',
    description: 'Tus patrones emocionales, claros.',
    type: 'website',
  },
};

export default function PatronesLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
