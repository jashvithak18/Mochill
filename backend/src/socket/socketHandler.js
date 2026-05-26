import { dbService } from '../services/dbService.js';

// Holds real-time positions and details of players in rooms
// Structure: { [roomId]: { [socketId]: { userId, username, avatar, x, y, state, tableId } } }
const activeCafes = {};

// Holds state for interactive minigames
// Structure: { [roomId]: { [tableId]: { gameType, state } } }
const cafeGames = {};

export const setupSockets = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 [Socket] Client connected: ${socket.id}`);
    
    let currentRoom = null;
    let currentUser = null;

    // 1. JOIN ROOM
    socket.on('room:join', async ({ roomId, user }) => {
      if (!roomId || !user) return;
      
      currentRoom = roomId;
      currentUser = user;
      
      socket.join(roomId);
      
      // Initialize room store if not exists
      if (!activeCafes[roomId]) {
        activeCafes[roomId] = {};
      }
      
      // Initialize room games if not exists
      if (!cafeGames[roomId]) {
        cafeGames[roomId] = {};
      }

      // Default avatar positioning inside the café scene
      const spawnPoints = [
        { x: 150, y: 300 },
        { x: 200, y: 350 },
        { x: 250, y: 280 },
        { x: 180, y: 400 }
      ];
      const spawn = spawnPoints[Math.floor(Math.random() * spawnPoints.length)];

      // Add user to active café room memory
      activeCafes[roomId][socket.id] = {
        socketId: socket.id, // Expose socket ID for WebRTC peer signaling
        userId: user._id,
        username: user.username,
        avatar: user.avatar || {},
        stats: user.stats || { level: 1, xp: 0, coins: 100 },
        status: user.status || 'Chilling ☕',
        x: spawn.x,
        y: spawn.y,
        state: 'idle', // idle, walking, sitting, dancing, sleeping, waving
        tableId: null
      };

      console.log(`☕ [Socket] User ${user.username} joined room ${roomId}`);

      // Broadcast new list of active players in this café room
      io.to(roomId).emit('room:users', Object.values(activeCafes[roomId]));
      
      // Send active games state to the joining user
      socket.emit('games:state', cafeGames[roomId]);
    });

    // 2. AVATAR MOVEMENT & STATE
    socket.on('avatar:move', ({ x, y, state, tableId }) => {
      if (!currentRoom || !activeCafes[currentRoom] || !activeCafes[currentRoom][socket.id]) return;

      const player = activeCafes[currentRoom][socket.id];
      player.x = x;
      player.y = y;
      if (state) player.state = state;
      player.tableId = tableId !== undefined ? tableId : player.tableId;

      // Broadcast moved position to everyone else in the room
      socket.to(currentRoom).emit('avatar:moved', {
        socketId: socket.id,
        userId: player.userId,
        username: player.username,
        x: player.x,
        y: player.y,
        state: player.state,
        tableId: player.tableId
      });
    });

    // 3. CHAT MESSAGE
    socket.on('chat:send', async ({ text, tableId }) => {
      if (!currentRoom || !currentUser || !activeCafes[currentRoom] || !activeCafes[currentRoom][socket.id]) return;

      const player = activeCafes[currentRoom][socket.id];

      try {
        const messageData = {
          roomId: currentRoom,
          tableId: tableId || null,
          sender: {
            userId: player.userId,
            username: player.username,
            avatar: player.avatar
          },
          text
        };

        // Asynchronously save to database/memory to keep sockets extremely responsive
        const savedMessage = await dbService.createMessage(messageData);

        // Broadcast chat to room
        io.to(currentRoom).emit('chat:received', savedMessage);
      } catch (err) {
        console.error('⚠️ [Socket Chat] Error saving message:', err.message);
      }
    });

    // 4. EMOJI / WAVE / DANCE REACTIONS
    socket.on('action:react', ({ emoji, action }) => {
      if (!currentRoom || !activeCafes[currentRoom] || !activeCafes[currentRoom][socket.id]) return;
      const player = activeCafes[currentRoom][socket.id];

      // Broadcast reaction (e.g. hearts floating, waves, etc.)
      io.to(currentRoom).emit('action:reacted', {
        userId: player.userId,
        username: player.username,
        socketId: socket.id,
        emoji,
        action // 'wave', 'dance', 'sleep', 'sparkles'
      });
    });

    // 5. TYPING INDICATORS
    socket.on('typing:status', ({ isTyping }) => {
      if (!currentRoom || !currentUser) return;
      socket.to(currentRoom).emit('typing:status', {
        username: currentUser.username,
        isTyping
      });
    });

    // 6. LO-FI MUSIC SYNCHRONIZATION
    socket.on('music:sync', ({ action, queue, trackIndex, elapsed, isPlaying }) => {
      if (!currentRoom) return;
      
      // Relay music controls from host (or voters) to all room participants
      socket.to(currentRoom).emit('music:synced', {
        action, // 'play', 'pause', 'skip', 'queue_change'
        queue,
        trackIndex,
        elapsed,
        isPlaying
      });
    });

    // 7. VIRTUAL COFFEE ORDER SIMULATOR
    socket.on('coffee:order', ({ drinkType, buffName }) => {
      if (!currentRoom || !currentUser) return;
      
      // Hands-free virtual barista prepares drink (broadcast anim)
      io.to(currentRoom).emit('coffee:brewing', {
        username: currentUser.username,
        drinkType,
        buffName
      });

      // Serve coffee after 3.5 seconds
      setTimeout(() => {
        if (io.to(currentRoom)) {
          io.to(currentRoom).emit('coffee:served', {
            username: currentUser.username,
            drinkType,
            buffName,
            message: `✨ ${currentUser.username} received their steaming ${drinkType}! Buff: [${buffName}] active!`
          });
        }
      }, 3500);
    });

    // 8. MINIGAMES REAL-TIME SYNC
    // Handles chess moves, tic-tac-toe actions, and collaborative whiteboard stroke arrays
    socket.on('game:action', ({ tableId, gameType, action, payload }) => {
      if (!currentRoom) return;

      if (!cafeGames[currentRoom][tableId]) {
        cafeGames[currentRoom][tableId] = { gameType, state: {} };
      }

      const game = cafeGames[currentRoom][tableId];

      // Update state depending on action
      if (gameType === 'chess') {
        if (action === 'move') {
          game.state.fen = payload.fen;
          game.state.turn = payload.turn;
        } else if (action === 'reset') {
          game.state = {};
        }
      } else if (gameType === 'tictactoe') {
        if (action === 'move') {
          game.state.board = payload.board;
          game.state.xIsNext = payload.xIsNext;
          game.state.winner = payload.winner;
        } else if (action === 'reset') {
          game.state = {};
        }
      } else if (gameType === 'whiteboard') {
        // Whiteboard drawing is pure stream - no full state stored on server, just relayed
      }

      // Broadcast the move/drawing stroke to all other players in the room
      socket.to(currentRoom).emit('game:synced', {
        tableId,
        gameType,
        action,
        payload
      });
    });

    // 9. WebRTC PROXIMITY AUDIO SIGNALING RELAY
    socket.on('webrtc:signal', ({ targetSocketId, signalData }) => {
      // Direct relay signaling to coordinate peer network mesh
      io.to(targetSocketId).emit('webrtc:signal', {
        senderSocketId: socket.id,
        signalData
      });
    });

    // 10. DISCONNECT HANDLING
    socket.on('disconnect', () => {
      console.log(`🔌 [Socket] Client disconnected: ${socket.id}`);
      
      if (currentRoom && activeCafes[currentRoom]) {
        const player = activeCafes[currentRoom][socket.id];
        
        if (player) {
          console.log(`☕ [Socket] User ${player.username} left café room`);
          delete activeCafes[currentRoom][socket.id];
          
          // Clean up empty café rooms
          if (Object.keys(activeCafes[currentRoom]).length === 0) {
            delete activeCafes[currentRoom];
            delete cafeGames[currentRoom];
          } else {
            // Notify others in room
            io.to(currentRoom).emit('room:users', Object.values(activeCafes[currentRoom]));
            io.to(currentRoom).emit('avatar:left', { socketId: socket.id, userId: player.userId });
          }
        }
      }
    });
  });
};
