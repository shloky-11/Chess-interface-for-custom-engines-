import React, { useRef, useEffect } from 'react';
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight, Copy, Check, Download } from 'lucide-react';
import { MoveRecord } from '../types/chess';

interface MoveHistoryProps {
  moves: MoveRecord[];
  currentPly: number; // which ply is currently being viewed
  onSelectPly: (ply: number) => void;
  fen: string;
  pgn: string;
}

export const MoveHistory: React.FC<MoveHistoryProps> = ({
  moves,
  currentPly,
  onSelectPly,
  fen,
  pgn,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [copiedPgn, setCopiedPgn] = React.useState(false);
  const [copiedFen, setCopiedFen] = React.useState(false);

  // Group moves into pairs [White, Black]
  const movePairs: { num: number; white?: MoveRecord; black?: MoveRecord }[] = [];
  for (let i = 0; i < moves.length; i += 2) {
    movePairs.push({
      num: Math.floor(i / 2) + 1,
      white: moves[i],
      black: moves[i + 1],
    });
  }

  // Scroll to bottom on new move
  useEffect(() => {
    if (scrollRef.current && currentPly >= moves.length) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [moves.length, currentPly]);

  const copyToClipboard = (text: string, isPgn: boolean) => {
    navigator.clipboard.writeText(text);
    if (isPgn) {
      setCopiedPgn(true);
      setTimeout(() => setCopiedPgn(false), 2000);
    } else {
      setCopiedFen(true);
      setTimeout(() => setCopiedFen(false), 2000);
    }
  };

  const getMoveTag = (rec?: MoveRecord) => {
    if (!rec?.analysis) return null;
    const cls = rec.analysis.classification;
    if (cls === 'blunder') return <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block shrink-0" title="Blunder" />;
    if (cls === 'mistake') return <span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block shrink-0" title="Mistake" />;
    if (cls === 'inaccuracy') return <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block shrink-0" title="Inaccuracy" />;
    if (cls === 'best' || cls === 'brilliant') return <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block shrink-0" title="Best Move" />;
    return null;
  };

  return (
    <div className="bg-[#161922] border border-slate-800 rounded-xl p-3 shadow-sm flex flex-col h-[260px] md:h-[280px]">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 text-xs font-semibold text-slate-300">
        <span>Notation & History</span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => copyToClipboard(pgn, true)}
            className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 px-2 py-0.5 rounded transition"
            title="Copy PGN to clipboard"
          >
            {copiedPgn ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            PGN
          </button>
          <button
            onClick={() => copyToClipboard(fen, false)}
            className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 px-2 py-0.5 rounded transition"
            title="Copy current FEN position"
          >
            {copiedFen ? <Check className="w-3 h-3 text-emerald-400" /> : <Download className="w-3 h-3" />}
            FEN
          </button>
        </div>
      </div>

      {/* Move Scroll Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto py-1 text-xs divide-y divide-slate-800/40">
        {movePairs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 italic text-xs">
            No moves played yet.
          </div>
        ) : (
          movePairs.map((pair) => (
            <div key={pair.num} className="grid grid-cols-12 py-1 items-center hover:bg-slate-800/30 rounded px-1">
              <span className="col-span-2 text-slate-500 font-mono text-[11px]">
                {pair.num}.
              </span>

              {/* White Move */}
              <div className="col-span-5">
                {pair.white && (
                  <button
                    onClick={() => onSelectPly(pair.white!.ply)}
                    className={`flex items-center gap-1.5 w-full text-left px-1.5 py-0.5 rounded transition font-mono ${
                      currentPly === pair.white.ply
                        ? 'bg-cyan-500/20 text-cyan-200 font-bold border border-cyan-500/40'
                        : 'text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {getMoveTag(pair.white)}
                    <span>{pair.white.san}</span>
                  </button>
                )}
              </div>

              {/* Black Move */}
              <div className="col-span-5">
                {pair.black && (
                  <button
                    onClick={() => onSelectPly(pair.black!.ply)}
                    className={`flex items-center gap-1.5 w-full text-left px-1.5 py-0.5 rounded transition font-mono ${
                      currentPly === pair.black.ply
                        ? 'bg-cyan-500/20 text-cyan-200 font-bold border border-cyan-500/40'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {getMoveTag(pair.black)}
                    <span>{pair.black.san}</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Ply Stepping Navigation Controls */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onSelectPly(0)}
            disabled={currentPly <= 0}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 transition"
            title="Start of game"
          >
            <ChevronFirst className="w-4 h-4" />
          </button>
          <button
            onClick={() => onSelectPly(Math.max(0, currentPly - 1))}
            disabled={currentPly <= 0}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 transition"
            title="Previous move"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => onSelectPly(Math.min(moves.length, currentPly + 1))}
            disabled={currentPly >= moves.length}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 transition"
            title="Next move"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onSelectPly(moves.length)}
            disabled={currentPly >= moves.length}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 transition"
            title="Current live position"
          >
            <ChevronLast className="w-4 h-4" />
          </button>
        </div>

        <span className="text-[11px] font-mono text-slate-400">
          Ply {currentPly} / {moves.length}
        </span>
      </div>
    </div>
  );
};
