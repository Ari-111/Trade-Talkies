import express from 'express';
import Room from '../models/Room.js';
import User from '../models/User.js';

const router = express.Router();

// Get rooms joined by user
router.get('/joined', async (req, res) => {
  const { uid } = req.query;
  try {
    const rooms = await Room.find({ members: uid });
    res.json(rooms);
  } catch (error) {
    console.error('Error fetching joined rooms:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all public rooms
router.get('/', async (req, res) => {
  try {
    const rooms = await Room.find({ isPublic: true });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get recommended rooms based on user interests
router.get('/recommended', async (req, res) => {
  const { uid } = req.query;
  try {
    const user = await User.findOne({ uid });
    if (!user || !user.interests || user.interests.length === 0) {
      // Fallback to all public rooms if no interests
      const rooms = await Room.find({ isPublic: true }).limit(10);
      return res.json(rooms);
    }

    // Find rooms where tags match user interests
    // Case insensitive matching would be better, but for now simple inclusion
    const rooms = await Room.find({
      isPublic: true,
      tags: { $in: user.interests.map(i => new RegExp(i, 'i')) }
    });
    
    res.json(rooms);
  } catch (error) {
    console.error('Error fetching recommended rooms:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new room
router.post('/', async (req, res) => {
  const { name, description, tags, isPublic, ownerId, ageLimit } = req.body;
  
  try {
    const newRoom = new Room({
      name,
      description,
      tags,
      isPublic,
      ownerId,
      ageLimit,
      members: [ownerId], // Owner is automatically a member
      channels: [
        { name: 'general', type: 'text' },
        { name: 'announcements', type: 'text' }
      ]
    });

    const savedRoom = await newRoom.save();
    
    // Update user's joined rooms (optional, if we store it on User too)
    // await User.findOneAndUpdate({ uid: ownerId }, { $push: { joinedRooms: savedRoom._id } });

    res.status(201).json(savedRoom);
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Join a room
router.post('/:roomId/join', async (req, res) => {
  const { roomId } = req.params;
  const { uid } = req.body;

  try {
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    if (!room.members.includes(uid)) {
      room.members.push(uid);
      await room.save();
    }

    res.json(room);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a channel in a room
router.post('/:roomId/channels', async (req, res) => {
  const { roomId } = req.params;
  const { name, type } = req.body;

  try {
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    room.channels.push({ name, type });
    await room.save();

    res.json(room);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
