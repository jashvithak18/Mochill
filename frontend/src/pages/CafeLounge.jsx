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

const THEME_DECOR = {
  tokyo_rain: {
    fireplace: { emoji: '🏮', label: 'Kotatsu Heater', title: 'Stoke/cool your warm Kotatsu', labelBg: 'bg-rose-950/80 text-rose-300' },
    barista: { emoji: '🍵', label: 'Matcha Bar', style: 'bg-emerald-950/10 border-emerald-800/20 hover:bg-emerald-900/20 text-emerald-800' },
    bookshelf: { emoji: '📚', label: 'Manga Shelf', style: 'bg-teal-950/10 border-teal-800/20 hover:bg-teal-900/20 text-teal-800' },
    tableChess: { emoji: '♟️', label: 'Shogi Board', style: 'bg-neutral-950/10 border-neutral-800/20 hover:bg-neutral-900/20 text-neutral-800' },
    tableWhiteboard: { emoji: '🎨', label: 'Neon Slate', style: 'bg-indigo-950/10 border-indigo-800/20 hover:bg-indigo-900/20 text-indigo-800' },
    tableTicTacToe: { emoji: '❌', label: 'Matcha Grid', style: 'bg-green-950/10 border-green-800/20 hover:bg-green-900/20 text-green-800' },
    cat: { emoji: '🐱', label: 'Sleeping Calico', purr: 'Meow~ 🌸' },
    bookshelfOverlay: {
      title: '☔ Tokyo Manga Corner',
      quote: '"The sound of rain outside makes the warm green tea taste even sweeter."',
      affirmation: '📘 Zen Note: Enjoy the cozy sound of lofi beats and rain. You are exactly where you need to be. Let your mind rest.'
    }
  },
  beach_sunset: {
    fireplace: { emoji: '🔥', label: 'Tiki Bonfire', title: 'Light/extinguish the Bonfire', labelBg: 'bg-orange-950/80 text-orange-300' },
    barista: { emoji: '🍹', label: 'Tiki Juice Bar', style: 'bg-orange-950/10 border-orange-800/20 hover:bg-orange-900/20 text-orange-800' },
    bookshelf: { emoji: '🐚', label: 'Surfboard Rack', style: 'bg-amber-950/10 border-amber-800/20 hover:bg-amber-900/20 text-amber-800' },
    tableChess: { emoji: '🏖️', label: 'Sand Chess', style: 'bg-yellow-950/10 border-yellow-800/20 hover:bg-yellow-900/20 text-yellow-800' },
    tableWhiteboard: { emoji: '🌊', label: 'Sand Canvas', style: 'bg-cyan-950/10 border-cyan-800/20 hover:bg-cyan-900/20 text-cyan-800' },
    tableTicTacToe: { emoji: '🐚', label: 'Shells Grid', style: 'bg-amber-950/10 border-amber-800/20 hover:bg-amber-900/20 text-amber-800' },
    cat: { emoji: '🦀', label: 'Sunny Crab', purr: 'Snip-snap! 🦀' },
    bookshelfOverlay: {
      title: '🐚 Sunset Travel Log',
      quote: '"Write your worries in the sand and let the waves wash them away."',
      affirmation: '🌊 Tidal Note: You are flowing beautifully, like the tides. Give yourself permission to bask in the warm twilight.'
    }
  },
  mountain_cabin: {
    fireplace: { emoji: '🪵', label: 'Roaring Hearth', title: 'Stoke the rustic Woodstove', labelBg: 'bg-amber-950/80 text-amber-300' },
    barista: { emoji: '🍎', label: 'Warm Cider Bar', style: 'bg-amber-950/20 border-amber-800/30 hover:bg-amber-900/30 text-amber-900' },
    bookshelf: { emoji: '🪵', label: 'Log Library', style: 'bg-stone-950/20 border-stone-800/30 hover:bg-stone-900/30 text-stone-950' },
    tableChess: { emoji: '♟️', label: 'Cabin Chess', style: 'bg-amber-950/15 border-amber-800/20 hover:bg-amber-900/20 text-amber-900' },
    tableWhiteboard: { emoji: '✏️', label: 'Cabin Board', style: 'bg-stone-950/15 border-stone-850/20 hover:bg-stone-900/20 text-stone-800' },
    tableTicTacToe: { emoji: '🌲', label: 'Pine Grid', style: 'bg-emerald-950/15 border-emerald-850/20 hover:bg-emerald-900/20 text-emerald-900' },
    cat: { emoji: '🐕', label: 'Cozy Husky', purr: 'Awoo~ ❄️' },
    bookshelfOverlay: {
      title: '🪵 Cabin Log Book',
      quote: '"In the silence of the snow, the warmth of the fire speaks louder."',
      affirmation: '🌲 Forest Note: Take a moment to disconnect from the noise of the busy world. Breathe in the crisp mountain air. You are safe and warm here.'
    }
  },
  library_study: {
    fireplace: { emoji: '🔥', label: 'Study Hearth', title: 'Stoke the vintage fireplace', labelBg: 'bg-yellow-950/80 text-yellow-300' },
    barista: { emoji: '☕', label: 'Bookstore Café', style: 'bg-yellow-950/10 border-yellow-800/20 hover:bg-yellow-900/20 text-yellow-900' },
    bookshelf: { emoji: '📖', label: 'Grand Archive', style: 'bg-stone-950/10 border-stone-800/20 hover:bg-stone-900/30 text-stone-900' },
    tableChess: { emoji: '👑', label: 'Royal Chess', style: 'bg-amber-950/10 border-amber-800/20 hover:bg-amber-900/20 text-amber-955' },
    tableWhiteboard: { emoji: '📝', label: 'Study Slate', style: 'bg-stone-950/10 border-stone-800/20 hover:bg-stone-900/20 text-stone-800' },
    tableTicTacToe: { emoji: '✒️', label: 'Quill Grid', style: 'bg-zinc-950/10 border-zinc-800/20 hover:bg-zinc-900/20 text-zinc-800' },
    cat: { emoji: '🦉', label: 'Professor Owl', purr: 'Hoot-hoot! 🦉' },
    bookshelfOverlay: {
      title: "📖 Scholar's Parchment",
      quote: '"An investment in knowledge always pays the best interest."',
      affirmation: '✏️ Study Note: Every small page read, every formula understood, brings you closer to your dreams. Keep learning at your own cozy pace.'
    }
  },
  fantasy_garden: {
    fireplace: { emoji: '🧪', label: 'Fairy Cauldron', title: 'Stoke the magic Cauldron', labelBg: 'bg-purple-950/80 text-purple-300' },
    barista: { emoji: '🌸', label: 'Nectar Brewery', style: 'bg-fuchsia-950/10 border-fuchsia-800/20 hover:bg-fuchsia-900/20 text-fuchsia-800' },
    bookshelf: { emoji: '✨', label: 'Spellbook Arch', style: 'bg-violet-950/10 border-violet-800/20 hover:bg-violet-900/20 text-violet-800' },
    tableChess: { emoji: '🔮', label: 'Riddle Table', style: 'bg-purple-950/10 border-purple-800/20 hover:bg-purple-900/20 text-purple-800' },
    tableWhiteboard: { emoji: '🪄', label: 'Pixie Slate', style: 'bg-pink-950/10 border-pink-800/30 hover:bg-pink-900/20 text-pink-800' },
    tableTicTacToe: { emoji: '🌀', label: 'Rune Grid', style: 'bg-indigo-950/10 border-indigo-800/20 hover:bg-indigo-900/20 text-indigo-800' },
    cat: { emoji: '🦄', label: 'Pegasus Foal', purr: 'Neigh! ✨' },
    bookshelfOverlay: {
      title: '✨ Pixie Grimoire',
      quote: '"Magic happens when you believe in your own power and trust the universe."',
      affirmation: '🌸 Garden Note: You are a magical creature filled with light and potential. Let your dreams wander in this starry grove today.'
    }
  }
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

  const theme = activeRoom?.theme || 'tokyo_rain';
  const decor = THEME_DECOR[theme] || THEME_DECOR['tokyo_rain'];

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

    // Fetch room details to restore session on page refresh
    const fetchRoomDetails = async () => {
      try {
        const response = await fetch(`${getApiUrl()}/api/rooms/${roomId}`);
        const data = await response.json();
        if (data.success) {
          setActiveRoom(data.room);
          
          // Auto-sync initial weather loops based on theme settings
          if (data.room.theme === 'tokyo_rain') setWeather('rain');
          else if (data.room.theme === 'mountain_cabin') setWeather('snow');
          else if (data.room.theme === 'beach_sunset') setWeather('sunset');
          else setWeather('clear');
        }
      } catch (err) {}
    };
    fetchRoomDetails();

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

      const theme = activeRoom?.theme || 'tokyo_rain';

      // 1. DYNAMIC FLOOR STYLING BY SELECTED THEME
      let floorColor = isDay ? '#FDFBF7' : '#FAF4EB';
      let plankColor = 'rgba(141,123,104,0.08)';

      if (theme === 'beach_sunset') {
        floorColor = '#F5E6CA'; // warm sand beige
        plankColor = 'rgba(200,122,83,0.12)';
      } else if (theme === 'mountain_cabin') {
        floorColor = '#5C4033'; // deep cozy dark cedar wood
        plankColor = 'rgba(255,255,255,0.06)';
      } else if (theme === 'library_study') {
        floorColor = '#FAF0E6'; // vintage oak parchment
        plankColor = 'rgba(139,90,43,0.08)';
      } else if (theme === 'fantasy_garden') {
        floorColor = '#FAF0F6'; // magical pastel pink-purple
        plankColor = 'rgba(186,85,211,0.08)';
      }

      ctx.fillStyle = floorColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Horizontal wood planks lines
      ctx.strokeStyle = plankColor;
      ctx.lineWidth = 2.5;
      for (let i = 0; i < canvas.height; i += 30) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }

      // 2. DYNAMIC DECOR ACCENTS BY THEME
      if (theme === 'beach_sunset') {
        // Draw glowing sunset sun arc at the top margin
        ctx.fillStyle = 'rgba(231, 76, 60, 0.08)';
        ctx.beginPath();
        ctx.arc(400, 0, 100, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(241, 196, 15, 0.04)';
        ctx.beginPath();
        ctx.arc(400, 0, 160, 0, Math.PI * 2);
        ctx.fill();
      } else if (theme === 'library_study') {
        // Draw warm sunbeams streaming from top-left
        ctx.fillStyle = 'rgba(244, 234, 224, 0.1)';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(150, 0);
        ctx.lineTo(800, 320);
        ctx.lineTo(800, 500);
        ctx.lineTo(0, 500);
        ctx.closePath();
        ctx.fill();
      } else if (theme === 'fantasy_garden') {
        // Draw magical golden fairy dust spores
        for (let i = 0; i < 15; i++) {
          ctx.fillStyle = `rgba(254, 241, 96, ${Math.random() * 0.4 + 0.15})`;
          ctx.beginPath();
          const rx = Math.random() * canvas.width;
          const ry = Math.random() * canvas.height;
          ctx.arc(rx, ry, Math.random() * 2 + 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 3. WEATHER RENDERING
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
      } else if (weather === 'snow' || (theme === 'mountain_cabin' && weather === 'clear')) {
        // Draw falling snow particles overlay
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        for (let i = 0; i < 16; i++) {
          ctx.beginPath();
          const rx = Math.random() * canvas.width;
          const ry = Math.random() * canvas.height;
          ctx.arc(rx, ry, Math.random() * 2.5 + 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 4. FIREPLACE EMBERS
      if (fireplaceOn) {
        let logColor = '#5A3825';
        let fireColor = '#E67E22';
        let emberColor = '231, 76, 60'; // Red/orange default

        if (theme === 'beach_sunset') {
          logColor = '#8E4A21'; // lighter sandy logs
          fireColor = '#E67E22';
          emberColor = '241, 196, 15'; // bright yellow embers
        } else if (theme === 'mountain_cabin') {
          logColor = '#3E2723'; // very dark cabin wood logs
          fireColor = '#D35400'; // dark hot orange
          emberColor = '230, 126, 34';
        } else if (theme === 'library_study') {
          logColor = '#4E3629';
          fireColor = '#F39C12'; // bright steady gold
          emberColor = '243, 156, 18';
        } else if (theme === 'fantasy_garden') {
          logColor = '#2C3E50'; // magical crystal logs/stones
          fireColor = '#9B59B6'; // magical purple flame/cauldron glow
          emberColor = '155, 89, 182'; // purple magical bubbles
        } else if (theme === 'tokyo_rain') {
          logColor = '#4A3E3D';
          fireColor = '#E74C3C'; // bright red Tokyo kotatsu heater grill glow
          emberColor = '241, 196, 15';
        }

        // Draw log wood base or heater grid
        ctx.fillStyle = logColor;
        ctx.fillRect(OBJECTS.fireplace.x + 22, OBJECTS.fireplace.y + 42, 36, 8);

        // Draw flame/glowing core
        ctx.fillStyle = fireColor;
        ctx.beginPath();
        ctx.arc(OBJECTS.fireplace.x + 40, OBJECTS.fireplace.y + 40, 18, 0, Math.PI, true);
        ctx.fill();

        // Animate floating sparks / embers / bubbles
        embers.forEach(e => {
          ctx.fillStyle = `rgba(${emberColor}, ${e.o})`;
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
  }, [isDay, weather, fireplaceOn, activeRoom]);

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
              title={decor.fireplace.title}
            >
              <div className="w-full h-full border border-orange-500/10 flex items-end justify-center">
                <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full select-none transform translate-y-3 shadow ${decor.fireplace.labelBg}`}>
                  {decor.fireplace.emoji} {decor.fireplace.label}
                </span>
              </div>
            </div>

            {/* Barista Counter */}
            <div
              onClick={handleBaristaCounterClick}
              className={`absolute pointer-events-auto cursor-pointer flex flex-col items-center justify-center border-2 border-dashed rounded-lg transition-all ${decor.barista.style}`}
              style={{
                left: `${(OBJECTS.barista.x / 800) * 100}%`,
                top: `${(OBJECTS.barista.y / 500) * 100}%`,
                width: `${(OBJECTS.barista.w / 800) * 100}%`,
                height: `${(OBJECTS.barista.h / 500) * 100}%`
              }}
            >
              <span className="text-3xl animate-bounce">{decor.barista.emoji}</span>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full mt-0.5 bg-white/90 shadow-sm border border-cream-200`}>
                {decor.barista.label}
              </span>
            </div>

            {/* Bookshelf */}
            <div
              onClick={handleBookshelfClick}
              className={`absolute pointer-events-auto cursor-pointer flex flex-col items-center justify-center border-2 border-dashed rounded-lg transition-all ${decor.bookshelf.style}`}
              style={{
                left: `${(OBJECTS.bookshelf.x / 800) * 100}%`,
                top: `${(OBJECTS.bookshelf.y / 500) * 100}%`,
                width: `${(OBJECTS.bookshelf.w / 800) * 100}%`,
                height: `${(OBJECTS.bookshelf.h / 500) * 100}%`
              }}
            >
              <span className="text-3xl">{decor.bookshelf.emoji}</span>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full mt-0.5 bg-white/90 shadow-sm border border-cream-200`}>
                {decor.bookshelf.label}
              </span>
            </div>

            {/* Game Chess table */}
            <div
              onClick={() => handleSeatClick(OBJECTS.tableChess)}
              className={`absolute pointer-events-auto cursor-pointer flex flex-col items-center justify-center border-2 border-dashed rounded-lg transition-all ${decor.tableChess.style}`}
              style={{
                left: `${(OBJECTS.tableChess.x / 800) * 100}%`,
                top: `${(OBJECTS.tableChess.y / 500) * 100}%`,
                width: `${(OBJECTS.tableChess.w / 800) * 100}%`,
                height: `${(OBJECTS.tableChess.h / 500) * 100}%`
              }}
            >
              <span className="text-2xl animate-pulse">{decor.tableChess.emoji}</span>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full mt-1 bg-white/90 shadow-sm border border-cream-200`}>
                {decor.tableChess.label}
              </span>
            </div>

            {/* Game Whiteboard table */}
            <div
              onClick={() => handleSeatClick(OBJECTS.tableWhiteboard)}
              className={`absolute pointer-events-auto cursor-pointer flex flex-col items-center justify-center border-2 border-dashed rounded-lg transition-all ${decor.tableWhiteboard.style}`}
              style={{
                left: `${(OBJECTS.tableWhiteboard.x / 800) * 100}%`,
                top: `${(OBJECTS.tableWhiteboard.y / 500) * 100}%`,
                width: `${(OBJECTS.tableWhiteboard.w / 800) * 100}%`,
                height: `${(OBJECTS.tableWhiteboard.h / 500) * 100}%`
              }}
            >
              <span className="text-2xl">{decor.tableWhiteboard.emoji}</span>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full mt-1 bg-white/90 shadow-sm border border-cream-200`}>
                {decor.tableWhiteboard.label}
              </span>
            </div>

            {/* Game TicTacToe table */}
            <div
              onClick={() => handleSeatClick(OBJECTS.tableTicTacToe)}
              className={`absolute pointer-events-auto cursor-pointer flex flex-col items-center justify-center border-2 border-dashed rounded-lg transition-all ${decor.tableTicTacToe.style}`}
              style={{
                left: `${(OBJECTS.tableTicTacToe.x / 800) * 100}%`,
                top: `${(OBJECTS.tableTicTacToe.y / 500) * 100}%`,
                width: `${(OBJECTS.tableTicTacToe.w / 800) * 100}%`,
                height: `${(OBJECTS.tableTicTacToe.h / 500) * 100}%`
              }}
            >
              <span className="text-2xl">{decor.tableTicTacToe.emoji}</span>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full mt-1 bg-white/90 shadow-sm border border-cream-200`}>
                {decor.tableTicTacToe.label}
              </span>
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
              title={`Click to pet ${decor.cat.label}!`}
            >
              <div className="flex flex-col items-center">
                {catMood === 'purring' && (
                  <span className="text-[9px] font-bold text-amber-600 bg-white/80 border border-amber-200 py-0.5 px-1.5 rounded-full animate-bounce">
                    {decor.cat.purr}
                  </span>
                )}
                <span className="text-xl">{decor.cat.emoji}</span>
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
            <div className="glass-panel p-5 rounded-cozy border border-white/50 flex flex-col gap-4 bg-white/90 shadow-cozy text-left animate-fadeIn">
              <div className="flex justify-between items-center pb-2 border-b border-cream-200">
                <span className="text-base font-extrabold text-cozy-darkWood flex items-center gap-1.5">
                  {decor.bookshelfOverlay.title}
                </span>
                <button
                  onClick={() => setActiveOverlay(null)}
                  className="text-xs bg-cream-200 hover:bg-cream-300 py-1 px-3.5 rounded-lg border border-cream-300 font-extrabold text-cozy-darkWood transition-colors"
                >
                  Close
                </button>
              </div>
              <p className="text-xs text-cozy-darkWood italic font-bold leading-relaxed">
                {decor.bookshelfOverlay.quote}
              </p>
              <div className="bg-cream-100 p-3 rounded-lg border border-cream-300/30 text-[10px] text-cozy-brown font-bold leading-relaxed">
                {decor.bookshelfOverlay.affirmation}
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
