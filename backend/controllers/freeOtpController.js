const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'abhijeet7068222@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'app_password'
  }
});

// Mock database
const otpsDatabase = {};
const usersDatabase = {};

// OTP pricing (Free version - all free!)
const OTP_PRICES = {
  '1week': { days: 7, price: 0, label: '1 Week' },
  '2weeks': { days: 14, price: 0, label: '2 Weeks' },
  '1month': { days: 30, price: 0, label: '1 Month' },
  '3months': { days: 90, price: 0, label: '3 Months' },
  '6months': { days: 180, price: 0, label: '6 Months' },
  '1year': { days: 365, price: 0, label: '1 Year' }
};

// Generate OTP
const generateOTP = () => {
  return crypto.randomBytes(12).toString('hex').toUpperCase();
};

// Create OTP (Free version)
exports.createOTP = async (req, res) => {
  try {
    const { userEmail, recipientEmail, duration } = req.body;

    if (!userEmail || !recipientEmail || !duration) {
      return res.status(400).json({
        success: false,
        message: 'User email, recipient email, and duration are required'
      });
    }

    if (!OTP_PRICES[duration]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid duration. Choose: 1week, 2weeks, 1month, 3months, 6months, 1year'
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpId = uuidv4();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + OTP_PRICES[duration].days);

    // Store OTP in database
    const otpData = {
      otpId,
      otp,
      userEmail,
      recipientEmail,
      duration,
      expiryDate,
      createdAt: new Date(),
      used: false,
      usedAt: null
    };

    otpsDatabase[otpId] = otpData;

    // Update user stats
    if (!usersDatabase[userEmail]) {
      usersDatabase[userEmail] = {
        email: userEmail,
        totalOTPsCreated: 0,
        totalOTPsUsed: 0,
        createdAt: new Date()
      };
    }
    usersDatabase[userEmail].totalOTPsCreated += 1;

    // Send OTP email to recipient
    const mailOptions = {
      from: process.env.EMAIL_USER || 'abhijeet7068222@gmail.com',
      to: recipientEmail,
      subject: `🔐 Your JriSita-AI OTP - Valid till ${expiryDate.toDateString()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">🔐 Your JriSita-AI OTP</h2>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="font-size: 12px; color: #666; margin: 0 0 10px 0;">OTP Code:</p>
            <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #2196F3; margin: 0;">${otp}</p>
          </div>
          <table style="width: 100%; margin: 20px 0;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #ddd;"><strong>Valid Duration:</strong></td>
              <td style="padding: 10px 0; border-bottom: 1px solid #ddd;">${OTP_PRICES[duration].label}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #ddd;"><strong>Expiry Date:</strong></td>
              <td style="padding: 10px 0; border-bottom: 1px solid #ddd;">${expiryDate.toDateString()}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #ddd;"><strong>Created By:</strong></td>
              <td style="padding: 10px 0; border-bottom: 1px solid #ddd;">${userEmail}</td>
            </tr>
          </table>
          <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #856404;"><strong>⚠️ Important:</strong> This OTP will expire on ${expiryDate.toDateString()}. Do not share this OTP with anyone else.</p>
          </div>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="font-size: 12px; color: #666; text-align: center; margin: 0;">© 2024 JriSita-AI. All rights reserved.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    // Send confirmation email to creator
    const creatorMailOptions = {
      from: process.env.EMAIL_USER || 'abhijeet7068222@gmail.com',
      to: userEmail,
      subject: `✅ OTP Created Successfully`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">✅ OTP Created Successfully!</h2>
          <p>Your OTP has been created and sent to <strong>${recipientEmail}</strong></p>
          <div style="background-color: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>OTP Details:</strong></p>
            <p>Duration: ${OTP_PRICES[duration].label}</p>
            <p>Created At: ${new Date().toLocaleString()}</p>
          </div>
          <p>You'll receive email notifications when the OTP is used.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="font-size: 12px; color: #666; text-align: center; margin: 0;">© 2024 JriSita-AI. All rights reserved.</p>
        </div>
      `
    };

    await transporter.sendMail(creatorMailOptions);

    res.status(200).json({
      success: true,
      otpId,
      message: 'OTP created and sent successfully',
      otp, // In real app, don't send OTP in response
      expiryDate,
      duration: OTP_PRICES[duration].label
    });
  } catch (error) {
    console.error('Error creating OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating OTP',
      error: error.message
    });
  }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: 'OTP is required'
      });
    }

    // Find OTP in database
    let otpData = null;
    let otpId = null;

    for (const [id, data] of Object.entries(otpsDatabase)) {
      if (data.otp === otp) {
        otpData = data;
        otpId = id;
        break;
      }
    }

    if (!otpData) {
      return res.status(404).json({
        success: false,
        message: 'OTP not found'
      });
    }

    // Check if expired
    if (new Date() > new Date(otpData.expiryDate)) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired'
      });
    }

    // Check if already used
    if (otpData.used) {
      return res.status(400).json({
        success: false,
        message: 'OTP already used'
      });
    }

    // Mark as used
    otpsDatabase[otpId].used = true;
    otpsDatabase[otpId].usedAt = new Date();

    if (usersDatabase[otpData.userEmail]) {
      usersDatabase[otpData.userEmail].totalOTPsUsed += 1;
    }

    // Send success email to creator
    const successMailOptions = {
      from: process.env.EMAIL_USER || 'abhijeet7068222@gmail.com',
      to: otpData.userEmail,
      subject: `🎉 Your OTP Was Used Successfully!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">🎉 OTP Used Successfully!</h2>
          <p>Your OTP has been verified and used by the recipient.</p>
          <div style="background-color: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Usage Details:</strong></p>
            <p>Recipient: ${otpData.recipientEmail}</p>
            <p>Used At: ${new Date().toLocaleString()}</p>
            <p>Duration: ${OTP_PRICES[otpData.duration].label}</p>
          </div>
          <p>Keep creating more OTPs to share with others!</p>
        </div>
      `
    };

    await transporter.sendMail(successMailOptions);

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      otpId,
      expiryDate: otpData.expiryDate,
      duration: OTP_PRICES[otpData.duration].label
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying OTP',
      error: error.message
    });
  }
};

