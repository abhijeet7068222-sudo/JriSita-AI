const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'JriSita-AI Backend is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
