import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useCafeStore } from '../store/useCafeStore';
import { useThemeStore } from '../store/useThemeStore';
import { useSocket } from '../context/SocketContext';
import { useWebRTC } from '../hooks/useWebRTC';
import {
  MessageSquare, Volume2, Moon, Sun, CloudRain,
  VolumeX, Coffee, Smile, Play, Award, HelpCircle
} from 'lucide-react';

import AvatarPreview from '../components/AvatarPreview';
import VinylPlayer from '../components/VinylPlayer';
import CoffeeBar from '../components/CoffeeBar';
import ChessGame from '../components/ChessGame';
import TicTacToeGame from '../components/TicTacToeGame';
import DrawingBoard from '../components/DrawingBoard';

const getApiUrl = () => window.location.hostname === 'localhost' ? '' : (import.meta.env.VITE_BACKEND_URL || '');

// Coordinates mapping for lounge objects
const OBJECTS = {
  barista: { x: 400, y: 110, w: 100, h: 50, label: 'Barista Counter 🍵' },
  fireplace: { x: 120, y: 130, w: 80, h: 60, label: 'Cozy Fireplace 🔥' },
  bookshelf: { x: 680, y: 140, w: 70, h: 70, label: 'Library Books 📚' },
  tableChess: { x: 220, y: 320, w: 60, h: 60, label: 'Chess Table 🏆', game: 'chess', id: 'tab_chess' },
  tableWhiteboard: { x: 580, y: 320, w: 60, h: 60, label: 'Whiteboard 🎨', game: 'whiteboard', id: 'tab_board' },
  tableTicTacToe: { x: 400, y: 380, w: 50, h: 50, label: 'TicTacToe ❌', game: 'tictactoe', id: 'tab_ttt' }
};

