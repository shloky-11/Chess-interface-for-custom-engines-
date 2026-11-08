export type Color = 'w' | 'b';

export type PieceSymbol = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';

export type Square = 
  | 'a8' | 'b8' | 'c8' | 'd8' | 'e8' | 'f8' | 'g8' | 'h8'
  | 'a7' | 'b7' | 'c7' | 'd7' | 'e7' | 'f7' | 'g7' | 'h7'
  | 'a6' | 'b6' | 'c6' | 'd6' | 'e6' | 'f6' | 'g6' | 'h6'
  | 'a5' | 'b5' | 'c5' | 'd5' | 'e5' | 'f5' | 'g5' | 'h5'
  | 'a4' | 'b4' | 'c4' | 'd4' | 'e4' | 'f4' | 'g4' | 'h4'
  | 'a3' | 'b3' | 'c3' | 'd3' | 'e3' | 'f3' | 'g3' | 'h3'
  | 'a2' | 'b2' | 'c2' | 'd2' | 'e2' | 'f2' | 'g2' | 'h2'
  | 'a1' | 'b1' | 'c1' | 'd1' | 'e1' | 'f1' | 'g1' | 'h1';

export type GameStatus =
  | 'in_progress'
  | 'checkmate'
  | 'stalemate'
  | 'threefold_repetition'
  | 'insufficient_material'
  | 'fifty_moves'
  | 'resigned'
  | 'time_out';

export type MoveClassification =
  | 'brilliant'
  | 'best'
  | 'excellent'
  | 'good'
  | 'inaccuracy'
  | 'mistake'
  | 'blunder'
  | 'book';

export interface MoveRecord {
  ply: number;
  moveNumber: number;
  color: Color;
  san: string;
  from: Square;
  to: Square;
  captured?: PieceSymbol;
  promotion?: PieceSymbol;
  fenBefore: string;
  fenAfter: string;
  timeRemaining?: number;
  analysis?: {
    scoreBefore: number; // centipawns relative to White
    scoreAfter: number;
    bestMoveSan: string;
    bestMoveFrom: Square;
    bestMoveTo: Square;
    classification: MoveClassification;
    evalDiff: number; // positive = advantage gained, negative = lost
    explanation: string;
  };
}

export type EngineType = 'built-in' | 'custom-script' | 'uci-worker';

export interface EngineDefinition {
  id: string;
  name: string;
  author: string;
  version: string;
  description: string;
  eloRange: [number, number];
  type: EngineType;
  isCustom?: boolean;
  scriptCode?: string;
  createdAt?: string;
  benchmarkScore?: number; // nodes/sec
}

export interface EngineSettings {
  engineId: string;
  targetElo: number; // 400 - 3200
  depth: number;
  realTimeAnalysis: boolean;
  showBestMoveArrow: boolean;
  showBlunderAlerts: boolean;
  soundEnabled: boolean;
  autoQueen: boolean;
}

export interface TimeControl {
  type: 'unlimited' | 'blitz_3_2' | 'blitz_5_0' | 'rapid_10_0' | 'classical_15_10' | 'custom';
  name: string;
  initialMinutes: number;
  incrementSeconds: number;
}

export interface EngineEvaluation {
  score: number; // in pawns e.g. +1.4 or centipawns
  rawCp: number; // centipawns (-10000 to +10000)
  mate?: number; // mate in N moves (+ for white, - for black)
  depth: number;
  nodes: number;
  nps: number;
  bestMove: {
    from: Square;
    to: Square;
    promotion?: PieceSymbol;
    san?: string;
  };
  pv: string[]; // principal variation moves e.g. ["e2e4", "c7c5", "g1f3"]
}
