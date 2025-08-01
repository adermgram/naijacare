const app = require('./app');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();
const connectDB = require('./config/db');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

// Connect to MongoDB
connectDB();

// Create HTTP server and Socket.IO server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      const allowedOrigins = [
        process.env.FRONTEND_URL || 'http://localhost:5173',
        'http://localhost:3000',
        'http://localhost:5173'
      ];
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: false,
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token', 'Origin', 'Accept']
  }
});

// Socket.IO authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-passwordHash');
    if (!user) {
      return next(new Error('User not found'));
    }

    socket.userId = user._id;
    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

// Socket.IO logic
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id} (${socket.user.name})`);

  // Join user's personal room
  socket.on('joinUserRoom', ({ userId }) => {
    socket.join(`user_${userId}`);
    console.log(`User ${socket.user.name} joined personal room: user_${userId}`);
  });

  // Join consultation room
  socket.on('joinConsultationRoom', ({ consultationId }) => {
    socket.join(`consultation_${consultationId}`);
    console.log(`User ${socket.user.name} joined consultation room: ${consultationId}`);
  });

  // Leave consultation room
  socket.on('leaveConsultationRoom', ({ consultationId }) => {
    socket.leave(`consultation_${consultationId}`);
    console.log(`User ${socket.user.name} left consultation room: ${consultationId}`);
  });

  // Handle typing events
  socket.on('typing', ({ consultationId, isTyping, userId, userName }) => {
    socket.to(`consultation_${consultationId}`).emit('userTyping', {
      consultationId,
      isTyping,
      userId,
      userName
    });
  });

  // Handle new messages
  socket.on('sendMessage', ({ consultationId, message }) => {
    socket.to(`consultation_${consultationId}`).emit('receiveMessage', {
      consultationId,
      message
    });
  });

  // Handle call events
  socket.on('callRequest', ({ consultationId, callType }) => {
    socket.to(`consultation_${consultationId}`).emit('incomingCall', {
      consultationId,
      callType,
      caller: socket.user
    });
  });

  socket.on('callAccepted', ({ consultationId, callType }) => {
    socket.to(`consultation_${consultationId}`).emit('callAccepted', {
      consultationId,
      callType
    });
  });

  socket.on('callRejected', ({ consultationId }) => {
    socket.to(`consultation_${consultationId}`).emit('callRejected', {
      consultationId
    });
  });

  socket.on('callEnded', ({ consultationId }) => {
    socket.to(`consultation_${consultationId}`).emit('callEnded', {
      consultationId
    });
  });

  socket.on('iceCandidate', ({ consultationId, candidate }) => {
    socket.to(`consultation_${consultationId}`).emit('iceCandidate', {
      consultationId,
      candidate
    });
  });

  socket.on('offer', ({ consultationId, offer }) => {
    socket.to(`consultation_${consultationId}`).emit('offer', {
      consultationId,
      offer
    });
  });

  socket.on('answer', ({ consultationId, answer }) => {
    socket.to(`consultation_${consultationId}`).emit('answer', {
      consultationId,
      answer
    });
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id} (${socket.user.name})`);
  });
});

// Attach `io` to the app so routes/controllers can use it if needed
app.set('io', io);

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running with Socket.IO on port ${PORT}`);
});
