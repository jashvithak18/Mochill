import mongoose from 'mongoose';

const RoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: 'A cozy spot to hang out and drink mocha.'
  },
  theme: {
    type: String,
    enum: ['tokyo_rain', 'beach_sunset', 'mountain_cabin', 'library_study', 'fantasy_garden'],
    default: 'tokyo_rain'
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  password: {
    type: String,
    default: ''
  },
  hostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Room = mongoose.models.Room || mongoose.model('Room', RoomSchema);
export default Room;
