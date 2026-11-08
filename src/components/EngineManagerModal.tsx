import React, { useState } from 'react';
import { X, Cpu, Plus, Check, Trash2, Gauge, RefreshCw, Zap } from 'lucide-react';
import { EngineDefinition } from '../types/chess';
import { runEngineBenchmark } from '../services/chessEngine';

interface EngineManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  engines: EngineDefinition[];
  activeEngineId: string;
  onSelectEngine: (engineId: string) => void;
  onOpenImportModal: () => void;
  onDeleteCustomEngine: (engineId: string) => void;
  onUpdateEngineBenchmark: (engineId: string, nps: number) => void;
}

export const EngineManagerModal: React.FC<EngineManagerModalProps> = ({
  isOpen,
  onClose,
  engines,
  activeEngineId,
  onSelectEngine,
  onOpenImportModal,
  onDeleteCustomEngine,
  onUpdateEngineBenchmark,
}) => {
  const [benchmarkingId, setBenchmarkingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRunBenchmark = async (engine: EngineDefinition) => {
    setBenchmarkingId(engine.id);
    try {
      const res = await runEngineBenchmark(engine.id, engine.scriptCode);
      onUpdateEngineBenchmark(engine.id, res.nps);
    } catch (err) {
      console.error('Benchmark failed:', err);
    } finally {
      setBenchmarkingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[#141721] border border-slate-700/80 rounded-2xl max-w-2xl w-full p-5 shadow-2xl space-y-4 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
              <Cpu className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-100">
                Chess Engine Manager
              </h3>
              <p className="text-xs text-slate-400">
                Choose active engine, benchmark calculation speed, or import new AI engines
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenImportModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Import Engine
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Engine Cards List */}
        <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
          {engines.map((eng) => {
            const isActive = eng.id === activeEngineId;
            const isBenchmarking = benchmarkingId === eng.id;

            return (
              <div
                key={eng.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  isActive
                    ? 'bg-slate-900 border-cyan-500/60 shadow-md shadow-cyan-950/30 ring-1 ring-cyan-500/40'
                    : 'bg-[#181c28] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                        {eng.name}
                        {eng.isCustom && (
                          <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/40 px-1.5 py-0.2 rounded font-normal">
                            Custom Script
                          </span>
                        )}
                      </h4>
                      <span className="text-xs text-slate-500 font-mono">v{eng.version}</span>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      {eng.description}
                    </p>

                    <div className="flex items-center gap-3 pt-1 text-xs text-slate-400 font-mono">
                      <span>Author: {eng.author}</span>
                      <span>·</span>
                      <span>Range: {eng.eloRange[0]} - {eng.eloRange[1]}+ ELO</span>
                      {eng.benchmarkScore && (
                        <>
                          <span>·</span>
                          <span className="text-cyan-400 flex items-center gap-1 font-bold">
                            <Gauge className="w-3 h-3" />
                            {Math.round(eng.benchmarkScore / 1000)}k nodes/sec
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleRunBenchmark(eng)}
                      disabled={isBenchmarking}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                      title="Run benchmark speed test"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isBenchmarking ? 'animate-spin text-cyan-400' : ''}`} />
                    </button>

                    {eng.isCustom && (
                      <button
                        onClick={() => onDeleteCustomEngine(eng.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 border border-slate-700 transition"
                        title="Delete custom engine"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => {
                        onSelectEngine(eng.id);
                        onClose();
                      }}
                      disabled={isActive}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        isActive
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 cursor-default'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                      }`}
                    >
                      {isActive ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Active
                        </>
                      ) : (
                        'Select'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            All engines run client-side offline with zero cloud latency.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
