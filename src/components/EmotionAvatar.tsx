'use client';

/**
 * EmotionAvatar · mini-retrato por emoción.
 *
 * Mapea cada Emotion del catálogo a una ilustración SVG de Egoera Characters
 * (estilo Velorah · piel verde-menta, pelo cobalto, camiseta coral).
 *
 * 9 emociones renderizan SVG inline (ligeros, escalables, color heredado).
 * 1 emoción (alegría) usa el PNG porque ningún Character expresa alegría
 * pura — `alegria-f.png` queda mejor para ese caso.
 *
 * Uso:
 *   <EmotionAvatar id="tristeza" size={36} />
 */

import Image from 'next/image';
import type { Emotion } from '@/lib/storage';
import {
  ZenCalmCharacter,
  ReflectiveCharacter,
  DeterminedCharacter,
  AnxiousCharacter,
  IrisInsomneCharacter,
  MiraSilenciosaCharacter,
  LolaAnsiosaCharacter,
  ZuriSensibleCharacter,
  OliComplacienteCharacter,
} from './illustrations/EgoeraCharacters';

type SvgCharacter = React.FC<{ size?: number; className?: string }>;

/** Mapeo emoción → personaje SVG. */
const SVG_MAP: Partial<Record<Emotion, SvgCharacter>> = {
  tristeza:  ZuriSensibleCharacter,
  rabia:     DeterminedCharacter,
  ansiedad:  LolaAnsiosaCharacter,
  miedo:     AnxiousCharacter,
  calma:     ZenCalmCharacter,
  esperanza: ReflectiveCharacter,
  verguenza: MiraSilenciosaCharacter,
  culpa:     OliComplacienteCharacter,
  cansancio: IrisInsomneCharacter,
};

/** Emociones que aún usan PNG (porque no hay match SVG suficiente). */
const PNG_MAP: Partial<Record<Emotion, string>> = {
  alegria: '/peeps/emotion-avatars/alegria-f.png',
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
  const Svg = SVG_MAP[id];
  if (Svg) {
    return (
      <Svg
        size={size}
        className={className}
      />
    );
  }

  const png = PNG_MAP[id];
  if (png) {
    return (
      <Image
        src={png}
        alt={alt}
        width={size * 2}
        height={size * 2}
        className={className}
        priority={priority}
        style={{
          width: size,
          height: size,
          objectFit: 'cover',
          objectPosition: 'center 30%', // alinea la cara (no el torso) en el círculo
          borderRadius: '50%',
          display: 'block',
        }}
        aria-hidden={!alt}
      />
    );
  }

  return null;
}
