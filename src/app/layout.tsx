import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Egoera Diario · Diario emocional despacio',
  description: 'Un diario emocional terapéutico. Sin gamificación, sin métricas raras. Cobalto + crema, despacio.',
  manifest: '/manifest.json',
  themeColor: '#1d2bdb',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Egoera Diario',
  },
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/icon-512.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f1ead8' },
    { media: '(prefers-color-scheme: dark)', color: '#0d0f3d' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;0,9..144,800;1,9..144,300;1,9..144,400;1,9..144,500;1,9..144,600;1,9..144,700;1,9..144,800&family=Caveat:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
