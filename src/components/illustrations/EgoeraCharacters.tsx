import React from 'react';

interface CharacterProps {
  size?: number;
  className?: string;
}

// ----------------------------------------------------
// 1. ZEN CALM CHARACTER (Top-Right, Image 1)
// Serene curly hair, peaceful smile, looking left calmly
// ----------------------------------------------------
export const ZenCalmCharacter: React.FC<CharacterProps> = ({ size = 200, className }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Torso - Orange Shirt */}
      <path
        d="M60 145 C60 125, 75 118, 100 118 C125 118, 140 125, 140 145 L145 190 H55 Z"
        fill="#db7457"
        stroke="#1d2bdb"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      {/* Crew Neck collar double line */}
      <path
        d="M85 119 C85 125, 115 125, 115 119"
        stroke="#1d2bdb"
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Neck - Mint Skin */}
      <path
        d="M88 100 V120 H112 V100 Z"
        fill="#cbeee5"
        stroke="#1d2bdb"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Head - Mint Skin */}
      <path
        d="M75 60 C75 38, 125 38, 125 60 C125 80, 122 104, 100 106 C78 104, 75 80, 75 60 Z"
        fill="#cbeee5"
        stroke="#1d2bdb"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Ears */}
      <path
        d="M75 72 C71 72, 69 76, 71 80 C72 83, 74 83, 75 81"
        fill="#cbeee5"
        stroke="#1d2bdb"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M125 72 C129 72, 131 76, 129 80 C128 83, 126 83, 125 81"
        fill="#cbeee5"
        stroke="#1d2bdb"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Hair - Blue Curly Hair */}
      <path
        d="M68 62 C64 62, 60 55, 62 48 C66 32, 85 22, 100 22 C115 22, 134 32, 138 48 C140 55, 136 62, 132 62 C128 50, 120 40, 100 40 C80 40, 72 50, 68 62 Z"
        fill="#1d2bdb"
        stroke="#1d2bdb"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      {/* Curly strands on top */}
      <path
        d="M80 34 C82 28, 90 26, 94 30 C96 34, 92 38, 88 38"
        stroke="#1d2bdb"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M102 28 C106 24, 114 26, 116 32 C114 38, 108 38, 104 36"
        stroke="#1d2bdb"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />

      {/* Eyebrows - Calm & content */}
      <path
        d="M82 68 C86 65, 92 65, 94 68"
        stroke="#1d2bdb"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M106 68 C108 65, 114 65, 118 68"
        stroke="#1d2bdb"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Eyes - Happy looking slightly left */}
      <ellipse cx="89" cy="74" rx="3.5" ry="4.5" fill="#1d2bdb" />
      <ellipse cx="111" cy="74" rx="3.5" ry="4.5" fill="#1d2bdb" />
      <path d="M86 71 Q89 69 92 71" stroke="#1d2bdb" strokeWidth="1.5" fill="none" />
      <path d="M108 71 Q111 69 114 71" stroke="#1d2bdb" strokeWidth="1.5" fill="none" />

      {/* Nose - Cozy handdrawn angle */}
      <path
        d="M98 75 L101 84 L97 86"
        stroke="#1d2bdb"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Smiling Mouth with visible teeth (Serene smile) */}
      <path
        d="M92 90 C92 98, 108 98, 108 90 Z"
        fill="#ffffff"
        stroke="#1d2bdb"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
    </svg>
  );
};

