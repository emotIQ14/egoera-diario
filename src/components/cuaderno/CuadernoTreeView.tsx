'use client';

/**
 * Vista Árbol del cuaderno · inspiración HTML "Egoera Cuaderno - Vista Árbol"
 *
 * Tronco horizontal + 3 ramas verticales agrupadas por fase:
 *  - Apertura (cover, editorial, sumario)
 *  - Lectura (section + exercise + quote_break alternados)
 *  - Cierre (map_table, closing)
 *
 * Cada nodo = una página del cuaderno. Click → setPageIndex(n).
 * Nodos completados se pintan en mostaza, no completados con coral.
 */

import { CuadernoPage } from '@/lib/cuadernos-data';

type Props = {
  pages: CuadernoPage[];
  pageIndex: number;
  completedPages: number[];
  onSelectPage: (idx: number) => void;
  cuadernoTitle: string;
  cuadernoIssue: string;
};

type Branch = {
  label: string;
  emName: string;
  color: string;
  side: 'left' | 'right' | 'center';
  indices: number[];
};

function classifyBranches(pages: CuadernoPage[]): Branch[] {
  const apertura: number[] = [];
  const lectura: number[] = [];
  const cierre: number[] = [];
  pages.forEach((p, i) => {
    if (p.type === 'cover' || p.type === 'editorial' || p.type === 'sumario') {
      apertura.push(i);
    } else if (p.type === 'map_table' || p.type === 'closing') {
      cierre.push(i);
    } else {
      lectura.push(i);
    }
  });
  return [
    { label: 'Apertura', emName: 'cómo entras', color: '#1d2bdb', side: 'left', indices: apertura },
    { label: 'Lectura', emName: 'el cuerpo', color: '#d97757', side: 'center', indices: lectura },
    { label: 'Cierre', emName: 'el mapa', color: '#f4c842', side: 'right', indices: cierre },
  ];
}

function pageLabel(page: CuadernoPage): string {
  switch (page.type) {
    case 'cover': return 'Portada';
    case 'editorial': return 'Editorial';
    case 'sumario': return 'Sumario';
    case 'section': return page.h ?? 'Teoría';
    case 'exercise': return page.h ?? 'Ejercicio';
    case 'quote_break': return 'Pausa · cita';
    case 'map_table': return page.h ?? 'Mapa';
    case 'closing': return 'Cierre';
  }
}

function pageKind(page: CuadernoPage): string {
  switch (page.type) {
    case 'cover': return 'Portada';
    case 'editorial': return 'Carta';
    case 'sumario': return 'Sumario';
    case 'section': return 'Teoría';
    case 'exercise': return 'Ejercicio';
    case 'quote_break': return 'Pausa';
    case 'map_table': return 'Mapa';
    case 'closing': return 'Cierre';
  }
}

