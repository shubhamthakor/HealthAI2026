require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const aiRoutes = require('./routes/aiRoutes');
const queueRoutes = require('./routes/queueRoutes');
const assistantRoutes = require('./routes/assistantRoutes');
const socketService = require('./services/socketService');
const { errorMiddleware } = require('./moddleware/errorMiddleware');

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

// Establish database connection
connectDB();

const app = express();

// Security Headers
app.use(helmet());

// Cross-Origin Resource Sharing
const allowedOrigins = [
  process.env.CLIENT_URL_PATIENT || 'http://localhost:5173',
  process.env.CLIENT_URL_DOCTOR || 'http://localhost:5174',
  process.env.CLIENT_URL_ADMIN || 'http://localhost:5175'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Request Parsers
app.use(express.json());
app.use(cookieParser());

// Mount Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/doctors', doctorRoutes);
app.use('/api/v1/appointments', appointmentRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/queue', queueRoutes);
app.use('/api/v1/assistant', assistantRoutes);

// Base route fallback
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Can't find ${req.originalUrl} on this server!`
    }
  });
});

// Centralized Error Handler Middleware
app.use(errorMiddleware);

// Server Listening
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize Socket.IO Server
socketService.init(server, allowedOrigins);

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! Shutting down server...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
