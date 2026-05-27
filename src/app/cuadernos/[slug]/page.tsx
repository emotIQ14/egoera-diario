'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getCuaderno } from '@/lib/cuadernos-data';
import CuadernoViewer from '@/components/cuaderno/CuadernoViewer';

export default function CuadernoPage() {
  const params = useParams();
  const slug = typeof params?.slug === 'string' ? params.slug : '';
  const cuaderno = getCuaderno(slug);

  if (!cuaderno) {
    return (
      <div className="not-found">
        <h1>Cuaderno no encontrado.</h1>
        <p>
          Quizá lo buscas en otra carpeta. Vuelve al
          <Link href="/cuadernos"> hub de cuadernos</Link>.
        </p>
        <style jsx>{`
          .not-found {
            padding: 80px 24px;
            text-align: center;
            color: var(--ink);
            max-width: 480px;
            margin: 0 auto;
          }
          h1 {
            font-family: var(--font-display);
            font-style: italic;
            margin-bottom: 14px;
          }
          a {
            color: var(--cobalto);
          }
        `}</style>
      </div>
    );
  }

  return <CuadernoViewer cuaderno={cuaderno} />;
}
