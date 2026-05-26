/**
 * Faces con expresiones — inspirados en las referencias del usuario.
 * Estilo: rostro grande, pelo cobalto definido, camiseta accent (coral),
 * piel cream-azul tenue, expresión variable por emoción.
 *
 * Uso: como avatar de "emoción detectada", como ilustración de cards,
 * y para acompañar entradas del diario.
 */

const COBALTO = '#1d2bdb';
const COBALTO_DEEP = '#0f1baa';
const SKIN = '#d4e8e3';        // verde-cream pálido (referencia)
const SKIN_SHADOW = '#a8c8c0';
const ACCENT = '#d97757';
const INK = '#0a0a18';

export type FaceEmotion =
  | 'sad'        // triste
  | 'angry'      // enfadado
  | 'joy'        // alegría
  | 'surprised'  // sorprendido
  | 'fear'       // miedo
  | 'serene'     // sereno
  | 'tired'      // cansancio
  | 'thoughtful'; // pensativo

type Props = {
  emotion: FaceEmotion;
  size?: number;
  hairStyle?: 'short-curly' | 'long-wavy' | 'bun' | 'flat-top' | 'long-straight' | 'ponytail';
  className?: string;
};

export default function FaceExpression({
  emotion,
  size = 160,
  hairStyle = 'short-curly',
  className,
}: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 200"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* Camiseta — siempre accent */}
      <path
        d="M30 165 Q 30 145 60 138 L 100 138 Q 130 145 130 165 L 130 200 L 30 200 Z"
        fill={ACCENT}
        stroke={INK}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      {/* Cuello */}
      <rect x="68" y="125" width="24" height="18" fill={SKIN} stroke={INK} strokeWidth="1.8" />
      {/* Cara */}
      <ellipse cx="80" cy="80" rx="45" ry="52" fill={SKIN} stroke={INK} strokeWidth="2.2" />
      {/* Sombra mejilla derecha */}
      <path d="M120 80 Q 125 100 115 120" fill={SKIN_SHADOW} opacity="0.5" />

      {/* Hair */}
      <Hair style={hairStyle} />

      {/* Eyes + Mouth según emoción */}
      <Features emotion={emotion} />
    </svg>
  );
}

function Hair({ style }: { style: Required<Props>['hairStyle'] }) {
  switch (style) {
    case 'short-curly':
      return (
        <g>
          <path
            d="M38 60 Q 36 30 70 24 Q 100 18 122 38 Q 130 58 122 70 L 118 60 Q 110 50 100 52 Q 90 46 80 50 Q 65 48 55 56 L 42 70 Z"
            fill={COBALTO}
          />
          <path d="M50 50 Q 56 46 60 50" stroke={COBALTO_DEEP} strokeWidth="1.6" fill="none" />
          <path d="M100 44 Q 108 42 114 48" stroke={COBALTO_DEEP} strokeWidth="1.6" fill="none" />
        </g>
      );
    case 'long-wavy':
      return (
        <g>
          <path
            d="M30 70 Q 26 30 70 20 Q 110 14 130 40 Q 138 80 132 130 Q 126 110 120 90 L 118 60 Q 110 50 80 50 Q 50 48 42 70 Q 38 100 32 130 Q 26 110 30 70 Z"
            fill={COBALTO}
          />
        </g>
      );
    case 'bun':
      return (
        <g>
          <circle cx="80" cy="22" r="14" fill={COBALTO} />
          <path
            d="M40 60 Q 38 34 70 32 L 90 32 Q 122 34 120 60 L 118 65 Q 100 55 80 56 Q 60 54 42 65 Z"
            fill={COBALTO}
          />
          <path d="M75 14 Q 80 8 85 14" stroke={COBALTO_DEEP} strokeWidth="1.4" fill="none" />
        </g>
      );
    case 'flat-top':
      return (
        <g>
          <path
            d="M40 56 L 40 30 Q 80 18 120 30 L 120 60 L 116 56 Q 100 50 80 52 Q 60 50 44 56 Z"
            fill={COBALTO}
          />
        </g>
      );
    case 'long-straight':
      return (
        <g>
          <path
            d="M34 60 Q 32 30 70 22 Q 108 18 126 40 Q 130 100 124 150 L 118 60 Q 110 50 80 50 Q 50 48 42 60 Q 36 110 36 150 Q 30 100 34 60 Z"
            fill={COBALTO}
          />
        </g>
      );
    case 'ponytail':
      return (
        <g>
          <path
            d="M40 56 Q 38 28 80 22 Q 118 26 122 50 L 122 70 Q 110 55 80 54 Q 50 52 42 70 Z"
            fill={COBALTO}
          />
          <path d="M122 55 Q 140 70 135 100 Q 128 90 122 75 Z" fill={COBALTO} />
        </g>
      );
  }
}

