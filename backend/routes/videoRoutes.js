const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const multer = require('multer');

const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 100 * 1024 * 1024 }
});

router.post('/create', videoController.createVideo);
router.get('/:videoId', videoController.getVideoStatus);
router.get('/', videoController.listVideos);
router.delete('/:videoId', videoController.deleteVideo);
router.post('/:videoId/regenerate', videoController.regenerateVideo);

module.exports = router;
