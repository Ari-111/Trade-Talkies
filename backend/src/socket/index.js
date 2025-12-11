import admin from '../config/firebase.js';
import Message from '../models/Message.js';

export default function socketHandler(io) {
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      socket.user = decodedToken;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.uid}`);

    socket.on('join_channel', (channelId) => {
      socket.join(channelId);
      console.log(`User ${socket.user.uid} joined channel: ${channelId}`);
    });

    socket.on('send_message', async (data) => {
      try {
        const { message, channelId, type, imageUrl, username, userAvatar } = data;
        
        // Save to DB
        const newMessage = await Message.create({
          userId: socket.user.uid,
          username: username || socket.user.name || 'User',
          userAvatar: userAvatar || socket.user.picture,
          message,
          channelId: channelId || 'general',
          type: type || 'text',
          imageUrl
        });

        // Broadcast to channel
        io.to(channelId || 'general').emit('receive_message', newMessage);
      } catch (error) {
        console.error('Error saving message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });
}
