import React from 'react';
import { Color, PieceSymbol } from '../types/chess';

interface ChessPieceProps {
  type: PieceSymbol;
  color: Color;
  className?: string;
}

export const ChessPiece: React.FC<ChessPieceProps> = ({ type, color, className = 'w-full h-full' }) => {
  const isWhite = color === 'w';

  // SVG piece silhouettes with high visual fidelity for Tournament chess
  switch (type) {
    case 'k': // King
      return (
        <svg viewBox="0 0 45 45" className={className} fill="none">
          {/* Base */}
          <path
            d="M 22.5 11.63 L 22.5 6 M 20 8 L 25 8"
            stroke={isWhite ? '#1e293b' : '#f8fafc'}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M 22.5 25 C 22.5 25 27 17.5 25.5 14.5 C 24 11.5 21 11.5 19.5 14.5 C 18 17.5 22.5 25 22.5 25 Z"
            fill={isWhite ? '#ffffff' : '#1e293b'}
            stroke={isWhite ? '#0f172a' : '#e2e8f0'}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M 11.5 37 C 17 40.5 28 40.5 33.5 37 C 34.5 30 31.5 24.5 29.5 22 C 27.5 19.5 22.5 19.5 22.5 19.5 C 22.5 19.5 17.5 19.5 15.5 22 C 13.5 24.5 10.5 30 11.5 37 Z"
            fill={isWhite ? '#ffffff' : '#1e293b'}
            stroke={isWhite ? '#0f172a' : '#e2e8f0'}
            strokeWidth="1.5"
          />
          <path
            d="M 11.5 30 C 17 27 28 27 33.5 30 M 11.5 33.5 C 17 30.5 28 30.5 33.5 33.5 M 11.5 37 C 17 34 28 34 33.5 37"
            stroke={isWhite ? '#0f172a' : '#e2e8f0'}
            strokeWidth="1.2"
          />
        </svg>
      );

    case 'q': // Queen
      return (
        <svg viewBox="0 0 45 45" className={className} fill="none">
          <g
            fill={isWhite ? '#ffffff' : '#1e293b'}
            stroke={isWhite ? '#0f172a' : '#e2e8f0'}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="6" cy="12" r="2" />
            <circle cx="14" cy="9" r="2" />
            <circle cx="22.5" cy="8" r="2" />
            <circle cx="31" cy="9" r="2" />
            <circle cx="39" cy="12" r="2" />
            <path d="M 9 26 C 17.5 24.5 30 24.5 36 26 L 38 14 L 31 25 L 22.5 12 L 14 25 L 7 14 L 9 26 Z" />
            <path d="M 9 26 C 9 28 10.5 37 10.5 37 C 17 40.5 28 40.5 34.5 37 C 34.5 37 36 28 36 26 C 27.5 24.5 17.5 24.5 9 26 Z" />
            <path d="M 11 32 C 17 29.5 28 29.5 34 32" fill="none" strokeWidth="1.2" />
            <path d="M 10.5 37 C 17 34.5 28 34.5 34.5 37" fill="none" strokeWidth="1.2" />
          </g>
        </svg>
      );

    case 'r': // Rook
      return (
        <svg viewBox="0 0 45 45" className={className} fill="none">
          <g
            fill={isWhite ? '#ffffff' : '#1e293b'}
            stroke={isWhite ? '#0f172a' : '#e2e8f0'}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M 9 39 L 36 39 L 36 36 L 9 36 Z" />
            <path d="M 12 36 L 12 32 L 33 32 L 33 36 Z" />
            <path d="M 11 14 L 11 9 L 15 9 L 15 11 L 20 11 L 20 9 L 25 9 L 25 11 L 30 11 L 30 9 L 34 9 L 34 14 Z" />
            <path d="M 34 14 L 31 17 L 14 17 L 11 14 Z" />
            <path d="M 31 17 L 31 29.5 C 31 29.5 28 31 22.5 31 C 17 31 14 29.5 14 29.5 L 14 17 Z" />
            <path d="M 14 29.5 L 12 32 L 33 32 L 31 29.5 Z" />
          </g>
        </svg>
      );

    case 'b': // Bishop
      return (
        <svg viewBox="0 0 45 45" className={className} fill="none">
          <g
            fill={isWhite ? '#ffffff' : '#1e293b'}
            stroke={isWhite ? '#0f172a' : '#e2e8f0'}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="22.5" cy="8.5" r="1.5" />
            <path d="M 9 36 C 12.39 35.03 19.11 36.43 22.5 34 C 25.89 36.43 32.61 35.03 36 36 C 36 36 37.65 36.54 39 38 C 38.32 38.97 37.14 39.99 35 40 C 30 40 15 40 10 40 C 7.86 39.99 6.68 38.97 6 38 C 7.35 36.54 9 36 9 36 Z" />
            <path d="M 15 32 C 17.5 34.5 27.5 34.5 30 32 C 30.5 30.5 30 28 29 26 C 27.5 22.5 27 18 22.5 13 C 18 18 17.5 22.5 16 26 C 15 28 14.5 30.5 15 32 Z" />
            <path d="M 25 15 L 20 22 M 20 18 L 25 25" strokeWidth="1.2" />
          </g>
        </svg>
      );

    case 'n': // Knight
      return (
        <svg viewBox="0 0 45 45" className={className} fill="none">
          <g
            fill={isWhite ? '#ffffff' : '#1e293b'}
            stroke={isWhite ? '#0f172a' : '#e2e8f0'}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M 22 10 C 32.5 11 38.5 18 38 39 L 9 39 C 9 34 11 27 15 23 C 12.5 18 11.5 12 17 8 C 17.5 7.5 19 8.5 20.5 9.5 C 22 8 24 7.5 26.5 8 C 26.5 8 28.5 10 27.5 13 C 32 12.5 35 15.5 33 21 C 29.5 19 25 20 21 21 C 18 21.5 16 23.5 16 26 C 17 26.5 19 26 21 25.5 C 23.5 25 26 25.5 27 27 C 28.5 29 27 32 25 33 C 22.5 34 20 33 19 31 C 17 29.5 16.5 27.5 16 26" />
            <circle cx="20" cy="15" r="1.5" fill={isWhite ? '#0f172a' : '#f8fafc'} />
          </g>
        </svg>
      );

    case 'p': // Pawn
    default:
      return (
        <svg viewBox="0 0 45 45" className={className} fill="none">
          <g
            fill={isWhite ? '#ffffff' : '#1e293b'}
            stroke={isWhite ? '#0f172a' : '#e2e8f0'}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M 22 9 C 19.79 9 18 10.79 18 13 C 18 13.89 18.29 14.71 18.78 15.38 C 16.83 16.5 15.5 18.59 15.5 21 C 15.5 23.03 16.44 24.84 17.91 26.03 C 14.91 27.09 10.5 31.58 10.5 39.5 L 33.5 39.5 C 33.5 31.58 29.09 27.09 26.09 26.03 C 27.56 24.84 28.5 23.03 28.5 21 C 28.5 18.59 27.17 16.5 25.22 15.38 C 25.71 14.71 26 13.89 26 13 C 26 10.79 24.21 9 22 9 Z" />
          </g>
        </svg>
      );
  }
};
