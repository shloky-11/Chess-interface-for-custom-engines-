import React from 'react';
import { Download, Volume2, VolumeX, Cpu, Plus, WifiOff, Check } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface WindowsTitleBarProps {
  engineName: string;
  targetElo: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenEngineManager: () => void;
  onOpenNewGame: () => void;
}

export const WindowsTitleBar: React.FC<WindowsTitleBarProps> = ({
  engineName,
  targetElo,
  soundEnabled,
  onToggleSound,
  onOpenEngineManager,
  onOpenNewGame,
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();

  return (
    <header className="flex items-center justify-between gap-4 px-4 py-2 bg-[#12141c] border-b border-slate-800/80 select-none text-slate-300">
      {/* Zone 1: App Brand Wordmark & Windows Icon */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <img
            src="/icon.svg"
            alt="Grandmaster Studio Logo"
            className="w-5 h-5 rounded-sm shrink-0"
          />
          <span className="text-sm font-bold tracking-tight text-slate-100 whitespace-nowrap">
            Grandmaster Studio
          </span>
        </div>

        {/* Offline Ready Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-emerald-400/90 pl-2 border-l border-slate-800">
          <Check className="w-3 h-3" />
          <span>Offline Ready</span>
        </div>
      </div>

      {/* Zone 2: Navigation & Quick Engine Status */}
      <div className="hidden md:flex items-center gap-4 text-xs font-medium">
        <button
          onClick={onOpenEngineManager}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition whitespace-nowrap"
          title="Change active chess engine"
        >
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span>{engineName}</span>
          <span className="font-mono text-cyan-400 font-bold">({targetElo})</span>
        </button>

        <button
          onClick={onOpenNewGame}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 hover:text-emerald-200 border border-emerald-500/40 transition whitespace-nowrap font-semibold"
        >
          <Plus className="w-3.5 h-3.5" />
          New Match
        </button>
      </div>

      {/* Zone 3: Primary Actions, Sound & Windows Controls */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Sound Toggle */}
        <button
          onClick={onToggleSound}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          title={soundEnabled ? 'Mute sound effects' : 'Unmute sound effects'}
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-cyan-400" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-500" />
          )}
        </button>

        {/* Mobile Engine Button */}
        <button
          onClick={onOpenEngineManager}
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title="Open engine manager"
        >
          <Cpu className="w-4 h-4 text-cyan-400" />
        </button>

        {/* PWA Install Button for Windows Desktop */}
        {isInstallable && !isInstalled && (
          <button
            onClick={install}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg shadow-sm transition whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            Install App
          </button>
        )}

        {/* Windows Desktop Frame Controls */}
        <div className="hidden sm:flex items-center gap-2 pl-3 ml-1 border-l border-slate-800 text-slate-500">
          <div className="w-3 h-3 rounded-full bg-slate-700/60 hover:bg-slate-600 transition cursor-pointer" title="Minimize" />
          <div className="w-3 h-3 rounded-full bg-slate-700/60 hover:bg-slate-600 transition cursor-pointer" title="Maximize" />
          <div className="w-3 h-3 rounded-full bg-rose-900/60 hover:bg-rose-600 transition cursor-pointer" title="Close" />
        </div>
      </div>
    </header>
  );
};
