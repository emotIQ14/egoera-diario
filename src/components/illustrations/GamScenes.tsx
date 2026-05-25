/**
 * Escenas gamificadas — una por tab de la app.
 * SVG inline, colores Egoera (cobalto + crema + accent + mostaza).
 * Pensadas para usarse en cards del home y headers de las pantallas.
 *
 * Estilo: cartoon plano, peep estilizado + objeto + decoraciones (estrellas,
 * hojas, puntos). Inspirado en PlantCare-style sin imitarlo: voz Egoera.
 */

const COBALTO = '#1d2bdb';
const CREMA = '#f1ead8';
const CREMA_SOFT = '#f7eecf';
const ACCENT = '#d97757';
const MOSTAZA = '#f4c842';
const INK = '#0a0a18';

type Props = { size?: number; className?: string };

/** Escritura — peep escribiendo en cuaderno con estrellas y signos. */
export function ActivityWritingScene({ size = 200, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* fondo circular crema */}
      <circle cx="100" cy="100" r="90" fill={CREMA_SOFT} />
      {/* mostaza orb fondo */}
      <circle cx="135" cy="80" r="38" fill={MOSTAZA} opacity="0.55" />
      {/* estrellas decorativas */}
      <Star cx={42} cy={48} r={3.5} color={ACCENT} />
      <Star cx={158} cy={42} r={2.6} color={COBALTO} />
      <Star cx={162} cy={140} r={3.2} color={MOSTAZA} />
      <Star cx={36} cy={132} r={2.4} color={ACCENT} />
      {/* cuaderno */}
      <rect x="56" y="118" width="88" height="56" rx="4" fill="#fff" stroke={COBALTO} strokeWidth="2.5" />
      <line x1="100" y1="118" x2="100" y2="174" stroke={COBALTO} strokeWidth="1.5" opacity="0.4" strokeDasharray="3 3" />
      <line x1="68" y1="134" x2="92" y2="134" stroke={COBALTO} strokeWidth="1.5" opacity="0.6" />
      <line x1="68" y1="146" x2="88" y2="146" stroke={COBALTO} strokeWidth="1.5" opacity="0.6" />
      <line x1="68" y1="158" x2="90" y2="158" stroke={COBALTO} strokeWidth="1.5" opacity="0.6" />
      <line x1="108" y1="134" x2="132" y2="134" stroke={COBALTO} strokeWidth="1.5" opacity="0.6" />
      <line x1="108" y1="146" x2="128" y2="146" stroke={COBALTO} strokeWidth="1.5" opacity="0.6" />
      {/* peep cabeza + busto */}
      <Peep cx={100} cy={88} headFill={ACCENT} bodyFill={COBALTO} eyeOpen />
      {/* lápiz */}
      <g transform="translate(118 102) rotate(28)">
        <rect x="0" y="0" width="36" height="6" rx="1" fill={MOSTAZA} stroke={COBALTO} strokeWidth="1.5" />
        <polygon points="36,0 44,3 36,6" fill={INK} />
      </g>
    </svg>
  );
}

/** Conversa — dos peeps con burbuja de diálogo. */
export function ActivityTalkingScene({ size = 200, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle cx="100" cy="100" r="90" fill={CREMA_SOFT} />
      <circle cx="68" cy="110" r="40" fill={MOSTAZA} opacity="0.4" />
      {/* burbuja diálogo */}
      <path
        d="M70 50 H150 a10 10 0 0 1 10 10 v32 a10 10 0 0 1 -10 10 H120 l-12 14 -4 -14 H70 a10 10 0 0 1 -10 -10 V60 a10 10 0 0 1 10 -10 Z"
        fill="#fff"
        stroke={COBALTO}
        strokeWidth="2.5"
      />
      <circle cx="92" cy="76" r="3" fill={COBALTO} />
      <circle cx="110" cy="76" r="3" fill={COBALTO} />
      <circle cx="128" cy="76" r="3" fill={COBALTO} />
      {/* peep izq */}
      <Peep cx={60} cy={150} headFill={COBALTO} bodyFill={ACCENT} eyeOpen />
      {/* peep der */}
      <Peep cx={150} cy={150} headFill={ACCENT} bodyFill={COBALTO} eyeOpen mirror />
      <Star cx={40} cy={48} r={3} color={ACCENT} />
      <Star cx={172} cy={108} r={2.8} color={MOSTAZA} />
    </svg>
  );
}

/** Patrones — peep mirando gráfico de línea. */
export function ActivityPatternsScene({ size = 200, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle cx="100" cy="100" r="90" fill={CREMA_SOFT} />
      <circle cx="138" cy="100" r="42" fill={ACCENT} opacity="0.18" />
      {/* gráfico */}
      <rect x="78" y="50" width="100" height="80" rx="6" fill="#fff" stroke={COBALTO} strokeWidth="2.5" />
      {/* ejes */}
      <line x1="86" y1="118" x2="170" y2="118" stroke={COBALTO} strokeWidth="1.2" opacity="0.55" />
      <line x1="86" y1="118" x2="86" y2="60" stroke={COBALTO} strokeWidth="1.2" opacity="0.55" />
      {/* curva */}
      <path
        d="M88 108 C 100 80, 116 102, 128 86 S 154 70, 168 76"
        fill="none"
        stroke={COBALTO}
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* puntos */}
      <circle cx="108" cy="92" r="3" fill={ACCENT} />
      <circle cx="128" cy="86" r="3" fill={MOSTAZA} />
      <circle cx="148" cy="73" r="3" fill={ACCENT} />
      {/* peep observando */}
      <Peep cx={48} cy={132} headFill={ACCENT} bodyFill={COBALTO} eyeOpen />
      <Star cx={32} cy={50} r={3} color={MOSTAZA} />
      <Star cx={184} cy={148} r={2.6} color={ACCENT} />
    </svg>
  );
}

