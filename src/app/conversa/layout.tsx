import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Conversa · Egoera',
  description:
    'Habla con tu diario. Una conversación íntima para entender lo que sientes.',
  openGraph: {
    title: 'Conversa · Egoera',
    description: 'Habla con tu diario. Una conversación íntima.',
    type: 'website',
  },
};

export default function ConversaLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
