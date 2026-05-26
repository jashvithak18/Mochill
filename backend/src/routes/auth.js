import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbService } from '../services/dbService.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'mochill_super_cozy_secret_key_1337';

// Generate JWT token helper
const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
};

// @route   POST api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please fill in all fields' });
    }

    // Check if user already exists
    const usernameExists = await dbService.findUserByUsername(username);
    if (usernameExists) {
      return res.status(400).json({ success: false, message: 'Username is already taken' });
    }

    const emailExists = await dbService.findUserByEmail(email);
    if (emailExists) {
      return res.status(400).json({ success: false, message: 'Email is already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await dbService.createUser({
      username,
      email,
      password: hashedPassword
    });

    const token = generateToken(user._id.toString());

    // Safe return (no password)
    const userObj = { ...user };
    delete userObj.password;

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        stats: user.stats,
        badges: user.badges,
        friends: user.friends,
        status: user.status
      }
    });
  } catch (error) {
    console.error('🔒 [Auth Register] Error:', error);
    res.status(500).json({ success: false, message: 'Server registration error' });
  }
});

// @route   POST api/auth/login
// @desc    Log in a user
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please fill in all fields' });
    }

    // Check email
    const user = await dbService.findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id.toString());

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        stats: user.stats,
        badges: user.badges,
        friends: user.friends,
        status: user.status
      }
    });
  } catch (error) {
    console.error('🔒 [Auth Login] Error:', error);
    res.status(500).json({ success: false, message: 'Server login error' });
  }
});

// @route   POST api/auth/guest
// @desc    Login as a quick guest
router.post('/guest', async (req, res) => {
  const { username } = req.body;

  try {
    const defaultUsername = username || `Chiller_${Math.floor(1000 + Math.random() * 9000)}`;
    const email = `guest_${Math.random().toString(36).substring(2, 9)}@mochill.com`;
    const password = `guest_${Math.random().toString(36).substring(2, 9)}`;

    // Verify username is unique
    let chosenUsername = defaultUsername;
    let usernameExists = await dbService.findUserByUsername(chosenUsername);
    let attempts = 0;
    while (usernameExists && attempts < 5) {
      chosenUsername = `${defaultUsername}_${Math.floor(10 + Math.random() * 90)}`;
      usernameExists = await dbService.findUserByUsername(chosenUsername);
      attempts++;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await dbService.createUser({
      username: chosenUsername,
      email,
      password: hashedPassword
    });

    const token = generateToken(user._id.toString());

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        stats: user.stats,
        badges: user.badges,
        friends: user.friends,
        status: user.status
      }
    });
  } catch (error) {
    console.error('🔒 [Auth Guest] Error:', error);
    res.status(500).json({ success: false, message: 'Server guest entry error' });
  }
});

// @route   GET api/auth/me
// @desc    Get logged in user details
router.get('/me', protect, async (req, res) => {
  res.status(200).json({
    success: true,
    user: {
      _id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      avatar: req.user.avatar,
      stats: req.user.stats,
      badges: req.user.badges,
      friends: req.user.friends,
      status: req.user.status
    }
  });
});

// @route   PUT api/auth/update
// @desc    Update user profile, status or customization
router.put('/update', protect, async (req, res) => {
  const { avatar, stats, status, badges } = req.body;

  try {
    const updateData = {};
    if (avatar) updateData.avatar = avatar;
    if (stats) updateData.stats = stats;
    if (status) updateData.status = status;
    if (badges) updateData.badges = badges;

    const updatedUser = await dbService.updateUser(req.user._id, updateData);

    res.status(200).json({
      success: true,
      user: {
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        stats: updatedUser.stats,
        badges: updatedUser.badges,
        friends: updatedUser.friends,
        status: updatedUser.status
      }
    });
  } catch (error) {
    console.error('🔒 [Auth Update] Error:', error);
    res.status(500).json({ success: false, message: 'Server update error' });
  }
});

export default router;
