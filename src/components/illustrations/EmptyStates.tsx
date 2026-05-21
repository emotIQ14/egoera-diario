import React from 'react';

interface EmptyProps {
  size?: number;
  stroke?: string;
  accent?: string;
  className?: string;
}

// 1. EmptyHistorial: Open notebook holding organic ideas
export const EmptyHistorial: React.FC<EmptyProps> = ({
  size = 180,
  stroke = '#1d2bdb',
  accent = '#f1ead8',
  className,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Background warm blob */}
    <path
      d="M50 80 C40 120, 90 160, 130 150 C170 140, 160 80, 120 70 C80 60, 60 40, 50 80 Z"
      fill={accent}
      opacity="0.6"
    />
    
    {/* Continuous line art notebook */}
    <path
      d="M55 70 C55 58.95 63.95 50 75 50 H155 V150 H75 C63.95 150 55 141.05 55 130 V70 Z"
      stroke={stroke}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M45 78 C45 66.95 53.95 58 65 58 H75 V142 H65 C53.95 142 45 133.05 45 122 V78 Z"
      stroke={stroke}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    
    {/* Hand-drawn spiral links */}
    <path d="M48 70 H58" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
    <path d="M48 85 H58" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
    <path d="M48 100 H58" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
    <path d="M48 115 H58" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
    <path d="M48 130 H58" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />

    {/* Scribble floating page lines */}
    <path d="M85 80 H135" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
    <path d="M85 98 H125" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
    <path d="M85 116 H140" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
    
    {/* Little organic leaf growing out of the book margin */}
    <path
      d="M140 100 C150 90, 160 95, 170 85 C160 105, 145 105, 140 100 Z"
      fill={stroke}
      opacity="0.85"
    />
  </svg>
);

// 2. EmptyPatrones: Bars with dotted circles representing moon cycles or emotional waves
export const EmptyPatrones: React.FC<EmptyProps> = ({
  size = 180,
  stroke = '#1d2bdb',
  accent = '#f1ead8',
  className,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Soft backdrop organic ring */}
    <circle cx="100" cy="100" r="50" fill={accent} opacity="0.6" />
    
    {/* Emotional waves (curved path) */}
    <path
      d="M30 140 C60 110, 80 120, 110 90 C140 60, 160 110, 170 80"
      stroke={stroke}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeDasharray="6 6"
    />
    
    {/* Continuous bar visualizers */}
    <rect x="45" y="110" width="16" height="45" rx="8" stroke={stroke} strokeWidth="2.5" />
    <rect x="80" y="75" width="16" height="80" rx="8" stroke={stroke} strokeWidth="2.5" fill={accent} />
    <rect x="115" y="95" width="16" height="60" rx="8" stroke={stroke} strokeWidth="2.5" />
    <rect x="150" y="115" width="16" height="40" rx="8" stroke={stroke} strokeWidth="2.5" fill={accent} />
    
    {/* Floor anchor line */}
    <path d="M25 155 H175" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />

    {/* Radiant small sparkling stars */}
    <path d="M145 40 L148 48 L156 51 L148 54 L145 62 L142 54 L134 51 L142 48 Z" fill={stroke} />
    <path d="M60 50 L61.5 54 L65.5 55.5 L61.5 57 L60 61 L58.5 57 L54.5 55.5 L58.5 54 Z" fill={stroke} opacity="0.7" />
  </svg>
);

