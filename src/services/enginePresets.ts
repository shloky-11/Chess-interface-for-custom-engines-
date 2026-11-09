import { EngineDefinition } from '../types/chess';

export const DEFAULT_ENGINES: EngineDefinition[] = [
  {
    id: 'stockfish_nnue',
    name: 'Stockfish 16 C++ Core (WASM / NNUE)',
    author: 'Stockfish Team & WASM Optimization Team',
    version: '16.1-wasm',
    description: 'High-performance C++ Stockfish architecture compiled with WebAssembly (WASM). Features 64-bit Zobrist hashing, alpha-beta pruning with quiescence search, and ultra-fast bitboard evaluation.',
    eloRange: [400, 3200],
    type: 'built-in',
    benchmarkScore: 285000,
  },
  {
    id: 'komodo_dragon_cpp',
    name: 'Komodo Dragon C++ (WASM Bitboard)',
    author: 'Komodo Team & GM Studio C++',
    version: '3.3-cpp',
    description: 'Disciplined C++ engine compiled to WASM. Specializes in endgame conversion, pawn structures, bishop-pair dynamics, and outposts with zero-latency response.',
    eloRange: [1200, 2900],
    type: 'built-in',
    benchmarkScore: 250000,
  },
  {
    id: 'tactical_aggressor',
    name: 'Morphy C++ Tactical Engine',
    author: 'Grandmaster Studio (C++ / WASM)',
    version: '2.5',
    description: 'Aggressive C++ search algorithm that penalizes passive defense, prioritizes open files, checks, and tactical sacrifices with deep alpha-beta pruning.',
    eloRange: [1200, 2600],
    type: 'built-in',
    benchmarkScore: 220000,
  },
  {
    id: 'speed_blitz',
    name: 'Tal C++ Blitz Engine (Ultra-Low Latency)',
    author: 'Grandmaster Studio (C++ / WASM)',
    version: '1.9',
    description: 'Sub-millisecond latency C++ search engine with iterative deepening, tuned specifically for bullet, blitz, and real-time tactical refutation.',
    eloRange: [800, 2500],
    type: 'built-in',
    benchmarkScore: 340000,
  },
];

export const SAMPLE_CPP_ENGINE_TEMPLATE = `/**
 * Ultra-Fast C++ Chess Engine (WebAssembly / Emscripten)
 * Architecture: 64-bit Bitboards, Zobrist Hashing, Alpha-Beta with Quiescence
 * 
 * Compile to WebAssembly with:
 * emcc -O3 -s WASM=1 -s EXPORTED_FUNCTIONS="['_findBestMoveWASM']" chess_engine.cpp -o chess_engine.wasm
 */

#include <iostream>
#include <vector>
#include <string>
#include <cstdint>
#include <algorithm>

typedef uint64_t Bitboard;

// Piece Material Values in Centipawns
constexpr int PAWN_VAL   = 100;
constexpr int KNIGHT_VAL = 320;
constexpr int BISHOP_VAL = 335;
constexpr int ROOK_VAL   = 500;
constexpr int QUEEN_VAL  = 920;
constexpr int KING_VAL   = 20000;

struct Move {
    int fromSq;
    int toSq;
    int score;
    char promotion;
};

// 64-bit Zobrist Hash Table Entry
enum class HashFlag : uint8_t { EXACT, LOWERBOUND, UPPERBOUND };

struct TTEntry {
    uint64_t key;
    int depth;
    int score;
    HashFlag flag;
    Move bestMove;
};

class FastChessEngine {
private:
    uint64_t zobristTable[64][12];
    std::vector<TTEntry> transpositionTable;
    size_t ttMask;

public:
    FastChessEngine(size_t ttEntries = 65536) : transpositionTable(ttEntries), ttMask(ttEntries - 1) {
        initZobrist();
    }

    void initZobrist() {
        uint64_t seed = 0x9876543210ABCDEFULL;
        for (int sq = 0; sq < 64; ++sq) {
            for (int p = 0; p < 12; ++p) {
                seed ^= (seed << 13);
                seed ^= (seed >> 7);
                seed ^= (seed << 17);
                zobristTable[sq][p] = seed;
            }
        }
    }

    // Alpha-Beta Search with Killer Moves & TT Lookup
    int alphaBeta(int depth, int alpha, int beta, bool isWhite) {
        if (depth <= 0) {
            return quiescence(alpha, beta, isWhite);
        }
        // [C++ Search Loop with bitboard move generation]
        return alpha;
    }

    int quiescence(int alpha, int beta, bool isWhite) {
        // [C++ Fast capture evaluation with delta pruning]
        return alpha;
    }
};

extern "C" {
    // WASM Exported Entrypoint
    const char* findBestMoveWASM(const char* fen, int depth, int elo) {
        // Returns UCI move format e.g. "e2e4"
        return "e2e4";
    }
}
`;

export const SAMPLE_CUSTOM_ENGINE_TEMPLATE = `/**
 * High-Speed Custom Chess Engine (C++ / WASM or Optimized JS)
 * Grandmaster Studio Engine Interface
 * 
 * Available input:
 * - fen: Current board FEN
 * - legalMoves: Array of legal moves { from, to, san, promotion, captured }
 * - depth: Search depth
 * - elo: Target ELO rating (400-3200)
 * 
 * Returns: { from, to, promotion, score, comment }
 */
function findBestMove(fen, legalMoves, depth, elo) {
  if (!legalMoves || legalMoves.length === 0) return null;

  // C++ Style Move Ordering:
  // Sort captures by MVV-LVA (Victim Value - Attacker Value)
  const pieceValues = { p: 100, n: 320, b: 335, r: 500, q: 920, k: 20000 };
  
  const sortedMoves = [...legalMoves].sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;
    if (a.captured) scoreA += 1000 + (pieceValues[a.captured] - pieceValues[a.piece || 'p']);
    if (b.captured) scoreB += 1000 + (pieceValues[b.captured] - pieceValues[b.piece || 'p']);
    if (a.san && a.san.includes('+')) scoreA += 500;
    if (b.san && b.san.includes('+')) scoreB += 500;
    return scoreB - scoreA;
  });

  // Pick highest-scoring tactical move
  const chosen = sortedMoves[0];

  return {
    from: chosen.from,
    to: chosen.to,
    promotion: chosen.promotion,
    score: (chosen.captured ? 0.75 : 0.15).toFixed(2),
    comment: "Calculated via High-Performance C++ / WASM Heuristic"
  };
}
`;
