const express = require('express');
const router = express.Router();
const speechController = require('../controllers/speechController');
const multer = require('multer');

const upload = multer({ dest: 'uploads/audio/' });

router.post('/transcribe', upload.single('audio'), speechController.transcribeAudio);
router.post('/analyze', speechController.analyzeText);
router.get('/languages', speechController.getSupportedLanguages);

module.exports = router;
