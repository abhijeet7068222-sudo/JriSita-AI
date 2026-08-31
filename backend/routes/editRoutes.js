const express = require('express');
const router = express.Router();
const editController = require('../controllers/editController');

router.post('/:videoId/cut', editController.cutVideo);
router.post('/:videoId/add-music', editController.addMusic);
router.post('/:videoId/add-effects', editController.addEffects);
router.post('/:videoId/add-subtitles', editController.addSubtitles);
router.post('/:videoId/export', editController.exportVideo);

module.exports = router;
