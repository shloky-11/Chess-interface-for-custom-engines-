import React from 'react';
import { Bot, User, Clock, Cpu } from 'lucide-react';
import { Color, PieceSymbol } from '../types/chess';
import { ChessPiece } from './ChessPieces';

interface PlayerCardProps {
  isEngine: boolean;
  name: string;
  elo?: number;
  color: Color;
  isTurn: boolean;
  timeRemaining?: number; // seconds
  isThinking?: boolean;
  capturedPieces: PieceSymbol[];
  materialAdvantage?: number; // positive if this player has material advantage
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  isEngine,
  name,
  elo,
  color,
  isTurn,
  timeRemaining,
  isThinking = false,
  capturedPieces,
  materialAdvantage = 0,
}) => {
  const isWhite = color === 'w';

  // Format time remaining MM:SS
  const formatTime = (secs?: number) => {
    if (secs === undefined || secs < 0) return '∞';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isLowTime = timeRemaining !== undefined && timeRemaining < 30 && timeRemaining > 0;

  // Group captured pieces by type
  const pieceCounts: Record<PieceSymbol, number> = {
    p: 0,
    n: 0,
    b: 0,
    r: 0,
    q: 0,
    k: 0,
  };
  capturedPieces.forEach((p) => {
    pieceCounts[p] = (pieceCounts[p] || 0) + 1;
  });

  const capturedOrder: PieceSymbol[] = ['p', 'n', 'b', 'r', 'q'];

  return (
    <div
      className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl border transition-all duration-200 ${
        isTurn
          ? 'bg-slate-900/90 border-cyan-500/50 shadow-md shadow-cyan-950/20'
          : 'bg-[#141720]/80 border-slate-800'
      }`}
    >
      {/* Avatar & Player Info */}
      <div className="flex items-center gap-2.5">
        <div
          className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center shrink-0 border ${
            isWhite ? 'bg-slate-200 text-slate-900 border-slate-300' : 'bg-slate-800 text-slate-100 border-slate-700'
          }`}
        >
          {isEngine ? (
            <Bot className="w-5 h-5 text-cyan-400" />
          ) : (
            <User className="w-5 h-5 text-slate-300" />
          )}

          {/* Turn indicator ping */}
          {isTurn && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-slate-900 animate-pulse" />
          )}
        </div>

        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs sm:text-sm font-bold text-slate-100 truncate max-w-[130px] sm:max-w-[160px]">
              {name}
            </span>
            {elo && (
              <span className="text-[10px] font-mono font-semibold text-slate-400 bg-slate-800/80 px-1.5 py-0.2 rounded border border-slate-700">
                {elo}
              </span>
            )}
          </div>

          {/* Captured Pieces Strip */}
          <div className="flex items-center gap-1 mt-0.5">
            <div className="flex items-center -space-x-1">
              {capturedOrder.map((sym) => {
                const count = pieceCounts[sym];
                if (count <= 0) return null;
                return (
                  <div key={sym} className="flex items-center" title={`${count}x ${sym.toUpperCase()}`}>
                    <div className="w-4 h-4">
                      {/* Captured pieces have the opposite color */}
                      <ChessPiece type={sym} color={isWhite ? 'b' : 'w'} />
                    </div>
                    {count > 1 && (
                      <span className="text-[9px] font-mono text-slate-400 mr-1">
                        ×{count}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {materialAdvantage > 0 && (
              <span className="text-[10px] font-mono font-bold text-emerald-400 ml-1">
                +{materialAdvantage}
              </span>
            )}

            {isThinking && (
              <span className="text-[10px] text-amber-400 flex items-center gap-1 ml-1 font-mono">
                <Cpu className="w-2.5 h-2.5 animate-spin" /> thinking...
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Clock Display */}
      <div
        className={`flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg font-mono text-xs sm:text-sm font-bold tabular-nums transition border ${
          isLowTime
            ? 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse'
            : isTurn
              ? 'bg-slate-800 text-slate-100 border-slate-700 shadow-inner'
              : 'bg-slate-900/60 text-slate-400 border-slate-800/60'
        }`}
      >
        <Clock className="w-3.5 h-3.5 text-slate-400" />
        <span>{formatTime(timeRemaining)}</span>
      </div>
    </div>
  );
};
