import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Tú · Egoera',
  description:
    'Tu espacio. Ajustes, perfil y todo lo tuyo en Egoera Diario.',
  openGraph: {
    title: 'Tú · Egoera',
    description: 'Tu espacio en Egoera Diario.',
    type: 'website',
  },
};

export default function TuLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
