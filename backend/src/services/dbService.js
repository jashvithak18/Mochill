import User from '../models/User.js';
import Room from '../models/Room.js';
import Message from '../models/Message.js';
import { memoryDb, getDbMode } from '../config/db.js';

// Helper to generate custom IDs for in-memory storage
const generateId = () => Math.random().toString(36).substring(2, 11);

export const dbService = {
  // USER OPERATIONS
  findUserByUsername: async (username) => {
    if (getDbMode()) {
      return memoryDb.users.find(u => u.username.toLowerCase() === username.toLowerCase()) || null;
    }
    return await User.findOne({ username: new RegExp(`^${username}$`, 'i') });
  },

  findUserByEmail: async (email) => {
    if (getDbMode()) {
      return memoryDb.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
    }
    return await User.findOne({ email: new RegExp(`^${email}$`, 'i') });
  },

  findUserById: async (id) => {
    if (getDbMode()) {
      const user = memoryDb.users.find(u => u._id === id) || null;
      return user;
    }
    return await User.findById(id);
  },

  createUser: async (userData) => {
    if (getDbMode()) {
      const newUser = {
        _id: `u_${generateId()}`,
        avatar: {
          hairstyle: 'wavy',
          hairColor: '#8B5A2B',
          outfit: 'sweater',
          outfitColor: '#E6C594',
          skinTone: '#FCE3BA',
          accessory: 'none',
          pet: 'none'
        },
        stats: {
          level: 1,
          xp: 0,
          coins: 100,
          streak: 0,
          lastClaimed: null
        },
        badges: [],
        friends: [],
        friendRequests: [],
        status: 'Chilling ☕',
        createdAt: new Date(),
        ...userData
      };
      memoryDb.users.push(newUser);
      return newUser;
    }
    const newUser = new User(userData);
    return await newUser.save();
  },

  updateUser: async (id, updateData) => {
    if (getDbMode()) {
      const index = memoryDb.users.findIndex(u => u._id === id);
      if (index === -1) return null;
      
      // Perform nested merge for avatar, stats, etc.
      const user = memoryDb.users[index];
      const updated = {
        ...user,
        ...updateData,
        avatar: { ...user.avatar, ...(updateData.avatar || {}) },
        stats: { ...user.stats, ...(updateData.stats || {}) }
      };
      
      memoryDb.users[index] = updated;
      return updated;
    }
    return await User.findByIdAndUpdate(id, { $set: updateData }, { new: true });
  },

  // ROOM OPERATIONS
  getAllRooms: async () => {
    if (getDbMode()) {
      return memoryDb.rooms;
    }
    return await Room.find({});
  },

  findRoomById: async (id) => {
    if (getDbMode()) {
      return memoryDb.rooms.find(r => r._id === id) || null;
    }
    return await Room.findById(id);
  },

  createRoom: async (roomData) => {
    if (getDbMode()) {
      const newRoom = {
        _id: `r_${generateId()}`,
        description: 'A cozy spot to hang out and drink mocha.',
        theme: 'tokyo_rain',
        isPrivate: false,
        password: '',
        hostId: null,
        createdAt: new Date(),
        ...roomData
      };
      memoryDb.rooms.push(newRoom);
      return newRoom;
    }
    const newRoom = new Room(roomData);
    return await newRoom.save();
  },

  deleteRoom: async (id) => {
    if (getDbMode()) {
      const index = memoryDb.rooms.findIndex(r => r._id === id);
      if (index === -1) return false;
      memoryDb.rooms.splice(index, 1);
      return true;
    }
    const res = await Room.findByIdAndDelete(id);
    return !!res;
  },

  // MESSAGE OPERATIONS
  getMessages: async (roomId, limit = 50) => {
    if (getDbMode()) {
      return memoryDb.messages
        .filter(m => m.roomId === roomId)
        .slice(-limit);
    }
    return await Message.find({ roomId }).sort({ createdAt: 1 }).limit(limit);
  },

  createMessage: async (messageData) => {
    if (getDbMode()) {
      const newMessage = {
        _id: `m_${generateId()}`,
        createdAt: new Date(),
        ...messageData
      };
      memoryDb.messages.push(newMessage);
      return newMessage;
    }
    const newMessage = new Message(messageData);
    return await newMessage.save();
  }
};