export default function CuadernoTreeView({
  pages,
  pageIndex,
  completedPages,
  onSelectPage,
  cuadernoTitle,
  cuadernoIssue,
}: Props) {
  const branches = classifyBranches(pages);
  const branchPositions: Record<'left' | 'right' | 'center', { x: number; angle: number }> = {
    left: { x: 200, angle: -90 },
    center: { x: 500, angle: -90 },
    right: { x: 800, angle: -90 },
  };
  const trunkY = 540;
  const W = 1000;
  const H = 620;

  return (
    <div className="tv">
      <header className="tv-head">
        <span className="tv-eyebrow">— ÁRBOL DEL CUADERNO —</span>
        <h2 className="tv-title">
          Las <em>ramas</em>.
        </h2>
        <p className="tv-sub">
          {cuadernoIssue} · {cuadernoTitle}. Toca cualquier hoja para abrir esa página.
        </p>
      </header>

      <svg
        className="tv-svg"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        aria-label="Árbol del cuaderno"
      >
        {/* Sombra del tronco */}
        <line
          x1={120}
          y1={trunkY}
          x2={880}
          y2={trunkY}
          stroke="#1d2bdb"
          strokeWidth={14}
          strokeOpacity={0.08}
          strokeLinecap="round"
        />
        {/* Tronco horizontal */}
        <line
          x1={120}
          y1={trunkY}
          x2={880}
          y2={trunkY}
          stroke="#1d2bdb"
          strokeWidth={2.5}
          strokeLinecap="round"
        />

        {/* Anclas en los extremos */}
        <circle cx={120} cy={trunkY} r={7} fill="#1d2bdb" opacity={0.65} />
        <circle cx={880} cy={trunkY} r={7} fill="#d97757" />

        {/* Texto del tronco */}
        <text
          x={500}
          y={trunkY + 32}
          textAnchor="middle"
          fontFamily="JetBrains Mono, monospace"
          fontSize={10}
          letterSpacing="2.4"
          fill="rgba(241,234,216,0.72)"
        >
          EGOERA · {cuadernoIssue.toUpperCase()}
        </text>

        {/* Ramas */}
        {branches.map((branch) => {
          const pos = branchPositions[branch.side];
          const branchTop = 80;
          const branchHeight = trunkY - branchTop;
          return (
            <g key={branch.label}>
              {/* Sombra de la rama */}
              <line
                x1={pos.x}
                y1={trunkY}
                x2={pos.x}
                y2={branchTop}
                stroke={branch.color}
                strokeWidth={10}
                strokeOpacity={0.12}
                strokeLinecap="round"
              />
              {/* Rama */}
              <line
                x1={pos.x}
                y1={trunkY}
                x2={pos.x}
                y2={branchTop}
                stroke={branch.color}
                strokeWidth={2.5}
                strokeLinecap="round"
              />

              {/* Nodos (hojas) */}
              {branch.indices.map((pageIdx, i) => {
                const total = branch.indices.length;
                // Distribución vertical en la rama
                const t = total === 1 ? 0.5 : i / (total - 1);
                const y = trunkY - 40 - t * (branchHeight - 80);
                const completed = completedPages.includes(pageIdx);
                const isActive = pageIdx === pageIndex;
                return (
                  <g
                    key={pageIdx}
                    className={`tv-node ${isActive ? 'active' : ''}`}
                    onClick={() => onSelectPage(pageIdx)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Halo activo */}
                    {isActive && (
                      <circle
                        cx={pos.x}
                        cy={y}
                        r={20}
                        fill="none"
                        stroke={branch.color}
                        strokeWidth={1.5}
                        strokeDasharray="3 3"
                        opacity={0.6}
                      />
                    )}
                    {/* Disco */}
                    <circle
                      cx={pos.x}
                      cy={y}
                      r={isActive ? 12 : 9}
                      fill={completed ? '#f4c842' : branch.color}
                      stroke="#1d2bdb"
                      strokeWidth={1.5}
                    />
                    {/* Número de página dentro */}
                    <text
                      x={pos.x}
                      y={y + 3}
                      textAnchor="middle"
                      fontFamily="JetBrains Mono, monospace"
                      fontSize={7}
                      fontWeight={600}
                      fill={completed ? '#0d0f3d' : '#f1ead8'}
                      style={{ pointerEvents: 'none' }}
                    >
                      {String(pageIdx + 1).padStart(2, '0')}
                    </text>
                    {/* Label lateral */}
                    <text
                      x={pos.x + (branch.side === 'left' ? -22 : 22)}
                      y={y + 3}
                      textAnchor={branch.side === 'left' ? 'end' : 'start'}
                      fontFamily="Fraunces, serif"
                      fontStyle="italic"
                      fontSize={10}
                      fill="rgba(241,234,216,0.78)"
                      style={{ pointerEvents: 'none' }}
                    >
                      {pageLabel(pages[pageIdx]).slice(0, 22)}
                    </text>
                  </g>
                );
              })}

              {/* Etiqueta de rama (arriba) */}
              <text
                x={pos.x}
                y={branchTop - 28}
                textAnchor="middle"
                fontFamily="JetBrains Mono, monospace"
                fontSize={9}
                letterSpacing="2.2"
                fill="rgba(241,234,216,0.5)"
              >
                {branch.label.toUpperCase()}
              </text>
              <text
                x={pos.x}
                y={branchTop - 6}
                textAnchor="middle"
                fontFamily="Caveat, cursive"
                fontStyle="italic"
                fontWeight={600}
                fontSize={28}
                fill={branch.color}
              >
                {branch.label}.
              </text>
              <text
                x={pos.x}
                y={branchTop + 16}
                textAnchor="middle"
                fontFamily="Fraunces, serif"
                fontStyle="italic"
                fontSize={11}
                fill="rgba(241,234,216,0.45)"
              >
                {branch.emName}
              </text>
              <text
                x={pos.x}
                y={branchTop + 36}
                textAnchor="middle"
                fontFamily="JetBrains Mono, monospace"
                fontSize={9}
                letterSpacing="1.8"
                fill={branch.color}
                fillOpacity={0.85}
              >
                · {branch.indices.length} {branch.indices.length === 1 ? 'hoja' : 'hojas'} ·
              </text>
            </g>
          );
        })}
      </svg>

      <footer className="tv-foot">
        <span>
          <strong>{completedPages.length}</strong> de {pages.length} leídas
        </span>
        <span className="tv-foot-dot">·</span>
        <span>
          <strong>{pageIndex + 1}</strong> donde estás
        </span>
        <span className="tv-foot-dot">·</span>
        <span>{pageKind(pages[pageIndex])}</span>
      </footer>

      <style jsx>{`
        .tv {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 12px 4px;
          min-height: 540px;
          width: 100%;
        }
        @media (min-width: 768px) {
          .tv {
            gap: 18px;
            padding: 18px 8px;
            min-height: 640px;
          }
        }
        .tv-head {
          text-align: center;
          margin-bottom: 4px;
        }
        .tv-eyebrow {
          display: block;
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.26em;
          color: #f4c842;
          margin-bottom: 6px;
        }
        .tv-title {
          font-family: var(--font-display);
          font-weight: 300;
          font-size: clamp(26px, 4.5vw, 38px);
          line-height: 1.05;
          color: var(--crema);
          margin: 0;
          letter-spacing: -0.01em;
        }
        .tv-title em {
          font-style: italic;
          color: #d97757;
        }
        .tv-sub {
          font-family: var(--font-body);
          font-size: 12.5px;
          color: rgba(241, 234, 216, 0.62);
          margin: 6px 0 0;
          font-style: italic;
        }
        .tv-svg {
          flex: 1;
          width: 100%;
          max-height: 560px;
          background:
            radial-gradient(circle at 30% 30%, rgba(217, 119, 87, 0.05), transparent 40%),
            radial-gradient(circle at 70% 70%, rgba(244, 200, 66, 0.06), transparent 50%);
          border-radius: 16px;
          border: 1px solid rgba(241, 234, 216, 0.10);
        }
        .tv-node circle {
          transition: r 0.2s ease, transform 0.2s ease;
          transform-origin: center;
          transform-box: fill-box;
        }
        .tv-node:hover circle {
          r: 13;
        }
        .tv-node.active circle {
          filter: drop-shadow(0 0 6px rgba(244, 200, 66, 0.55));
        }
        .tv-foot {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          padding: 8px 0 4px;
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(241, 234, 216, 0.55);
        }
        .tv-foot strong {
          color: #f4c842;
          font-family: var(--font-display);
          font-style: italic;
          font-size: 16px;
          font-weight: 500;
          letter-spacing: -0.01em;
          text-transform: none;
          margin-right: 4px;
        }
        .tv-foot-dot {
          opacity: 0.35;
        }
      `}</style>
    </div>
  );
}