export const CafeLounge = () => {
  const { id: roomId } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();

  // Zustand state stores
  const { user, awardXP, awardCoins } = useAuthStore();
  const {
    activeRoom,
    activeUsers,
    messages,
    brewStatus,
    activeBuff,
    activeTableId,
    activeGameType,
    setActiveUsers,
    updateUserPosition,
    removeUser,
    addMessage,
    setMessages,
    serveCoffee,
    sitAtTable,
    leaveTable
  } = useCafeStore();

  const {
    isDay,
    weather,
    fireplaceOn,
    fireplaceIntensity,
    catMood,
    soundVolume,
    toggleDayNight,
    setWeather,
    toggleFireplace,
    setCatMood,
    setSoundVolume
  } = useThemeStore();

  // Local component coordinates & chat states
  const [playerPos, setPlayerPos] = useState({ x: 200, y: 350 });
  const [targetPos, setTargetPos] = useState({ x: 200, y: 350 });
  const [isWalking, setIsWalking] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [speechBubbles, setSpeechBubbles] = useState({}); // { [userId]: { text, expires } }
  const [activeOverlay, setActiveOverlay] = useState(null); // null, 'barista', 'bookshelf'
  const [sparkles, setSparkles] = useState([]); // Array of floating reactions
  const [showHelp, setShowHelp] = useState(true); // Kid-friendly Lounge Help defaults to true on entry

  const canvasRef = useRef(null);
  const playerPosRef = useRef({ x: 200, y: 350 });
  const animationFrameId = useRef(null);
  const socketThrottleRef = useRef(0);

  // WebRTC proximity hooks
  const { initLocalStream, localStream, initiateHandshake, audioElements } = useWebRTC(roomId, activeUsers, user._id);

  // 1. JOIN ROOM ON MOUNT
  useEffect(() => {
    if (!socket || !user || !roomId) return;

    // Fetch initial chat logs from database
    const fetchChatLogs = async () => {
      try {
        const response = await fetch(`${getApiUrl()}/api/rooms/${roomId}/messages`);
        const data = await response.json();
        if (data.success) {
          setMessages(data.messages);
        }
      } catch (err) {}
    };
    fetchChatLogs();

    // Trigger join
    socket.emit('room:join', { roomId, user });

    // Periodically award XP just for resting (Passive Cozy gamifications)
    const xpTimer = setInterval(() => {
      awardXP(10);
    }, 60000); // 10 XP every minute

    return () => {
      clearInterval(xpTimer);
    };
  }, [socket, roomId, user]);

  // 2. SOCKET SOCKET listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('room:users', (users) => {
      setActiveUsers(users);
    });

    socket.on('avatar:moved', ({ socketId, userId, x, y, state, tableId }) => {
      updateUserPosition(userId, { x, y, state, tableId });
    });

    socket.on('chat:received', (msg) => {
      addMessage(msg);
      
      // Trigger a visual speech bubble
      setSpeechBubbles(prev => ({
        ...prev,
        [msg.sender.userId]: {
          text: msg.text,
          expires: Date.now() + 4500
        }
      }));
    });

    socket.on('action:reacted', ({ userId, emoji }) => {
      // Spawn floating sparkles
      const newSpark = {
        id: Math.random(),
        userId,
        emoji,
        top: 20,
        opacity: 1
      };
      setSparkles(prev => [...prev, newSpark]);
    });

    socket.on('coffee:brewing', ({ username, drinkType }) => {
      // Barista brews alert
    });

    socket.on('coffee:served', ({ username, drinkType, buffName }) => {
      if (username === user.username) {
        serveCoffee(drinkType, buffName);
        awardXP(15);
      }
    });

    return () => {
      socket.off('room:users');
      socket.off('avatar:moved');
      socket.off('chat:received');
      socket.off('action:reacted');
      socket.off('coffee:brewing');
      socket.off('coffee:served');
    };
  }, [socket]);

  // Proximity Voice Handshake and volume scaling loop
  useEffect(() => {
    if (!socket || !localStream) return;

    const voiceInterval = setInterval(() => {
      activeUsers.forEach(peerUser => {
        if (peerUser.userId !== user._id && peerUser.socketId) {
          const dx = playerPos.x - peerUser.x;
          const dy = playerPos.y - peerUser.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            // Walking within 120 pixels triggers automatic spatial voice handshake!
            initiateHandshake(peerUser.socketId);
            
            // Adjust volume based on physical grid proximity
            const audio = audioElements[peerUser.socketId];
            if (audio) {
              const proximityVolume = Math.max(0, 1 - (distance / 150));
              audio.volume = proximityVolume * soundVolume; // Scale with user master volume
            }
          } else {
            // Fade out audio if players walk far apart
            const audio = audioElements[peerUser.socketId];
            if (audio) {
              audio.volume = 0;
            }
          }
        }
      });
    }, 1500);

    return () => clearInterval(voiceInterval);
  }, [activeUsers, playerPos, localStream, socket, audioElements, soundVolume]);

  // 3. BACKGROUND CANVAS RENDERING (Cozy wood boards, sparks, weather)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let sparkFrame;

    // Cozy Fire embers particles array
    let embers = Array.from({ length: 15 }, () => ({
      x: OBJECTS.fireplace.x + 20 + Math.random() * 40,
      y: OBJECTS.fireplace.y + 35 + Math.random() * 10,
      r: Math.random() * 2 + 1,
      v: Math.random() * 0.6 + 0.2,
      o: Math.random() * 0.7 + 0.3
    }));

    const drawGrid = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Floor shade: soft light Ghibli cream-yellow wood floorboards
      ctx.fillStyle = isDay ? '#FDFBF7' : '#FAF4EB';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Horizontal wood planks lines
      ctx.strokeStyle = 'rgba(141,123,104,0.08)';
      ctx.lineWidth = 2.5;
      for (let i = 0; i < canvas.height; i += 30) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }

      // Draw cozy fireplace embers
      if (fireplaceOn) {
        // Draw wood logs
        ctx.fillStyle = '#5A3825';
        ctx.fillRect(OBJECTS.fireplace.x + 22, OBJECTS.fireplace.y + 42, 36, 8);

        ctx.fillStyle = '#E67E22';
        ctx.beginPath();
        ctx.arc(OBJECTS.fireplace.x + 40, OBJECTS.fireplace.y + 40, 18, 0, Math.PI, true);
        ctx.fill();

        // Animate floating red fire embers sparks
        embers.forEach(e => {
          ctx.fillStyle = `rgba(231, 76, 60, ${e.o})`;
          ctx.beginPath();
          ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
          ctx.fill();

          e.y -= e.v;
          e.o -= 0.008;
          if (e.o <= 0) {
            e.y = OBJECTS.fireplace.y + 38 + Math.random() * 8;
            e.o = Math.random() * 0.7 + 0.3;
          }
        });
      }

      // Draw rain weather lines overlay
      if (weather === 'rain') {
        ctx.strokeStyle = 'rgba(74, 144, 226, 0.45)'; // Rich, cozy blue raindrop color
        ctx.lineWidth = 2.5; // Thicker streaks
        for (let i = 0; i < 24; i++) { // More raindrops
          ctx.beginPath();
          const rx = Math.random() * canvas.width;
          const ry = Math.random() * canvas.height;
          ctx.moveTo(rx, ry);
          ctx.lineTo(rx - 3, ry + 18);
          ctx.stroke();
        }
      }

      sparkFrame = requestAnimationFrame(drawGrid);
    };
    drawGrid();

    return () => {
      cancelAnimationFrame(sparkFrame);
    };
  }, [isDay, weather, fireplaceOn]);

  // 4. TICK WALK interpolation LERP loops
  useEffect(() => {
    const updateLoop = () => {
      const dx = targetPos.x - playerPosRef.current.x;
      const dy = targetPos.y - playerPosRef.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 3) {
        setIsWalking(true);
        // Apply Espresso Energy Buff speed modifier
        const speedFactor = activeBuff?.name === 'Energy Speed' ? 0.14 : 0.09;
        
        const nextX = playerPosRef.current.x + dx * speedFactor;
        const nextY = playerPosRef.current.y + dy * speedFactor;

        const currentPos = { x: Math.round(nextX), y: Math.round(nextY) };
        setPlayerPos(currentPos);
        playerPosRef.current = currentPos;

        // Throttle Socket move relays to every 3 animation frames (approx 50ms) to maximize performance
        if (socket && Date.now() - socketThrottleRef.current > 50) {
          socket.emit('avatar:move', {
            x: currentPos.x,
            y: currentPos.y,
            state: 'walking',
            tableId: null
          });
          socketThrottleRef.current = Date.now();
        }
      } else {
        if (isWalking) {
          setIsWalking(false);
          // Snap complete
          if (socket) {
            socket.emit('avatar:move', {
              x: playerPos.x,
              y: playerPos.y,
              state: 'idle',
              tableId: null
            });
          }
        }
      }
      animationFrameId.current = requestAnimationFrame(updateLoop);
    };
    animationFrameId.current = requestAnimationFrame(updateLoop);

    return () => {
      cancelAnimationFrame(animationFrameId.current);
    };
  }, [targetPos, isWalking, socket, activeBuff]);

  // Sparkle floating updates
  useEffect(() => {
    const timer = setInterval(() => {
      setSparkles(prev =>
        prev
          .map(s => ({ ...s, top: s.top + 3, opacity: s.opacity - 0.04 }))
          .filter(s => s.opacity > 0)
      );
    }, 40);
    return () => clearInterval(timer);
  }, []);

  // 5. INTERACT AND WALK EVENT
  const handleCanvasClick = (e) => {
    // If a game table is active, we cannot walk freely
    if (activeTableId) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = Math.round(((e.clientX - rect.left) / rect.width) * canvas.width);
    const clickY = Math.round(((e.clientY - rect.top) / rect.height) * canvas.height);

    // Collision boundaries check: prevent walking directly over fireplace
    if (
      clickX > OBJECTS.fireplace.x &&
      clickX < OBJECTS.fireplace.x + OBJECTS.fireplace.w &&
      clickY > OBJECTS.fireplace.y &&
      clickY < OBJECTS.fireplace.y + OBJECTS.fireplace.h
    ) {
      return;
    }

    setTargetPos({ x: clickX, y: clickY });
    setActiveOverlay(null);
  };

  const handleSeatClick = (table) => {
    setTargetPos({ x: table.x + 20, y: table.y + 40 });
    sitAtTable(table.id, table.game);

    if (socket) {
      socket.emit('avatar:move', {
        x: table.x + 20,
        y: table.y + 40,
        state: 'sitting',
        tableId: table.id
      });
    }
  };

  const handleBaristaCounterClick = () => {
    setTargetPos({ x: OBJECTS.barista.x + 30, y: OBJECTS.barista.y + 40 });
    setActiveOverlay('barista');
  };

  const handleBookshelfClick = () => {
    setTargetPos({ x: OBJECTS.bookshelf.x + 20, y: OBJECTS.bookshelf.y + 40 });
    setActiveOverlay('bookshelf');
    awardXP(5);
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    if (socket) {
      socket.emit('chat:send', { text: chatInput, tableId: activeTableId });
    }
    setChatInput('');
  };

  const handleEmojiReact = (emoji) => {
    if (socket) {
      socket.emit('action:react', { emoji, action: 'wave' });
    }
  };

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col gap-5 p-4 relative select-none">
      
      {/* Dynamic weather/lighting overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-40 transition-colors duration-1000"
        style={{
          backgroundColor: weather === 'rain'
            ? 'rgba(44, 62, 80, 0.18)' // Cozy slate tint for rain
            : !isDay
            ? 'rgba(44, 62, 80, 0.22)' // Deep night
            : weather === 'sunset'
            ? 'rgba(230, 126, 34, 0.08)' // Sunset orange
            : 'transparent'
        }}
      />

      {/* TOP CONTROLS HUD */}
      <header className="flex flex-wrap justify-between items-center bg-white/75 py-3 px-5 rounded-cozy border border-cream-300 shadow-glass relative z-30 gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="py-1.5 px-3 bg-cream-200 hover:bg-cream-300 text-xs font-bold text-cozy-darkWood rounded-lg border border-cream-300 btn-bounce flex items-center gap-1"
          >
            <span>🚪</span>
            <span>Leave Café</span>
          </button>
          
          <h2 className="text-sm font-extrabold text-cozy-darkWood hidden sm:block">
            Lounge: {activeRoom ? activeRoom.name : 'Virtual Café'}
          </h2>
        </div>

        {/* WEATHER & LIGHTS SWITCHES */}
        <div className="flex items-center gap-2">
          {/* Day Night Toggle */}
          <button
            onClick={toggleDayNight}
            className="p-1.5 bg-white border border-cream-300 text-cozy-darkWood rounded-md hover:bg-cream-50 btn-bounce"
            title="Toggle Day/Night"
          >
            {isDay ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Rain Mode */}
          <button
            onClick={() => setWeather(weather === 'rain' ? 'clear' : 'rain')}
            className={`p-1.5 border rounded-md btn-bounce transition-all ${
              weather === 'rain'
                ? 'bg-cozy-beige text-cozy-terracotta border-cozy-terracotta shadow-sm'
                : 'bg-white text-cozy-darkWood border-cream-300 hover:bg-cream-50'
            }`}
            title="Toggle Rainy weather"
          >
            <CloudRain className="w-4 h-4" />
          </button>

          {/* Spatial Mic activation */}
          <button
            onClick={initLocalStream}
            className={`py-1 px-2.5 rounded-lg border font-bold text-xs btn-bounce transition-all flex items-center gap-1 ${
              localStream
                ? 'bg-cozy-moss text-white border-cozy-moss'
                : 'bg-white text-cozy-brown border-cream-300 hover:bg-cream-50'
            }`}
          >
            <span>🎙️</span>
            <span>{localStream ? 'Mic Active' : 'Mic Off'}</span>
          </button>

          {/* Lounge Onboarding Help Manual */}
          <button
            onClick={() => setShowHelp(true)}
            className="p-1.5 bg-white border border-cream-300 text-cozy-darkWood rounded-md hover:bg-cream-50 btn-bounce"
            title="Lounge Onboarding Help Manual"
          >
            <HelpCircle className="w-4 h-4 text-cozy-terracotta" />
          </button>
        </div>
      </header>

      {/* Lounges main 2.5D visual area */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 relative z-10">
        
        {/* LEFT COLUMN: ACTIVE ENVIRONMENT AND HUD PLAYS */}
        <div className="xl:col-span-3 flex flex-col gap-4">
          
          <div className="relative border-4 border-cozy-brown/85 rounded-cozy overflow-hidden shadow-2xl bg-cream-200">
            {/* CANVAS FLOOR TILES */}
            <canvas
              ref={canvasRef}
              width={800}
              height={500}
              onClick={handleCanvasClick}
              className="w-full aspect-[8/5] block cursor-pointer"
            />

            {/* FURNITURE CARDS OVERLAID DIRECTLY ON CANVAS */}
            
            {/* Cozy Fireplace */}
            <div
              onClick={toggleFireplace}
              className="absolute pointer-events-auto cursor-pointer"
              style={{
                left: `${(OBJECTS.fireplace.x / 800) * 100}%`,
                top: `${(OBJECTS.fireplace.y / 500) * 100}%`,
                width: `${(OBJECTS.fireplace.w / 800) * 100}%`,
                height: `${(OBJECTS.fireplace.h / 500) * 100}%`
              }}
              title="Click to stoke/extinguish Fire"
            >
              <div className="w-full h-full border border-orange-500/10 flex items-end justify-center">
                <span className="text-[10px] bg-amber-950/80 text-amber-300 font-extrabold px-1.5 py-0.5 rounded-full select-none transform translate-y-3">
                  🔥 Fireplace
                </span>
              </div>
            </div>

            {/* Barista Counter */}
            <div
              onClick={handleBaristaCounterClick}
              className="absolute pointer-events-auto cursor-pointer flex flex-col items-center justify-center bg-amber-900/10 border-2 border-dashed border-amber-800/20 hover:bg-amber-900/20 rounded-lg"
              style={{
                left: `${(OBJECTS.barista.x / 800) * 100}%`,
                top: `${(OBJECTS.barista.y / 500) * 100}%`,
                width: `${(OBJECTS.barista.w / 800) * 100}%`,
                height: `${(OBJECTS.barista.h / 500) * 100}%`
              }}
            >
              <span className="text-3xl animate-bounce">☕</span>
              <span className="text-[9px] bg-amber-950/80 text-amber-200 font-bold px-1.5 py-0.5 rounded-full">Barista</span>
            </div>

            {/* Bookshelf */}
            <div
              onClick={handleBookshelfClick}
              className="absolute pointer-events-auto cursor-pointer flex flex-col items-center justify-center bg-teal-900/10 border-2 border-dashed border-teal-800/20 hover:bg-teal-900/20 rounded-lg"
              style={{
                left: `${(OBJECTS.bookshelf.x / 800) * 100}%`,
                top: `${(OBJECTS.bookshelf.y / 500) * 100}%`,
                width: `${(OBJECTS.bookshelf.w / 800) * 100}%`,
                height: `${(OBJECTS.bookshelf.h / 500) * 100}%`
              }}
            >
              <span className="text-3xl">📚</span>
              <span className="text-[9px] bg-teal-950/80 text-teal-200 font-bold px-1.5 py-0.5 rounded-full">Bookshelf</span>
            </div>

            {/* Game Chess table */}
            <div
              onClick={() => handleSeatClick(OBJECTS.tableChess)}
              className="absolute pointer-events-auto cursor-pointer flex flex-col items-center justify-center bg-neutral-900/10 border-2 border-dashed border-neutral-800/20 hover:bg-neutral-900/20 rounded-lg"
              style={{
                left: `${(OBJECTS.tableChess.x / 800) * 100}%`,
                top: `${(OBJECTS.tableChess.y / 500) * 100}%`,
                width: `${(OBJECTS.tableChess.w / 800) * 100}%`,
                height: `${(OBJECTS.tableChess.h / 500) * 100}%`
              }}
            >
              <span className="text-2xl animate-pulse">🏆</span>
              <span className="text-[9px] bg-neutral-950/85 text-neutral-200 font-bold px-1.5 py-0.5 rounded-full mt-1">Chess Table</span>
            </div>

            {/* Game Whiteboard table */}
            <div
              onClick={() => handleSeatClick(OBJECTS.tableWhiteboard)}
              className="absolute pointer-events-auto cursor-pointer flex flex-col items-center justify-center bg-neutral-900/10 border-2 border-dashed border-neutral-800/20 hover:bg-neutral-900/20 rounded-lg"
              style={{
                left: `${(OBJECTS.tableWhiteboard.x / 800) * 100}%`,
                top: `${(OBJECTS.tableWhiteboard.y / 500) * 100}%`,
                width: `${(OBJECTS.tableWhiteboard.w / 800) * 100}%`,
                height: `${(OBJECTS.tableWhiteboard.h / 500) * 100}%`
              }}
            >
              <span className="text-2xl">🎨</span>
              <span className="text-[9px] bg-neutral-950/85 text-neutral-200 font-bold px-1.5 py-0.5 rounded-full mt-1">Drawing Board</span>
            </div>

            {/* Game TicTacToe table */}
            <div
              onClick={() => handleSeatClick(OBJECTS.tableTicTacToe)}
              className="absolute pointer-events-auto cursor-pointer flex flex-col items-center justify-center bg-neutral-900/10 border-2 border-dashed border-neutral-800/20 hover:bg-neutral-900/20 rounded-lg"
              style={{
                left: `${(OBJECTS.tableTicTacToe.x / 800) * 100}%`,
                top: `${(OBJECTS.tableTicTacToe.y / 500) * 100}%`,
                width: `${(OBJECTS.tableTicTacToe.w / 800) * 100}%`,
                height: `${(OBJECTS.tableTicTacToe.h / 500) * 100}%`
              }}
            >
              <span className="text-2xl">❌</span>
              <span className="text-[9px] bg-neutral-950/85 text-neutral-200 font-bold px-1.5 py-0.5 rounded-full mt-1">TicTacToe</span>
            </div>

            {/* Sleeping Cat decorative spot */}
            <div
              onClick={() => {
                setCatMood('purring');
                awardCoins(2);
                setTimeout(() => setCatMood('sleeping'), 4000);
              }}
              className="absolute cursor-pointer select-none"
              style={{
                left: `${((OBJECTS.fireplace.x + 85) / 800) * 100}%`,
                top: `${((OBJECTS.fireplace.y + 42) / 500) * 100}%`
              }}
              title="Click to pet Cozy Cat!"
            >
              <div className="flex flex-col items-center">
                {catMood === 'purring' && (
                  <span className="text-[9px] font-bold text-amber-600 bg-white/80 border border-amber-200 py-0.5 px-1.5 rounded-full animate-bounce">
                    Purr~ 💖
                  </span>
                )}
                <span className="text-xl">🐱</span>
              </div>
            </div>

            {/* RENDER ACTIVE USERS IN COZY LAYER */}
            
            {/* OTHER CLIENT PLAYERS */}
            {activeUsers
              .filter(u => u.userId !== user._id)
              .map((p) => (
                <div
                  key={p.userId}
                  className="absolute pointer-events-none transition-all duration-300"
                  style={{
                    left: `${(p.x / 800) * 100}%`,
                    top: `${(p.y / 500) * 100}%`,
                    transform: 'translate(-50%, -85%)'
                  }}
                >
                  <div className="flex flex-col items-center relative">
                    
                    {/* Speech bubble */}
                    {speechBubbles[p.userId] && speechBubbles[p.userId].expires > Date.now() && (
                      <div className="speech-bubble py-1.5 px-2.5 max-w-[120px] text-[10px] font-bold text-cozy-darkWood mb-2 break-words text-center leading-snug">
                        {speechBubbles[p.userId].text}
                      </div>
                    )}

                    {/* Level Badge */}
                    <div className="text-[8px] bg-cozy-darkWood text-cream-100 font-extrabold px-1.5 py-0.2 rounded-full absolute -top-4">
                      Lv.{p.stats?.level || 1}
                    </div>

                    <AvatarPreview
                      hairstyle={p.avatar.hairstyle}
                      hairColor={p.avatar.hairColor}
                      outfit={p.avatar.outfit}
                      outfitColor={p.avatar.outfitColor}
                      skinTone={p.avatar.skinTone}
                      accessory={p.avatar.accessory}
                      pet={p.avatar.pet}
                      size={54}
                      animation={p.state}
                    />

                    {/* Name tag */}
                    <div className="bg-white/80 border border-cream-300/40 py-0.5 px-2 rounded-full shadow text-[10px] font-extrabold text-cozy-darkWood mt-1">
                      {p.username}
                    </div>
                  </div>
                </div>
              ))}

            {/* LOGGED IN USER AVATAR */}
            <div
              className="absolute pointer-events-none"
              style={{
                left: `${(playerPos.x / 800) * 100}%`,
                top: `${(playerPos.y / 500) * 100}%`,
                transform: 'translate(-50%, -85%)',
                zIndex: 10
              }}
            >
              <div className="flex flex-col items-center relative">
                
                {/* Speech bubble */}
                {speechBubbles[user._id] && speechBubbles[user._id].expires > Date.now() && (
                  <div className="speech-bubble py-1.5 px-2.5 max-w-[120px] text-[10px] font-bold text-cozy-darkWood mb-2 break-words text-center leading-snug">
                    {speechBubbles[user._id].text}
                  </div>
                )}

                {/* Local Buff floating bubbles */}
                {activeBuff && (
                  <div className="absolute -top-6 text-sm bg-amber-950 border border-amber-900 py-0.5 px-2.5 rounded-full font-bold text-amber-300 flex items-center gap-1 animate-pulse">
                    <span>{activeBuff.icon}</span>
                    <span className="text-[8px] uppercase tracking-wider">{activeBuff.name}</span>
                  </div>
                )}

                {/* Level badge */}
                <div className="text-[8px] bg-cozy-terracotta text-white font-extrabold px-1.5 py-0.2 rounded-full absolute -top-4 shadow-sm animate-bounce">
                  Lv.{user.stats.level}
                </div>

                <AvatarPreview
                  hairstyle={user.avatar.hairstyle}
                  hairColor={user.avatar.hairColor}
                  outfit={user.avatar.outfit}
                  outfitColor={user.avatar.outfitColor}
                  skinTone={user.avatar.skinTone}
                  accessory={user.avatar.accessory}
                  pet={user.avatar.pet}
                  size={58}
                  animation={isWalking ? 'walking' : activeTableId ? 'sitting' : 'idle'}
                />

                {/* Username label */}
                <div className="bg-cozy-terracotta border border-cozy-terracotta/20 py-0.5 px-2 rounded-full shadow text-[10px] font-extrabold text-white mt-1">
                  You ({user.username})
                </div>
              </div>
            </div>

            {/* FLOATING EMOTE REACTIONS OVERLAYS */}
            {sparkles.map(s => {
              const u = activeUsers.find(au => au.userId === s.userId) || (s.userId === user._id ? { x: playerPos.x, y: playerPos.y } : null);
              if (!u) return null;
              return (
                <div
                  key={s.id}
                  className="absolute pointer-events-none transition-all duration-300 text-2xl animate-ping select-none"
                  style={{
                    left: `${(u.x / 800) * 100}%`,
                    top: `${((u.y - 65) / 500) * 100}%`,
                    transform: 'translate(-50%, -50%)',
                    opacity: s.opacity
                  }}
                >
                  {s.emoji}
                </div>
              );
            })}
          </div>

          {/* EMOTE BAR CONTROLS */}
          <div className="flex bg-white/70 py-2.5 px-4 rounded-cozy border border-cream-300 shadow-glass items-center justify-between">
            <span className="text-[10px] text-cozy-brown font-extrabold uppercase tracking-wider">Tap Emote Reactions:</span>
            <div className="flex gap-2">
              {['❤️', '✨', '☕', '🍵', '💤', '🎉', '👋', '🔥'].map(emoji => (
                <button
                  key={emoji}
                  onClick={() => handleEmojiReact(emoji)}
                  className="p-1.5 text-base bg-white hover:bg-cream-100 rounded-lg border border-cream-300 transition-transform btn-bounce"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: INTEGRATED GAMES DRAWER & CHATS */}
        <div className="xl:col-span-1 flex flex-col gap-4">
          
          {/* SYNCD LO-FI VINYL PLAYER */}
          <VinylPlayer isHost={activeRoom?.hostId === user._id} />

          {/* ACTIVE GAMES CONTAINER */}
          {activeTableId && activeGameType === 'chess' && (
            <ChessGame tableId={activeTableId} onClose={leaveTable} />
          )}

          {activeTableId && activeGameType === 'tictactoe' && (
            <TicTacToeGame tableId={activeTableId} onClose={leaveTable} />
          )}

          {activeTableId && activeGameType === 'whiteboard' && (
            <DrawingBoard tableId={activeTableId} onClose={leaveTable} />
          )}

          {/* INTERACTIVE INTERLACE OVERLAYS */}
          {activeOverlay === 'barista' && (
            <CoffeeBar onClose={() => setActiveOverlay(null)} />
          )}

          {activeOverlay === 'bookshelf' && (
            <div className="glass-panel p-5 rounded-cozy border border-white/50 flex flex-col gap-4 bg-white/90 shadow-cozy text-left">
              <div className="flex justify-between items-center pb-2 border-b border-cream-200">
                <span className="text-lg">📚 Library Notebook</span>
                <button
                  onClick={() => setActiveOverlay(null)}
                  className="text-xs bg-cream-200 hover:bg-cream-300 py-1 px-3.5 rounded-lg border border-cream-300 font-bold"
                >
                  Close
                </button>
              </div>
              <p className="text-xs text-cozy-darkWood italic font-bold">"Today is a good day to rest, reflect, and enjoy a warm cup of coffee in Mochill."</p>
              <div className="bg-cream-100 p-3 rounded-lg border border-cream-300/30 text-[10px] text-cozy-brown font-semibold leading-relaxed">
                📘 Daily Affirmation: "You are doing incredible work. Remember to breathe and step away when needed. Your mental sanity is valuable!"
              </div>
            </div>
          )}

          {/* CHAT BOARD ROOM */}
          {!activeTableId && !activeOverlay && (
            <div className="glass-panel rounded-cozy border border-white/50 flex flex-col h-[280px] shadow-cozy overflow-hidden">
              <div className="bg-white/60 p-3 border-b border-cream-300/40 text-left">
                <h3 className="text-xs font-bold text-cozy-darkWood flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-cozy-terracotta" />
                  <span>Room General Chat</span>
                </h3>
              </div>

              {/* MESSAGE LOG SCROLLER */}
              <div className="flex-1 p-3 overflow-y-auto flex flex-col gap-2">
                {messages.length === 0 ? (
                  <p className="text-[10px] text-center text-cozy-brown/85 font-medium my-auto">Silence is beautiful. Say something nice!</p>
                ) : (
                  messages.map((m, idx) => (
                    <div key={m._id || idx} className="text-left bg-white/60 py-1.5 px-3 rounded-lg border border-cream-200/50">
                      <div className="flex justify-between text-[9px] font-extrabold text-cozy-terracotta">
                        <span>{m.sender.username}</span>
                        <span className="text-[8px] text-cozy-brown/50">
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-cozy-darkWood font-medium mt-0.5 break-words">
                        {m.text}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* INPUT SEND */}
              <form onSubmit={handleSendChat} className="p-2 border-t border-cream-300/40 bg-white/40 flex gap-2">
                <input
                  type="text"
                  placeholder="Share some cozy thoughts..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-white border border-cream-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-cozy-terracotta text-cozy-darkWood"
                  maxLength={50}
                />
                <button
                  type="submit"
                  className="py-1.5 px-3 bg-cozy-terracotta hover:bg-cozy-terracotta/90 text-white rounded-lg text-xs font-bold shadow transition-all btn-bounce"
                >
                  Send
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* KID-FRIENDLY BEGINNER GUIDE MODAL OVERLAY */}
      {showHelp && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center p-6 select-none">
          <div className="w-full max-w-lg bg-white border-4 border-cozy-brown/80 rounded-cozy p-6 shadow-2xl relative flex flex-col gap-5 text-left max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-cream-200">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📖</span>
                <h2 className="text-base font-extrabold font-display text-cozy-darkWood">Mochill Café Onboarding Quest</h2>
              </div>
              <button
                onClick={() => setShowHelp(false)}
                className="py-1 px-4 bg-cozy-terracotta hover:bg-cozy-terracotta/90 text-white font-extrabold rounded-lg text-xs transition-all btn-bounce shadow-sm"
              >
                Let's Play! 🛋️
              </button>
            </div>

            <div className="flex flex-col gap-4 text-xs font-semibold text-cozy-brown leading-relaxed">
              
              <div className="flex items-start gap-3 bg-cream-100 p-3 rounded-lg border border-cream-300/30">
                <span className="text-xl">🎮</span>
                <div>
                  <h4 className="font-extrabold text-cozy-darkWood text-xs">How to Walk Around</h4>
                  <p className="text-[11px] mt-0.5">Simply **click anywhere on the floorboards**! Your Ghibli sprite avatar will smoothly walk directly towards your cursor. Click near tables to seat yourself.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-cream-100 p-3 rounded-lg border border-cream-300/30">
                <span className="text-xl">🎙️</span>
                <div>
                  <h4 className="font-extrabold text-cozy-darkWood text-xs">Proximity Spatial Voice Chat Rules</h4>
                  <p className="text-[11px] mt-0.5">Walk within **`120 pixels`** of your friend's avatar to auto-connect! ⚠️ **SECURITY KEY**: To enable microphones, both you and your friend **must use the secure HTTPS link**: `https://mochill.onrender.com`. Insecure `http` connections block mic hardware access instantly.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-cream-100 p-3 rounded-lg border border-cream-300/30">
                <span className="text-xl">🍵</span>
                <div>
                  <h4 className="font-extrabold text-cozy-darkWood text-xs">Virtual Barista Counter</h4>
                  <p className="text-[11px] mt-0.5">Click on the Barista or the menu. Spend your coins to order beverages (Matcha focus halos, Espresso speed boosts) and earn **XP points** for your profile.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-cream-100 p-3 rounded-lg border border-cream-300/30">
                <span className="text-xl">🏆</span>
                <div>
                  <h4 className="font-extrabold text-cozy-darkWood text-xs">Seating & Table Minigames</h4>
                  <p className="text-[11px] mt-0.5">Click on labeled game tables to seat yourself. Challenges include real-time **Chess matches**, **Tic-Tac-Toe**, or drawing collaboratively on the **blackboard**!</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-cream-100 p-3 rounded-lg border border-cream-300/30">
                <span className="text-xl">🐱</span>
                <div>
                  <h4 className="font-extrabold text-cozy-darkWood text-xs">Curled Fireplace Cat (Easter Egg)</h4>
                  <p className="text-[11px] mt-0.5">Pet the cat near the crackling fireplace by clicking it. It meows, sparks a *“Purr~ 💖”* tag, and rewards you with **`2 Coins`**!</p>
                </div>
              </div>

            </div>

            <div className="text-[10px] text-center text-cozy-brown/80 font-bold uppercase tracking-wider border-t border-cream-200 pt-3">
              ✨ Welcome to the most relaxing metaverse on the internet!
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default CafeLounge;
