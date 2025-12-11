import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// Update user profile (Onboarding)
router.post('/onboarding', async (req, res) => {
  const { uid, username, interests, email } = req.body;

  try {
    let user = await User.findOne({ uid });
    
    if (!user) {
      // If user not found by UID, check by email (to handle cases where UID changed or DB is out of sync)
      user = await User.findOne({ email });
      
      if (user) {
        // User exists by email, update UID and other fields
        user.uid = uid;
        user.username = username || user.username;
        user.interests = interests || user.interests;
      } else {
        // Create new user if not found by UID or Email
        user = new User({
          uid,
          email,
          username,
          interests,
        });
      }
    } else {
      user.username = username;
      user.interests = interests;
    }
    
    await user.save();
    res.status(200).json(user);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user profile
router.get('/:uid', async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.params.uid });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
