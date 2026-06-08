/**
 * Mascot Egoera — un sobre con cara que actúa como compañero visual.
 * Variantes:
 *  - 'idle': ojos cerrados sonriendo (estado por defecto)
 *  - 'wave': agita un brazo (saluda)
 *  - 'holding-letter': agarra una carta
 *  - 'sleeping': zZz
 *
 * Estilo: línea cobalto sobre cream, sello mostaza arriba derecha,
 *         brazos delgados, animación breath sutil.
 */

const COBALTO = '#1d2bdb';
const CREMA = '#f1ead8';
const CREMA_SOFT = '#f7eecf';
const ACCENT = '#d97757';
const MOSTAZA = '#f4c842';
const INK = '#0a0a18';

type Variant = 'idle' | 'wave' | 'holding-letter' | 'sleeping';

type Props = {
  size?: number;
  variant?: Variant;
  className?: string;
};

export default function EgoeraMascot({ size = 140, variant = 'idle', className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* fondo redondo crema suave */}
      <circle cx="80" cy="80" r="70" fill={CREMA_SOFT} />

      {/* cuerpo animado: respira + balanceo sutil (idle vivo) */}
      <g className="eg-mascot-breath">
      {/* Cuerpo: sobre */}
      <g>
        {/* base del sobre */}
        <rect
          x="38"
          y="52"
          width="84"
          height="60"
          rx="6"
          fill="#fff"
          stroke={COBALTO}
          strokeWidth="2.6"
        />
        {/* solapa triangular (cerrada) */}
        <path
          d="M38 58 L80 90 L122 58"
          fill="none"
          stroke={COBALTO}
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        {/* sello mostaza arriba derecha */}
        <rect x="100" y="42" width="20" height="20" rx="2" fill={MOSTAZA} stroke={COBALTO} strokeWidth="1.6" />
        <text x="110" y="56" textAnchor="middle" fontSize="11" fill={COBALTO} fontFamily="serif" fontStyle="italic">e</text>
      </g>

      {/* Cara — variantes */}
      <Face variant={variant} />

      {/* Brazos */}
      <Arms variant={variant} />

      {/* Pies pequeños */}
      <ellipse cx="62" cy="116" rx="6" ry="3" fill={COBALTO} />
      <ellipse cx="98" cy="116" rx="6" ry="3" fill={COBALTO} />
      </g>

      <style>{`
        .eg-mascot-breath { animation: egMascotBreath 4.6s ease-in-out infinite; transform-origin: 80px 116px; will-change: transform; }
        @keyframes egMascotBreath {
          0%, 100% { transform: scale(1) translateY(0) rotate(-1.2deg); }
          50% { transform: scale(1.022) translateY(-3px) rotate(1.2deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .eg-mascot-breath { animation: none; }
        }
      `}</style>
    </svg>
  );
}

function Face({ variant }: { variant: Variant }) {
  if (variant === 'sleeping') {
    return (
      <g>
        <path d="M60 80 Q 64 78 68 80" stroke={COBALTO} strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M92 80 Q 96 78 100 80" stroke={COBALTO} strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M76 92 Q 80 94 84 92" stroke={COBALTO} strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <text x="118" y="42" fontSize="14" fill={COBALTO} fontStyle="italic">z</text>
        <text x="124" y="34" fontSize="10" fill={COBALTO} fontStyle="italic">z</text>
      </g>
    );
  }
  if (variant === 'wave') {
    return (
      <g>
        {/* ojos abiertos brillantes */}
        <circle cx="64" cy="80" r="3" fill={COBALTO} />
        <circle cx="96" cy="80" r="3" fill={COBALTO} />
        <circle cx="63" cy="79" r="0.8" fill="#fff" />
        <circle cx="95" cy="79" r="0.8" fill="#fff" />
        {/* sonrisa abierta */}
        <path d="M70 92 Q 80 100 90 92" stroke={COBALTO} strokeWidth="2" fill={ACCENT} strokeLinecap="round" />
      </g>
    );
  }
  // idle + holding-letter: ojos cerrados sonriendo
  return (
    <g>
      <path d="M58 80 Q 64 76 70 80" stroke={COBALTO} strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M90 80 Q 96 76 102 80" stroke={COBALTO} strokeWidth="2.2" fill="none" strokeLinecap="round" />
      {/* sonrisa cerrada */}
      <path d="M72 92 Q 80 96 88 92" stroke={COBALTO} strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* rubor mejillas */}
      <ellipse cx="60" cy="88" rx="4" ry="2" fill={ACCENT} opacity="0.32" />
      <ellipse cx="100" cy="88" rx="4" ry="2" fill={ACCENT} opacity="0.32" />
    </g>
  );
}

function Arms({ variant }: { variant: Variant }) {
  if (variant === 'wave') {
    return (
      <g>
        {/* brazo izq pegado al cuerpo */}
        <path d="M40 88 Q 32 96 36 108" stroke={COBALTO} strokeWidth="2.6" fill="none" strokeLinecap="round" />
        {/* brazo der saluda arriba */}
        <path d="M120 84 Q 134 70 130 50" stroke={COBALTO} strokeWidth="2.6" fill="none" strokeLinecap="round" />
        <circle cx="130" cy="48" r="4" fill={CREMA} stroke={COBALTO} strokeWidth="1.8" />
      </g>
    );
  }
  if (variant === 'holding-letter') {
    return (
      <g>
        {/* dos brazos hacia el centro sostienen carta pequeña */}
        <path d="M40 90 Q 50 100 64 100" stroke={COBALTO} strokeWidth="2.6" fill="none" strokeLinecap="round" />
        <path d="M120 90 Q 110 100 96 100" stroke={COBALTO} strokeWidth="2.6" fill="none" strokeLinecap="round" />
        <rect x="64" y="96" width="32" height="22" rx="2" fill="#fff" stroke={COBALTO} strokeWidth="1.8" />
        <path d="M64 98 L80 110 L96 98" stroke={COBALTO} strokeWidth="1.2" fill="none" />
        <circle cx="90" cy="104" r="2" fill={ACCENT} />
      </g>
    );
  }
  // idle: brazos relajados
  return (
    <g>
      <path d="M40 90 Q 34 100 38 112" stroke={COBALTO} strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <path d="M120 90 Q 126 100 122 112" stroke={COBALTO} strokeWidth="2.6" fill="none" strokeLinecap="round" />
    </g>
  );
}
