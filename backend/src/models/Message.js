import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  roomId: {
    type: String, // String works for both Mongo ObjectIds and fallback UUIDs
    required: true
  },
  tableId: {
    type: String,
    default: null // If sent at a private table (chess, tic-tac-toe)
  },
  sender: {
    userId: { type: String, required: true },
    username: { type: String, required: true },
    avatar: {
      hairstyle: String,
      hairColor: String,
      outfit: String,
      outfitColor: String,
      skinTone: String,
      accessory: String,
      pet: String
    }
  },
  text: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema);
export default Message;