// 3. EmptyConversa: Socratic talking clouds representing interpersonal/intrapsychic dialogues
export const EmptyConversa: React.FC<EmptyProps> = ({
  size = 180,
  stroke = '#1d2bdb',
  accent = '#f1ead8',
  className,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Left speech bubble background */}
    <path
      d="M40 90 C40 62.38 66.86 40 100 40 C133.14 40 160 62.38 160 90 C160 117.62 133.14 140 100 140 C86.5 140 74 136 63 129 L35 137 L43 111 C41 104 40 97 40 90 Z"
      fill={accent}
      opacity="0.8"
    />
    
    {/* Socratic talking bubbles overlapping */}
    <path
      d="M35 100 C35 66.86 63.95 40 100 40 C136.05 40 165 66.86 165 100 C165 133.14 136.05 160 100 160 C87.1 160 75 156.4 64.6 150 L35 157 L42.5 130.5 C37.8 121.5 35 111.1 35 100 Z"
      stroke={stroke}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    
    <path
      d="M125 70 C132 75 137 83 137 92 C137 104 125 113 110 115"
      stroke={stroke}
      strokeWidth="2.5"
      strokeLinecap="round"
      opacity="0.5"
    />

    {/* Elegant conversational dialogue lines */}
    <path d="M75 90 H125" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
    <path d="M75 105 H115" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
    <path d="M75 120 H95" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />

    {/* Socratic Sparkle icon inside the bubble */}
    <path
      d="M135 125 L138 132 L145 135 L138 138 L135 145 L132 138 L125 135 L132 132 Z"
      fill={stroke}
    />
  </svg>
);

// 4. EmptyLecturas: Elegant bookstack pointing towards self-discovery
export const EmptyLecturas: React.FC<EmptyProps> = ({
  size = 180,
  stroke = '#1d2bdb',
  accent = '#f1ead8',
  className,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Backdrop circular glow */}
    <circle cx="102" cy="110" r="52" fill={accent} opacity="0.7" />
    
    {/* Base book */}
    <path
      d="M45 130 H155 V150 C155 152.76 152.76 155 150 155 H50 C47.24 155 45 152.76 45 150 V130 Z"
      stroke={stroke}
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    
    {/* Middle book */}
    <path
      d="M55 102 H145 V130 H55 V102 Z"
      stroke={stroke}
      strokeWidth="2.5"
      fill={accent}
      strokeLinejoin="round"
    />
    
    {/* Top leaning book */}
    <g transform="rotate(-12 100 80)">
      <rect
        x="65"
        y="55"
        width="70"
        height="24"
        rx="2"
        stroke={stroke}
        strokeWidth="2.5"
        fill="white"
      />
    </g>

    {/* Serene organic branch representing knowledge roots */}
    <path
      d="M110 50 C110 35, 120 25, 132 20 C125 32, 115 38, 110 50 Z"
      fill={stroke}
    />
    <path
      d="M102 44 L92 35 C99 35, 101 41, 102 44 Z"
      fill={stroke}
      opacity="0.75"
    />
  </svg>
);

// 5. EmptyBrujula: Organic compass representation pointing inwards (self-search)
export const EmptyBrujula: React.FC<EmptyProps> = ({
  size = 180,
  stroke = '#1d2bdb',
  accent = '#f1ead8',
  className,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Soft central organic concentric gradient backdrop */}
    <circle cx="100" cy="100" r="55" fill={accent} opacity="0.6" />
    <circle cx="100" cy="100" r="40" stroke={stroke} strokeWidth="1.2" strokeDasharray="3 4" opacity="0.4" />
    
    {/* Compass outer dial */}
    <circle cx="100" cy="100" r="62" stroke={stroke} strokeWidth="2.5" />
    
    {/* Cardinal ticks */}
    <path d="M100 38 V45" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
    <path d="M100 155 V162" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
    <path d="M38 100 H45" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
    <path d="M155 100 H162" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />

    {/* Serene diamond compass needle pointing inwards */}
    <path
      d="M100 55 L114 100 L100 145 L86 100 Z"
      stroke={stroke}
      strokeWidth="2.5"
      fill={accent}
      strokeLinejoin="round"
    />
    {/* Needle separation line */}
    <path d="M100 55 V145" stroke={stroke} strokeWidth="1.5" opacity="0.5" />

    {/* Centre pin */}
    <circle cx="100" cy="100" r="6" fill={stroke} />
  </svg>
);
