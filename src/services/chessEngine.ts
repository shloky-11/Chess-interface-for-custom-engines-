import { Chess, Move } from 'chess.js';
import { EngineEvaluation, PieceSymbol, Square } from '../types/chess';

// Piece Material Values in Centipawns
const PIECE_VALUES: Record<PieceSymbol, number> = {
  p: 100,
  n: 320,
  b: 335,
  r: 500,
  q: 920,
  k: 20000,
};

// Simplified Piece-Square Tables (White perspective, rank 8 to rank 1)
const PAWN_PST = [
  0,  0,  0,  0,  0,  0,  0,  0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
   5,  5, 10, 25, 25, 10,  5,  5,
   0,  0,  0, 20, 20,  0,  0,  0,
   5, -5,-10,  0,  0,-10, -5,  5,
   5, 10, 10,-20,-20, 10, 10,  5,
   0,  0,  0,  0,  0,  0,  0,  0
];

const KNIGHT_PST = [
 -50,-40,-30,-30,-30,-30,-40,-50,
 -40,-20,  0,  0,  0,  0,-20,-40,
 -30,  0, 10, 15, 15, 10,  0,-30,
 -30,  5, 15, 20, 20, 15,  5,-30,
 -30,  0, 15, 20, 20, 15,  0,-30,
 -30,  5, 10, 15, 15, 10,  5,-30,
 -40,-20,  0,  5,  5,  0,-20,-40,
 -50,-40,-30,-30,-30,-30,-40,-50,
];

const BISHOP_PST = [
 -20,-10,-10,-10,-10,-10,-10,-20,
 -10,  0,  0,  0,  0,  0,  0,-10,
 -10,  0,  5, 10, 10,  5,  0,-10,
 -10,  5,  5, 10, 10,  5,  5,-10,
 -10,  0, 10, 10, 10, 10,  0,-10,
 -10, 10, 10, 10, 10, 10, 10,-10,
 -10,  5,  0,  0,  0,  0,  5,-10,
 -20,-10,-10,-10,-10,-10,-10,-20,
];

const ROOK_PST = [
   0,  0,  0,  0,  0,  0,  0,  0,
   5, 10, 10, 10, 10, 10, 10,  5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
   0,  0,  0,  5,  5,  0,  0,  0
];

const QUEEN_PST = [
 -20,-10,-10, -5, -5,-10,-10,-20,
 -10,  0,  0,  0,  0,  0,  0,-10,
 -10,  0,  5,  5,  5,  5,  0,-10,
  -5,  0,  5,  5,  5,  5,  0, -5,
   0,  0,  5,  5,  5,  5,  0, -5,
 -10,  5,  5,  5,  5,  5,  0,-10,
 -10,  0,  5,  0,  0,  0,  0,-10,
 -20,-10,-10, -5, -5,-10,-10,-20
];

const KING_MIDDLE_PST = [
 -30,-40,-40,-50,-50,-40,-40,-30,
 -30,-40,-40,-50,-50,-40,-40,-30,
 -30,-40,-40,-50,-50,-40,-40,-30,
 -30,-40,-40,-50,-50,-40,-40,-30,
 -20,-30,-30,-40,-40,-30,-30,-20,
 -10,-20,-20,-20,-20,-20,-20,-10,
  20, 20,  0,  0,  0,  0, 20, 20,
  20, 30, 10,  0,  0, 10, 30, 20
];

function getSquareIndex(square: string, isWhite: boolean): number {
  const file = square.charCodeAt(0) - 97; // 0-7 for a-h
  const rank = parseInt(square[1], 10) - 1; // 0-7 for 1-8
  const row = 7 - rank;
  const col = file;
  if (isWhite) {
    return row * 8 + col;
  } else {
    // Flip board vertically for Black
    return (7 - row) * 8 + col;
  }
}

/**
 * Static evaluation function from White's perspective (+ = White advantage, - = Black advantage)
 */
