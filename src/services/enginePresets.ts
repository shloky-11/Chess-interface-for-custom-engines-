import { EngineDefinition } from '../types/chess';

export const DEFAULT_ENGINES: EngineDefinition[] = [
  {
    id: 'stockfish_nnue',
    name: 'Stockfish 16 NNUE',
    author: 'Stockfish Team & Tord Romstad',
    version: '16.1',
    description: 'The world champion chess engine. Features deep positional evaluation, tactical accuracy, and smooth ELO scaling from 400 to 3200+.',
    eloRange: [400, 3200],
    type: 'built-in',
    benchmarkScore: 28400,
  },
  {
    id: 'tactical_aggressor',
    name: 'Morphy Tactical Bot',
    author: 'Grandmaster Studio',
    version: '2.4',
    description: 'Sharp, attacking engine that seeks King hunts, open diagonals, and aggressive piece sacrifices to break open defenses.',
    eloRange: [1200, 2600],
    type: 'built-in',
    benchmarkScore: 22100,
  },
  {
    id: 'positional_gm',
    name: 'Karpov Positional GM',
    author: 'Grandmaster Studio',
    version: '3.1',
    description: 'Disciplined classical strategist emphasizing solid pawn structures, space advantage, outposts, and flawless endgame technique.',
    eloRange: [1400, 2800],
    type: 'built-in',
    benchmarkScore: 24500,
  },
  {
    id: 'speed_blitz',
    name: 'Tal Blitz Specialist',
    author: 'Grandmaster Studio',
    version: '1.8',
    description: 'Ultra-fast low-latency engine designed for bullet and blitz time controls, finding tricky counter-attacks under time pressure.',
    eloRange: [800, 2400],
    type: 'built-in',
    benchmarkScore: 31000,
  },
];

export const SAMPLE_CUSTOM_ENGINE_TEMPLATE = `/**
 * Custom Chess Engine Script Template
 * Grandmaster Studio UCI / Worker interface
 * 
 * Available input:
 * - fen: Current FEN string of the board
 * - legalMoves: Array of legal moves in SAN and UCI format { from, to, san, promotion }
 * - depth: Configured search depth
 * - elo: Configured target ELO (400-3200)
 * 
 * Must return:
 * {
 *   from: string, // e.g. "e2"
 *   to: string,   // e.g. "e4"
 *   promotion?: string, // 'q', 'r', 'b', 'n'
 *   score?: number, // evaluation in centipawns
 *   comment?: string // optional reasoning text
 * }
 */
function findBestMove(fen, legalMoves, depth, elo) {
  if (!legalMoves || legalMoves.length === 0) return null;

  // Prefer captures and checks
  const captures = legalMoves.filter(m => m.captured);
  const pool = captures.length > 0 && Math.random() < 0.75 ? captures : legalMoves;
  
  // Pick from best tactical candidate
  const chosen = pool[Math.floor(Math.random() * pool.length)];

  return {
    from: chosen.from,
    to: chosen.to,
    promotion: chosen.promotion,
    score: (Math.random() * 2 - 1).toFixed(2),
    comment: "Calculated via Custom Script Engine"
  };
}
`;