// ----------------------------------------------------
// 2. REFLECTIVE CHARACTER (Top-Left, Image 2)
// Gentle bob-cut hair, tilted head, sad vulnerable eyes
// ----------------------------------------------------
export const ReflectiveCharacter: React.FC<CharacterProps> = ({ size = 200, className }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g transform="rotate(-5, 100, 100)">
        {/* Torso - Orange Shirt */}
        <path
          d="M60 145 C60 125, 75 118, 100 118 C125 118, 140 125, 140 145 L145 190 H55 Z"
          fill="#db7457"
          stroke="#1d2bdb"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <path
          d="M85 119 C85 125, 115 125, 115 119"
          stroke="#1d2bdb"
          strokeWidth="3.5"
          fill="none"
          strokeLinecap="round"
        />

        {/* Neck */}
        <path
          d="M88 100 V120 H112 V100 Z"
          fill="#cbeee5"
          stroke="#1d2bdb"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Head */}
        <path
          d="M75 62 C75 40, 125 40, 125 62 C125 82, 122 103, 100 105 C78 103, 75 82, 75 62 Z"
          fill="#cbeee5"
          stroke="#1d2bdb"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Bob-cut Hair - Cobalt Blue */}
        <path
          d="M64 62 C58 62, 56 70, 58 84 C60 98, 62 104, 66 104 C70 94, 72 80, 72 66 H128 C128 80, 130 94, 134 104 C138 104, 140 98, 142 84 C144 70, 142 62, 136 62 C132 40, 118 24, 100 24 C82 24, 68 40, 64 62 Z"
          fill="#1d2bdb"
          stroke="#1d2bdb"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Drooping Eyebrows (Vulnerable/Reflective) */}
        <path
          d="M80 67 C84 70, 90 70, 93 66"
          stroke="#1d2bdb"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M107 66 C110 70, 116 70, 120 67"
          stroke="#1d2bdb"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Melancholy Eyes */}
        <ellipse cx="87" cy="74" rx="3" ry="4" fill="#1d2bdb" />
        <ellipse cx="113" cy="74" rx="3" ry="4" fill="#1d2bdb" />
        <path d="M83 71 C85 73, 89 73, 91 71" stroke="#1d2bdb" strokeWidth="1.5" fill="none" />
        <path d="M109 71 C111 73, 115 73, 117 71" stroke="#1d2bdb" strokeWidth="1.5" fill="none" />

        {/* Nose */}
        <path
          d="M98 76 L101 84 L97 86"
          stroke="#1d2bdb"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Soft down-turned sad mouth */}
        <path
          d="M93 92 C96 90, 104 90, 107 92"
          stroke="#1d2bdb"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
      </g>
    </svg>
  );
};

// ----------------------------------------------------
// 3. DETERMINED CHARACTER (Top-Left, Image 1 style)
// Straight gaze, firm focus, neat stylish short hair
// ----------------------------------------------------
export const DeterminedCharacter: React.FC<CharacterProps> = ({ size = 200, className }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Torso - Orange Shirt */}
      <path
        d="M60 145 C60 125, 75 118, 100 118 C125 118, 140 125, 140 145 L145 190 H55 Z"
        fill="#db7457"
        stroke="#1d2bdb"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <path
        d="M85 119 C85 125, 115 125, 115 119"
        stroke="#1d2bdb"
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Neck */}
      <path
        d="M88 100 V120 H112 V100 Z"
        fill="#cbeee5"
        stroke="#1d2bdb"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Head */}
      <path
        d="M75 60 C75 38, 125 38, 125 60 C125 80, 122 104, 100 106 C78 104, 75 80, 75 60 Z"
        fill="#cbeee5"
        stroke="#1d2bdb"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Hair - Short styling with cute sideburn locks */}
      <path
        d="M71 52 C65 52, 62 42, 68 34 C74 24, 88 18, 100 18 C112 18, 126 24, 132 34 C138 42, 135 52, 129 52 C125 44, 120 34, 100 34 C80 34, 75 44, 71 52 Z"
        fill="#1d2bdb"
        stroke="#1d2bdb"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      
      {/* Eyebrows - Strong straight/focused */}
      <path
        d="M80 66 H94"
        stroke="#1d2bdb"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M106 66 H120"
        stroke="#1d2bdb"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Eyes - Deep direct gaze */}
      <circle cx="87" cy="74" r="4.5" fill="#1d2bdb" />
      <circle cx="113" cy="74" r="4.5" fill="#1d2bdb" />

      {/* Nose */}
      <path
        d="M98 75 L101 83 L97 85"
        stroke="#1d2bdb"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Firm tight confident mouth */}
      <path
        d="M92 92 H108"
        stroke="#1d2bdb"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