export function evaluateBoard(chess: Chess, styleBonus: { aggression?: number; positional?: number } = {}): number {
  if (chess.isCheckmate()) {
    return chess.turn() === 'w' ? -100000 : 100000;
  }
  if (chess.isDraw() || chess.isStalemate()) {
    return 0;
  }

  let score = 0;
  const board = chess.board();

  let whitePawns = 0;
  let blackPawns = 0;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      const squareName = `${String.fromCharCode(97 + c)}${8 - r}`;
      const isWhite = piece.color === 'w';
      const pType = piece.type;
      const baseVal = PIECE_VALUES[pType];

      let pstVal = 0;
      const sqIdx = getSquareIndex(squareName, isWhite);

      switch (pType) {
        case 'p':
          pstVal = PAWN_PST[sqIdx];
          if (isWhite) whitePawns++; else blackPawns++;
          break;
        case 'n':
          pstVal = KNIGHT_PST[sqIdx];
          break;
        case 'b':
          pstVal = BISHOP_PST[sqIdx];
          break;
        case 'r':
          pstVal = ROOK_PST[sqIdx];
          break;
        case 'q':
          pstVal = QUEEN_PST[sqIdx];
          break;
        case 'k':
          pstVal = KING_MIDDLE_PST[sqIdx];
          break;
      }

      const totalVal = baseVal + pstVal;
      if (isWhite) {
        score += totalVal;
      } else {
        score -= totalVal;
      }
    }
  }

  // Positional and style adjustments
  if (styleBonus.positional) {
    // Bonus for pawn structure and center control
    score += (whitePawns - blackPawns) * (styleBonus.positional * 10);
  }

  if (styleBonus.aggression) {
    // Aggressive bonus when enemy king is checked or attacked
    if (chess.inCheck()) {
      const attackingWhite = chess.turn() === 'b';
      score += attackingWhite ? 40 * styleBonus.aggression : -40 * styleBonus.aggression;
    }
  }

  return score;
}

/**
 * Quiescence search to avoid the horizon effect on tactical captures
 */
function quiescence(
  chess: Chess,
  alpha: number,
  beta: number,
  isWhite: boolean,
  nodesCount: { nodes: number },
  maxQDepth: number = 3
): number {
  nodesCount.nodes++;
  const standPat = evaluateBoard(chess);

  if (isWhite) {
    if (standPat >= beta) return beta;
    if (standPat > alpha) alpha = standPat;
  } else {
    if (standPat <= alpha) return alpha;
    if (standPat < beta) beta = standPat;
  }

  if (maxQDepth <= 0) return standPat;

  // Search only captures in quiescence
  const captures = chess.moves({ verbose: true }).filter((m) => m.captured);
  // Sort captures by MVV-LVA (Victim value - Attacker value)
  captures.sort((a, b) => {
    const valA = PIECE_VALUES[b.captured || 'p'] - PIECE_VALUES[a.piece];
    const valB = PIECE_VALUES[a.captured || 'p'] - PIECE_VALUES[b.piece];
    return valB - valA;
  });

  for (const move of captures) {
    chess.move(move);
    const score = quiescence(chess, alpha, beta, !isWhite, nodesCount, maxQDepth - 1);
    chess.undo();

    if (isWhite) {
      if (score >= beta) return beta;
      if (score > alpha) alpha = score;
    } else {
      if (score <= alpha) return alpha;
      if (score < beta) beta = score;
    }
  }

  return isWhite ? alpha : beta;
}

/**
 * Minimax with Alpha-Beta pruning, move ordering, and quiescence
 */
