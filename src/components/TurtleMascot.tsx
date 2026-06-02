'use client';

/**
 * TurtleMascot · mascota tortuga erudita animada de Egoera.
 *
 * 12 emociones, cada una un PNG transparente en /public/turtle/<emotion>.png.
 * - Flota con un bob suave + leve squash (idle), respetando prefers-reduced-motion.
 * - Siempre CENTRADA en su contenedor (flex center, mobile-first).
 * - Responsive por altura: ~110px en móvil, ~170px en escritorio.
 * - Las imágenes tienen aspect ratios distintos; fijamos la ALTURA y dejamos
 *   width:auto para no deformar a la tortuga. Pasamos width/height intrínsecos
 *   a next/image para que reserve el ratio correcto (sin CLS).
 *
 * Uso:
 *   <TurtleMascot emotion="calm" />
 *   <TurtleMascot emotion="happy" caption="Hoy te veo bien" />
 */

import Image from 'next/image';

export type TurtleEmotion =
  | 'calm'
  | 'inspiration'
  | 'confusion'
  | 'frustration'
  | 'reading'
  | 'happy'
  | 'pride'
  | 'surprise'
  | 'sad'
  | 'upset'
  | 'sleepy'
  | 'shy';

/** Dimensiones intrínsecas de cada PNG (px). Mantienen el ratio sin deformar. */
const TURTLE_DIMS: Record<TurtleEmotion, { w: number; h: number }> = {
  calm: { w: 158, h: 204 },
  inspiration: { w: 244, h: 224 },
  confusion: { w: 269, h: 220 },
  frustration: { w: 324, h: 227 },
  reading: { w: 239, h: 227 },
  happy: { w: 249, h: 227 },
  pride: { w: 274, h: 227 },
  surprise: { w: 242, h: 227 },
  sad: { w: 290, h: 220 },
  upset: { w: 250, h: 220 },
  sleepy: { w: 258, h: 222 },
  shy: { w: 297, h: 220 },
};

/** Texto alternativo descriptivo por emoción (accesibilidad). */
const TURTLE_ALT: Record<TurtleEmotion, string> = {
  calm: 'Tortuga de Egoera tranquila y serena',
  inspiration: 'Tortuga de Egoera con una idea, inspirada',
  confusion: 'Tortuga de Egoera confundida, pensativa',
  frustration: 'Tortuga de Egoera algo frustrada',
  reading: 'Tortuga de Egoera leyendo, concentrada',
  happy: 'Tortuga de Egoera contenta y sonriente',
  pride: 'Tortuga de Egoera orgullosa y satisfecha',
  surprise: 'Tortuga de Egoera sorprendida',
  sad: 'Tortuga de Egoera triste',
  upset: 'Tortuga de Egoera disgustada',
  sleepy: 'Tortuga de Egoera con sueño, adormilada',
  shy: 'Tortuga de Egoera tímida',
};

type TurtleMascotProps = {
  emotion: TurtleEmotion;
  /** Texto opcional debajo de la tortuga. */
  caption?: string;
  /** Carga prioritaria (above-the-fold). */
  priority?: boolean;
  /** Clase extra para el contenedor. */
  className?: string;
};

export default function TurtleMascot({
  emotion,
  caption,
  priority = false,
  className = '',
}: TurtleMascotProps) {
  const dims = TURTLE_DIMS[emotion] ?? TURTLE_DIMS.calm;
  const alt = TURTLE_ALT[emotion] ?? 'Tortuga de Egoera';

  return (
    <div className={`turtle-wrap ${className}`}>
      <div className="turtle-stage" aria-hidden="false">
        {/* sombra suave que late en sincronía con el bob */}
        <span className="turtle-shadow" aria-hidden="true" />
        <Image
          key={emotion}
          src={`/turtle/${emotion}.png`}
          alt={alt}
          width={dims.w}
          height={dims.h}
          priority={priority}
          className="turtle-img"
          sizes="(max-width: 600px) 110px, 170px"
          draggable={false}
        />
      </div>
      {caption ? <p className="turtle-caption">{caption}</p> : null}

      <style jsx>{`
        .turtle-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          /* altura de la tortuga, responsive */
          --turtle-h: 110px;
          gap: 8px;
          /* nunca provocar scroll horizontal */
          max-width: 100%;
          overflow: visible;
        }
        .turtle-stage {
          position: relative;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          height: var(--turtle-h);
          /* el ancho lo marca la imagen; centrado por el flex padre */
          line-height: 0;
        }
        .turtle-img {
          height: var(--turtle-h);
          width: auto;
          max-width: 100%;
          object-fit: contain;
          transform-origin: bottom center;
          animation: turtle-bob 3s ease-in-out infinite;
          will-change: transform;
          user-select: none;
          -webkit-user-drag: none;
        }
        .turtle-shadow {
          position: absolute;
          bottom: -6px;
          left: 50%;
          width: 56%;
          height: 10px;
          transform: translateX(-50%);
          background: radial-gradient(
            ellipse at center,
            rgba(13, 15, 61, 0.18),
            rgba(13, 15, 61, 0) 70%
          );
          border-radius: 50%;
          animation: turtle-shadow 3s ease-in-out infinite;
          pointer-events: none;
        }
        .turtle-caption {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--ink);
          opacity: 0.5;
          text-align: center;
          margin: 0;
        }

        /* Bob: flotación + leve squash (escala vertical) con origen en la base. */
        @keyframes turtle-bob {
          0% {
            transform: translateY(0) scaleY(1) scaleX(1);
          }
          30% {
            transform: translateY(-7px) scaleY(1.025) scaleX(0.99);
          }
          50% {
            transform: translateY(-9px) scaleY(1.03) scaleX(0.985);
          }
          70% {
            transform: translateY(-7px) scaleY(1.025) scaleX(0.99);
          }
          100% {
            transform: translateY(0) scaleY(1) scaleX(1);
          }
        }
        /* La sombra se encoge cuando la tortuga sube (sensación de profundidad). */
        @keyframes turtle-shadow {
          0% {
            transform: translateX(-50%) scaleX(1);
            opacity: 0.9;
          }
          50% {
            transform: translateX(-50%) scaleX(0.8);
            opacity: 0.55;
          }
          100% {
            transform: translateX(-50%) scaleX(1);
            opacity: 0.9;
          }
        }

        /* Escritorio: tortuga más grande. */
        @media (min-width: 600px) {
          .turtle-wrap {
            --turtle-h: 170px;
            gap: 10px;
          }
        }

        /* Accesibilidad: sin movimiento si el usuario lo pide. */
        @media (prefers-reduced-motion: reduce) {
          .turtle-img,
          .turtle-shadow {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
