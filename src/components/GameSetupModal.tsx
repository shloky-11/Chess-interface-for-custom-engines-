import React, { useState } from 'react';
import { X, Play, Clock, Bot, Shuffle } from 'lucide-react';
import { Color, EngineDefinition, TimeControl } from '../types/chess';
import { ChessPiece } from './ChessPieces';

interface GameSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartGame: (color: Color, timeControl: TimeControl, elo: number, engineId: string) => void;
  engines: EngineDefinition[];
  currentEngineId: string;
  currentElo: number;
}

const TIME_CONTROLS: TimeControl[] = [
  { type: 'unlimited', name: 'Casual (Unlimited)', initialMinutes: 0, incrementSeconds: 0 },
  { type: 'blitz_3_2', name: 'Blitz (3 min + 2s)', initialMinutes: 3, incrementSeconds: 2 },
  { type: 'blitz_5_0', name: 'Blitz (5 min)', initialMinutes: 5, incrementSeconds: 0 },
  { type: 'rapid_10_0', name: 'Rapid (10 min)', initialMinutes: 10, incrementSeconds: 0 },
  { type: 'classical_15_10', name: 'Classical (15 min + 10s)', initialMinutes: 15, incrementSeconds: 10 },
];

export const GameSetupModal: React.FC<GameSetupModalProps> = ({
  isOpen,
  onClose,
  onStartGame,
  engines,
  currentEngineId,
  currentElo,
}) => {
  const [selectedColor, setSelectedColor] = useState<'w' | 'b' | 'random'>('w');
  const [selectedTimeControl, setSelectedTimeControl] = useState<TimeControl>(TIME_CONTROLS[3]); // 10 min
  const [selectedEngineId, setSelectedEngineId] = useState(currentEngineId);
  const [targetElo, setTargetElo] = useState(currentElo);

  if (!isOpen) return null;

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    const finalColor: Color =
      selectedColor === 'random' ? (Math.random() < 0.5 ? 'w' : 'b') : selectedColor;

    onStartGame(finalColor, selectedTimeControl, targetElo, selectedEngineId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[#141721] border border-slate-700/80 rounded-2xl max-w-lg w-full p-5 shadow-2xl space-y-4 my-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <Play className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-100">
                New Chess Match
              </h3>
              <p className="text-xs text-slate-400">
                Configure side, clock, and opponent engine difficulty
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

        <form onSubmit={handleStart} className="space-y-4">
          {/* Side Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Play As
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedColor('w')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition ${
                  selectedColor === 'w'
                    ? 'bg-slate-800 border-cyan-500 text-cyan-300 ring-2 ring-cyan-500/30'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="w-7 h-7">
                  <ChessPiece type="k" color="w" />
                </div>
                <span className="text-xs font-semibold">White (First)</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedColor('random')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition ${
                  selectedColor === 'random'
                    ? 'bg-slate-800 border-cyan-500 text-cyan-300 ring-2 ring-cyan-500/30'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="w-7 h-7 flex items-center justify-center">
                  <Shuffle className="w-6 h-6 text-amber-400" />
                </div>
                <span className="text-xs font-semibold">Random</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedColor('b')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition ${
                  selectedColor === 'b'
                    ? 'bg-slate-800 border-cyan-500 text-cyan-300 ring-2 ring-cyan-500/30'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="w-7 h-7">
                  <ChessPiece type="k" color="b" />
                </div>
                <span className="text-xs font-semibold">Black</span>
              </button>
            </div>
          </div>

          {/* Time Controls */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              Time Control
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {TIME_CONTROLS.map((tc) => (
                <button
                  key={tc.type}
                  type="button"
                  onClick={() => setSelectedTimeControl(tc)}
                  className={`p-2.5 rounded-lg border text-left text-xs font-medium transition ${
                    selectedTimeControl.type === tc.type
                      ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {tc.name}
                </button>
              ))}
            </div>
          </div>

          {/* Opponent Engine Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-cyan-400" />
              Opponent Engine
            </label>
            <select
              value={selectedEngineId}
              onChange={(e) => setSelectedEngineId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden focus:border-cyan-500"
            >
              {engines.map((eng) => (
                <option key={eng.id} value={eng.id}>
                  {eng.name} ({eng.author})
                </option>
              ))}
            </select>
          </div>

          {/* Initial ELO */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
              <span>Engine Strength</span>
              <span className="font-mono text-cyan-400">{targetElo} ELO</span>
            </div>
            <input
              type="range"
              min="400"
              max="3200"
              step="50"
              value={targetElo}
              onChange={(e) => setTargetElo(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-hidden"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg shadow-emerald-950/40 transition"
            >
              <Play className="w-4 h-4" />
              Start Match
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
