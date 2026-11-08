import React from 'react';
import { Gauge, Zap } from 'lucide-react';

interface DifficultyBarProps {
  targetElo: number;
  onChangeElo: (elo: number) => void;
  disabled?: boolean;
}

export const DifficultyBar: React.FC<DifficultyBarProps> = ({
  targetElo,
  onChangeElo,
  disabled = false,
}) => {
  const getTierInfo = (elo: number) => {
    if (elo < 800) return { label: 'Beginner', color: 'text-emerald-400', desc: 'Frequent tactical misses & blunders' };
    if (elo < 1200) return { label: 'Casual', color: 'text-cyan-400', desc: 'Basic piece development & captures' };
    if (elo < 1600) return { label: 'Club Player', color: 'text-blue-400', desc: 'Solid openings & tactical vision' };
    if (elo < 2000) return { label: 'Expert', color: 'text-amber-400', desc: 'Sharp calculation & positional plans' };
    if (elo < 2500) return { label: 'Master', color: 'text-orange-400', desc: 'Relentless endgame & deep search' };
    return { label: 'Super GM', color: 'text-rose-400', desc: 'Flawless calculation & maximum depth' };
  };

  const tier = getTierInfo(targetElo);

  const presets = [
    { elo: 600, label: '600 Novice' },
    { elo: 1200, label: '1200 Casual' },
    { elo: 1650, label: '1650 Club' },
    { elo: 2200, label: '2200 Master' },
    { elo: 2800, label: '2800 GM' },
  ];

  return (
    <div className="bg-[#161922] border border-slate-800 rounded-xl p-3.5 shadow-sm space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Engine Difficulty
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className={`font-bold ${tier.color}`}>{tier.label}</span>
          <span className="text-slate-500 font-mono">·</span>
          <span className="font-mono font-bold text-slate-100 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
            {targetElo} ELO
          </span>
        </div>
      </div>

      {/* Range Slider */}
      <div className="relative pt-1">
        <input
          type="range"
          min="400"
          max="3200"
          step="50"
          value={targetElo}
          disabled={disabled}
          onChange={(e) => onChangeElo(parseInt(e.target.value, 10))}
          className="w-full h-1.5 bg-slate-700/80 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-hidden disabled:opacity-50"
        />
        <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
          <span>400</span>
          <span>1200</span>
          <span>2000</span>
          <span>2800</span>
          <span>3200+</span>
        </div>
      </div>

      <div className="text-[11px] text-slate-400 flex items-center justify-between pt-0.5">
        <span className="truncate">{tier.desc}</span>
      </div>

      {/* Quick ELO Presets */}
      <div className="flex items-center gap-1.5 pt-1 overflow-x-auto">
        <span className="text-[10px] uppercase font-semibold text-slate-500 shrink-0 flex items-center gap-1">
          <Zap className="w-3 h-3 text-amber-400" /> Presets:
        </span>
        {presets.map((p) => (
          <button
            key={p.elo}
            type="button"
            disabled={disabled}
            onClick={() => onChangeElo(p.elo)}
            className={`px-2 py-0.5 text-[11px] font-medium rounded transition whitespace-nowrap ${
              targetElo === p.elo
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                : 'bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/50'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
};
