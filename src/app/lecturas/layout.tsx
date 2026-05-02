import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Lecturas · Egoera',
  description:
    'Lecturas cortas que acompañan tu diario emocional. Despacio.',
  openGraph: {
    title: 'Lecturas · Egoera',
    description: 'Lecturas cortas que acompañan tu diario.',
    type: 'website',
  },
};

export default function LecturasLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
