const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

// Mock database - replace with MongoDB
const videosDatabase = {};

// Create video from story
exports.createVideo = async (req, res) => {
  try {
    const { title, story, language, voiceType, style } = req.body;

    if (!title || !story) {
      return res.status(400).json({
        success: false,
        message: 'Title and story are required'
      });
    }

    const videoId = uuidv4();

    // Call HeyGen API (mock for now)
    const videoData = {
      videoId,
      title,
      story,
      language: language || 'hindi',
      voiceType: voiceType || 'female',
      style: style || 'cinematic',
      status: 'processing',
      createdAt: new Date(),
      progress: 0
    };

    videosDatabase[videoId] = videoData;

    // Simulate processing
    simulateVideoGeneration(videoId);

    res.status(200).json({
      success: true,
      videoId,
      status: 'processing',
      message: 'Video generation started',
      estimatedTime: '5-10 minutes'
    });
  } catch (error) {
    console.error('Error creating video:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating video',
      error: error.message
    });
  }
};

// Get video status
exports.getVideoStatus = async (req, res) => {
  try {
    const { videoId } = req.params;

    if (!videosDatabase[videoId]) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    const video = videosDatabase[videoId];

    res.status(200).json({
      success: true,
      video: {
        videoId: video.videoId,
        title: video.title,
        status: video.status,
        progress: video.progress,
        videoUrl: video.videoUrl || null,
        duration: video.duration || null,
        createdAt: video.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching video status',
      error: error.message
    });
  }
};

// List all videos
exports.listVideos = async (req, res) => {
  try {
    const videos = Object.values(videosDatabase).map(v => ({
      videoId: v.videoId,
      title: v.title,
      status: v.status,
      createdAt: v.createdAt,
      language: v.language
    }));

    res.status(200).json({
      success: true,
      videos,
      total: videos.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching videos'
    });
  }
};

// Delete video
exports.deleteVideo = async (req, res) => {
  try {
    const { videoId } = req.params;

    if (!videosDatabase[videoId]) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    delete videosDatabase[videoId];

    res.status(200).json({
      success: true,
      message: 'Video deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting video'
    });
  }
};

// Regenerate video
exports.regenerateVideo = async (req, res) => {
  try {
    const { videoId } = req.params;

    if (!videosDatabase[videoId]) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    videosDatabase[videoId].status = 'processing';
    videosDatabase[videoId].progress = 0;

    simulateVideoGeneration(videoId);

    res.status(200).json({
      success: true,
      message: 'Video regeneration started'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error regenerating video'
    });
  }
};

// Simulate video generation
function simulateVideoGeneration(videoId) {
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 30;
    if (progress >= 100) {
      progress = 100;
      videosDatabase[videoId].status = 'completed';
      videosDatabase[videoId].progress = 100;
      videosDatabase[videoId].videoUrl = `https://example-videos.s3.amazonaws.com/${videoId}.mp4`;
      videosDatabase[videoId].duration = Math.floor(Math.random() * 300) + 60;
      clearInterval(interval);
    } else {
      videosDatabase[videoId].progress = Math.floor(progress);
    }
  }, 2000);
}
