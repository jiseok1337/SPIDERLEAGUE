const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/spider-league';

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const spiderRoutes = require('./routes/spiders');
const battleRoutes = require('./routes/battles');
const leagueRoutes = require('./routes/leagues');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/spiders', spiderRoutes);
app.use('/api/battles', battleRoutes);
app.use('/api/leagues', leagueRoutes);

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Spider League API is running' });
});

// Socket.io for real-time battles
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-battle', (battleId) => {
    socket.join(battleId);
    console.log(`User ${socket.id} joined battle ${battleId}`);
  });

  socket.on('battle-action', (data) => {
    socket.to(data.battleId).emit('battle-update', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// MongoDB connection
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    server.listen(PORT, () => {
      console.log(`Spider League API server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

module.exports = { app, io };