import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Diario · Egoera',
  description:
    'Escribe tu día con calma. Texto o voz, sin presiones. Tu espacio emocional privado.',
  openGraph: {
    title: 'Diario · Egoera',
    description: 'Escribe tu día con calma. Texto o voz, sin presiones.',
    type: 'website',
  },
};

export default function DiarioLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
