import mongoose from 'mongoose';

const channelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['text', 'voice'], default: 'text' },
});

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  icon: String,
  ownerId: {
    type: String, // Firebase UID
    required: true,
  },
  isPublic: {
    type: Boolean,
    default: true,
  },
  tags: [{
    type: String,
  }],
  members: [{
    type: String, // Firebase UID
  }],
  channels: [channelSchema],
  ageLimit: Number,
}, {
  timestamps: true,
});

const Room = mongoose.model('Room', roomSchema);

export default Room;