// ----------------------------------------------------
// 4. ANXIOUS CHARACTER (Bottom-Right, Image 2 style)
// Wild exploded hair, scared eyes, squiggly worry mouth
// ----------------------------------------------------
export const AnxiousCharacter: React.FC<CharacterProps> = ({ size = 200, className }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Torso - Orange Shirt */}
      <path
        d="M60 145 C60 125, 75 118, 100 118 C125 118, 140 125, 140 145 L145 190 H55 Z"
        fill="#db7457"
        stroke="#1d2bdb"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <path
        d="M85 119 C85 125, 115 125, 115 119"
        stroke="#1d2bdb"
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Neck */}
      <path
        d="M88 100 V120 H112 V100 Z"
        fill="#cbeee5"
        stroke="#1d2bdb"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Head */}
      <path
        d="M75 60 C75 38, 125 38, 125 60 C125 80, 122 104, 100 106 C78 104, 75 80, 75 60 Z"
        fill="#cbeee5"
        stroke="#1d2bdb"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Wild Exploded Hair (Spiky all directions) */}
      <path
        d="M60 48 L45 42 L55 32 L40 22 L60 20 L65 5 L80 18 L95 2 L105 18 L120 2 L130 20 L150 15 L140 32 L155 42 L135 48 L142 65 L128 72 C128 72, 124 54, 100 54 C76 54, 72 72, 72 72 L58 65 Z"
        fill="#1d2bdb"
        stroke="#1d2bdb"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Scared slanted eyebrows */}
      <path
        d="M78 68 C83 64, 89 68, 93 72"
        stroke="#1d2bdb"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M107 72 C111 68, 117 64, 122 68"
        stroke="#1d2bdb"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Wide, anxious eyes with tiny pupils */}
      <circle cx="87" cy="78" r="6" fill="#ffffff" stroke="#1d2bdb" strokeWidth="2.5" />
      <circle cx="87" cy="78" r="2" fill="#1d2bdb" />
      
      <circle cx="113" cy="78" r="6" fill="#ffffff" stroke="#1d2bdb" strokeWidth="2.5" />
      <circle cx="113" cy="78" r="2" fill="#1d2bdb" />

      {/* Nose */}
      <path
        d="M98 80 L101 86 L97 88"
        stroke="#1d2bdb"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Squiggly nervous mouth */}
      <path
        d="M90 95 Q92 92 95 95 Q98 98 101 95 Q104 92 107 95 Q110 98 112 95"
        stroke="#1d2bdb"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
};

