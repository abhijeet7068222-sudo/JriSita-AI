import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const App = () => {
  const [currentPage, setCurrentPage] = useState('login');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    recipientEmail: '',
    duration: '1week',
    otpCode: ''
  });
  const [stats, setStats] = useState({
    otpsCreated: 0,
    otpsUsed: 0,
    conversionRate: 0
  });

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      // Simulate checking for stored token
      setLoading(false);
    };
    checkUser();
  }, []);

  const handleGuestLogin = () => {
    setLoading(true);
    axios.post(`${API_BASE_URL}/auth/guest`)
      .then(res => {
        setUser(res.data.user);
        setCurrentPage('dashboard');
      })
      .catch(err => {
        Alert.alert('Error', 'Login failed');
      })
      .finally(() => setLoading(false));
  };

  const handleCreateOTP = () => {
    if (!formData.recipientEmail) {
      Alert.alert('Error', 'Please enter recipient email');
      return;
    }

    setLoading(true);
    axios.post(`${API_BASE_URL}/otp/create`, {
      userEmail: user.email || 'mobile-user@example.com',
      recipientEmail: formData.recipientEmail,
      duration: formData.duration
    })
      .then(res => {
        Alert.alert('Success', 'OTP created and sent!\n\nOTP: ' + res.data.otp);
        setFormData({ ...formData, recipientEmail: '' });
      })
      .catch(err => {
        Alert.alert('Error', err.response?.data?.message || 'Failed to create OTP');
      })
      .finally(() => setLoading(false));
  };

  const handleVerifyOTP = () => {
    if (!formData.otpCode) {
      Alert.alert('Error', 'Please enter OTP code');
      return;
    }

    setLoading(true);
    axios.post(`${API_BASE_URL}/otp/verify`, { otp: formData.otpCode })
      .then(res => {
        Alert.alert('Success', 'OTP verified successfully!');
        setFormData({ ...formData, otpCode: '' });
      })
      .catch(err => {
        Alert.alert('Error', err.response?.data?.message || 'Invalid OTP');
      })
      .finally(() => setLoading(false));
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('login');
  };

  // Login Screen
  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.loginContainer}>
          <Text style={styles.appTitle}>🎬 JriSita-AI</Text>
          <Text style={styles.appSubtitle}>Free OTP Manager</Text>
          
          <TouchableOpacity
            style={styles.guestButton}
            onPress={handleGuestLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>👤 Continue as Guest</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.footerText}>v1.0.0</Text>
        </View>
      </View>
    );
  }

  // Dashboard
  if (currentPage === 'dashboard') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>📊 Dashboard</Text>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.logoutButton}>Logout</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>📝 Created</Text>
              <Text style={styles.statValue}>{stats.otpsCreated}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>✅ Used</Text>
              <Text style={styles.statValue}>{stats.otpsUsed}</Text>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#667eea' }]}
              onPress={() => setCurrentPage('create')}
            >
              <Text style={styles.actionButtonText}>➕ Create OTP</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#2ecc71' }]}
              onPress={() => setCurrentPage('verify')}
            >
              <Text style={styles.actionButtonText}>✅ Verify OTP</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Create OTP Screen
  if (currentPage === 'create') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setCurrentPage('dashboard')}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>➕ Create OTP</Text>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.formContainer}>
            <Text style={styles.label}>Recipient Email</Text>
            <TextInput
              style={styles.input}
              placeholder="recipient@example.com"
              value={formData.recipientEmail}
              onChangeText={(text) => setFormData({ ...formData, recipientEmail: text })}
              keyboardType="email-address"
            />

            <Text style={styles.label}>Duration</Text>
            <View style={styles.durationOptions}>
              {['1week', '1month', '1year'].map(dur => (
                <TouchableOpacity
                  key={dur}
                  style={[
                    styles.durationButton,
                    formData.duration === dur && styles.durationButtonActive
                  ]}
                  onPress={() => setFormData({ ...formData, duration: dur })}
                >
                  <Text style={[
                    styles.durationButtonText,
                    formData.duration === dur && styles.durationButtonTextActive
                  ]}>
                    {dur === '1week' ? '1 Week' : dur === '1month' ? '1 Month' : '1 Year'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleCreateOTP}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>🚀 Create OTP</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Verify OTP Screen
  if (currentPage === 'verify') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setCurrentPage('dashboard')}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>✅ Verify OTP</Text>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.formContainer}>
            <Text style={styles.label}>Enter OTP Code</Text>
            <TextInput
              style={[styles.input, { fontSize: 18, letterSpacing: 2 }]}
              placeholder="AB3CD5EF7G9KL2MN4OP6"
              value={formData.otpCode}
              onChangeText={(text) => setFormData({ ...formData, otpCode: text.toUpperCase() })}
            />

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleVerifyOTP}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>🔐 Verify OTP</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#667eea',
    paddingHorizontal: 20,
  },
  appTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  appSubtitle: {
    fontSize: 18,
    color: '#e0e0e0',
    marginBottom: 40,
  },
  guestButton: {
    backgroundColor: '#f39c12',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginBottom: 20,
  },
  header: {
    backgroundColor: '#1a1a2e',
    paddingTop: 40,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  backButton: {
    fontSize: 18,
    color: '#667eea',
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    color: 'white',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 6,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#667eea',
  },
  actionButtons: {
    gap: 12,
  },
  actionButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  formContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    marginTop: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  durationOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  durationButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  durationButtonActive: {
    borderColor: '#667eea',
    backgroundColor: '#667eea',
  },
  durationButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: 'bold',
  },
  durationButtonTextActive: {
    color: 'white',
  },
  submitButton: {
    backgroundColor: '#667eea',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 25,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  footerText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 20,
  },
});

export default App;
