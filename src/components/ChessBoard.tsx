import React, { useState } from 'react';
import { Chess, Square as ChessSquareType } from 'chess.js';
import { Color, MoveClassification, PieceSymbol, Square } from '../types/chess';
import { ChessPiece } from './ChessPieces';
import { BoardOverlay } from './BoardOverlay';

interface ChessBoardProps {
  chess: Chess;
  orientation: Color;
  onMove: (from: Square, to: Square, promotion?: PieceSymbol) => boolean;
  isEngineThinking: boolean;
  bestMoveArrow?: { from: Square; to: Square } | null;
  lastMove?: { from: Square; to: Square } | null;
  lastMoveBlunder?: { square: Square; classification: MoveClassification } | null;
  disabled?: boolean;
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
  chess,
  orientation,
  onMove,
  isEngineThinking,
  bestMoveArrow,
  lastMove,
  lastMoveBlunder,
  disabled = false,
}) => {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [draggedSquare, setDraggedSquare] = useState<Square | null>(null);
  const [promotionPending, setPromotionPending] = useState<{ from: Square; to: Square } | null>(null);

  // Files and ranks according to orientation
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

  const displayFiles = orientation === 'w' ? files : [...files].reverse();
  const displayRanks = orientation === 'w' ? ranks : [...ranks].reverse();

  // Find all legal moves for selected piece
  const legalMovesForSelected = React.useMemo(() => {
    if (!selectedSquare) return [];
    try {
      const moves = chess.moves({ square: selectedSquare as ChessSquareType, verbose: true });
      return moves.map(m => ({
        to: m.to as Square,
        isCapture: !!m.captured,
        promotion: !!m.promotion,
      }));
    } catch {
      return [];
    }
  }, [selectedSquare, chess]);

  // King in check square
  const inCheckSquare = React.useMemo(() => {
    if (!chess.inCheck()) return null;
    const turn = chess.turn();
    const board = chess.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.type === 'k' && piece.color === turn) {
          return `${String.fromCharCode(97 + c)}${8 - r}` as Square;
        }
      }
    }
    return null;
  }, [chess]);

  const handleSquareClick = (square: Square) => {
    if (disabled || isEngineThinking) return;

    if (!selectedSquare) {
      const piece = chess.get(square as ChessSquareType);
      if (piece && piece.color === chess.turn()) {
        setSelectedSquare(square);
      }
      return;
    }

    if (selectedSquare === square) {
      setSelectedSquare(null);
      return;
    }

    // Check if clicked square is a destination for the selected piece
    const isLegal = legalMovesForSelected.some(m => m.to === square);
    if (isLegal) {
      attemptMove(selectedSquare, square);
    } else {
      // If clicking another of one's own pieces, switch selection
      const piece = chess.get(square as ChessSquareType);
      if (piece && piece.color === chess.turn()) {
        setSelectedSquare(square);
      } else {
        setSelectedSquare(null);
      }
    }
  };

  const attemptMove = (from: Square, to: Square) => {
    const piece = chess.get(from as ChessSquareType);
    // Check if move is a pawn promotion
    const isPawn = piece && piece.type === 'p';
    const isPromotingRank = (piece?.color === 'w' && to[1] === '8') || (piece?.color === 'b' && to[1] === '1');

    if (isPawn && isPromotingRank) {
      setPromotionPending({ from, to });
      return;
    }

    const success = onMove(from, to);
    if (success) {
      setSelectedSquare(null);
    }
  };

  const completePromotion = (promoPiece: PieceSymbol) => {
    if (!promotionPending) return;
    onMove(promotionPending.from, promotionPending.to, promoPiece);
    setPromotionPending(null);
    setSelectedSquare(null);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, square: Square) => {
    if (disabled || isEngineThinking) {
      e.preventDefault();
      return;
    }
    const piece = chess.get(square as ChessSquareType);
    if (piece && piece.color === chess.turn()) {
      setDraggedSquare(square);
      setSelectedSquare(square);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', square);
    } else {
      e.preventDefault();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetSquare: Square) => {
    e.preventDefault();
    if (!draggedSquare) return;
    attemptMove(draggedSquare, targetSquare);
    setDraggedSquare(null);
  };

  return (
    <div className="relative inline-block select-none">
      {/* Outer Polished Mahogany Frame */}
      <div className="board-mahogany-frame p-3 md:p-4 rounded-xl border border-amber-900/50">
        {/* Vinyl Tournament Chessboard Container */}
        <div className="relative aspect-square w-[340px] sm:w-[420px] md:w-[480px] lg:w-[540px] xl:w-[580px] max-w-full rounded-md overflow-hidden shadow-2xl border border-emerald-950/40">
          {/* 8x8 Grid Squares */}
          <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
            {displayRanks.map((rank) =>
              displayFiles.map((file) => {
                const square = `${file}${rank}` as Square;
                const fileIdx = file.charCodeAt(0) - 97;
                const rankIdx = parseInt(rank, 10) - 1;
                const isDarkSquare = (fileIdx + rankIdx) % 2 === 0;

                const piece = chess.get(square as ChessSquareType);
                const isSelected = selectedSquare === square;
                const isLegalDestination = legalMovesForSelected.find(m => m.to === square);
                const isLastMoveSquare = lastMove && (lastMove.from === square || lastMove.to === square);
                const isInCheck = inCheckSquare === square;

                return (
                  <div
                    key={square}
                    onClick={() => handleSquareClick(square)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, square)}
                    className={`relative flex items-center justify-center cursor-pointer transition-colors duration-150 chess-square ${
                      isDarkSquare ? 'bg-[#739552]' : 'bg-[#ebecd0]'
                    } ${
                      isSelected ? 'ring-inset ring-4 ring-amber-400/90' : ''
                    } ${
                      isLastMoveSquare ? (isDarkSquare ? 'bg-[#baca44]' : 'bg-[#f7f784]') : ''
                    }`}
                  >
                    {/* King in Check Red Glow */}
                    {isInCheck && (
                      <div className="absolute inset-0 bg-red-600/70 animate-pulse rounded-sm pointer-events-none" />
                    )}

                    {/* Rank label on the leftmost column */}
                    {file === displayFiles[0] && (
                      <span
                        className={`absolute top-0.5 left-1 text-[10px] sm:text-xs font-semibold leading-none pointer-events-none ${
                          isDarkSquare ? 'text-[#ebecd0]/90' : 'text-[#739552]'
                        }`}
                      >
                        {rank}
                      </span>
                    )}

                    {/* File label on the bottom rank */}
                    {rank === displayRanks[7] && (
                      <span
                        className={`absolute bottom-0.5 right-1 text-[10px] sm:text-xs font-semibold leading-none pointer-events-none ${
                          isDarkSquare ? 'text-[#ebecd0]/90' : 'text-[#739552]'
                        }`}
                      >
                        {file}
                      </span>
                    )}

                    {/* Chess Piece Graphic */}
                    {piece && (
                      <div
                        draggable={!disabled && !isEngineThinking && piece.color === chess.turn()}
                        onDragStart={(e) => handleDragStart(e, square)}
                        className={`w-full h-full p-1 sm:p-1.5 transition-transform duration-100 ${
                          draggedSquare === square ? 'opacity-40 scale-95' : 'hover:scale-[1.03]'
                        }`}
                      >
                        <ChessPiece type={piece.type} color={piece.color} />
                      </div>
                    )}

                    {/* Legal Move Indicators */}
                    {isLegalDestination && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        {isLegalDestination.isCapture ? (
                          <div className="w-full h-full rounded-full border-4 border-black/25 sm:border-[5px]" />
                        ) : (
                          <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-black/25" />
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* SVG Overlay for Best Move Arrows and Blunder Badges */}
          <BoardOverlay
            bestMoveArrow={bestMoveArrow}
            lastMoveBlunder={lastMoveBlunder}
            orientation={orientation}
          />
        </div>
      </div>

      {/* Pawn Promotion Dialog Modal */}
      {promotionPending && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs rounded-xl p-4">
          <div className="bg-[#18181b] border border-slate-700 p-4 rounded-xl shadow-2xl text-center max-w-xs w-full animate-in fade-in zoom-in-95 duration-150">
            <h4 className="text-sm font-semibold text-slate-200 mb-3">Promote Pawn</h4>
            <div className="grid grid-cols-4 gap-2">
              {(['q', 'r', 'b', 'n'] as PieceSymbol[]).map((pieceSymbol) => (
                <button
                  key={pieceSymbol}
                  onClick={() => completePromotion(pieceSymbol)}
                  className="aspect-square flex items-center justify-center p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 transition hover:scale-105"
                  title={`Promote to ${pieceSymbol.toUpperCase()}`}
                >
                  <ChessPiece type={pieceSymbol} color={chess.turn()} className="w-8 h-8" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