// ----------------------------------------------------
// 5. IRIS INSOMNE CHARACTER (Bottom-Right, Image 1)
// Tired, eyebags, sweating drop, squiggly teeth smirk
// ----------------------------------------------------
export const IrisInsomneCharacter: React.FC<CharacterProps> = ({ size = 200, className }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Torso - Orange Shirt */}
      <path
        d="M60 145 C60 125, 75 118, 100 118 C125 118, 140 125, 140 145 L145 190 H55 Z"
        fill="#db7457"
        stroke="#1d2bdb"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <path
        d="M85 119 C85 125, 115 125, 115 119"
        stroke="#1d2bdb"
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Neck */}
      <path
        d="M88 100 V120 H112 V100 Z"
        fill="#cbeee5"
        stroke="#1d2bdb"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Head */}
      <path
        d="M75 60 C75 38, 125 38, 125 60 C125 80, 122 104, 100 106 C78 104, 75 80, 75 60 Z"
        fill="#cbeee5"
        stroke="#1d2bdb"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Messy curly hair pointing upwards */}
      <path
        d="M68 54 C58 54, 52 42, 60 30 C70 12, 85 10, 100 10 C115 10, 130 12, 140 30 C148 42, 142 54, 132 54 C124 45, 115 42, 100 42 C85 42, 76 45, 68 54 Z"
        fill="#1d2bdb"
        stroke="#1d2bdb"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Sweat Drop */}
      <path
        d="M125 64 Q127 72 124 75 Q121 72 125 64"
        fill="#ffffff"
        stroke="#1d2bdb"
        strokeWidth="2"
      />

      {/* Worried tilted eyebrows */}
      <path
        d="M78 68 C83 69, 89 67, 92 64"
        stroke="#1d2bdb"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M108 64 C111 67, 117 69, 122 68"
        stroke="#1d2bdb"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Eyebags and tired weary eyes */}
      <circle cx="87" cy="75" r="3.5" fill="#1d2bdb" />
      <circle cx="113" cy="75" r="3.5" fill="#1d2bdb" />
      <path d="M80 81 C80 81, 85 84, 94 81" stroke="#1d2bdb" strokeWidth="2" fill="none" />
      <path d="M106 81 C106 81, 111 84, 120 81" stroke="#1d2bdb" strokeWidth="2" fill="none" />

      {/* Nose */}
      <path
        d="M98 76 L101 84 L97 86"
        stroke="#1d2bdb"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Squiggly grin/grimace mouth for nervous anxiety */}
      <path
        d="M88 92 H112 V98 H88 Z"
        fill="#ffffff"
        stroke="#1d2bdb"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      {/* Teeth dividing line */}
      <path d="M88 95 H112" stroke="#1d2bdb" strokeWidth="2" />
      <path d="M96 92 V98 M104 92 V98" stroke="#1d2bdb" strokeWidth="2" />
    </svg>
  );
};

// ----------------------------------------------------
// 6. MIRA SILENCIOSA CHARACTER (Bottom-Middle, Image 2)
// High Ponytail hair, thinking side-gaze, neutral tight mouth
// ----------------------------------------------------
export const MiraSilenciosaCharacter: React.FC<CharacterProps> = ({ size = 200, className }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Ponytail reaching to the right side */}
      <path
        d="M125 50 C140 45, 165 55, 160 80 C155 100, 135 90, 126 78 Z"
        fill="#1d2bdb"
        stroke="#1d2bdb"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      {/* Small hair band */}
      <ellipse cx="126" cy="60" rx="4" ry="7" fill="#db7457" stroke="#1d2bdb" strokeWidth="2" />

      {/* Torso - Orange Shirt */}
      <path
        d="M60 145 C60 125, 75 118, 100 118 C125 118, 140 125, 140 145 L145 190 H55 Z"
        fill="#db7457"
        stroke="#1d2bdb"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <path
        d="M85 119 C85 125, 115 125, 115 119"
        stroke="#1d2bdb"
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Neck */}
      <path
        d="M88 100 V120 H112 V100 Z"
        fill="#cbeee5"
        stroke="#1d2bdb"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Head */}
      <path
        d="M75 60 C75 38, 125 38, 125 60 C125 80, 122 104, 100 106 C78 104, 75 80, 75 60 Z"
        fill="#cbeee5"
        stroke="#1d2bdb"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Hair on Head - Elegant slick look */}
      <path
        d="M75 50 C71 50, 68 44, 73 38 C80 28, 92 24, 100 24 C112 24, 120 28, 123 38 C125 44, 122 50, 118 50 C110 42, 105 38, 100 38 C95 38, 88 42, 75 50 Z"
        fill="#1d2bdb"
        stroke="#1d2bdb"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Skeptical raised eyebrows */}
      <path
        d="M78 68 C82 65, 88 65, 92 68"
        stroke="#1d2bdb"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M106 63 C110 60, 116 60, 120 63"
        stroke="#1d2bdb"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Eyes looking to the right */}
      <ellipse cx="91" cy="74" rx="3.5" ry="4.5" fill="#1d2bdb" />
      <ellipse cx="117" cy="74" rx="3.5" ry="4.5" fill="#1d2bdb" />

      {/* Nose */}
      <path
        d="M98 75 L101 83 L97 85"
        stroke="#1d2bdb"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Small tight neutral/thinking circular mouth */}
      <circle cx="100" cy="92" r="3.5" stroke="#1d2bdb" strokeWidth="3" fill="none" />
    </svg>
  );
};

