import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import Message from '../models/Message.js';

const router = express.Router();

// Get Messages (with pagination)
router.get('/:channelId?', verifyToken, async (req, res) => {
  try {
    const { channelId } = req.params;
    const { limit = 50, before } = req.query;
    
    const query = { channelId: channelId || 'general' };
    
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Post Message (HTTP fallback or for specific use cases)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { message, channelId, type, imageUrl } = req.body;
    const { uid, name, picture } = req.user;

    // Ideally fetch username from DB, but for speed using token data or default
    const newMessage = await Message.create({
      userId: uid,
      username: name || 'User',
      userAvatar: picture,
      message,
      channelId: channelId || 'general',
      type,
      imageUrl
    });

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
