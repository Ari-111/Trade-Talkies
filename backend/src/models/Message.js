import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  userAvatar: String,
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['text', 'image', 'system'],
    default: 'text',
  },
  imageUrl: String,
  channelId: {
    type: String,
    default: 'general', // For MVP, default to general or support multiple channels
  },
}, {
  timestamps: true,
});

const Message = mongoose.model('Message', messageSchema);

export default Message;
