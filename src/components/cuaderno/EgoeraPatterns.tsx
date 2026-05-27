'use client';

/**
 * Patrones y marcas decorativas de la identidad Egoera para el módulo de
 * cuadernos. SVG inline para que escalen y se pinten con CSS variables.
 *
 * Familia:
 *  - WavePattern         — líneas onduladas sutiles (fondo respiración)
 *  - DotsGrid            — retícula de puntos (papel cuadriculado sutil)
 *  - ConcentricStamp     — sello redondo concéntrico con número o letra
 *  - CornerMark          — marca de esquina (escuadra) para márgenes
 *  - SeamLine            — línea cosida horizontal
 *  - CompassRose         — pequeña brújula (sólo en sección "Antes de empezar")
 *  - BookmarkRibbon      — cinta marcalibros lateral
 */

import type { CSSProperties } from 'react';

type ColorProp = { color?: string };
type PaintedProps = ColorProp & { className?: string; style?: CSSProperties };

// ─── Wave pattern · líneas que respiran ─────────────────────────────────────
export function WavePattern({ color = 'rgba(29,43,219,0.10)', className, style }: PaintedProps) {
  return (
    <svg
      aria-hidden
      className={className}
      style={style}
      viewBox="0 0 200 60"
      preserveAspectRatio="none"
    >
      <path
        d="M0 30 C 25 10, 50 50, 75 30 S 125 10, 150 30 S 200 50, 200 30"
        fill="none"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M0 42 C 25 22, 50 62, 75 42 S 125 22, 150 42 S 200 62, 200 42"
        fill="none"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
}

// ─── Dots grid · papel cuadriculado sutil ──────────────────────────────────
export function DotsGrid({
  color = 'rgba(29,43,219,0.16)',
  size = 14,
  dot = 1.1,
  className,
  style,
}: PaintedProps & { size?: number; dot?: number }) {
  return (
    <div
      aria-hidden
      className={className}
      style={{
        backgroundImage: `radial-gradient(circle, ${color} ${dot}px, transparent ${dot}px)`,
        backgroundSize: `${size}px ${size}px`,
        backgroundPosition: '0 0',
        ...style,
      }}
    />
  );
}

// ─── Sello redondo concéntrico con número/letra dentro ─────────────────────
export function ConcentricStamp({
  label,
  size = 92,
  fg = '#1d2bdb',
  bg = '#f4c842',
  className,
  style,
}: {
  label: string;
  size?: number;
  fg?: string;
  bg?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const cx = size / 2;
  const r1 = size / 2 - 2;
  const r2 = size / 2 - 8;
  const r3 = size / 2 - 14;
  return (
    <svg
      aria-hidden
      className={className}
      style={style}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
    >
      <circle cx={cx} cy={cx} r={r1} fill="none" stroke={fg} strokeWidth="1" opacity="0.4" />
      <circle cx={cx} cy={cx} r={r2} fill={bg} />
      <circle cx={cx} cy={cx} r={r3} fill="none" stroke={fg} strokeWidth="1" opacity="0.55" />
      <text
        x={cx}
        y={cx}
        fontFamily="Fraunces, serif"
        fontStyle="italic"
        fontWeight="500"
        fontSize={size * 0.32}
        textAnchor="middle"
        dominantBaseline="central"
        fill={fg}
      >
        {label}
      </text>
    </svg>
  );
}

// ─── Marca de esquina · escuadra decorativa ────────────────────────────────
export function CornerMark({
  size = 32,
  color = 'rgba(29,43,219,0.25)',
  position = 'tl',
  className,
  style,
}: PaintedProps & { size?: number; position?: 'tl' | 'tr' | 'bl' | 'br' }) {
  const rotation = { tl: 0, tr: 90, br: 180, bl: 270 }[position];
  return (
    <svg
      aria-hidden
      className={className}
      style={style}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      transform={`rotate(${rotation})`}
    >
      <path
        d="M 4 4 L 4 14 M 4 4 L 14 4"
        fill="none"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="4" cy="4" r="1.4" fill={color} />
    </svg>
  );
}

// ─── Línea cosida ──────────────────────────────────────────────────────────
export function SeamLine({
  color = 'rgba(29,43,219,0.32)',
  className,
  style,
}: PaintedProps) {
  return (
    <div
      aria-hidden
      className={className}
      style={{
        height: 1,
        backgroundImage: `repeating-linear-gradient(to right, ${color} 0, ${color} 6px, transparent 6px, transparent 12px)`,
        ...style,
      }}
    />
  );
}

// ─── Pequeña brújula decorativa (para portadas/headers especiales) ────────
export function CompassRose({
  size = 48,
  color = '#1d2bdb',
  className,
  style,
}: PaintedProps & { size?: number }) {
  return (
    <svg
      aria-hidden
      className={className}
      style={style}
      width={size}
      height={size}
      viewBox="0 0 48 48"
    >
      <circle cx="24" cy="24" r="22" fill="none" stroke={color} strokeWidth="1.2" opacity="0.55" />
      <circle cx="24" cy="24" r="17" fill="none" stroke={color} strokeWidth="0.7" opacity="0.35" strokeDasharray="2 3" />
      <path d="M24 6 L27 24 L24 42 L21 24 Z" fill={color} />
      <path d="M6 24 L24 21 L42 24 L24 27 Z" fill={color} opacity="0.65" />
      <circle cx="24" cy="24" r="2.6" fill="#f4c842" stroke={color} strokeWidth="1" />
    </svg>
  );
}

// ─── Cinta marcalibros lateral ─────────────────────────────────────────────
export function BookmarkRibbon({
  side = 'right',
  color = '#d97757',
  height = 56,
  className,
  style,
}: PaintedProps & { side?: 'left' | 'right'; height?: number }) {
  return (
    <svg
      aria-hidden
      className={className}
      style={style}
      width={22}
      height={height}
      viewBox={`0 0 22 ${height}`}
    >
      <path
        d={`M 0 0 L 22 0 L 22 ${height} L 11 ${height - 8} L 0 ${height} Z`}
        fill={color}
        opacity="0.95"
      />
      <path
        d={`M 0 0 L 22 0 L 22 ${height} L 11 ${height - 8} L 0 ${height} Z`}
        fill="none"
        stroke="rgba(13,15,61,0.35)"
        strokeWidth="0.5"
      />
    </svg>
  );
}

// ─── Ornamento tipo "anotación al margen" estilo cuaderno ──────────────────
export function MarginNote({
  text,
  rotate = -3,
  color = '#1d2bdb',
  className,
  style,
}: { text: string; rotate?: number; color?: string; className?: string; style?: CSSProperties }) {
  return (
    <div
      aria-hidden
      className={className}
      style={{
        fontFamily: 'Caveat, cursive',
        fontSize: 18,
        color,
        transform: `rotate(${rotate}deg)`,
        lineHeight: 1,
        ...style,
      }}
    >
      {text}
    </div>
  );
}
