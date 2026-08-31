const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const passport = require('passport');
const session = require('express-session');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Session middleware
app.use(session({
  secret: process.env.JWT_SECRET || 'your_session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/videos', require('./routes/videoRoutes'));
app.use('/api/speech', require('./routes/speechRoutes'));
app.use('/api/edit', require('./routes/editRoutes'));
app.use('/api/otp', require('./routes/freeOtpRoutes'));
app.use('/api/health', require('./routes/healthRoutes'));

// Welcome route
app.get('/', (req, res) => {
  res.json({
    status: '✅ Running',
    message: '🎬 JriSita-AI Backend Server',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      videos: '/api/videos',
      otp: '/api/otp',
      speech: '/api/speech',
      edit: '/api/edit',
      health: '/api/health'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🎬 JriSita-AI Backend running on http://localhost:${PORT}`);
  console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🔐 GitHub OAuth: Configured`);
  console.log(`📧 Email Service: Enabled`);
  console.log(`⏰ Timestamp: ${new Date().toISOString()}\n`);
});

module.exports = app;
