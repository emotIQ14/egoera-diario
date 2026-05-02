import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Egoera Pro · Más profundo',
  description:
    'Memoria infinita, voz ilimitada, exports profesionales y la ciencia detrás de cada insight. €4,99/mes.',
  openGraph: {
    title: 'Egoera Pro',
    description: '4× más claros tus patrones emocionales',
    type: 'website',
  },
};

export default function ProLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