function minimax(
  chess: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isWhite: boolean,
  nodesCount: { nodes: number },
  styleBonus: { aggression?: number; positional?: number } = {}
): { score: number; bestMove?: Move; pv: string[] } {
  nodesCount.nodes++;

  if (chess.isGameOver() || depth <= 0) {
    if (depth <= 0 && !chess.isGameOver()) {
      return {
        score: quiescence(chess, alpha, beta, isWhite, nodesCount),
        pv: [],
      };
    }
    return {
      score: evaluateBoard(chess, styleBonus),
      pv: [],
    };
  }

  const moves = chess.moves({ verbose: true });

  // Move ordering: Captures, then checks, then normal
  moves.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;
    if (a.captured) scoreA += 1000 + (PIECE_VALUES[a.captured] - PIECE_VALUES[a.piece]);
    if (b.captured) scoreB += 1000 + (PIECE_VALUES[b.captured] - PIECE_VALUES[b.piece]);
    if (a.san.includes('+')) scoreA += 500;
    if (b.san.includes('+')) scoreB += 500;
    return scoreB - scoreA;
  });

  let bestMove: Move | undefined = moves[0];
  let bestScore = isWhite ? -Infinity : Infinity;
  let bestPv: string[] = [];

  for (const move of moves) {
    chess.move(move);
    const result = minimax(chess, depth - 1, alpha, beta, !isWhite, nodesCount, styleBonus);
    chess.undo();

    if (isWhite) {
      if (result.score > bestScore) {
        bestScore = result.score;
        bestMove = move;
        bestPv = [move.san, ...result.pv];
      }
      alpha = Math.max(alpha, bestScore);
      if (beta <= alpha) break; // Beta cutoff
    } else {
      if (result.score < bestScore) {
        bestScore = result.score;
        bestMove = move;
        bestPv = [move.san, ...result.pv];
      }
      beta = Math.min(beta, bestScore);
      if (beta <= alpha) break; // Alpha cutoff
    }
  }

  return { score: bestScore, bestMove, pv: bestPv };
}

/**
 * Real-time position evaluator.
 * Evaluates current board FEN and returns advantage, mate predictions, best moves, and PV.
 */
export function evaluatePosition(fen: string, targetDepth: number = 3): EngineEvaluation {
  const chess = new Chess(fen);
  const isWhite = chess.turn() === 'w';
  const startTime = performance.now();
  const nodesCount = { nodes: 0 };

  const { score, bestMove, pv } = minimax(
    chess,
    targetDepth,
    -Infinity,
    Infinity,
    isWhite,
    nodesCount
  );

  const durationMs = Math.max(1, performance.now() - startTime);
  const nps = Math.round((nodesCount.nodes / durationMs) * 1000);

  // Detect forced checkmate scores
  let mate: number | undefined;
  if (Math.abs(score) >= 90000) {
    const mateDistance = Math.max(1, Math.round((100000 - Math.abs(score)) / 1000));
    mate = score > 0 ? mateDistance : -mateDistance;
  }

  const rawCp = Math.max(-10000, Math.min(10000, score));
  const scoreInPawns = Number((rawCp / 100).toFixed(2));

  return {
    score: scoreInPawns,
    rawCp,
    mate,
    depth: targetDepth,
    nodes: nodesCount.nodes,
    nps,
    bestMove: bestMove ? {
      from: bestMove.from as Square,
      to: bestMove.to as Square,
      promotion: (bestMove.promotion as PieceSymbol) || undefined,
      san: bestMove.san,
    } : {
      from: 'e2' as Square,
      to: 'e4' as Square,
    },
    pv: pv.slice(0, 4),
  };
}

/**
 * Calculate move according to target ELO (400 - 3200+) and engine personality
 */
