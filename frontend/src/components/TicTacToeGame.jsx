import React, { useEffect, useState } from 'react';
import { RefreshCw, X as CloseIcon } from 'lucide-react';
import { useCafeStore } from '../store/useCafeStore';
import { useSocket } from '../context/SocketContext';

const THEME_TTT_CONFIG = {
  tokyo_rain: {
    name: 'Matcha Go Grid',
    boardStyle: 'bg-emerald-950/20 border-2 border-emerald-800',
    cellStyle: 'bg-emerald-950/80 hover:bg-emerald-900 border-emerald-850',
    xColor: 'text-rose-400',
    oColor: 'text-emerald-400',
    titleColor: 'text-emerald-300'
  },
  beach_sunset: {
    name: 'Shells Sand Grid',
    boardStyle: 'bg-orange-950/20 border-2 border-orange-850',
    cellStyle: 'bg-amber-950/80 hover:bg-orange-900 border-orange-900',
    xColor: 'text-orange-400',
    oColor: 'text-cyan-400',
    titleColor: 'text-orange-300'
  },
  mountain_cabin: {
    name: 'Pinecone Log Grid',
    boardStyle: 'bg-amber-950/10 border-2 border-amber-900',
    cellStyle: 'bg-stone-950/80 hover:bg-stone-900 border-stone-850',
    xColor: 'text-amber-500',
    oColor: 'text-emerald-500',
    titleColor: 'text-amber-300'
  },
  library_study: {
    name: 'Ink & Quill Grid',
    boardStyle: 'bg-neutral-950/40 border-2 border-neutral-850',
    cellStyle: 'bg-zinc-950/80 hover:bg-zinc-900 border-zinc-850',
    xColor: 'text-amber-500',
    oColor: 'text-stone-400',
    titleColor: 'text-yellow-300'
  },
  fantasy_garden: {
    name: 'Magical Rune Grid',
    boardStyle: 'bg-purple-950/20 border-2 border-purple-850',
    cellStyle: 'bg-purple-950/80 hover:bg-purple-900 border-purple-850',
    xColor: 'text-pink-400',
    oColor: 'text-cyan-400',
    titleColor: 'text-fuchsia-300'
  }
};

export const TicTacToeGame = ({ tableId, onClose }) => {
  const socket = useSocket();
  const { gameState, updateGameState, activeRoom } = useCafeStore();
  const [board, setBoard] = useState(gameState.board || Array(9).fill(''));
  const [xIsNext, setXIsNext] = useState(gameState.xIsNext !== undefined ? gameState.xIsNext : true);
  const [winner, setWinner] = useState(gameState.winner || null);

  const theme = activeRoom?.theme || 'tokyo_rain';
  const conf = THEME_TTT_CONFIG[theme] || THEME_TTT_CONFIG['tokyo_rain'];

  // Sync board from Zustand
  useEffect(() => {
    if (gameState.board) setBoard(gameState.board);
    if (gameState.xIsNext !== undefined) setXIsNext(gameState.xIsNext);
    if (gameState.winner !== undefined) setWinner(gameState.winner);
  }, [gameState]);

  // Listen to socket syncs
  useEffect(() => {
    if (!socket) return;

    socket.on('game:synced', ({ tableId: activeTableId, gameType, action, payload }) => {
      if (activeTableId === tableId && gameType === 'tictactoe') {
        if (action === 'move') {
          updateGameState({
            board: payload.board,
            xIsNext: payload.xIsNext,
            winner: payload.winner
          });
        } else if (action === 'reset') {
          updateGameState({
            board: Array(9).fill(''),
            xIsNext: true,
            winner: null
          });
        }
      }
    });

    return () => {
      socket.off('game:synced');
    };
  }, [socket, tableId]);

  // Standard winning check helper
  const calculateWinner = (squares) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
      [0, 4, 8], [2, 4, 6]             // Diagonals
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    if (squares.every(s => s !== '')) return 'Draw';
    return null;
  };

  const handleCellClick = (index) => {
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = xIsNext ? 'X' : 'O';
    
    const gameWinner = calculateWinner(newBoard);
    const nextXIsNext = !xIsNext;

    setBoard(newBoard);
    setXIsNext(nextXIsNext);
    setWinner(gameWinner);

    // Save state
    updateGameState({
      board: newBoard,
      xIsNext: nextXIsNext,
      winner: gameWinner
    });

    // Broadcast
    if (socket) {
      socket.emit('game:action', {
        tableId,
        gameType: 'tictactoe',
        action: 'move',
        payload: { board: newBoard, xIsNext: nextXIsNext, winner: gameWinner }
      });
    }
  };

  const handleReset = () => {
    const freshBoard = Array(9).fill('');
    setBoard(freshBoard);
    setXIsNext(true);
    setWinner(null);

    updateGameState({
      board: freshBoard,
      xIsNext: true,
      winner: null
    });

    if (socket) {
      socket.emit('game:action', {
        tableId,
        gameType: 'tictactoe',
        action: 'reset',
        payload: {}
      });
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-neutral-900 border-4 border-amber-950 rounded-cozy p-5 shadow-2xl relative select-none">
      
      {/* Title Header */}
      <div className="flex justify-between items-center pb-2 border-b border-neutral-800 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">❌</span>
          <h2 className={`text-sm font-extrabold font-display ${conf.titleColor}`}>Table {tableId.slice(-1).toUpperCase()} - {conf.name}</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="p-1 bg-neutral-880 hover:bg-neutral-700 text-neutral-400 hover:text-white rounded-md transition-colors"
            title="Reset Board"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1 bg-neutral-850 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-md transition-colors"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Game Status */}
      <div className={`mb-4 text-center text-xs font-bold py-1 px-3 bg-neutral-950/60 rounded-full border border-neutral-800/80 w-fit mx-auto ${conf.titleColor}`}>
        {winner
          ? winner === 'Draw'
            ? '🤝 Peaceful Draw!'
            : `🎉 Winner: ${winner === 'X' ? '❌' : '⭕'}`
          : `Next player: ${xIsNext ? '❌ (Cross)' : '⭕ (Nought)'}`}
      </div>

      {/* Chalkboard Grid */}
      <div className={`aspect-square rounded-lg p-2 flex flex-wrap gap-1 ${conf.boardStyle}`}>
        {board.map((cell, idx) => (
          <button
            key={idx}
            onClick={() => handleCellClick(idx)}
            className={`w-[31%] h-[31%] rounded-md flex items-center justify-center text-4xl font-extrabold transition-all border border-neutral-850 shadow-inner ${conf.cellStyle} ${
              cell === 'X' ? conf.xColor : conf.oColor
            }`}
          >
            <span className="scale-110 drop-shadow-md">{cell}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
export default TicTacToeGame;
