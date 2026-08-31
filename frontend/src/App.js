import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE_URL = 'http://localhost:5000/api';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      setLoading(true);
      setTimeout(() => {
        // Simulate user data from token
        const userData = {
          id: 'user_' + Math.random(),
          username: 'User',
          email: 'user@example.com',
          avatar: 'https://via.placeholder.com/150'
        };
        setUser(userData);
        setLoading(false);
      }, 500);
    }
  }, [token]);

  const handleGitHubLogin = () => {
    window.location.href = `${API_BASE_URL.replace('/api', '')}/api/auth/github`;
  };

  const handleGuestLogin = () => {
    axios.post(`${API_BASE_URL}/auth/guest`)
      .then(res => {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
      })
      .catch(err => console.error('Guest login failed:', err));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setCurrentPage('login');
  };

  if (loading) {
    return <div className="loading">⏳ Loading...</div>;
  }

  if (!user) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h1>🎬 JriSita-AI</h1>
          <p>Create and Share OTPs - Free Edition</p>
          <div className="login-buttons">
            <button className="btn btn-github" onClick={handleGitHubLogin}>
              ⚫ Sign in with GitHub
            </button>
            <button className="btn btn-guest" onClick={handleGuestLogin}>
              👤 Continue as Guest
            </button>
          </div>
          <p className="footer-text">Free OTP System v1.0</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="navbar-brand">
          <h2>🎬 JriSita-AI</h2>
        </div>
        <div className="navbar-menu">
          <button
            className={currentPage === 'dashboard' ? 'active' : ''}
            onClick={() => setCurrentPage('dashboard')}
          >
            📊 Dashboard
          </button>
          <button
            className={currentPage === 'create-otp' ? 'active' : ''}
            onClick={() => setCurrentPage('create-otp')}
          >
            ➕ Create OTP
          </button>
          <button
            className={currentPage === 'my-otps' ? 'active' : ''}
            onClick={() => setCurrentPage('my-otps')}
          >
            📋 My OTPs
          </button>
          <button
            className={currentPage === 'verify' ? 'active' : ''}
            onClick={() => setCurrentPage('verify')}
          >
            ✅ Verify OTP
          </button>
        </div>
        <div className="navbar-user">
          <span>{user.username}</span>
          <button className="btn btn-logout" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="main-content">
        {currentPage === 'dashboard' && <Dashboard user={user} />}
        {currentPage === 'create-otp' && <CreateOTP user={user} />}
        {currentPage === 'my-otps' && <MyOTPs user={user} />}
        {currentPage === 'verify' && <VerifyOTP />}
      </div>
    </div>
  );
}

