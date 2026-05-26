import express from 'express';
import { dbService } from '../services/dbService.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET api/rooms
// @desc    Get all active rooms
router.get('/', async (req, res) => {
  try {
    const rooms = await dbService.getAllRooms();
    res.status(200).json({ success: true, rooms });
  } catch (error) {
    console.error('☕ [Rooms Get] Error:', error);
    res.status(500).json({ success: false, message: 'Server room fetching error' });
  }
});

// @route   GET api/rooms/:id
// @desc    Get a single room by ID
router.get('/:id', async (req, res) => {
  try {
    const room = await dbService.findRoomById(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Café room not found' });
    }
    res.status(200).json({ success: true, room });
  } catch (error) {
    console.error('☕ [Rooms Get Single] Error:', error);
    res.status(500).json({ success: false, message: 'Server single room fetching error' });
  }
});

// @route   POST api/rooms
// @desc    Create a new café room
router.post('/', protect, async (req, res) => {
  const { name, description, theme, isPrivate, password } = req.body;

  try {
    if (!name) {
      return res.status(400).json({ success: false, message: 'Please specify a room name' });
    }

    const roomData = {
      name,
      description: description || 'A cozy spot to hang out and drink mocha.',
      theme: theme || 'tokyo_rain',
      isPrivate: !!isPrivate,
      password: password || '',
      hostId: req.user._id
    };

    const newRoom = await dbService.createRoom(roomData);

    res.status(201).json({ success: true, room: newRoom });
  } catch (error) {
    console.error('☕ [Rooms Create] Error:', error);
    res.status(500).json({ success: false, message: 'Server room creation error' });
  }
});

// @route   GET api/rooms/:id/messages
// @desc    Get room chat messages history
router.get('/:id/messages', async (req, res) => {
  try {
    const messages = await dbService.getMessages(req.params.id, 50);
    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error('☕ [Rooms Messages] Error:', error);
    res.status(500).json({ success: false, message: 'Server message fetching error' });
  }
});

export default router;
