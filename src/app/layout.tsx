import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister';
import { StructuredData } from '@/components/StructuredData';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://egoera-diario.vercel.app'),
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
    icon: [
      { url: '/icons/favicon.ico', sizes: 'any' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/icons/apple-touch-icon.png',
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://egoera-diario.vercel.app',
    siteName: 'Egoera Diario',
    title: 'Egoera Diario · Diario emocional despacio',
    description: 'Sin gamificación. Sin métricas raras. Solo tú escuchándote.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Egoera Diario' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Egoera Diario',
    description: 'Diario emocional, despacio.',
    images: ['/og-image.png'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // a11y: permitimos zoom para WCAG 1.4.4 (Resize Text)
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
      <body>
        <ServiceWorkerRegister />
        {children}
        <StructuredData />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