/** Actividades — peep en pose de yoga / cuerpo, hojas alrededor. */
export function ActivityYogaScene({ size = 200, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle cx="100" cy="100" r="90" fill={CREMA_SOFT} />
      {/* sol mostaza atrás */}
      <circle cx="100" cy="96" r="48" fill={MOSTAZA} opacity="0.55" />
      {/* peep yoga (sentado loto) */}
      {/* cabeza */}
      <circle cx="100" cy="78" r="14" fill={ACCENT} stroke={COBALTO} strokeWidth="2.5" />
      <circle cx="96" cy="78" r="1.5" fill={COBALTO} />
      <circle cx="104" cy="78" r="1.5" fill={COBALTO} />
      <path d="M96 84 Q 100 87 104 84" stroke={COBALTO} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      {/* cuello */}
      <line x1="100" y1="92" x2="100" y2="100" stroke={COBALTO} strokeWidth="2.5" />
      {/* torso */}
      <path
        d="M82 100 Q 100 96 118 100 L 122 122 Q 100 128 78 122 Z"
        fill={COBALTO}
        stroke={COBALTO}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* piernas cruzadas */}
      <path
        d="M78 122 Q 64 130 70 144 Q 100 152 130 144 Q 136 130 122 122"
        fill={COBALTO}
        stroke={COBALTO}
        strokeWidth="2.5"
        strokeLinejoin="round"
        opacity="0.85"
      />
      {/* brazos doblados, manos en rodillas */}
      <path
        d="M84 108 Q 70 116 76 134"
        stroke={COBALTO}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M116 108 Q 130 116 124 134"
        stroke={COBALTO}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      {/* manos */}
      <circle cx="76" cy="134" r="4" fill={ACCENT} stroke={COBALTO} strokeWidth="1.5" />
      <circle cx="124" cy="134" r="4" fill={ACCENT} stroke={COBALTO} strokeWidth="1.5" />
      {/* hojas */}
      <Leaf cx={36} cy={140} rot={-20} color={MOSTAZA} />
      <Leaf cx={164} cy={140} rot={25} color={ACCENT} />
      <Leaf cx={158} cy={62} rot={70} color={COBALTO} />
      <Leaf cx={42} cy={62} rot={-70} color={ACCENT} />
      <Star cx={28} cy={92} r={2.6} color={COBALTO} />
      <Star cx={172} cy={92} r={2.8} color={MOSTAZA} />
    </svg>
  );
}

// ─── primitivas internas ────────────────────────────────────────────

function Star({ cx, cy, r, color }: { cx: number; cy: number; r: number; color: string }) {
  // estrella simple de 4 puntas (lozenge)
  return (
    <path
      d={`M${cx} ${cy - r} L${cx + r * 0.35} ${cy - r * 0.35} L${cx + r} ${cy} L${cx + r * 0.35} ${cy + r * 0.35} L${cx} ${cy + r} L${cx - r * 0.35} ${cy + r * 0.35} L${cx - r} ${cy} L${cx - r * 0.35} ${cy - r * 0.35} Z`}
      fill={color}
    />
  );
}

function Leaf({ cx, cy, rot, color }: { cx: number; cy: number; rot: number; color: string }) {
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${rot})`}>
      <path
        d="M-8 0 Q 0 -12 8 0 Q 0 12 -8 0 Z"
        fill={color}
        opacity="0.78"
      />
      <line x1="-8" y1="0" x2="8" y2="0" stroke={INK} strokeWidth="1" opacity="0.4" />
    </g>
  );
}

function Peep({
  cx, cy, headFill, bodyFill, eyeOpen, mirror,
}: {
  cx: number; cy: number; headFill: string; bodyFill: string; eyeOpen?: boolean; mirror?: boolean;
}) {
  return (
    <g transform={`translate(${cx} ${cy}) ${mirror ? 'scale(-1 1)' : ''}`}>
      {/* cabeza */}
      <circle cx="0" cy="-22" r="13" fill={headFill} stroke={COBALTO} strokeWidth="2" />
      {/* ojos */}
      {eyeOpen ? (
        <>
          <circle cx="-4" cy="-22" r="1.3" fill={COBALTO} />
          <circle cx="4" cy="-22" r="1.3" fill={COBALTO} />
        </>
      ) : (
        <>
          <line x1="-6" y1="-22" x2="-2" y2="-22" stroke={COBALTO} strokeWidth="1.5" />
          <line x1="2" y1="-22" x2="6" y2="-22" stroke={COBALTO} strokeWidth="1.5" />
        </>
      )}
      {/* sonrisa */}
      <path d="M-3 -17 Q 0 -15 3 -17" stroke={COBALTO} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      {/* cuerpo */}
      <path
        d="M-12 -8 Q 0 -10 12 -8 L 16 18 L -16 18 Z"
        fill={bodyFill}
        stroke={COBALTO}
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </g>
  );
}
