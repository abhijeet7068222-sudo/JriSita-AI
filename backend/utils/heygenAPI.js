const axios = require('axios');

const HEYGEN_API_BASE = 'https://api.heygen.com/v1';
const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;

const heygenClient = axios.create({
  baseURL: HEYGEN_API_BASE,
  headers: {
    'X-API-Key': HEYGEN_API_KEY,
    'Content-Type': 'application/json'
  }
});

// Create video with avatar
exports.createVideoWithAvatar = async (options) => {
  try {
    const { script, voiceLanguage = 'hi-IN', voiceGender = 'female', avatarId = 'default', title } = options;

    return {
      success: true,
      videoId: 'mock-video-id',
      status: 'processing'
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get video status
exports.getVideoStatus = async (videoRequestId) => {
  try {
    return {
      success: true,
      status: 'completed',
      videoUrl: 'https://example.com/video.mp4'
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

exports.getAvatars = async () => {
  try {
    return { success: true, avatars: [] };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

module.exports.default = { createVideoWithAvatar, getVideoStatus, getAvatars };
