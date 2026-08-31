const express = require('express');
const router = express.Router();
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// Mock database
const usersDatabase = {};

// Configure Passport GitHub Strategy
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID || 'test_client_id',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || 'test_client_secret',
    callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:5000/api/auth/github/callback'
  },
  function(accessToken, refreshToken, profile, done) {
    let user = usersDatabase[profile.id];
    if (!user) {
      user = {
        id: profile.id,
        githubId: profile.id,
        username: profile.username,
        displayName: profile.displayName,
        profileUrl: profile.profileUrl,
        avatar: profile._json.avatar_url,
        email: profile.emails && profile.emails[0] ? profile.emails[0].value : null,
        createdAt: new Date(),
        totalEarnings: 0,
        otpsCreated: 0,
        otpsUsed: 0
      };
      usersDatabase[profile.id] = user;
    }
    return done(null, user);
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  const user = usersDatabase[id];
  done(null, user);
});

// GitHub Login Route
router.get('/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

// GitHub Callback
router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  (req, res) => {
    const token = jwt.sign(
      { 
        id: req.user.id, 
        username: req.user.username,
        email: req.user.email
      },
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: '7d' }
    );

    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/dashboard?token=${token}`);
  }
);

// Guest Login (No Auth)
router.post('/guest', (req, res) => {
  const guestId = 'guest_' + uuidv4();
  const token = jwt.sign(
    { id: guestId, username: 'Guest', email: null },
    process.env.JWT_SECRET || 'your_jwt_secret_key',
    { expiresIn: '7d' }
  );

  res.json({
    success: true,
    message: 'Guest login successful',
    token,
    user: {
      id: guestId,
      username: 'Guest User',
      email: null,
      avatar: 'https://via.placeholder.com/150'
    }
  });
});

// Get current user
router.get('/me', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  res.json({
    success: true,
    user: req.user
  });
});

// Logout
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ success: false, error: err });
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

module.exports = router;
