# 🎬 JriSita-AI - Complete Setup Guide

## 📋 Overview

**JriSita-AI** is a FREE open-source platform for creating and sharing OTPs with video generation capabilities. This guide will help you set up everything in **15-20 minutes**.

### ✨ Features
- ✅ **Free OTP System** - Create OTPs for any duration (1 week to 1 year)
- 🔐 **GitHub OAuth Login** - Secure authentication
- 📱 **Mobile App** - React Native iOS/Android
- 🌐 **Web Dashboard** - React-based frontend
- 🎥 **Video Generation** - HeyGen integration ready
- 📧 **Email Notifications** - Gmail-based OTP delivery
- 📊 **Analytics** - Track your OTP usage

---

## 🚀 Quick Start (15 Minutes)

### **Step 1: Clone the Repository**
```bash
git clone https://github.com/abhijeet7068222-sudo/JriSita-AI.git
cd JriSita-AI
```

### **Step 2: Setup Backend**

#### **2.1 Install Dependencies**
```bash
cd backend
npm install
```

#### **2.2 Create .env File**
```bash
cp .env.example .env
```

#### **2.3 Configure .env**
Edit `backend/.env` and add:
```
PORT=5000
NODE_ENV=development

# Gmail Configuration (For sending OTPs)
EMAIL_USER=abhijeet7068222@gmail.com
EMAIL_PASSWORD=your_gmail_app_password

# GitHub OAuth (Optional - for GitHub login)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback

# JWT
JWT_SECRET=your_random_secret_key_here

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

#### **2.4 Start Backend Server**
```bash
npm start
```

✅ Backend running on `http://localhost:5000`

---

### **Step 3: Setup Frontend**

#### **3.1 Install Dependencies** (In new terminal)
```bash
cd frontend
npm install
```

#### **3.2 Start Frontend**
```bash
npm start
```

✅ Frontend running on `http://localhost:3000`

---

### **Step 4: Setup Mobile App** (Optional)

#### **4.1 Install React Native CLI**
```bash
npm install -g react-native-cli
```

#### **4.2 Install Dependencies**
```bash
cd mobile
npm install
```

#### **4.3 Run on Android**
```bash
react-native run-android
```

#### **4.4 Run on iOS** (macOS only)
```bash
react-native run-ios
```

---

## 📧 Gmail Setup (Important!)

### **Generate Gmail App Password**

1. Go to https://myaccount.google.com
2. Click **Security** in left menu
3. Enable **2-Step Verification** (if not enabled)
4. Search for **App passwords**
5. Select **Mail** and **Windows Computer**
6. Copy the 16-character password
7. Paste in `.env` as `EMAIL_PASSWORD`

⚠️ **Without this, emails won't be sent!**

---

## 🔐 GitHub OAuth Setup (Optional)

### **Create GitHub OAuth App**

1. Go to https://github.com/settings/developers
2. Click **New OAuth App**
3. Fill in:
   - **Application name**: JriSita-AI
   - **Homepage URL**: http://localhost:3000
   - **Authorization callback URL**: http://localhost:5000/api/auth/github/callback
4. Copy **Client ID** and **Client Secret**
5. Add to `.env`:
   ```
   GITHUB_CLIENT_ID=your_client_id
   GITHUB_CLIENT_SECRET=your_client_secret
   ```

---

## 📱 API Endpoints

### **Authentication**
- `GET /api/auth/github` - Login with GitHub
- `POST /api/auth/guest` - Guest login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### **OTP Management**
- `POST /api/otp/create` - Create new OTP
- `POST /api/otp/verify` - Verify OTP
- `GET /api/otp/details/:otpId` - Get OTP details
- `GET /api/otp/list` - List all OTPs
- `GET /api/otp/pricing` - Get pricing (all FREE!)
- `GET /api/otp/stats/:email` - Get user statistics

### **Video Generation**
- `POST /api/videos/create` - Create video from story
- `GET /api/videos/:videoId` - Get video status
- `GET /api/videos` - List all videos
- `DELETE /api/videos/:videoId` - Delete video

### **Editing**
- `POST /api/edit/:videoId/cut` - Cut video
- `POST /api/edit/:videoId/add-music` - Add music
- `POST /api/edit/:videoId/add-effects` - Add effects
- `POST /api/edit/:videoId/add-subtitles` - Add subtitles
- `POST /api/edit/:videoId/export` - Export video

---

## 🧪 Testing the App

### **Create OTP**
```bash
curl -X POST http://localhost:5000/api/otp/create \
  -H "Content-Type: application/json" \
  -d '{
    "userEmail": "abhijeet7068222@gmail.com",
    "recipientEmail": "friend@example.com",
    "duration": "1week"
  }'
```

