import React from 'react';
import { Color } from '../types/chess';

interface EvalBarProps {
  score: number; // in pawns e.g. +1.4 (relative to White)
  mate?: number; // mate in N (positive for White, negative for Black)
  orientation: Color;
}

export const EvalBar: React.FC<EvalBarProps> = ({ score, mate, orientation }) => {
  // Convert centipawn / pawn evaluation into percentage height (0 to 100% for White)
  // Logistic function: p = 50 + 50 * (2 / (1 + exp(-0.35 * score)) - 1)
  let whitePercent = 50;

  if (mate !== undefined) {
    whitePercent = mate > 0 ? 100 : 0;
  } else {
    // Standard logistic curve
    const clampedScore = Math.max(-15, Math.min(15, score));
    whitePercent = 50 + 50 * (2 / (1 + Math.exp(-0.35 * clampedScore)) - 1);
    whitePercent = Math.max(3, Math.min(97, whitePercent));
  }

  // Display text formatted nicely
  let displayText = '';
  if (mate !== undefined) {
    displayText = `M${Math.abs(mate)}`;
  } else {
    const absScore = Math.abs(score).toFixed(1);
    displayText = score > 0 ? `+${absScore}` : score < 0 ? `-${absScore}` : '0.0';
  }

  const isWhiteAdvantage = mate !== undefined ? mate > 0 : score >= 0;
  const isFlipped = orientation === 'b';

  return (
    <div className="relative w-8 md:w-9 h-full min-h-[460px] md:min-h-[540px] bg-[#1a1e27] rounded-lg overflow-hidden border border-slate-700/60 shadow-inner flex flex-col justify-end select-none shrink-0">
      {/* Black area (top if normal, bottom if flipped) */}
      <div
        className="w-full bg-[#181a20] transition-all duration-300 ease-out"
        style={{
          height: isFlipped ? `${whitePercent}%` : `${100 - whitePercent}%`,
        }}
      />

      {/* White area */}
      <div
        className="w-full bg-[#f1f5f9] transition-all duration-300 ease-out"
        style={{
          height: isFlipped ? `${100 - whitePercent}%` : `${whitePercent}%`,
        }}
      />

      {/* Center 0.0 midline */}
      <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-slate-400/40 pointer-events-none" />

      {/* Evaluation text badge anchored to the leading side */}
      <div
        className={`absolute left-0 right-0 py-1 text-[11px] font-bold text-center font-mono tracking-tight transition-all duration-300 ${
          isWhiteAdvantage
            ? isFlipped
              ? 'top-2 text-slate-800'
              : 'bottom-2 text-slate-900'
            : isFlipped
              ? 'bottom-2 text-slate-200'
              : 'top-2 text-slate-200'
        }`}
      >
        {displayText}
      </div>
    </div>
  );
};
