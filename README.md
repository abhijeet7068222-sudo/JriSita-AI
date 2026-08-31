# 🎬 JriSita-AI

**AI-Powered Video Generation & Editing App**

Tell stories in any language → JriSita creates professional videos instantly!

## Features

✅ **Voice Input** - Speak your story in any language (Hindi, English, Urdu, etc.)
✅ **AI Story Generation** - Auto-generate engaging narratives
✅ **Video Creation** - High-quality video from your story
✅ **Auto Editing** - Professional cuts, transitions, effects
✅ **Multi-Platform** - Mobile (iOS/Android) + Web/Desktop
✅ **Real-time Processing** - Get videos in minutes!

## Tech Stack

- **Frontend**: React, React Native, Tailwind CSS
- **Backend**: Node.js, Express.js
- **AI Services**: HeyGen API, Google Speech-to-Text, OpenAI GPT
- **Database**: MongoDB
- **Storage**: AWS S3 / Firebase Storage
- **Video Processing**: FFmpeg

## Project Structure

```
JriSita-AI/
├── frontend/              # Web app (React)
├── mobile/                # Mobile app (React Native)
├── backend/               # API server (Node.js)
├── scripts/               # Video processing scripts
├── docs/                  # Documentation
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn
- MongoDB
- API Keys (HeyGen, OpenAI, Google Cloud)

### Installation

```bash
# Clone repo
git clone https://github.com/abhijeet7068222-sudo/JriSita-AI.git
cd JriSita-AI

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Add your API keys

# Start backend
cd backend && npm start

# Start frontend (in another terminal)
cd frontend && npm start
```

## How to Use

1. **Open JriSita AI App**
2. **Tell Your Story** 📢
   - Speak or type your story
   - Support for Hindi, English, Urdu, etc.
3. **AI Generates Video** 🤖
   - JriSita creates a professional video
   - Auto-editing with effects
4. **Edit & Refine** ✂️
   - Cut unwanted parts
   - Add transitions, music
   - Download or share

## API Integration

### Speech-to-Text (Google)
```javascript
const speech = require('@google-cloud/speech');
const client = new speech.SpeechClient();
```

### Video Generation (HeyGen)
```javascript
const response = await heygenAPI.createVideo({
  title: 'My Story Video',
  script: 'Your story text here',
  voice: 'hindi-female',
  avatar: 'avatar-1'
});
```

## Contributing

Contributions welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md)

## License

MIT License - See [LICENSE](LICENSE)

## Support

For issues & features, create an [Issue](https://github.com/abhijeet7068222-sudo/JriSita-AI/issues)

---

**Made with ❤️ by Abhijeet**
