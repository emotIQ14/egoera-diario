import type { ReactElement } from 'react';

const schema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Egoera Diario',
  applicationCategory: 'HealthApplication',
  operatingSystem: 'iOS, Android, Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'EUR',
  },
  // aggregateRating eliminada: era ficticia (4.8/127 reseñas inventadas).
  // Google penaliza fake reviews. Cuando haya reseñas reales, re-añadir desde fuente verificable.
  author: {
    '@type': 'Person',
    name: 'Ander Bilbao Castejón',
    url: 'https://egoera.es/ander-bilbao/',
  },
} as const;

export function StructuredData(): ReactElement {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify yields a trusted, deterministic payload — safe for dangerouslySetInnerHTML.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
