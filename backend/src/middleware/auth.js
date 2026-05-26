import jwt from 'jsonwebtoken';
import { dbService } from '../services/dbService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'mochill_super_cozy_secret_key_1337';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);

      // Get user from DB/Memory
      const user = await dbService.findUserById(decoded.id);

      if (!user) {
        return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('🔒 [Auth Middleware] JWT Error:', error.message);
      res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};
