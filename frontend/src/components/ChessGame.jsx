import React, { useEffect, useState } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { useCafeStore } from '../store/useCafeStore';
import { useSocket } from '../context/SocketContext';

// Simple starting board layout
const INITIAL_BOARD = [
  ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
  ['♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟'],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙'],
  ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖']
];

export const ChessGame = ({ tableId, onClose }) => {
  const socket = useSocket();
  const { gameState, updateGameState } = useCafeStore();
  const [board, setBoard] = useState(gameState.board || INITIAL_BOARD);
  const [selectedPiece, setSelectedPiece] = useState(null); // { r, c }
  const [turn, setTurn] = useState(gameState.turn || 'white');

  // 1. Sync board from Zustand
  useEffect(() => {
    if (gameState.board) {
      setBoard(gameState.board);
    }
    if (gameState.turn) {
      setTurn(gameState.turn);
    }
  }, [gameState]);

  // 2. Listen to socket updates
  useEffect(() => {
    if (!socket) return;

    socket.on('game:synced', ({ tableId: activeTableId, gameType, action, payload }) => {
      if (activeTableId === tableId && gameType === 'chess') {
        if (action === 'move') {
          updateGameState({ board: payload.board, turn: payload.turn });
        } else if (action === 'reset') {
          updateGameState({ board: INITIAL_BOARD, turn: 'white' });
        }
      }
    });

    return () => {
      socket.off('game:synced');
    };
  }, [socket, tableId]);

  const isWhitePiece = (char) => {
    if (!char) return false;
    return '♙♖♘♗♕♔'.includes(char);
  };

  const handleCellClick = (r, c) => {
    const piece = board[r][c];

    // Case 1: Selecting a piece
    if (!selectedPiece) {
      if (piece) {
        // Prevent selecting opponent's piece if we enforce turn-taking
        const isWhite = isWhitePiece(piece);
        if ((turn === 'white' && isWhite) || (turn === 'black' && !isWhite)) {
          setSelectedPiece({ r, c });
        }
      }
      return;
    }

    // Case 2: Moving the selected piece
    const { r: pr, c: pc } = selectedPiece;
    
    // Clicking the same cell cancels selection
    if (pr === r && pc === c) {
      setSelectedPiece(null);
      return;
    }

    // Perform piece move
    const newBoard = board.map((row) => [...row]);
    newBoard[r][c] = newBoard[pr][pc];
    newBoard[pr][pc] = '';

    const nextTurn = turn === 'white' ? 'black' : 'white';

    // Update locally and in Zustand
    setBoard(newBoard);
    setTurn(nextTurn);
    setSelectedPiece(null);

    updateGameState({ board: newBoard, turn: nextTurn });

    // Emit to room
    if (socket) {
      socket.emit('game:action', {
        tableId,
        gameType: 'chess',
        action: 'move',
        payload: { board: newBoard, turn: nextTurn }
      });
    }
  };

  const handleReset = () => {
    setBoard(INITIAL_BOARD);
    setTurn('white');
    setSelectedPiece(null);
    updateGameState({ board: INITIAL_BOARD, turn: 'white' });

    if (socket) {
      socket.emit('game:action', {
        tableId,
        gameType: 'chess',
        action: 'reset',
        payload: {}
      });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-neutral-900 border-4 border-amber-950 rounded-cozy p-5 shadow-2xl relative select-none">
      
      {/* Title bar */}
      <div className="flex justify-between items-center pb-2.5 border-b border-neutral-800 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🏆</span>
          <h2 className="text-sm font-extrabold font-display text-amber-200">Table {tableId.slice(-1).toUpperCase()} - Cozy Chess</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white rounded-lg transition-colors border border-neutral-700"
            title="Reset Board"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 bg-neutral-850 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Turn indicator */}
      <div className="mb-3 text-center text-xs font-bold py-1 px-3 bg-neutral-950/60 rounded-full border border-neutral-800/80 w-fit mx-auto capitalize text-amber-300">
        Turn: {turn === 'white' ? '⚪ White Chiller' : '⚫ Black Chiller'}
      </div>

      {/* Chess Grid Board */}
      <div className="aspect-square bg-amber-900 rounded-lg p-1.5 border border-amber-950 flex flex-col gap-0.5 shadow-inner">
        {board.map((row, r) => (
          <div key={r} className="flex-1 flex gap-0.5">
            {row.map((cell, c) => {
              const isDark = (r + c) % 2 === 1;
              const isSelected = selectedPiece && selectedPiece.r === r && selectedPiece.c === c;
              
              return (
                <button
                  key={c}
                  onClick={() => handleCellClick(r, c)}
                  className={`flex-1 flex items-center justify-center text-3xl font-normal transition-all hover:scale-105 select-none rounded-[3px] ${
                    isSelected
                      ? 'bg-amber-400/80 text-amber-950 shadow-inner scale-95 border border-amber-300'
                      : isDark
                      ? 'bg-amber-950/40 text-cream-50 hover:bg-amber-950/60'
                      : 'bg-cream-200/90 text-amber-950 hover:bg-cream-200'
                  }`}
                >
                  <span className="drop-shadow-md">{cell}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="mt-3 text-[10px] text-center text-neutral-500 font-semibold uppercase tracking-wider">
        Click piece to select ➔ Click square to move
      </div>
    </div>
  );
};
export default ChessGame;
