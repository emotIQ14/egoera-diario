'use client';

/**
 * EmotionAvatar · mini-retrato por emoción.
 *
 * Mapea cada Emotion del catálogo a una ilustración facial expresiva.
 * 9 de 10 son PNG (estilo Velorah, paleta cobalto + crema + coral).
 * 1 (cansancio) es SVG line-art coherente con el resto.
 *
 * Uso:
 *   <EmotionAvatar id="tristeza" size={36} />
 *   <EmotionAvatar id="cansancio" size={48} className="chip-avatar" />
 */

import Image from 'next/image';
import type { Emotion } from '@/lib/storage';

/** Mapeo emoción → archivo (sin extensión). */
const AVATAR_MAP: Record<Emotion, { file: string; ext: 'png' | 'svg' }> = {
  tristeza:   { file: 'tristeza-f',  ext: 'png' },
  rabia:      { file: 'rabia-f',     ext: 'png' },
  alegria:    { file: 'alegria-f',   ext: 'png' },
  miedo:      { file: 'miedo-m',     ext: 'png' },
  calma:      { file: 'calma-m',     ext: 'png' },
  ansiedad:   { file: 'sorpresa-f',  ext: 'png' }, // ojos abiertos + tensión
  esperanza:  { file: 'alegria-m',   ext: 'png' }, // sonrisa suave (no exuberante)
  verguenza:  { file: 'duda-f',      ext: 'png' }, // mirada baja, retraída
  culpa:      { file: 'tristeza-m',  ext: 'png' }, // melancolía masculina
  cansancio:  { file: 'cansancio',   ext: 'svg' }, // SVG line-art (único faltante)
};

type EmotionAvatarProps = {
  id: Emotion;
  size?: number;
  className?: string;
  alt?: string;
  priority?: boolean;
};

export default function EmotionAvatar({
  id,
  size = 40,
  className = '',
  alt = '',
  priority = false,
}: EmotionAvatarProps) {
  const meta = AVATAR_MAP[id];
  if (!meta) return null;
  const src = `/peeps/emotion-avatars/${meta.file}.${meta.ext}`;

  // El SVG no necesita next/image optimización
  if (meta.ext === 'svg') {
    return (
      <img
        src={src}
        alt={alt}
        width={size}
        height={size}
        className={className}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        style={{
          objectFit: 'cover',
          borderRadius: '50%',
          display: 'block',
        }}
        aria-hidden={!alt}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={size * 2}
      height={size * 2}
      className={className}
      priority={priority}
      style={{
        width: size,
        height: size,
        objectFit: 'cover',
        borderRadius: '50%',
        display: 'block',
      }}
      aria-hidden={!alt}
    />
  );
}
