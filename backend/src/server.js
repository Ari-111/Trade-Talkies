import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import messageRoutes from './routes/messages.js';
import roomRoutes from './routes/roomRoutes.js';
import aiRoutes from './routes/ai.js';
import socketHandler from './socket/index.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/ai', aiRoutes);

app.get('/', (req, res) => {
  res.send('Trade Talkies Backend is running');
});

// Socket.IO Setup
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for MVP, restrict in production
    methods: ["GET", "POST"]
  }
});

socketHandler(io);

const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