// Dashboard Component
function Dashboard({ user }) {
  const [stats, setStats] = useState({
    totalOTPsCreated: 0,
    totalOTPsUsed: 0,
    conversionRate: 0
  });
  const [recentOtps, setRecentOtps] = useState([]);

  useEffect(() => {
    // Fetch user stats
    axios.get(`${API_BASE_URL}/otp/stats/${user.email}`)
      .then(res => setStats(res.data.stats))
      .catch(err => console.error('Error fetching stats:', err));

    // Fetch recent OTPs
    axios.get(`${API_BASE_URL}/otp/list`)
      .then(res => setRecentOtps(res.data.otps.slice(0, 5)))
      .catch(err => console.error('Error fetching OTPs:', err));
  }, [user]);

  return (
    <div className="page-dashboard">
      <h1>📊 Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>📝 OTPs Created</h3>
          <p className="stat-value">{stats.totalOTPsCreated}</p>
        </div>
        <div className="stat-card">
          <h3>✅ OTPs Used</h3>
          <p className="stat-value">{stats.totalOTPsUsed}</p>
        </div>
        <div className="stat-card">
          <h3>📊 Conversion Rate</h3>
          <p className="stat-value">{stats.conversionRate}%</p>
        </div>
        <div className="stat-card">
          <h3>🎉 Status</h3>
          <p className="stat-value" style={{ color: '#4CAF50' }}>ACTIVE</p>
        </div>
      </div>

      <div className="recent-otps">
        <h2>📋 Recent OTPs</h2>
        {recentOtps.length > 0 ? (
          <table className="otps-table">
            <thead>
              <tr>
                <th>Created By</th>
                <th>Sent To</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {recentOtps.map((otp, idx) => (
                <tr key={idx}>
                  <td>{otp.createdBy}</td>
                  <td>{otp.sentTo}</td>
                  <td>{otp.duration}</td>
                  <td><span className={`status ${otp.status.includes('✅') ? 'used' : 'active'}`}>{otp.status}</span></td>
                  <td>{new Date(otp.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="empty-state">No OTPs created yet</p>
        )}
      </div>
    </div>
  );
}

// Create OTP Component
function CreateOTP({ user }) {
  const [formData, setFormData] = useState({
    recipientEmail: '',
    duration: '1week'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [otpResult, setOtpResult] = useState(null);
  const [otpPricing, setOtpPricing] = useState([]);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/otp/pricing`)
      .then(res => setOtpPricing(res.data.pricing))
      .catch(err => console.error('Error fetching pricing:', err));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    axios.post(`${API_BASE_URL}/otp/create`, {
      userEmail: user.email,
      recipientEmail: formData.recipientEmail,
      duration: formData.duration
    })
      .then(res => {
        setOtpResult(res.data);
        setFormData({ recipientEmail: '', duration: '1week' });
        setMessage('✅ OTP created and sent successfully!');
      })
      .catch(err => {
        setMessage('❌ Error: ' + (err.response?.data?.message || err.message));
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="page-create-otp">
      <h1>➕ Create New OTP</h1>
      
      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Your Email</label>
            <input type="email" value={user.email} disabled />
          </div>

          <div className="form-group">
            <label>Recipient Email *</label>
            <input
              type="email"
              value={formData.recipientEmail}
              onChange={(e) => setFormData({ ...formData, recipientEmail: e.target.value })}
              placeholder="recipient@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Select Duration *</label>
            <div className="duration-options">
              {otpPricing.map(option => (
                <label key={option.id} className="radio-option">
                  <input
                    type="radio"
                    name="duration"
                    value={option.id}
                    checked={formData.duration === option.id}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  />
                  <span>{option.label} - {option.price}</span>
                </label>
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? '⏳ Creating...' : '🚀 Create OTP'}
          </button>
        </form>

        {message && (
          <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        {otpResult && (
          <div className="otp-result-card">
            <h3>✅ OTP Created Successfully!</h3>
            <div className="otp-code-box">
              <p className="label">OTP Code:</p>
              <p className="code">{otpResult.otp}</p>
              <button className="btn btn-copy" onClick={() => navigator.clipboard.writeText(otpResult.otp)}>
                📋 Copy
              </button>
            </div>
            <table className="otp-details">
              <tbody>
                <tr>
                  <td>OTP ID:</td>
                  <td>{otpResult.otpId}</td>
                </tr>
                <tr>
                  <td>Recipient:</td>
                  <td>{formData.recipientEmail}</td>
                </tr>
                <tr>
                  <td>Duration:</td>
                  <td>{otpResult.duration}</td>
                </tr>
                <tr>
                  <td>Expiry Date:</td>
                  <td>{new Date(otpResult.expiryDate).toDateString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// My OTPs Component
function MyOTPs({ user }) {
  const [otps, setOtps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios.get(`${API_BASE_URL}/otp/list`)
      .then(res => setOtps(res.data.otps))
      .catch(err => console.error('Error fetching OTPs:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-my-otps">
      <h1>📋 My OTPs</h1>
      
      {loading ? (
        <p className="loading">⏳ Loading OTPs...</p>
      ) : otps.length > 0 ? (
        <div className="otps-list">
          {otps.map((otp, idx) => (
            <div key={idx} className="otp-card">
              <div className="otp-header">
                <h3>OTP #{idx + 1}</h3>
                <span className={`status-badge ${otp.status.includes('✅') ? 'used' : 'active'}`}>
                  {otp.status}
                </span>
              </div>
              <table className="otp-info">
                <tbody>
                  <tr>
                    <td>Sent To:</td>
                    <td>{otp.sentTo}</td>
                  </tr>
                  <tr>
                    <td>Duration:</td>
                    <td>{otp.duration}</td>
                  </tr>
                  <tr>
                    <td>Created:</td>
                    <td>{new Date(otp.createdAt).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td>Expires:</td>
                    <td>{new Date(otp.expiryDate).toDateString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))}
        </div>
      ) : (
        <p className="empty-state">No OTPs created yet. <a href="#">Create one now!</a></p>
      )}
    </div>
  );
}

// Verify OTP Component
function VerifyOTP() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [result, setResult] = useState(null);

  const handleVerify = (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    axios.post(`${API_BASE_URL}/otp/verify`, { otp })
      .then(res => {
        setResult(res.data);
        setMessage('✅ OTP verified successfully!');
        setOtp('');
      })
      .catch(err => {
        setMessage('❌ Error: ' + (err.response?.data?.message || err.message));
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="page-verify-otp">
      <h1>✅ Verify OTP</h1>
      
      <div className="form-container">
        <form onSubmit={handleVerify}>
          <div className="form-group">
            <label>Enter OTP Code *</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.toUpperCase())}
              placeholder="AB3CD5EF7G9KL2MN4OP6"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? '⏳ Verifying...' : '🔐 Verify OTP'}
          </button>
        </form>

        {message && (
          <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        {result && (
          <div className="verify-result-card">
            <h3>✅ OTP Verified!</h3>
            <table className="result-details">
              <tbody>
                <tr>
                  <td>OTP ID:</td>
                  <td>{result.otpId}</td>
                </tr>
                <tr>
                  <td>Duration:</td>
                  <td>{result.duration}</td>
                </tr>
                <tr>
                  <td>Verified At:</td>
                  <td>{new Date().toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
