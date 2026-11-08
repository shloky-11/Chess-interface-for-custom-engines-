import React from 'react';
import { Activity, AlertTriangle, ArrowRight, CheckCircle2, ChevronRight, Eye, Sparkles, Undo2 } from 'lucide-react';
import { EngineEvaluation, MoveClassification, MoveRecord } from '../types/chess';

interface AnalysisHUDProps {
  lastMoveRecord?: MoveRecord | null;
  currentEvaluation?: EngineEvaluation | null;
  isEngineThinking: boolean;
  engineName: string;
  realTimeAnalysis: boolean;
  onToggleRealTime: () => void;
  showBestMoveArrow: boolean;
  onToggleBestMoveArrow: () => void;
  onTakeback?: () => void;
  canTakeback?: boolean;
}

export const AnalysisHUD: React.FC<AnalysisHUDProps> = ({
  lastMoveRecord,
  currentEvaluation,
  isEngineThinking,
  engineName,
  realTimeAnalysis,
  onToggleRealTime,
  showBestMoveArrow,
  onToggleBestMoveArrow,
  onTakeback,
  canTakeback = false,
}) => {
  const getClassificationBadge = (cls?: MoveClassification) => {
    switch (cls) {
      case 'brilliant':
        return {
          label: 'Brilliant !!',
          bgColor: 'bg-cyan-500/20',
          textColor: 'text-cyan-300',
          borderColor: 'border-cyan-500/40',
          icon: <Sparkles className="w-3.5 h-3.5 text-cyan-400" />,
        };
      case 'best':
        return {
          label: 'Best Move',
          bgColor: 'bg-emerald-500/20',
          textColor: 'text-emerald-300',
          borderColor: 'border-emerald-500/40',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
        };
      case 'excellent':
        return {
          label: 'Excellent',
          bgColor: 'bg-teal-500/20',
          textColor: 'text-teal-300',
          borderColor: 'border-teal-500/30',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />,
        };
      case 'good':
        return {
          label: 'Good',
          bgColor: 'bg-slate-700/40',
          textColor: 'text-slate-200',
          borderColor: 'border-slate-600/40',
          icon: null,
        };
      case 'inaccuracy':
        return {
          label: 'Inaccuracy ?!',
          bgColor: 'bg-amber-500/20',
          textColor: 'text-amber-300',
          borderColor: 'border-amber-500/40',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
        };
      case 'mistake':
        return {
          label: 'Mistake ?',
          bgColor: 'bg-orange-500/20',
          textColor: 'text-orange-300',
          borderColor: 'border-orange-500/40',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />,
        };
      case 'blunder':
        return {
          label: 'Blunder ??',
          bgColor: 'bg-rose-500/20',
          textColor: 'text-rose-300',
          borderColor: 'border-rose-500/50',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />,
        };
      default:
        return null;
    }
  };

  const badge = getClassificationBadge(lastMoveRecord?.analysis?.classification);
  const isBlunder = lastMoveRecord?.analysis?.classification === 'blunder';

  return (
    <div className="bg-[#161922] border border-slate-800 rounded-xl p-3.5 shadow-sm space-y-3">
      {/* Header with Active Engine status and Analysis Toggles */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <Activity className={`w-4 h-4 ${isEngineThinking ? 'text-amber-400 animate-spin' : 'text-cyan-400'}`} />
          <span className="text-xs font-semibold text-slate-200">
            Real-Time Analysis
          </span>
          {isEngineThinking && (
            <span className="text-[10px] text-amber-400/90 font-mono animate-pulse">
              evaluating...
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={onToggleBestMoveArrow}
            title="Toggle best move arrow on board"
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition ${
              showBestMoveArrow
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
            }`}
          >
            <Eye className="w-3 h-3" />
            Arrow
          </button>

          <button
            onClick={onToggleRealTime}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
              realTimeAnalysis
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
            }`}
          >
            {realTimeAnalysis ? 'Active' : 'Muted'}
          </button>
        </div>
      </div>

      {/* Engine Telemetry */}
      {currentEvaluation && realTimeAnalysis && (
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono bg-slate-900/60 px-2.5 py-1.5 rounded-lg border border-slate-800/60">
          <span className="truncate text-slate-300">{engineName}</span>
          <div className="flex items-center gap-3 shrink-0">
            <span>d:{currentEvaluation.depth}</span>
            <span>{currentEvaluation.nodes.toLocaleString()} nodes</span>
            <span>{Math.round(currentEvaluation.nps / 1000)}k nps</span>
          </div>
        </div>
      )}

      {/* Last Move Real-Time Feedback Card */}
      {realTimeAnalysis && lastMoveRecord?.analysis ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-100">
                {lastMoveRecord.color === 'w' ? 'White' : 'Black'}: {lastMoveRecord.san}
              </span>
              {badge && (
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${badge.bgColor} ${badge.textColor} ${badge.borderColor}`}
                >
                  {badge.icon}
                  {badge.label}
                </span>
              )}
            </div>

            <span
              className={`text-xs font-mono font-bold ${
                lastMoveRecord.analysis.evalDiff >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {lastMoveRecord.analysis.evalDiff > 0 ? `+${lastMoveRecord.analysis.evalDiff}` : lastMoveRecord.analysis.evalDiff}
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/40 p-2 rounded-lg border border-slate-800/40">
            {lastMoveRecord.analysis.explanation}
          </p>

          {/* If the move was not the best move, show what the engine recommended */}
          {lastMoveRecord.analysis.bestMoveSan &&
            lastMoveRecord.analysis.bestMoveSan !== 'N/A' &&
            lastMoveRecord.analysis.bestMoveSan !== lastMoveRecord.san && (
              <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-800/40 px-2.5 py-1.5 rounded-lg">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                  Engine Top Choice:
                  <strong className="text-cyan-300 font-mono">
                    {lastMoveRecord.analysis.bestMoveSan}
                  </strong>
                </span>
                {isBlunder && canTakeback && (
                  <button
                    onClick={onTakeback}
                    className="flex items-center gap-1 text-[11px] font-medium text-rose-300 hover:text-white bg-rose-500/20 hover:bg-rose-500/30 px-2 py-0.5 rounded transition"
                  >
                    <Undo2 className="w-3 h-3" />
                    Takeback
                  </button>
                )}
              </div>
            )}

          {/* Engine Principal Variation (Best continuation line) */}
          {currentEvaluation?.pv && currentEvaluation.pv.length > 0 && (
            <div className="flex items-center gap-1 text-[11px] text-slate-400 pt-1 overflow-x-auto">
              <span className="text-slate-500 shrink-0">Line:</span>
              <div className="flex items-center gap-1 font-mono text-slate-300">
                {currentEvaluation.pv.map((m, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && <ChevronRight className="w-3 h-3 text-slate-600" />}
                    <span>{m}</span>
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-xs text-slate-400 py-1 flex items-center justify-between">
          <span>Make a move to see live tactical evaluation</span>
          <span className="text-[11px] font-mono text-cyan-400/80">Real-time active</span>
        </div>
      )}
    </div>
  );
};
