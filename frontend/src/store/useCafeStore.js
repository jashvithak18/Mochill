import { create } from 'zustand';

export const useCafeStore = create((set, get) => ({
  rooms: [],
  activeRoom: null,
  activeUsers: [],
  messages: [],
  
  // Lo-Fi vinyl state
  musicQueue: [
    { title: 'Sunset Lo-Fi Chill', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', duration: 372 },
    { title: 'Cozy Rain Beats', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', duration: 423 },
    { title: 'Ghibli Piano Lounge', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', duration: 302 },
    { title: 'Midnight Coffee Jazz', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', duration: 360 }
  ],
  currentTrackIndex: 0,
  currentTrackElapsed: 0,
  musicPlaying: false,

  // Coffee Brew status
  brewStatus: null, // null, 'brewing', 'served'
  activeBuff: null, // null, { name: 'Focus Boost', icon: '📝', duration: 60 }
  
  // Game Table status
  activeTableId: null,
  activeGameType: null, // 'chess', 'tictactoe', 'whiteboard'
  gameState: {},

  fetchRooms: async () => {
    try {
      const res = await fetch('/api/rooms');
      const data = await res.json();
      if (data.success) {
        set({ rooms: data.rooms });
      }
    } catch (err) {
      console.error('☕ [Cafe Store] Fetch Rooms Error:', err.message);
    }
  },

  setActiveRoom: (room) => set({ activeRoom: room }),
  
  setActiveUsers: (users) => set({ activeUsers: users }),
  
  updateUserPosition: (userId, positionData) => {
    set((state) => ({
      activeUsers: state.activeUsers.map((u) =>
        u.userId === userId ? { ...u, ...positionData } : u
      )
    }));
  },

  removeUser: (userId) => {
    set((state) => ({
      activeUsers: state.activeUsers.filter((u) => u.userId !== userId)
    }));
  },

  setMessages: (messages) => set({ messages }),
  
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),

  // Vinyl Queue controls
  setMusicState: (musicData) => {
    set({
      currentTrackIndex: musicData.trackIndex !== undefined ? musicData.trackIndex : get().currentTrackIndex,
      currentTrackElapsed: musicData.elapsed !== undefined ? musicData.elapsed : get().currentTrackElapsed,
      musicPlaying: musicData.isPlaying !== undefined ? musicData.isPlaying : get().musicPlaying,
      musicQueue: musicData.queue !== undefined ? musicData.queue : get().musicQueue
    });
  },

  nextTrack: () => {
    const queue = get().musicQueue;
    const nextIdx = (get().currentTrackIndex + 1) % queue.length;
    set({ currentTrackIndex: nextIdx, currentTrackElapsed: 0 });
  },

  // Coffee Simulation
  startBrewing: (drinkType, buffName) => {
    set({ brewStatus: 'brewing' });
  },

  serveCoffee: (drinkType, buffName) => {
    let icon = '☕';
    if (drinkType.includes('Matcha')) icon = '🍵';
    if (drinkType.includes('Chocolate')) icon = '🍫';
    if (drinkType.includes('Espresso')) icon = '⚡';

    set({
      brewStatus: 'served',
      activeBuff: {
        name: buffName,
        icon,
        drinkType,
        expiresAt: Date.now() + 60 * 1000 // 60 seconds buff
      }
    });

    // Clear serve notice after 4 seconds
    setTimeout(() => {
      set({ brewStatus: null });
    }, 4000);
  },

  clearBuff: () => set({ activeBuff: null }),

  // Minigame table seating
  sitAtTable: (tableId, gameType) => {
    set({ activeTableId: tableId, activeGameType: gameType, gameState: {} });
  },

  leaveTable: () => {
    set({ activeTableId: null, activeGameType: null, gameState: {} });
  },

  updateGameState: (newState) => {
    set((state) => ({
      gameState: { ...state.gameState, ...newState }
    }));
  }
}));
