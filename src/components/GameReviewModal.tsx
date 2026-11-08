import React from 'react';
import { X, Trophy, BarChart3, RotateCcw } from 'lucide-react';
import { GameStatus, MoveRecord } from '../types/chess';
import { calculateAccuracy } from '../services/analysisService';

interface GameReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: GameStatus;
  winner?: 'w' | 'b' | 'draw' | null;
  moves: MoveRecord[];
  onSelectPly: (ply: number) => void;
  onNewGame: () => void;
}

export const GameReviewModal: React.FC<GameReviewModalProps> = ({
  isOpen,
  onClose,
  status,
  winner,
  moves,
  onSelectPly,
  onNewGame,
}) => {
  if (!isOpen) return null;

  const whiteAccuracy = calculateAccuracy(moves, 'w');
  const blackAccuracy = calculateAccuracy(moves, 'b');

  // Count move classifications
  const stats = {
    white: { best: 0, inaccuracy: 0, mistake: 0, blunder: 0 },
    black: { best: 0, inaccuracy: 0, mistake: 0, blunder: 0 },
  };

  moves.forEach((m) => {
    const cls = m.analysis?.classification;
    const target = m.color === 'w' ? stats.white : stats.black;
    if (cls === 'brilliant' || cls === 'best' || cls === 'excellent') target.best++;
    else if (cls === 'inaccuracy') target.inaccuracy++;
    else if (cls === 'mistake') target.mistake++;
    else if (cls === 'blunder') target.blunder++;
  });

  const getResultTitle = () => {
    if (status === 'checkmate') {
      return winner === 'w' ? 'White Won by Checkmate' : 'Black Won by Checkmate';
    }
    if (status === 'resigned') {
      return winner === 'w' ? 'Black Resigned — White Wins' : 'White Resigned — Black Wins';
    }
    if (status === 'time_out') {
      return winner === 'w' ? 'Black Timed Out — White Wins' : 'White Timed Out — Black Wins';
    }
    if (status === 'stalemate') return 'Draw by Stalemate';
    if (status === 'threefold_repetition') return 'Draw by Threefold Repetition';
    if (status === 'insufficient_material') return 'Draw by Insufficient Material';
    if (status === 'fifty_moves') return 'Draw by 50-Move Rule';
    return 'Game Completed';
  };

  // Build SVG evaluation graph points
  const graphWidth = 480;
  const graphHeight = 120;
  const numMoves = Math.max(1, moves.length);

  const points = moves.map((m, idx) => {
    const x = (idx / numMoves) * graphWidth;
    const score = m.analysis?.scoreAfter || 0;
    // Map score -5 to +5 pawns to y-axis (clamped)
    const clampedScore = Math.max(-5, Math.min(5, score));
    // When score is +5, y should be near 0 (top). When score is -5, y near height.
    const y = graphHeight / 2 - (clampedScore / 5) * (graphHeight / 2 - 8);
    return { x, y, ply: m.ply, score };
  });

  const pathD = points.length > 0
    ? `M 0,${graphHeight / 2} ` + points.map((p) => `L ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[#141721] border border-slate-700/80 rounded-2xl max-w-xl w-full p-5 shadow-2xl space-y-4 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                {getResultTitle()}
              </h3>
              <p className="text-xs text-slate-400">
                Post-game accuracy analysis & engine evaluation chart
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Accuracy Comparison */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200">White Accuracy</span>
              <span className="font-mono text-lg font-extrabold text-cyan-400">
                {whiteAccuracy}%
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1 text-[11px] font-mono text-center pt-1 border-t border-slate-800/60">
              <div className="bg-slate-800/40 p-1 rounded">
                <span className="block text-emerald-400 font-bold">{stats.white.best}</span>
                <span className="text-[10px] text-slate-400">Best</span>
              </div>
              <div className="bg-slate-800/40 p-1 rounded">
                <span className="block text-amber-400 font-bold">{stats.white.inaccuracy}</span>
                <span className="text-[10px] text-slate-400">Inacc</span>
              </div>
              <div className="bg-slate-800/40 p-1 rounded">
                <span className="block text-rose-400 font-bold">{stats.white.blunder}</span>
                <span className="text-[10px] text-slate-400">Blunder</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200">Black Accuracy</span>
              <span className="font-mono text-lg font-extrabold text-cyan-400">
                {blackAccuracy}%
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1 text-[11px] font-mono text-center pt-1 border-t border-slate-800/60">
              <div className="bg-slate-800/40 p-1 rounded">
                <span className="block text-emerald-400 font-bold">{stats.black.best}</span>
                <span className="text-[10px] text-slate-400">Best</span>
              </div>
              <div className="bg-slate-800/40 p-1 rounded">
                <span className="block text-amber-400 font-bold">{stats.black.inaccuracy}</span>
                <span className="text-[10px] text-slate-400">Inacc</span>
              </div>
              <div className="bg-slate-800/40 p-1 rounded">
                <span className="block text-rose-400 font-bold">{stats.black.blunder}</span>
                <span className="text-[10px] text-slate-400">Blunder</span>
              </div>
            </div>
          </div>
        </div>

        {/* Evaluation Graph */}
        <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
              Game Evaluation Chart (Centipawns)
            </span>
            <span className="text-[10px] text-slate-500">Click graph to jump to move</span>
          </div>

          <div className="relative w-full h-[120px] bg-[#0c0e14] rounded-lg border border-slate-800/80 overflow-hidden">
            {/* Zero line */}
            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-slate-700/60 pointer-events-none" />

            <svg
              className="w-full h-full cursor-pointer"
              viewBox={`0 0 ${graphWidth} ${graphHeight}`}
              preserveAspectRatio="none"
            >
              {pathD && (
                <path
                  d={pathD}
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Interactive Point circles */}
              {points.map((p, i) => (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r="3.5"
                  className="fill-slate-900 stroke-cyan-400 hover:fill-cyan-300 hover:scale-125 transition-transform"
                  strokeWidth="1.5"
                  onClick={() => {
                    onSelectPly(p.ply);
                    onClose();
                  }}
                >
                  <title>Ply {p.ply}: {p.score > 0 ? `+${p.score}` : p.score}</title>
                </circle>
              ))}
            </svg>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
          >
            Review Board
          </button>

          <button
            onClick={() => {
              onClose();
              onNewGame();
            }}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-bold text-white shadow-lg shadow-cyan-950/40 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
};
