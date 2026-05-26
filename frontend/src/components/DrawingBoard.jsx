import React, { useEffect, useRef, useState } from 'react';
import { Palette, Eraser, Trash2, X } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

export const DrawingBoard = ({ tableId, onClose }) => {
  const socket = useSocket();
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const lastX = useRef(0);
  const lastY = useRef(0);

  const [color, setColor] = useState('#C87A53'); // Cozy Terracotta by default
  const [brushSize, setBrushSize] = useState(4);
  const [tool, setTool] = useState('pencil'); // pencil, eraser

  const colors = [
    { label: 'Terracotta', value: '#C87A53' },
    { label: 'Moss', value: '#A8B296' },
    { label: 'Warm Wood', value: '#8D7B68' },
    { label: 'Dark Wood', value: '#4A3E3D' },
    { label: 'Sunset Red', value: '#E78895' },
    { label: 'Lavender', value: '#D5C3E5' },
    { label: 'Chalk White', value: '#FAF8F5' }
  ];

  // 1. Sync dimensions & listen to drawing broadcasts
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Clear board with chalkboard dark green look
    ctx.fillStyle = '#2C3E50';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!socket) return;

    socket.on('game:synced', ({ tableId: activeTableId, gameType, action, payload }) => {
      if (activeTableId === tableId && gameType === 'whiteboard') {
        if (action === 'draw') {
          drawRemoteLine(payload);
        } else if (action === 'clear') {
          clearCanvasLocal();
        }
      }
    });

    return () => {
      socket.off('game:synced');
    };
  }, [socket, tableId]);

  const drawRemoteLine = ({ x, y, px, py, color, size }) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.moveTo(px, py);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.closePath();
  };

  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    // Support touch controls for mobile
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    return {
      x: ((clientX - rect.left) / rect.width) * canvas.width,
      y: ((clientY - rect.top) / rect.height) * canvas.height
    };
  };

  // 2. Mouse/Touch drawing events
  const startDrawing = (e) => {
    isDrawing.current = true;
    const { x, y } = getCanvasCoords(e);
    lastX.current = x;
    lastY.current = y;
  };

  const draw = (e) => {
    if (!isDrawing.current) return;
    e.preventDefault(); // Prevent page dragging on mobile

    const canvas = canvasRef.current;
    if (!canvas) return;

    const { x, y } = getCanvasCoords(e);
    const ctx = canvas.getContext('2d');

    const drawColor = tool === 'eraser' ? '#2C3E50' : color;
    const drawSize = tool === 'eraser' ? brushSize * 3 : brushSize;

    // Draw locally
    ctx.beginPath();
    ctx.strokeStyle = drawColor;
    ctx.lineWidth = drawSize;
    ctx.moveTo(lastX.current, lastY.current);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.closePath();

    // Broadcast stroke coordinate updates
    if (socket) {
      socket.emit('game:action', {
        tableId,
        gameType: 'whiteboard',
        action: 'draw',
        payload: {
          x,
          y,
          px: lastX.current,
          py: lastY.current,
          color: drawColor,
          size: drawSize
        }
      });
    }

    lastX.current = x;
    lastY.current = y;
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  const clearCanvasLocal = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#2C3E50';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const handleClear = () => {
    clearCanvasLocal();

    if (socket) {
      socket.emit('game:action', {
        tableId,
        gameType: 'whiteboard',
        action: 'clear',
        payload: {}
      });
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-neutral-900 border-4 border-amber-950 rounded-cozy p-4 shadow-2xl relative select-none">
      
      {/* Header toolbar controls */}
      <div className="flex justify-between items-center pb-2 border-b border-neutral-800 mb-3">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-amber-200" />
          <h2 className="text-sm font-extrabold font-display text-amber-200">Table {tableId.slice(-1).toUpperCase()} - Cozy Drawing Board</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 bg-neutral-850 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-md transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* DRAWING CANVAS */}
      <div className="bg-neutral-950 rounded-lg overflow-hidden border border-neutral-800 relative cursor-crosshair">
        <canvas
          ref={canvasRef}
          width={600}
          height={400}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full aspect-[3/2] block bg-[#2C3E50]"
        />
      </div>

      {/* BRUSH BAR CONTROLS */}
      <div className="mt-3 flex flex-wrap justify-between items-center gap-3 bg-neutral-950/60 p-2.5 rounded-lg border border-neutral-850">
        
        {/* Color buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {colors.map((c) => (
            <button
              key={c.value}
              onClick={() => {
                setColor(c.value);
                setTool('pencil');
              }}
              title={c.label}
              className={`w-6 h-6 rounded-full border-2 transition-transform btn-bounce ${
                color === c.value && tool === 'pencil'
                  ? 'border-white scale-110 shadow'
                  : 'border-transparent'
              }`}
              style={{ backgroundColor: c.value }}
            />
          ))}
        </div>

        {/* Thickness controls & tools */}
        <div className="flex items-center gap-2">
          {/* Eraser */}
          <button
            onClick={() => setTool('eraser')}
            className={`p-1.5 rounded-md border transition-all btn-bounce ${
              tool === 'eraser'
                ? 'bg-cozy-terracotta text-white border-cozy-terracotta shadow'
                : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white'
            }`}
            title="Chalk Eraser"
          >
            <Eraser className="w-4 h-4" />
          </button>

          {/* Size Dial */}
          <div className="flex items-center gap-1.5 bg-neutral-800 px-2 py-1 rounded-md border border-neutral-700">
            <span className="text-[10px] text-neutral-400 font-extrabold">BRUSH</span>
            <input
              type="range"
              min="2"
              max="16"
              step="1"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="w-14 h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-cozy-terracotta"
            />
          </div>

          {/* Clear board */}
          <button
            onClick={handleClear}
            className="p-1.5 bg-neutral-800 hover:bg-red-950 hover:text-red-400 text-neutral-400 rounded-md transition-all btn-bounce border border-neutral-700"
            title="Wipe Chalkboard"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
export default DrawingBoard;