// ----------------------------------------------------
// 7. LOLA ANSIOSA CHARACTER (Top-Right, Image 2)
// Voluminous curly hair, star twinkle happy eyes, fists raised
// ----------------------------------------------------
export const LolaAnsiosaCharacter: React.FC<CharacterProps> = ({ size = 200, className }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Huge curly hair - Afro styling of circular paths */}
      <path
        d="M50 76 C35 76, 25 56, 40 40 C55 24, 75 14, 100 14 C125 14, 145 24, 160 40 C175 56, 165 76, 150 76"
        fill="#1d2bdb"
        stroke="#1d2bdb"
        strokeWidth="3"
      />
      <circle cx="50" cy="60" r="22" fill="#1d2bdb" />
      <circle cx="150" cy="60" r="22" fill="#1d2bdb" />
      <circle cx="65" cy="40" r="24" fill="#1d2bdb" />
      <circle cx="135" cy="40" r="24" fill="#1d2bdb" />
      <circle cx="100" cy="30" r="26" fill="#1d2bdb" />

      {/* Torso - Orange Shirt */}
      <path
        d="M60 145 C60 125, 75 118, 100 118 C125 118, 140 125, 140 145 L145 190 H55 Z"
        fill="#db7457"
        stroke="#1d2bdb"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <path
        d="M85 119 C85 125, 115 125, 115 119"
        stroke="#1d2bdb"
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Raised active hands (Fists for eager validation) */}
      <path
        d="M45 170 C40 152, 52 142, 58 148 L65 168 Z"
        fill="#cbeee5"
        stroke="#1d2bdb"
        strokeWidth="3"
      />
      <path
        d="M155 170 C160 152, 148 142, 142 148 L135 168 Z"
        fill="#cbeee5"
        stroke="#1d2bdb"
        strokeWidth="3"
      />

      {/* Neck */}
      <path
        d="M88 100 V120 H112 V100 Z"
        fill="#cbeee5"
        stroke="#1d2bdb"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Head */}
      <path
        d="M75 62 C75 40, 125 40, 125 62 C125 82, 122 103, 100 105 C78 103, 75 82, 75 62 Z"
        fill="#cbeee5"
        stroke="#1d2bdb"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Arched highly happy eyebrows */}
      <path
        d="M78 64 C82 58, 88 58, 92 64"
        stroke="#1d2bdb"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M108 64 C112 58, 118 58, 122 64"
        stroke="#1d2bdb"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Joyful Star Pupil twinkling eyes */}
      {/* Left eye star */}
      <path
        d="M87 69 L89 73 L93 74 L89 75 L87 79 L85 75 L81 74 L85 73 Z"
        fill="#1d2bdb"
      />
      {/* Right eye star */}
      <path
        d="M113 69 L115 73 L119 74 L115 75 L113 79 L111 75 L107 74 L111 73 Z"
        fill="#1d2bdb"
      />

      {/* Nose */}
      <path
        d="M98 76 L101 84 L97 86"
        stroke="#1d2bdb"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Big Ecstatic Laughing Mouth with teeth */}
      <path
        d="M86 88 C86 102, 114 102, 114 88 H86 Z"
        fill="#ffffff"
        stroke="#1d2bdb"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
    </svg>
  );
};

