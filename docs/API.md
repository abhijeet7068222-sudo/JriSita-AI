# JriSita-AI API Documentation

## Base URL
```
http://localhost:5000/api
```

## Endpoints

### 1. Create Video from Story
**POST** `/api/videos/create`

```json
{
  "title": "Jungle Adventure",
  "story": "एक राजा था...",
  "language": "hindi",
  "voiceType": "female",
  "duration": 300,
  "style": "cinematic"
}
```

**Response:**
```json
{
  "success": true,
  "videoId": "vid_123456",
  "status": "processing",
  "estimatedTime": "5 minutes"
}
```

### 2. Get Video Status
**GET** `/api/videos/:videoId`

**Response:**
```json
{
  "videoId": "vid_123456",
  "title": "Jungle Adventure",
  "status": "completed",
  "videoUrl": "https://s3.amazonaws.com/...",
  "duration": 285,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### 3. Speech to Text
**POST** `/api/speech-to-text`

**Form Data:**
- `audio`: Audio file (wav, mp3)
- `language`: Language code (en, hi, ur)

**Response:**
```json
{
  "text": "एक राजा था...",
  "confidence": 0.98,
  "language": "hi"
}
```

### 4. Edit Video
**POST** `/api/videos/:videoId/edit`

```json
{
  "cuts": [
    {"start": 10, "end": 20},
    {"start": 50, "end": 60}
  ],
  "addMusic": true,
  "musicType": "cinematic",
  "transitions": true
}
```

## Error Codes

- `400` - Bad Request
- `401` - Unauthorized
- `404` - Video Not Found
- `500` - Server Error

## Rate Limiting

- 100 requests per minute
- 1000 requests per day