### **Verify OTP**
```bash
curl -X POST http://localhost:5000/api/otp/verify \
  -H "Content-Type: application/json" \
  -d '{"otp": "AB3CD5EF7G9KL2MN4OP6"}'
```

### **Get Pricing**
```bash
curl http://localhost:5000/api/otp/pricing
```

---

## 🎥 Video Generation Setup

### **HeyGen Integration** (For AI Videos)

1. Sign up at https://www.heygen.com
2. Get your API Key from dashboard
3. Add to `.env`:
   ```
   HEYGEN_API_KEY=your_heygen_api_key
   ```

---

## 📊 Database Setup (MongoDB)

### **Option 1: MongoDB Atlas (Cloud)**

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create cluster
4. Get connection string
5. Add to `.env`:
   ```
   MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/jrisita-ai
   ```

### **Option 2: Local MongoDB**

```bash
# Install MongoDB
brew install mongodb-community  # macOS
# or download from https://www.mongodb.com/try/download/community

# Start MongoDB
mongod

# In .env
MONGODB_URI=mongodb://localhost:27017/jrisita-ai
```

---

## 🚀 Deployment

### **Deploy Backend to Heroku**

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
cd backend
heroku create your-app-name

# Set environment variables
heroku config:set EMAIL_USER=your_email@gmail.com
heroku config:set EMAIL_PASSWORD=your_app_password
# ... set other vars

# Deploy
git push heroku main
```

### **Deploy Frontend to Vercel**

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd frontend
vercel
```

### **Deploy to AWS**

```bash
# Use AWS Elastic Beanstalk or Lambda
# Follow AWS documentation for Node.js deployment
```

---

## 🐛 Troubleshooting

### **Port 5000 already in use**
```bash
# Kill process using port 5000
lsof -ti:5000 | xargs kill -9
# or change port in .env
```

### **Emails not sending**
- ✅ Enable 2FA on Gmail
- ✅ Create App Password (not account password)
- ✅ Check EMAIL_USER and EMAIL_PASSWORD in .env
- ✅ Check spam folder

### **GitHub OAuth not working**
- ✅ Check Client ID and Secret are correct
- ✅ Verify callback URL matches
- ✅ Check if app is public

### **Mobile app won't connect to backend**
- ✅ Make sure backend is running
- ✅ Use your machine's IP instead of localhost
- ✅ Check firewall settings

---

## 📁 Project Structure

```
JriSita-AI/
├── backend/
│   ├── controllers/
│   │   ├── freeOtpController.js      # OTP logic
│   │   ├── videoController.js        # Video generation
│   │   ├── editController.js         # Video editing
│   │   └── speechController.js       # Speech processing
│   ├── routes/
│   │   ├── authRoutes.js             # Authentication
│   │   ├── freeOtpRoutes.js          # OTP routes
│   │   ├── videoRoutes.js            # Video routes
│   │   └── ...
│   ├── utils/
│   │   ├── videoProcessor.js         # Video utilities
│   │   └── heygenAPI.js              # HeyGen API
│   ├── .env.example
│   ├── package.json
│   └── server.js                     # Main server
├── frontend/
│   ├── src/
│   │   ├── App.js                    # Main component
│   │   ├── App.css                   # Styles
│   │   └── index.js                  # Entry point
│   ├── public/
│   │   └── index.html
│   └── package.json
├── mobile/
│   ├── App.js                        # React Native app
│   └── package.json
└── README.md
```

---

## 📝 Features Roadmap

- ✅ Free OTP System
- ✅ GitHub OAuth
- ✅ Email Notifications
- ✅ Web Dashboard
- ✅ Mobile App
- 🔄 Payment Integration (Coming Soon)
- 🔄 Video Analytics (Coming Soon)
- 🔄 AI-powered Subtitles (Coming Soon)
- 🔄 Social Sharing (Coming Soon)

---

## 💰 Payment Integration (Update Guide)

To add Razorpay payment later:

1. Go to https://razorpay.com
2. Create account and get API keys
3. Update `backend/controllers/otpController.js`
4. Replace free pricing with real pricing
5. Add payment verification logic

---

## 🤝 Contributing

Contributions welcome! Please follow:
1. Fork repository
2. Create feature branch
3. Make changes
4. Submit pull request

---

## 📄 License

MIT License - Free to use commercially

---

## 📞 Support

- 📧 Email: abhijeet7068222@gmail.com
- 🐛 Issues: GitHub Issues
- 💬 Discussions: GitHub Discussions

---

## 🎉 You're All Set!

### Quick Commands

```bash
# Terminal 1: Start Backend
cd backend && npm start

# Terminal 2: Start Frontend
cd frontend && npm start

# Terminal 3: Start Mobile (Optional)
cd mobile && npm start
```

🚀 **Open http://localhost:3000 in browser!**

---

**Made with ❤️ by JriSita-AI Team**
