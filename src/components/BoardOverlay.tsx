import React from 'react';
import { Color, MoveClassification, Square } from '../types/chess';

interface ArrowData {
  from: Square;
  to: Square;
  color?: string; // e.g. '#06b6d4' (cyan) or '#10b981' (emerald)
  width?: number;
}

interface AlertData {
  square: Square;
  classification: MoveClassification;
}

interface BoardOverlayProps {
  bestMoveArrow?: ArrowData | null;
  lastMoveBlunder?: AlertData | null;
  orientation: Color;
}

function squareToCoords(square: Square, orientation: Color): { x: number; y: number } {
  const file = square.charCodeAt(0) - 97; // 0-7
  const rank = parseInt(square[1], 10) - 1; // 0-7

  // If orientation is white: rank 8 is top (row 0), rank 1 is bottom (row 7)
  // file a is left (col 0), file h is right (col 7)
  let col = file;
  let row = 7 - rank;

  if (orientation === 'b') {
    col = 7 - file;
    row = rank;
  }

  // Each square is 12.5% (1/8th of 100)
  return {
    x: col * 12.5 + 6.25,
    y: row * 12.5 + 6.25,
  };
}

export const BoardOverlay: React.FC<BoardOverlayProps> = ({
  bestMoveArrow,
  lastMoveBlunder,
  orientation,
}) => {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none z-20"
      viewBox="0 0 100 100"
    >
      <defs>
        {/* Best move arrow marker */}
        <marker
          id="arrowhead-best"
          markerWidth="4"
          markerHeight="4"
          refX="2.5"
          refY="2"
          orient="auto"
        >
          <polygon points="0 0, 4 2, 0 4" fill="#06b6d4" />
        </marker>
        {/* Blunder arrow marker */}
        <marker
          id="arrowhead-blunder"
          markerWidth="4"
          markerHeight="4"
          refX="2.5"
          refY="2"
          orient="auto"
        >
          <polygon points="0 0, 4 2, 0 4" fill="#ef4444" />
        </marker>
      </defs>

      {/* Real-time Best Move Arrow */}
      {bestMoveArrow && (
        (() => {
          const start = squareToCoords(bestMoveArrow.from, orientation);
          const end = squareToCoords(bestMoveArrow.to, orientation);

          // Shorten line slightly so arrow head sits right in square center
          const dx = end.x - start.x;
          const dy = end.y - start.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          if (len === 0) return null;

          const trim = 2.5;
          const targetX = end.x - (dx / len) * trim;
          const targetY = end.y - (dy / len) * trim;

          return (
            <line
              x1={start.x}
              y1={start.y}
              x2={targetX}
              y2={targetY}
              stroke={bestMoveArrow.color || '#06b6d4'}
              strokeWidth={bestMoveArrow.width || 2.2}
              strokeLinecap="round"
              strokeOpacity="0.85"
              markerEnd="url(#arrowhead-best)"
            />
          );
        })()
      )}

      {/* Blunder Alert badge on affected square */}
      {lastMoveBlunder && (
        (() => {
          const pos = squareToCoords(lastMoveBlunder.square, orientation);
          const isBlunder = lastMoveBlunder.classification === 'blunder';
          const isMistake = lastMoveBlunder.classification === 'mistake';

          if (!isBlunder && !isMistake) return null;

          return (
            <g transform={`translate(${pos.x + 3.2}, ${pos.y - 5.5})`}>
              <circle
                r="3.2"
                fill={isBlunder ? '#ef4444' : '#f59e0b'}
                stroke="#0f172a"
                strokeWidth="0.6"
              />
              <text
                textAnchor="middle"
                dy="1.2"
                fill="#ffffff"
                fontSize="3.2"
                fontWeight="bold"
                fontFamily="sans-serif"
              >
                {isBlunder ? '??' : '?'}
              </text>
            </g>
          );
        })()
      )}
    </svg>
  );
};