// ----------------------------------------------------
// 8. EVA CUIDADORA CHARACTER (Caring with top bun)
// Soft gentle smile, neat bun, compassionate gaze
// ----------------------------------------------------
export const EvaCuidadoraCharacter: React.FC<CharacterProps> = ({ size = 200, className }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Top Bun on Head */}
      <circle cx="100" cy="24" r="16" fill="#1d2bdb" stroke="#1d2bdb" strokeWidth="3" />

      {/* Torso - Orange Shirt */}
      <path
        d="M60 145 C60 125, 75 118, 100 118 C125 118, 140 125, 140 145 L145 190 H55 Z"
        fill="#db7457"
        stroke="#1d2bdb"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <path
        d="M85 119 C85 125, 115 125, 115 119"
        stroke="#1d2bdb"
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Neck */}
      <path
        d="M88 100 V120 H112 V100 Z"
        fill="#cbeee5"
        stroke="#1d2bdb"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Head */}
      <path
        d="M75 62 C75 40, 125 40, 125 62 C125 82, 122 103, 100 105 C78 103, 75 82, 75 62 Z"
        fill="#cbeee5"
        stroke="#1d2bdb"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Sleek Hair on Head */}
      <path
        d="M75 52 C71 52, 68 46, 74 38 C80 28, 90 28, 100 28 C110 28, 120 28, 126 38 C132 46, 129 52, 125 52 C115 42, 110 38, 100 38 C90 38, 85 42, 75 52 Z"
        fill="#1d2bdb"
        stroke="#1d2bdb"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Soft caring curved eyebrows */}
      <path
        d="M78 68 C83 63, 89 63, 93 68"
        stroke="#1d2bdb"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M107 68 C111 63, 117 63, 122 68"
        stroke="#1d2bdb"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Warm compassionate eyes */}
      <circle cx="87" cy="74" r="4" fill="#1d2bdb" />
      <circle cx="113" cy="74" r="4" fill="#1d2bdb" />

      {/* Nose */}
      <path
        d="M98 76 L101 84 L97 86"
        stroke="#1d2bdb"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Friendly warm smiling curve */}
      <path
        d="M90 92 C94 95, 106 95, 110 92"
        stroke="#1d2bdb"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
};

// ----------------------------------------------------
// 9. ZURI SENSIBLE CHARACTER (Top-Left, Image 1 style)
// Slanted concerned eyebrows, sweet sad down mouth
// ----------------------------------------------------
export const ZuriSensibleCharacter: React.FC<CharacterProps> = ({ size = 200, className }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g transform="rotate(3, 100, 100)">
        {/* Torso - Orange Shirt */}
        <path
          d="M60 145 C60 125, 75 118, 100 118 C125 118, 140 125, 140 145 L145 190 H55 Z"
          fill="#db7457"
          stroke="#1d2bdb"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <path
          d="M85 119 C85 125, 115 125, 115 119"
          stroke="#1d2bdb"
          strokeWidth="3.5"
          fill="none"
          strokeLinecap="round"
        />

        {/* Neck */}
        <path
          d="M88 100 V120 H112 V100 Z"
          fill="#cbeee5"
          stroke="#1d2bdb"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Head */}
        <path
          d="M75 60 C75 38, 125 38, 125 60 C125 80, 122 104, 100 106 C78 104, 75 80, 75 60 Z"
          fill="#cbeee5"
          stroke="#1d2bdb"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Soft curly hair */}
        <path
          d="M68 54 C58 54, 52 44, 62 34 C72 16, 85 14, 100 14 C115 14, 128 16, 138 34 C148 44, 142 54, 132 54 C124 44, 115 40, 100 40 C85 40, 76 44, 68 54 Z"
          fill="#1d2bdb"
          stroke="#1d2bdb"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Concerned, slanted eyebrows */}
        <path
          d="M78 68 C83 71, 89 71, 92 67"
          stroke="#1d2bdb"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M108 67 C111 71, 117 71, 122 68"
          stroke="#1d2bdb"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Glistening sad eyes looking down */}
        <ellipse cx="87" cy="76" rx="3.5" ry="4.5" fill="#1d2bdb" />
        <ellipse cx="113" cy="76" rx="3.5" ry="4.5" fill="#1d2bdb" />
        <path d="M84 81 Q87 83 90 81" stroke="#1d2bdb" strokeWidth="1.5" fill="none" />
        <path d="M110 81 Q113 83 116 81" stroke="#1d2bdb" strokeWidth="1.5" fill="none" />

        {/* Nose */}
        <path
          d="M98 76 L101 84 L97 86"
          stroke="#1d2bdb"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Gentle down-turned mouth */}
        <path
          d="M93 94 C96 92, 104 92, 107 94"
          stroke="#1d2bdb"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
      </g>
    </svg>
  );
};

