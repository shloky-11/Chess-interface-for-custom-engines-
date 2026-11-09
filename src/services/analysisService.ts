import { Color, EngineEvaluation, MoveClassification, MoveRecord, Square } from '../types/chess';
import { evaluatePosition } from './chessEngine';

export interface MoveAnalysisResult {
  scoreBefore: number;
  scoreAfter: number;
  bestMoveSan: string;
  bestMoveFrom: Square;
  bestMoveTo: Square;
  classification: MoveClassification;
  evalDiff: number;
  explanation: string;
}

/**
 * Analyzes a played move compared to the engine's best move in the position.
 * Accepts optional knownEvalBefore to reuse existing calculations with 0ms latency.
 */
export function analyzePlayedMove(
  fenBefore: string,
  fenAfter: string,
  playedSan: string,
  playerColor: Color,
  knownEvalBefore?: EngineEvaluation | null
): MoveAnalysisResult {
  // Use cached evaluation if available, otherwise calculate with fast iterative deepening
  const evalBefore = knownEvalBefore || evaluatePosition(fenBefore, 3);
  const evalAfter = evaluatePosition(fenAfter, 3);

  const scoreBefore = evalBefore.score;
  const scoreAfter = evalAfter.score;

  // Compute evaluation delta from current player's perspective
  // For White, higher score is better. For Black, lower (more negative) score is better.
  const diffFromPlayerPerspective =
    playerColor === 'w'
      ? scoreAfter - scoreBefore
      : scoreBefore - scoreAfter;

  const centipawnLoss = Math.max(0, -diffFromPlayerPerspective * 100);

  let classification: MoveClassification = 'good';
  let explanation = '';

  const isBestMove =
    evalBefore.bestMove.san === playedSan ||
    (evalBefore.bestMove.from && evalBefore.bestMove.to &&
      playedSan.includes(evalBefore.bestMove.to));

  if (isBestMove || centipawnLoss <= 15) {
    if (playedSan.includes('x') && centipawnLoss === 0 && Math.abs(scoreAfter) > 2.5) {
      classification = 'brilliant';
      explanation = 'Spectacular tactical execution finding the master move!';
    } else {
      classification = 'best';
      explanation = 'The engine agrees: this is the best move in the position.';
    }
  } else if (centipawnLoss <= 35) {
    classification = 'excellent';
    explanation = 'Very strong move preserving solid positional advantage.';
  } else if (centipawnLoss <= 75) {
    classification = 'good';
    explanation = 'A natural, playable move keeping the game balanced.';
  } else if (centipawnLoss <= 160) {
    classification = 'inaccuracy';
    explanation = `Slight inaccuracy. Better was ${evalBefore.bestMove.san || 'the engine suggestion'}.`;
  } else if (centipawnLoss <= 320) {
    classification = 'mistake';
    explanation = `Mistake allowing counterplay. ${evalBefore.bestMove.san ? `Engine preferred ${evalBefore.bestMove.san}.` : ''}`;
  } else {
    classification = 'blunder';
    explanation = `Blunder costing substantial material or tactical initiative! Better was ${evalBefore.bestMove.san || 'defense'}.`;
  }

  return {
    scoreBefore,
    scoreAfter,
    bestMoveSan: evalBefore.bestMove.san || 'N/A',
    bestMoveFrom: evalBefore.bestMove.from,
    bestMoveTo: evalBefore.bestMove.to,
    classification,
    evalDiff: Number(diffFromPlayerPerspective.toFixed(2)),
    explanation,
  };
}

/**
 * Computes CAPS-style accuracy score percentage (0 - 100%) for a set of moves
 */
export function calculateAccuracy(moves: MoveRecord[], color: Color): number {
  const playerMoves = moves.filter((m) => m.color === color && m.analysis);
  if (playerMoves.length === 0) return 90.0;

  let totalWeight = 0;
  for (const move of playerMoves) {
    const cls = move.analysis?.classification;
    switch (cls) {
      case 'brilliant':
      case 'best':
        totalWeight += 100;
        break;
      case 'excellent':
        totalWeight += 92;
        break;
      case 'good':
        totalWeight += 80;
        break;
      case 'inaccuracy':
        totalWeight += 55;
        break;
      case 'mistake':
        totalWeight += 30;
        break;
      case 'blunder':
        totalWeight += 5;
        break;
      default:
        totalWeight += 85;
    }
  }

  return Number((totalWeight / playerMoves.length).toFixed(1));
}