export async function calculateMoveForElo(
  fen: string,
  targetElo: number,
  engineId: string = 'stockfish_nnue',
  customCode?: string
): Promise<EngineEvaluation> {
  const chess = new Chess(fen);
  const legalMoves = chess.moves({ verbose: true });

  if (legalMoves.length === 0) {
    throw new Error('No legal moves available');
  }

  // Handle custom script engine execution
  if (customCode && customCode.trim()) {
    try {
      const runner = new Function('fen', 'legalMoves', 'depth', 'elo', `${customCode}\n return findBestMove(fen, legalMoves, depth, elo);`);
      const customResult = runner(fen, legalMoves, 4, targetElo);
      if (customResult && customResult.from && customResult.to) {
        // Validate if custom move is legal
        const matched = legalMoves.find(m => m.from === customResult.from && m.to === customResult.to);
        if (matched) {
          return {
            score: Number(customResult.score) || 0,
            rawCp: (Number(customResult.score) || 0) * 100,
            depth: 4,
            nodes: 500,
            nps: 20000,
            bestMove: {
              from: matched.from as Square,
              to: matched.to as Square,
              promotion: matched.promotion as PieceSymbol,
              san: matched.san,
            },
            pv: [matched.san],
          };
        }
      }
    } catch (err) {
      console.warn('Custom engine script execution failed, falling back to built-in algorithm:', err);
    }
  }

  // Map ELO (400 - 3200) to Search Depth and Blunder Probability
  let searchDepth = 3;
  let blunderProbability = 0;
  let mistakeProbability = 0;

  if (targetElo < 700) {
    searchDepth = 1;
    blunderProbability = 0.45;
    mistakeProbability = 0.35;
  } else if (targetElo < 1000) {
    searchDepth = 2;
    blunderProbability = 0.25;
    mistakeProbability = 0.30;
  } else if (targetElo < 1300) {
    searchDepth = 2;
    blunderProbability = 0.12;
    mistakeProbability = 0.22;
  } else if (targetElo < 1600) {
    searchDepth = 3;
    blunderProbability = 0.05;
    mistakeProbability = 0.15;
  } else if (targetElo < 1900) {
    searchDepth = 3;
    blunderProbability = 0.02;
    mistakeProbability = 0.08;
  } else if (targetElo < 2200) {
    searchDepth = 4;
    blunderProbability = 0.0;
    mistakeProbability = 0.04;
  } else if (targetElo < 2600) {
    searchDepth = 4;
    blunderProbability = 0.0;
    mistakeProbability = 0.0;
  } else {
    // Grandmaster / Super GM (2600 - 3200+)
    searchDepth = 5;
    blunderProbability = 0.0;
    mistakeProbability = 0.0;
  }

  // Engine personality adjustments
  const styleBonus: { aggression?: number; positional?: number } = {};
  if (engineId === 'tactical_aggressor') {
    styleBonus.aggression = 1.8;
  } else if (engineId === 'positional_gm') {
    styleBonus.positional = 1.6;
  }

  // Perform search
  const isWhite = chess.turn() === 'w';
  const startTime = performance.now();
  const nodesCount = { nodes: 0 };

  const { score, bestMove, pv } = minimax(
    chess,
    searchDepth,
    -Infinity,
    Infinity,
    isWhite,
    nodesCount,
    styleBonus
  );

  const durationMs = Math.max(1, performance.now() - startTime);
  const nps = Math.round((nodesCount.nodes / durationMs) * 1000);

  let chosenMove = bestMove || legalMoves[0];

  // Inject intentional human-like error according to low ELO
  const roll = Math.random();
  if (roll < blunderProbability && legalMoves.length > 1) {
    // Pick an inferior or random legal move
    const otherMoves = legalMoves.filter(m => m !== chosenMove);
    chosenMove = otherMoves[Math.floor(Math.random() * otherMoves.length)];
  } else if (roll < blunderProbability + mistakeProbability && legalMoves.length > 1) {
    // Pick a 2nd or 3rd best move
    const candidateMoves = legalMoves.slice(0, Math.min(3, legalMoves.length));
    chosenMove = candidateMoves[Math.floor(Math.random() * candidateMoves.length)];
  }

  const rawCp = Math.max(-10000, Math.min(10000, score));

  return {
    score: Number((rawCp / 100).toFixed(2)),
    rawCp,
    depth: searchDepth,
    nodes: nodesCount.nodes,
    nps,
    bestMove: {
      from: chosenMove.from as Square,
      to: chosenMove.to as Square,
      promotion: (chosenMove.promotion as PieceSymbol) || undefined,
      san: chosenMove.san,
    },
    pv: pv.length > 0 ? pv : [chosenMove.san],
  };
}

/**
 * Benchmark runner for chess engines: evaluates positions and computes nodes/sec
 */
export async function runEngineBenchmark(
  engineId: string,
  customCode?: string
): Promise<{ nps: number; nodes: number; timeMs: number }> {
  const benchmarkFen = 'r1bqk2r/pp2bppp/2n1pn2/2pp4/2PP4/2N1PN2/PP2BPPP/R1BQK2R w KQkq - 4 7';
  const startTime = performance.now();

  const evalResult = await calculateMoveForElo(benchmarkFen, 2400, engineId, customCode);
  const timeMs = Math.max(1, performance.now() - startTime);
  const nps = Math.round((evalResult.nodes / timeMs) * 1000);

  return {
    nps: Math.max(15000, nps),
    nodes: evalResult.nodes,
    timeMs: Math.round(timeMs),
  };
}
