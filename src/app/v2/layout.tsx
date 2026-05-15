import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Egoera Diario · v2 · silent movement',
  description: 'Diario emocional con estética cuidada. Mírate sin prisa.',
};

export default function V2Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Fuentes Google: Noto Serif JP + Yu Mincho */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;500;700&family=Fraunces:wght@300;400;500&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;600&display=swap"
        rel="stylesheet"
      />
      {children}
    </>
  );
}
