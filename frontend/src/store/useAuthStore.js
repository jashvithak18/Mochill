import { create } from 'zustand';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('mochill_token') || null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Load User Session
  loadUser: async () => {
    const token = get().token;
    if (!token) {
      set({ isAuthenticated: false, isLoading: false });
      return null;
    }

    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (data.success) {
        set({ user: data.user, isAuthenticated: true, isLoading: false });
        return data.user;
      } else {
        // Token expired or invalid
        get().logout();
        set({ isLoading: false });
        return null;
      }
    } catch (err) {
      console.error('🔒 [Auth Store] Load User Error:', err.message);
      set({ isLoading: false });
      return null;
    }
  },

  // Register Account
  register: async (username, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      const data = await response.json();

      if (data.success) {
        localStorage.setItem('mochill_token', data.token);
        set({
          user: data.user,
          token: data.token,
          isAuthenticated: true,
          isLoading: false
        });
        return { success: true };
      } else {
        set({ error: data.message, isLoading: false });
        return { success: false, message: data.message };
      }
    } catch (err) {
      set({ error: 'Network registration error', isLoading: false });
      return { success: false, message: 'Network connection issue' };
    }
  },

  // Login Account
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();

      if (data.success) {
        localStorage.setItem('mochill_token', data.token);
        set({
          user: data.user,
          token: data.token,
          isAuthenticated: true,
          isLoading: false
        });
        return { success: true };
      } else {
        set({ error: data.message, isLoading: false });
        return { success: false, message: data.message };
      }
    } catch (err) {
      set({ error: 'Network login error', isLoading: false });
      return { success: false, message: 'Network connection issue' };
    }
  },

  // Guest Onboarding
  guestLogin: async (username) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/auth/guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      const data = await response.json();

      if (data.success) {
        localStorage.setItem('mochill_token', data.token);
        set({
          user: data.user,
          token: data.token,
          isAuthenticated: true,
          isLoading: false
        });
        return { success: true };
      } else {
        set({ error: data.message, isLoading: false });
        return { success: false, message: data.message };
      }
    } catch (err) {
      set({ error: 'Network guest login error', isLoading: false });
      return { success: false, message: 'Network connection issue' };
    }
  },

  // Logout Session
  logout: () => {
    localStorage.removeItem('mochill_token');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null
    });
  },

  // Update Avatar or Custom Settings
  updateProfile: async (fieldsToUpdate) => {
    const token = get().token;
    if (!token) return { success: false };

    try {
      const response = await fetch('/api/auth/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(fieldsToUpdate)
      });
      const data = await response.json();

      if (data.success) {
        set({ user: data.user });
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (err) {
      console.error('🔒 [Auth Store] Update Profile Error:', err.message);
      return { success: false, message: 'Connection error' };
    }
  },

  // Local Sync Helper
  awardCoins: (amount) => {
    const user = get().user;
    if (!user) return;
    const updatedStats = { ...user.stats, coins: (user.stats.coins || 0) + amount };
    get().updateProfile({ stats: updatedStats });
  },

  awardXP: (amount) => {
    const user = get().user;
    if (!user) return;
    
    let xp = (user.stats.xp || 0) + amount;
    let level = user.stats.level || 1;
    const xpNeeded = level * 100;

    if (xp >= xpNeeded) {
      xp -= xpNeeded;
      level += 1;
      // Triggers high-level client-side alert
      setTimeout(() => {
        try {
          if (typeof window !== 'undefined') {
            const event = new CustomEvent('level-up', { detail: { level } });
            window.dispatchEvent(event);
          }
        } catch (e) {}
      }, 100);
    }

    const updatedStats = { ...user.stats, xp, level };
    get().updateProfile({ stats: updatedStats });
  }
}));
