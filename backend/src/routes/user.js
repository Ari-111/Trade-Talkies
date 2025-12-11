import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Create or Update User
router.post('/', verifyToken, async (req, res) => {
  try {
    const { uid, email, name, picture } = req.user;
    const { username, interests } = req.body;

    let user = await User.findOne({ uid });

    if (user) {
      user.email = email;
      user.displayName = name || user.displayName;
      user.photoURL = picture || user.photoURL;
      if (username) user.username = username;
      if (interests) user.interests = interests;
      await user.save();
    } else {
      user = await User.create({
        uid,
        email,
        username: username || email.split('@')[0],
        displayName: name,
        photoURL: picture,
        interests: interests || []
      });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Current User
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.user.uid });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