// Get OTP details
exports.getOTPDetails = async (req, res) => {
  try {
    const { otpId } = req.params;

    if (!otpsDatabase[otpId]) {
      return res.status(404).json({
        success: false,
        message: 'OTP not found'
      });
    }

    const otpData = otpsDatabase[otpId];
    const daysRemaining = Math.ceil((new Date(otpData.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));

    res.status(200).json({
      success: true,
      otp: {
        otpId,
        createdBy: otpData.userEmail,
        sentTo: otpData.recipientEmail,
        duration: OTP_PRICES[otpData.duration].label,
        status: otpData.used ? 'USED ✅' : 'ACTIVE ⏳',
        expiryDate: otpData.expiryDate,
        createdAt: otpData.createdAt,
        usedAt: otpData.usedAt,
        daysRemaining: daysRemaining > 0 ? daysRemaining : 'Expired'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching OTP details'
    });
  }
};

// List all OTPs
exports.listOTPs = async (req, res) => {
  try {
    const otps = Object.entries(otpsDatabase).map(([id, data]) => ({
      otpId: id,
      createdBy: data.userEmail,
      sentTo: data.recipientEmail,
      duration: OTP_PRICES[data.duration].label,
      status: data.used ? 'USED ✅' : 'ACTIVE ⏳',
      expiryDate: data.expiryDate,
      createdAt: data.createdAt
    }));

    res.json({
      success: true,
      total: otps.length,
      otps
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching OTPs'
    });
  }
};

// Get user stats
exports.getUserStats = async (req, res) => {
  try {
    const { email } = req.params;

    if (!usersDatabase[email]) {
      return res.json({
        success: true,
        stats: {
          email,
          totalOTPsCreated: 0,
          totalOTPsUsed: 0,
          conversionRate: 0
        }
      });
    }

    const userData = usersDatabase[email];
    const conversionRate = userData.totalOTPsCreated > 0 
      ? ((userData.totalOTPsUsed / userData.totalOTPsCreated) * 100).toFixed(2)
      : 0;

    res.json({
      success: true,
      stats: {
        email: userData.email,
        totalOTPsCreated: userData.totalOTPsCreated,
        totalOTPsUsed: userData.totalOTPsUsed,
        conversionRate: `${conversionRate}%`,
        joinedAt: userData.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user stats'
    });
  }
};

// Get OTP pricing
exports.getOTPPricing = async (req, res) => {
  try {
    const pricing = Object.keys(OTP_PRICES).map(key => ({
      id: key,
      label: OTP_PRICES[key].label,
      days: OTP_PRICES[key].days,
      price: 'FREE 🎉'
    }));

    res.json({
      success: true,
      message: '🎉 All OTPs are FREE in this version!',
      pricing
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching pricing'
    });
  }
};
