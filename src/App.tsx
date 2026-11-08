import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chess } from 'chess.js';
import {
  RotateCcw,
  RefreshCw,
  Flag,
  BarChart2,
  Cpu,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';

import {
  Color,
  EngineDefinition,
  EngineEvaluation,
  GameStatus,
  MoveRecord,
  PieceSymbol,
  Square,
  TimeControl,
} from './types/chess';
import { DEFAULT_ENGINES } from './services/enginePresets';
import { calculateMoveForElo, evaluatePosition } from './services/chessEngine';
import { analyzePlayedMove } from './services/analysisService';
import { soundService } from './services/soundService';

import { WindowsTitleBar } from './components/WindowsTitleBar';
import { ChessBoard } from './components/ChessBoard';
import { EvalBar } from './components/EvalBar';
import { DifficultyBar } from './components/DifficultyBar';
import { AnalysisHUD } from './components/AnalysisHUD';
import { MoveHistory } from './components/MoveHistory';
import { PlayerCard } from './components/PlayerCard';
import { EngineManagerModal } from './components/EngineManagerModal';
import { EngineImportModal } from './components/EngineImportModal';
import { GameSetupModal } from './components/GameSetupModal';
import { GameReviewModal } from './components/GameReviewModal';

const LOCAL_STORAGE_CUSTOM_ENGINES = 'gm_chess_custom_engines';
const LOCAL_STORAGE_SETTINGS = 'gm_chess_settings';

export default function App() {
  // Engine Registry State
  const [engines, setEngines] = useState<EngineDefinition[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_CUSTOM_ENGINES);
      if (saved) {
        const parsed = JSON.parse(saved);
        return [...DEFAULT_ENGINES, ...parsed];
      }
    } catch {
      // Fallback to default
    }
    return DEFAULT_ENGINES;
  });

  const [activeEngineId, setActiveEngineId] = useState<string>('stockfish_nnue');
  const [targetElo, setTargetElo] = useState<number>(1500);

  // Settings State
  const [realTimeAnalysis, setRealTimeAnalysis] = useState<boolean>(true);
  const [showBestMoveArrow, setShowBestMoveArrow] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Chess Game State
  const [chess, setChess] = useState<Chess>(() => new Chess());
  const [playerColor, setPlayerColor] = useState<Color>('w');
  const [boardOrientation, setBoardOrientation] = useState<Color>('w');
  const [timeControl, setTimeControl] = useState<TimeControl>({
    type: 'rapid_10_0',
    name: 'Rapid (10 min)',
    initialMinutes: 10,
    incrementSeconds: 0,
  });

  const [whiteTime, setWhiteTime] = useState<number>(600);
  const [blackTime, setBlackTime] = useState<number>(600);
  const [gameStatus, setGameStatus] = useState<GameStatus>('in_progress');
  const [winner, setWinner] = useState<'w' | 'b' | 'draw' | null>(null);

  // Moves History & Evaluation
  const [moves, setMoves] = useState<MoveRecord[]>([]);
  const [currentPly, setCurrentPly] = useState<number>(0);
  const [currentEvaluation, setCurrentEvaluation] = useState<EngineEvaluation | null>(null);
  const [isEngineThinking, setIsEngineThinking] = useState<boolean>(false);

  // Modals
  const [isEngineManagerOpen, setIsEngineManagerOpen] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [isGameSetupOpen, setIsGameSetupOpen] = useState<boolean>(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);

  const clockIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const activeEngine = engines.find((e) => e.id === activeEngineId) || engines[0];

  // Sync sound service
  useEffect(() => {
    soundService.enabled = soundEnabled;
  }, [soundEnabled]);

  // Save custom engines to local storage
  const handleSaveCustomEngine = (newEngine: EngineDefinition) => {
    const updated = [...engines, newEngine];
    setEngines(updated);
    setActiveEngineId(newEngine.id);
    const customOnly = updated.filter((e) => e.isCustom);
    localStorage.setItem(LOCAL_STORAGE_CUSTOM_ENGINES, JSON.stringify(customOnly));
  };

  const handleDeleteCustomEngine = (engineId: string) => {
    const updated = engines.filter((e) => e.id !== engineId);
    setEngines(updated);
    if (activeEngineId === engineId) {
      setActiveEngineId('stockfish_nnue');
    }
    const customOnly = updated.filter((e) => e.isCustom);
    localStorage.setItem(LOCAL_STORAGE_CUSTOM_ENGINES, JSON.stringify(customOnly));
  };

  const handleUpdateEngineBenchmark = (engineId: string, nps: number) => {
    setEngines((prev) =>
      prev.map((e) => (e.id === engineId ? { ...e, benchmarkScore: nps } : e))
    );
  };

  // Evaluate initial board state
  useEffect(() => {
    if (moves.length === 0) {
      const initialEval = evaluatePosition(chess.fen(), 3);
      setCurrentEvaluation(initialEval);
    }
  }, [moves.length, chess]);

  // Handle Clock Countdown
  useEffect(() => {
    if (gameStatus !== 'in_progress' || timeControl.type === 'unlimited') {
      if (clockIntervalRef.current) clearInterval(clockIntervalRef.current);
      return;
    }

    clockIntervalRef.current = setInterval(() => {
      const turn = chess.turn();
      if (turn === 'w') {
        setWhiteTime((prev) => {
          if (prev <= 1) {
            setGameStatus('time_out');
            setWinner('b');
            soundService.playGameOver(playerColor === 'b');
            return 0;
          }
          return prev - 1;
        });
      } else {
        setBlackTime((prev) => {
          if (prev <= 1) {
            setGameStatus('time_out');
            setWinner('w');
            soundService.playGameOver(playerColor === 'w');
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => {
      if (clockIntervalRef.current) clearInterval(clockIntervalRef.current);
    };
  }, [gameStatus, chess, timeControl.type, playerColor]);

  // Check Game End Conditions
  const checkGameEnd = useCallback((game: Chess) => {
    if (game.isCheckmate()) {
      const winningColor = game.turn() === 'w' ? 'b' : 'w';
      setGameStatus('checkmate');
      setWinner(winningColor);
      soundService.playGameOver(winningColor === playerColor);
      return true;
    }
    if (game.isStalemate()) {
      setGameStatus('stalemate');
      setWinner('draw');
      soundService.playGameOver(false);
      return true;
    }
    if (game.isThreefoldRepetition()) {
      setGameStatus('threefold_repetition');
      setWinner('draw');
      soundService.playGameOver(false);
      return true;
    }
    if (game.isInsufficientMaterial()) {
      setGameStatus('insufficient_material');
      setWinner('draw');
      soundService.playGameOver(false);
      return true;
    }
    return false;
  }, [playerColor]);

  // Perform Engine Move
  const triggerEngineMove = useCallback(async (currentChess: Chess) => {
    if (currentChess.isGameOver()) return;
    setIsEngineThinking(true);

    try {
      const currentFen = currentChess.fen();
      const customScript = activeEngine.isCustom ? activeEngine.scriptCode : undefined;

      // Small natural delay so moves don't appear instantaneously robotic
      const minDelay = new Promise((res) => setTimeout(res, 400));
      const [evalResult] = await Promise.all([
        calculateMoveForElo(currentFen, targetElo, activeEngine.id, customScript),
        minDelay,
      ]);

      if (evalResult && evalResult.bestMove) {
        const moveAttempt = currentChess.move({
          from: evalResult.bestMove.from,
          to: evalResult.bestMove.to,
          promotion: evalResult.bestMove.promotion || 'q',
        });

        if (moveAttempt) {
          const fenAfter = currentChess.fen();

          // Sound effect
          if (moveAttempt.captured) {
            soundService.playCapture();
          } else {
            soundService.playMove();
          }

          if (currentChess.inCheck()) {
            soundService.playCheck();
          }

          // Real-time analysis of the engine's move
          let moveAnalysis;
          if (realTimeAnalysis) {
            moveAnalysis = analyzePlayedMove(
              currentFen,
              fenAfter,
              moveAttempt.san,
              currentChess.turn() === 'w' ? 'b' : 'w'
            );
          }

          const newRecord: MoveRecord = {
            ply: moves.length + 1,
            moveNumber: Math.floor(moves.length / 2) + 1,
            color: moveAttempt.color,
            san: moveAttempt.san,
            from: moveAttempt.from as Square,
            to: moveAttempt.to as Square,
            captured: moveAttempt.captured as PieceSymbol,
            promotion: moveAttempt.promotion as PieceSymbol,
            fenBefore: currentFen,
            fenAfter,
            analysis: moveAnalysis,
          };

          const newMoves = [...moves, newRecord];
          setMoves(newMoves);
          setCurrentPly(newMoves.length);
          setCurrentEvaluation(evalResult);

          // Add clock increment
          if (timeControl.incrementSeconds > 0) {
            if (moveAttempt.color === 'w') {
              setWhiteTime((t) => t + timeControl.incrementSeconds);
            } else {
              setBlackTime((t) => t + timeControl.incrementSeconds);
            }
          }

          checkGameEnd(currentChess);
        }
      }
    } catch (err) {
      console.error('Engine move error:', err);
    } finally {
      setIsEngineThinking(false);
    }
  }, [
    activeEngine,
    targetElo,
    moves,
    realTimeAnalysis,
    timeControl.incrementSeconds,
    checkGameEnd,
  ]);

  // Execute Human Move
  const handlePlayerMove = (from: Square, to: Square, promotion?: PieceSymbol): boolean => {
    if (gameStatus !== 'in_progress' || isEngineThinking) return false;
    if (chess.turn() !== playerColor) return false;

    const fenBefore = chess.fen();
    try {
      const moveResult = chess.move({
        from,
        to,
        promotion: promotion || 'q',
      });

      if (!moveResult) return false;

      const fenAfter = chess.fen();

      // Sound
      if (moveResult.captured) {
        soundService.playCapture();
      } else {
        soundService.playMove();
      }

      if (chess.inCheck()) {
        soundService.playCheck();
      }

      // Real-time Move Analysis
      let analysis;
      if (realTimeAnalysis) {
        analysis = analyzePlayedMove(fenBefore, fenAfter, moveResult.san, playerColor);
        if (analysis.classification === 'blunder') {
          soundService.playBlunderAlert();
        }
      }

      const newRecord: MoveRecord = {
        ply: moves.length + 1,
        moveNumber: Math.floor(moves.length / 2) + 1,
        color: playerColor,
        san: moveResult.san,
        from,
        to,
        captured: moveResult.captured as PieceSymbol,
        promotion: moveResult.promotion as PieceSymbol,
        fenBefore,
        fenAfter,
        analysis,
      };

      const updatedMoves = [...moves, newRecord];
      setMoves(updatedMoves);
      setCurrentPly(updatedMoves.length);

      // Update evaluation immediately
      const postEval = evaluatePosition(fenAfter, 3);
      setCurrentEvaluation(postEval);

      // Increment clock
      if (timeControl.incrementSeconds > 0) {
        if (playerColor === 'w') {
          setWhiteTime((t) => t + timeControl.incrementSeconds);
        } else {
          setBlackTime((t) => t + timeControl.incrementSeconds);
        }
      }

      const isOver = checkGameEnd(chess);

      // If game continues, queue engine move
      if (!isOver) {
        setTimeout(() => triggerEngineMove(chess), 100);
      }

      return true;
    } catch {
      return false;
    }
  };

  // If player starts as Black, let engine make move 1
  useEffect(() => {
    if (
      playerColor === 'b' &&
      chess.turn() === 'w' &&
      moves.length === 0 &&
      gameStatus === 'in_progress' &&
      !isEngineThinking
    ) {
      triggerEngineMove(chess);
    }
  }, [playerColor, chess, moves.length, gameStatus, isEngineThinking, triggerEngineMove]);

  // Restart / Setup New Game
  const startNewGame = (
    color: Color,
    tc: TimeControl,
    elo: number,
    engineId: string
  ) => {
    const newChess = new Chess();
    setChess(newChess);
    setPlayerColor(color);
    setBoardOrientation(color);
    setTimeControl(tc);
    setTargetElo(elo);
    setActiveEngineId(engineId);
    setWhiteTime(tc.initialMinutes * 60);
    setBlackTime(tc.initialMinutes * 60);
    setGameStatus('in_progress');
    setWinner(null);
    setMoves([]);
    setCurrentPly(0);
    const initEval = evaluatePosition(newChess.fen(), 3);
    setCurrentEvaluation(initEval);
  };

  // Undo / Take Back Move (undoes 2 plies: bot's move and player's move)
  const handleTakeback = () => {
    if (moves.length === 0 || isEngineThinking) return;

    // If it's player's turn, undo 2 plies (bot + player)
    // If it's bot's turn, undo 1 ply
    const pliesToUndo = chess.turn() === playerColor ? 2 : 1;
    for (let i = 0; i < pliesToUndo; i++) {
      chess.undo();
    }

    const remainingMoves = moves.slice(0, Math.max(0, moves.length - pliesToUndo));
    setMoves(remainingMoves);
    setCurrentPly(remainingMoves.length);
    setGameStatus('in_progress');
    setWinner(null);

    const newEval = evaluatePosition(chess.fen(), 3);
    setCurrentEvaluation(newEval);
  };

  // Resign Match
  const handleResign = () => {
    if (gameStatus !== 'in_progress') return;
    setGameStatus('resigned');
    setWinner(playerColor === 'w' ? 'b' : 'w');
    soundService.playGameOver(false);
  };

  // Selected board view (current live board or past move)
  const displayChess = React.useMemo(() => {
    if (currentPly >= moves.length) {
      return chess;
    }
    const replayChess = new Chess();
    for (let i = 0; i < currentPly; i++) {
      replayChess.move({
        from: moves[i].from,
        to: moves[i].to,
        promotion: moves[i].promotion,
      });
    }
    return replayChess;
  }, [currentPly, moves, chess]);

  // Material calculations for player cards
  const capturedPieces = React.useMemo(() => {
    const whiteCaptured: PieceSymbol[] = [];
    const blackCaptured: PieceSymbol[] = [];

    moves.slice(0, currentPly).forEach((m) => {
      if (m.captured) {
        if (m.color === 'w') {
          blackCaptured.push(m.captured);
        } else {
          whiteCaptured.push(m.captured);
        }
      }
    });

    return { whiteCaptured, blackCaptured };
  }, [moves, currentPly]);

  const lastMove = moves.length > 0 && currentPly > 0 ? moves[currentPly - 1] : null;

  return (
    <div className="flex flex-col min-h-screen bg-[#0c0e14] text-slate-100">
      {/* Windows 11 Title Bar */}
      <WindowsTitleBar
        engineName={activeEngine.name}
        targetElo={targetElo}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((v) => !v)}
        onOpenEngineManager={() => setIsEngineManagerOpen(true)}
        onOpenNewGame={() => setIsGameSetupOpen(true)}
      />

      {/* Main Chess Arena Viewport */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-3 sm:p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Chessboard & Dynamic Evaluation Bar */}
        <div className="lg:col-span-7 xl:col-span-7 flex flex-col items-center">
          {/* Opponent Card (Top) */}
          <div className="w-full max-w-[580px] mb-2.5">
            <PlayerCard
              isEngine={true}
              name={activeEngine.name}
              elo={targetElo}
              color={playerColor === 'w' ? 'b' : 'w'}
              isTurn={displayChess.turn() !== playerColor && gameStatus === 'in_progress'}
              timeRemaining={playerColor === 'w' ? blackTime : whiteTime}
              isThinking={isEngineThinking}
              capturedPieces={
                playerColor === 'w'
                  ? capturedPieces.blackCaptured
                  : capturedPieces.whiteCaptured
              }
            />
          </div>

          {/* Board Center Container with Vertical Eval Bar */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 w-full">
            {/* Dynamic Evaluation Bar */}
            <EvalBar
              score={currentEvaluation?.score || 0}
              mate={currentEvaluation?.mate}
              orientation={boardOrientation}
            />

            {/* Chessboard */}
            <ChessBoard
              chess={displayChess}
              orientation={boardOrientation}
              onMove={handlePlayerMove}
              isEngineThinking={isEngineThinking}
              bestMoveArrow={
                showBestMoveArrow && currentEvaluation?.bestMove
                  ? {
                      from: currentEvaluation.bestMove.from,
                      to: currentEvaluation.bestMove.to,
                    }
                  : null
              }
              lastMove={lastMove ? { from: lastMove.from, to: lastMove.to } : null}
              lastMoveBlunder={
                lastMove?.analysis
                  ? {
                      square: lastMove.to,
                      classification: lastMove.analysis.classification,
                    }
                  : null
              }
              disabled={currentPly < moves.length}
            />
          </div>

          {/* Player Card (Bottom) */}
          <div className="w-full max-w-[580px] mt-2.5">
            <PlayerCard
              isEngine={false}
              name="Player (You)"
              color={playerColor}
              isTurn={displayChess.turn() === playerColor && gameStatus === 'in_progress'}
              timeRemaining={playerColor === 'w' ? whiteTime : blackTime}
              capturedPieces={
                playerColor === 'w'
                  ? capturedPieces.whiteCaptured
                  : capturedPieces.blackCaptured
              }
            />
          </div>

          {/* Board Quick Utility Bar */}
          <div className="w-full max-w-[580px] flex items-center justify-between gap-2 pt-3">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setBoardOrientation((o) => (o === 'w' ? 'b' : 'w'))}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-xs font-semibold text-slate-300 border border-slate-700/60 transition"
                title="Flip board orientation"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Flip
              </button>

              <button
                onClick={handleTakeback}
                disabled={moves.length === 0 || isEngineThinking}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 disabled:opacity-40 text-xs font-semibold text-slate-300 border border-slate-700/60 transition"
                title="Take back last move"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Takeback
              </button>

              <button
                onClick={handleResign}
                disabled={gameStatus !== 'in_progress'}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-950/40 hover:text-rose-300 disabled:opacity-40 text-xs font-semibold text-slate-400 border border-slate-700/60 transition"
                title="Resign current match"
              >
                <Flag className="w-3.5 h-3.5" />
                Resign
              </button>
            </div>

            {moves.length > 0 && (
              <button
                onClick={() => setIsReviewModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold transition"
              >
                <BarChart2 className="w-3.5 h-3.5" />
                Match Review
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Engine Controls, Real-time Analysis HUD, and Move Notation */}
        <div className="lg:col-span-5 xl:col-span-5 space-y-3.5 w-full">
          {/* Seamless Difficulty & ELO Adjustment Bar */}
          <DifficultyBar
            targetElo={targetElo}
            onChangeElo={(elo) => setTargetElo(elo)}
            disabled={isEngineThinking}
          />

          {/* Real-Time Move Analysis HUD */}
          <AnalysisHUD
            lastMoveRecord={lastMove}
            currentEvaluation={currentEvaluation}
            isEngineThinking={isEngineThinking}
            engineName={activeEngine.name}
            realTimeAnalysis={realTimeAnalysis}
            onToggleRealTime={() => setRealTimeAnalysis((v) => !v)}
            showBestMoveArrow={showBestMoveArrow}
            onToggleBestMoveArrow={() => setShowBestMoveArrow((v) => !v)}
            onTakeback={handleTakeback}
            canTakeback={moves.length > 0 && !isEngineThinking}
          />

          {/* Move History / Notation Scroll List */}
          <MoveHistory
            moves={moves}
            currentPly={currentPly}
            onSelectPly={(ply) => setCurrentPly(ply)}
            fen={displayChess.fen()}
            pgn={chess.pgn()}
          />

          {/* Quick Engine Switcher & Import Pill Strip */}
          <div className="bg-[#141720] border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <div>
                <span className="block font-semibold text-slate-200">
                  Engine: {activeEngine.name}
                </span>
                <span className="text-[11px] text-slate-400">
                  {activeEngine.isCustom ? 'Custom JS Worker' : 'FIDE Master Search'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition text-[11px]"
              >
                <Sparkles className="w-3 h-3 text-cyan-400" />
                Import
              </button>
              <button
                onClick={() => setIsEngineManagerOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition text-[11px]"
              >
                <Layers className="w-3 h-3 text-amber-400" />
                Manage
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <EngineManagerModal
        isOpen={isEngineManagerOpen}
        onClose={() => setIsEngineManagerOpen(false)}
        engines={engines}
        activeEngineId={activeEngineId}
        onSelectEngine={(id) => setActiveEngineId(id)}
        onOpenImportModal={() => {
          setIsEngineManagerOpen(false);
          setIsImportModalOpen(true);
        }}
        onDeleteCustomEngine={handleDeleteCustomEngine}
        onUpdateEngineBenchmark={handleUpdateEngineBenchmark}
      />

      <EngineImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSaveEngine={handleSaveCustomEngine}
      />

      <GameSetupModal
        isOpen={isGameSetupOpen}
        onClose={() => setIsGameSetupOpen(false)}
        onStartGame={startNewGame}
        engines={engines}
        currentEngineId={activeEngineId}
        currentElo={targetElo}
      />

      <GameReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        status={gameStatus}
        winner={winner}
        moves={moves}
        onSelectPly={(ply) => setCurrentPly(ply)}
        onNewGame={() => {
          setIsReviewModalOpen(false);
          setIsGameSetupOpen(true);
        }}
      />
    </div>
  );
}
