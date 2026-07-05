
const express = require('express');
 const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const path = require('path');
const net = require('net');


dotenv.config({ path: path.join(__dirname, '.env') });

const { connect } = require('./db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/materials', require('./routes/materialRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (userId) => {
    onlineUsers.set(userId, socket.id);
    socket.userId = userId;
    io.emit('onlineUsers', Array.from(onlineUsers.keys()));
  });

  socket.on('sendMessage', async (data) => {
    const { senderId, receiverId, content, conversationId } = data;
    const Message = require('./models/Message');
    try {
      const message = await Message.create({
        sender: senderId,
        receiver: receiverId,
        content,
        conversationId,
      });
      await message.populate('sender', 'name avatar');
      const receiverSocket = onlineUsers.get(receiverId);
      if (receiverSocket) {
        io.to(receiverSocket).emit('newMessage', message);
      }
      socket.emit('messageSent', message);
    } catch (err) {
      socket.emit('error', err.message);
    }
  });

  socket.on('disconnect', () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      io.emit('onlineUsers', Array.from(onlineUsers.keys()));
    }
    console.log('User disconnected:', socket.id);
  });
});

app.set('io', io);

const START_PORT = parseInt(process.env.PORT, 10) || 5000;

async function findFreePort(start) {
  let port = start;
  while (port < start + 1000) {
    const isFree = await new Promise((resolve) => {
      const tester = net.createServer()
        .once('error', () => {
          tester.close?.();
          resolve(false);
        })
        .once('listening', () => {
          tester.close(() => resolve(true));
        })
        .listen(port);
    });
    if (isFree) return port;
    port += 1;
  }
  throw new Error('No free ports available');
}

(async () => {
  try {
    await connect();
    const port = await findFreePort(START_PORT);
    if (port !== START_PORT) {
      console.warn(`Port ${START_PORT} in use — falling back to ${port}`);
    }
    server.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });
    server.on('error', (err) => {
      console.error('Server error:', err);
      process.exit(1);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
})();

// Global error handlers to avoid crashes without logs
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Optional: perform cleanup here
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});
