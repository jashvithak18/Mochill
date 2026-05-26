import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  avatar: {
    hairstyle: { type: String, default: 'wavy' },
    hairColor: { type: String, default: '#8B5A2B' },
    outfit: { type: String, default: 'sweater' },
    outfitColor: { type: String, default: '#E6C594' }, // warm cream-brown
    skinTone: { type: String, default: '#FCE3BA' },
    accessory: { type: String, default: 'none' }, // glasses, headphones, cat ears
    pet: { type: String, default: 'none' } // orange_cat, shiba, crow
  },
  stats: {
    level: { type: Number, default: 1 },
    xp: { type: Number, default: 0 },
    coins: { type: Number, default: 100 },
    streak: { type: Number, default: 0 },
    lastClaimed: { type: Date, default: null }
  },
  badges: [{ type: String }], // 'first_coffee', 'chess_master', 'study_streak'
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, default: 'Chilling ☕' },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);
export default User;