// ----------------------------------------------------
// 10. JUNE RUMIADORA CHARACTER (Bottom-Middle, Image 1)
// Messy wind-blown hair, skeptical side look, thinking frown
// ----------------------------------------------------
export const JuneRumiadoraCharacter: React.FC<CharacterProps> = ({ size = 200, className }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Torso - Orange Shirt */}
      <path
        d="M60 145 C60 125, 75 118, 100 118 C125 118, 140 125, 140 145 L145 190 H55 Z"
        fill="#db7457"
        stroke="#1d2bdb"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <path
        d="M85 119 C85 125, 115 125, 115 119"
        stroke="#1d2bdb"
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Neck */}
      <path
        d="M88 100 V120 H112 V100 Z"
        fill="#cbeee5"
        stroke="#1d2bdb"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Head */}
      <path
        d="M75 60 C75 38, 125 38, 125 60 C125 80, 122 104, 100 106 C78 104, 75 80, 75 60 Z"
        fill="#cbeee5"
        stroke="#1d2bdb"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Messy curly rumiadora hair */}
      <path
        d="M65 52 C55 52, 50 42, 58 32 C68 14, 82 10, 100 10 C118 10, 132 14, 142 32 C150 42, 145 52, 135 52 C125 42, 115 38, 100 38 C85 38, 75 42, 65 52 Z"
        fill="#1d2bdb"
        stroke="#1d2bdb"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Skeptical thinking eyebrows */}
      <path
        d="M78 68 C82 66, 88 66, 92 69"
        stroke="#1d2bdb"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M106 66 C110 68, 116 68, 120 65"
        stroke="#1d2bdb"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Side-looking rumiando eyes */}
      <ellipse cx="91" cy="75" rx="3.5" ry="4.5" fill="#1d2bdb" />
      <ellipse cx="117" cy="75" rx="3.5" ry="4.5" fill="#1d2bdb" />

      {/* Nose */}
      <path
        d="M98 76 L101 84 L97 86"
        stroke="#1d2bdb"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Slightly open puzzled talking mouth */}
      <path
        d="M94 92 C94 96, 106 96, 106 92 Z"
        fill="#ffffff"
        stroke="#1d2bdb"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  );
};

