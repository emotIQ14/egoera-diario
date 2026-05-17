'use client';

/**
 * Componente reutilizable para mostrar una ilustración del catálogo
 * con animación de spawn-pop estable y soporte a `prefers-reduced-motion`.
 *
 * Ejemplos:
 *   <Peep name="nora" />
 *   <Peep name="critico-interno" folder="ifs" size={96} />
 *   <Peep name="self" folder="arquetipos" size={64} alt="Self" />
 */

import Image from 'next/image';
import type { PeepFolder } from './peep-catalog';

interface PeepProps {
  name: string;
  folder?: PeepFolder;
  size?: number;
  alt?: string;
  delay?: number;
  className?: string;
  priority?: boolean;
}

export default function Peep({
  name,
  folder = 'amigas',
  size = 120,
  alt = '',
  delay = 0,
  className = '',
  priority = false,
}: PeepProps) {
  return (
    <span
      className={`peep-wrap ${className}`}
      style={{
        width: size,
        height: size,
        animationDelay: `${delay}ms`,
      }}
      aria-hidden={!alt}
    >
      <Image
        src={`/peeps/${folder}/${name}.png`}
        alt={alt}
        width={size * 2}
        height={size * 2}
        priority={priority || delay < 200}
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
      <style jsx>{`
        .peep-wrap {
          display: inline-block;
          flex-shrink: 0;
          animation: peep-pop 0.55s cubic-bezier(0.18, 0.89, 0.32, 1.28) both;
          transform-origin: center bottom;
        }
        @keyframes peep-pop {
          0% {
            opacity: 0;
            transform: translateY(12px) scale(0.85);
          }
          60% {
            opacity: 1;
            transform: translateY(-3px) scale(1.04);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .peep-wrap {
            animation: none;
          }
        }
      `}</style>
    </span>
  );
}
