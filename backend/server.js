const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/videos', require('./routes/videoRoutes'));
app.use('/api/speech', require('./routes/speechRoutes'));
app.use('/api/edit', require('./routes/editRoutes'));
app.use('/api/health', require('./routes/healthRoutes'));

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
  console.log(`📡 API Base URL: http://localhost:${PORT}/api\n`);
});

module.exports = app;