// ----------------------------------------------------
// 11. OLI COMPLACIENTE CHARACTER (Bottom-Left, Image 2)
// Big surprised eyes, open 'O' mouth of shock
// ----------------------------------------------------
export const OliComplacienteCharacter: React.FC<CharacterProps> = ({ size = 200, className }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Torso - Orange Shirt */}
      <path
        d="M60 145 C60 125, 75 118, 100 118 C125 118, 140 125, 140 145 L145 190 H55 Z"
        fill="#db7457"
        stroke="#1d2bdb"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <path
        d="M85 119 C85 125, 115 125, 115 119"
        stroke="#1d2bdb"
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Neck */}
      <path
        d="M88 100 V120 H112 V100 Z"
        fill="#cbeee5"
        stroke="#1d2bdb"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Head */}
      <path
        d="M75 60 C75 38, 125 38, 125 60 C125 80, 122 104, 100 106 C78 104, 75 80, 75 60 Z"
        fill="#cbeee5"
        stroke="#1d2bdb"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Neat basic short hair */}
      <path
        d="M72 50 C66 50, 62 42, 68 34 C74 22, 88 16, 100 16 C112 16, 126 22, 132 34 C138 42, 134 50, 128 50 C120 40, 112 36, 100 36 C88 36, 80 40, 72 50 Z"
        fill="#1d2bdb"
        stroke="#1d2bdb"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Highly arched surprised eyebrows */}
      <path
        d="M78 62 C82 56, 88 56, 92 62"
        stroke="#1d2bdb"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M108 62 C112 56, 118 56, 122 62"
        stroke="#1d2bdb"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Big wide round eyes */}
      <circle cx="85" cy="74" r="6" fill="#ffffff" stroke="#1d2bdb" strokeWidth="2.5" />
      <circle cx="85" cy="74" r="2.5" fill="#1d2bdb" />
      
      <circle cx="115" cy="74" r="6" fill="#ffffff" stroke="#1d2bdb" strokeWidth="2.5" />
      <circle cx="115" cy="74" r="2.5" fill="#1d2bdb" />

      {/* Nose */}
      <path
        d="M98 76 L101 84 L97 86"
        stroke="#1d2bdb"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Wide open 'O' shaped shocked mouth */}
      <circle cx="100" cy="94" r="7" fill="#ffffff" stroke="#1d2bdb" strokeWidth="3.5" />
    </svg>
  );
};

// ----------------------------------------------------
// 12. SQUATTING INTRO CHARACTER (Top-Middle, Image 1 style)
// Wild angry/passionate hair, clenched teeth, robust frame
// ----------------------------------------------------
export const SquattingIntroCharacter: React.FC<CharacterProps> = ({ size = 200, className }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Torso - Orange Shirt */}
      <path
        d="M60 145 C60 125, 75 118, 100 118 C125 118, 140 125, 140 145 L145 190 H55 Z"
        fill="#db7457"
        stroke="#1d2bdb"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <path
        d="M85 119 C85 125, 115 125, 115 119"
        stroke="#1d2bdb"
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Neck */}
      <path
        d="M88 100 V120 H112 V100 Z"
        fill="#cbeee5"
        stroke="#1d2bdb"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Head */}
      <path
        d="M75 60 C75 38, 125 38, 125 60 C125 80, 122 104, 100 106 C78 104, 75 80, 75 60 Z"
        fill="#cbeee5"
        stroke="#1d2bdb"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Spiky angry wind hair */}
      <path
        d="M66 52 C56 50, 52 38, 62 28 C74 16, 90 12, 100 12 C110 12, 126 16, 138 28 C148 38, 144 50, 134 52 C124 40, 115 34, 100 34 C85 34, 76 40, 66 52 Z"
        fill="#1d2bdb"
        stroke="#1d2bdb"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <path
        d="M80 22 L84 15 L90 22"
        stroke="#1d2bdb"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M110 22 L114 15 L120 22"
        stroke="#1d2bdb"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />

      {/* Strongly furrowed angry eyebrows */}
      <path
        d="M78 68 L92 73"
        stroke="#1d2bdb"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M122 68 L108 73"
        stroke="#1d2bdb"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Direct intense eyes */}
      <circle cx="86" cy="77" r="4.5" fill="#1d2bdb" />
      <circle cx="114" cy="77" r="4.5" fill="#1d2bdb" />

      {/* Nose */}
      <path
        d="M98 76 L101 84 L97 86"
        stroke="#1d2bdb"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Clenched angry grill teeth mouth */}
      <path
        d="M88 92 H112 V98 H88 Z"
        fill="#ffffff"
        stroke="#1d2bdb"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <path d="M88 95 H112" stroke="#1d2bdb" strokeWidth="2" />
      <path d="M96 92 V98 M104 92 V98" stroke="#1d2bdb" strokeWidth="2" />
    </svg>
  );
};