function Features({ emotion }: { emotion: FaceEmotion }) {
  switch (emotion) {
    case 'sad':
      return (
        <g>
          {/* Cejas caídas hacia el centro */}
          <path d="M55 65 Q 64 70 72 67" stroke={INK} strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <path d="M88 67 Q 96 70 105 65" stroke={INK} strokeWidth="2.2" fill="none" strokeLinecap="round" />
          {/* Ojos pequeños tristes */}
          <ellipse cx="64" cy="80" rx="3.5" ry="4" fill={INK} />
          <ellipse cx="96" cy="80" rx="3.5" ry="4" fill={INK} />
          {/* Boca curvada hacia abajo */}
          <path d="M67 108 Q 80 100 93 108" stroke={INK} strokeWidth="2.4" fill="none" strokeLinecap="round" />
        </g>
      );
    case 'angry':
      return (
        <g>
          {/* Cejas inclinadas hacia abajo en el centro (enfado) */}
          <path d="M55 60 L 72 66" stroke={INK} strokeWidth="3" strokeLinecap="round" />
          <path d="M105 60 L 88 66" stroke={INK} strokeWidth="3" strokeLinecap="round" />
          {/* Ojos entornados */}
          <path d="M58 78 Q 64 80 70 78" stroke={INK} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M90 78 Q 96 80 102 78" stroke={INK} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* Pupilas duras */}
          <circle cx="64" cy="80" r="2" fill={INK} />
          <circle cx="96" cy="80" r="2" fill={INK} />
          {/* Boca con dientes apretados */}
          <rect x="66" y="104" width="28" height="8" rx="2" fill="#fff" stroke={INK} strokeWidth="2" />
          <line x1="74" y1="104" x2="74" y2="112" stroke={INK} strokeWidth="1.2" />
          <line x1="80" y1="104" x2="80" y2="112" stroke={INK} strokeWidth="1.2" />
          <line x1="86" y1="104" x2="86" y2="112" stroke={INK} strokeWidth="1.2" />
        </g>
      );
    case 'joy':
      return (
        <g>
          {/* Cejas relajadas levantadas */}
          <path d="M55 62 Q 64 58 73 62" stroke={INK} strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <path d="M87 62 Q 96 58 105 62" stroke={INK} strokeWidth="2.2" fill="none" strokeLinecap="round" />
          {/* Ojos brillantes */}
          <circle cx="64" cy="80" r="4" fill={INK} />
          <circle cx="96" cy="80" r="4" fill={INK} />
          <circle cx="63" cy="79" r="1.4" fill="#fff" />
          <circle cx="95" cy="79" r="1.4" fill="#fff" />
          {/* Sonrisa amplia con dientes */}
          <path d="M60 100 Q 80 122 100 100 Q 95 116 80 118 Q 65 116 60 100 Z" fill="#fff" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M60 100 Q 80 108 100 100" stroke={INK} strokeWidth="1.6" fill="none" />
          {/* Estrellitas en los ojos */}
          <path d="M70 76 l1 -2 l1 2 l2 1 l-2 1 l-1 2 l-1 -2 l-2 -1 z" fill="#fff" />
        </g>
      );
    case 'surprised':
      return (
        <g>
          {/* Cejas muy arriba */}
          <path d="M55 56 Q 64 52 73 56" stroke={INK} strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <path d="M87 56 Q 96 52 105 56" stroke={INK} strokeWidth="2.2" fill="none" strokeLinecap="round" />
          {/* Ojos muy abiertos */}
          <circle cx="64" cy="82" r="6" fill="#fff" stroke={INK} strokeWidth="2" />
          <circle cx="96" cy="82" r="6" fill="#fff" stroke={INK} strokeWidth="2" />
          <circle cx="64" cy="82" r="2.5" fill={INK} />
          <circle cx="96" cy="82" r="2.5" fill={INK} />
          {/* Boca abierta O */}
          <ellipse cx="80" cy="108" rx="5" ry="8" fill={ACCENT} stroke={INK} strokeWidth="2" />
        </g>
      );
    case 'fear':
      return (
        <g>
          {/* Cejas tipo casita */}
          <path d="M55 64 Q 64 56 72 64" stroke={INK} strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <path d="M88 64 Q 96 56 104 64" stroke={INK} strokeWidth="2.4" fill="none" strokeLinecap="round" />
          {/* Ojos abiertos preocupados */}
          <circle cx="64" cy="82" r="5" fill="#fff" stroke={INK} strokeWidth="2" />
          <circle cx="96" cy="82" r="5" fill="#fff" stroke={INK} strokeWidth="2" />
          <circle cx="64" cy="83" r="2" fill={INK} />
          <circle cx="96" cy="83" r="2" fill={INK} />
          {/* Boca tensa con dientes */}
          <rect x="64" y="104" width="32" height="10" rx="3" fill="#fff" stroke={INK} strokeWidth="2" />
          <line x1="72" y1="104" x2="72" y2="114" stroke={INK} strokeWidth="1.2" />
          <line x1="80" y1="104" x2="80" y2="114" stroke={INK} strokeWidth="1.2" />
          <line x1="88" y1="104" x2="88" y2="114" stroke={INK} strokeWidth="1.2" />
          {/* Gota sudor */}
          <path d="M118 76 q 2 4 0 8 q -3 -2 -3 -6 q 0 -3 3 -2 z" fill="#a8c2f0" />
        </g>
      );
    case 'tired':
      return (
        <g>
          <path d="M55 63 Q 64 65 73 63" stroke={INK} strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <path d="M87 63 Q 96 65 105 63" stroke={INK} strokeWidth="2.2" fill="none" strokeLinecap="round" />
          {/* Ojos entornados con bolsas */}
          <path d="M56 80 Q 64 85 72 80" stroke={INK} strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <path d="M88 80 Q 96 85 104 80" stroke={INK} strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <path d="M58 85 Q 64 87 70 85" stroke={INK} strokeWidth="1.2" fill="none" opacity="0.5" />
          <path d="M90 85 Q 96 87 102 85" stroke={INK} strokeWidth="1.2" fill="none" opacity="0.5" />
          {/* Boca neutra */}
          <line x1="68" y1="108" x2="92" y2="108" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
        </g>
      );
    case 'thoughtful':
      return (
        <g>
          {/* Una ceja levantada */}
          <path d="M55 64 Q 64 60 72 64" stroke={INK} strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <path d="M87 60 Q 96 55 105 58" stroke={INK} strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <circle cx="64" cy="80" r="3.5" fill={INK} />
          <circle cx="96" cy="80" r="3.5" fill={INK} />
          {/* Boca pequeña a un lado */}
          <path d="M70 108 Q 80 105 88 110" stroke={INK} strokeWidth="2.2" fill="none" strokeLinecap="round" />
        </g>
      );
    case 'serene':
    default:
      return (
        <g>
          <path d="M55 64 Q 64 60 73 64" stroke={INK} strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <path d="M87 64 Q 96 60 105 64" stroke={INK} strokeWidth="2.2" fill="none" strokeLinecap="round" />
          {/* Ojos cerrados sonriendo */}
          <path d="M58 80 Q 64 76 70 80" stroke={INK} strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <path d="M90 80 Q 96 76 102 80" stroke={INK} strokeWidth="2.4" fill="none" strokeLinecap="round" />
          {/* Sonrisa cerrada suave */}
          <path d="M68 105 Q 80 112 92 105" stroke={INK} strokeWidth="2.2" fill="none" strokeLinecap="round" />
          {/* Rubor */}
          <ellipse cx="56" cy="95" rx="6" ry="3" fill={ACCENT} opacity="0.32" />
          <ellipse cx="104" cy="95" rx="6" ry="3" fill={ACCENT} opacity="0.32" />
        </g>
      );
  }
}

/** Grid de 6 faces para mostrar la paleta emocional completa. */
export function FaceGrid({ size = 100 }: { size?: number }) {
  const items: { emotion: FaceEmotion; hair: Required<Props>['hairStyle']; label: string }[] = [
    { emotion: 'sad',        hair: 'long-straight', label: 'tristeza' },
    { emotion: 'angry',      hair: 'bun',           label: 'rabia' },
    { emotion: 'joy',        hair: 'long-wavy',     label: 'alegría' },
    { emotion: 'surprised',  hair: 'short-curly',   label: 'sorpresa' },
    { emotion: 'fear',       hair: 'ponytail',      label: 'miedo' },
    { emotion: 'serene',     hair: 'flat-top',      label: 'serenidad' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, maxWidth: 480, margin: '0 auto' }}>
      {items.map(i => (
        <figure key={i.emotion} style={{ margin: 0, textAlign: 'center' }}>
          <FaceExpression emotion={i.emotion} hairStyle={i.hair} size={size} />
          <figcaption style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--ink)',
            opacity: 0.65,
            marginTop: 4,
          }}>{i.label}</figcaption>
        </figure>
      ))}
    </div>
  );
}
