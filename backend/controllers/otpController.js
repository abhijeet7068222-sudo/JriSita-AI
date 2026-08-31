const crypto = require('crypto');
const nodemailer = require('nodemailer');
const Razorpay = require('razorpay');
const { v4: uuidv4 } = require('uuid');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// OTP pricing structure
const OTP_PRICES = {
  '1week': { days: 7, price: 39900, label: '1 Week' },
  '2weeks': { days: 14, price: 59900, label: '2 Weeks' },
  '1month': { days: 30, price: 99900, label: '1 Month' },
  '3months': { days: 90, price: 199900, label: '3 Months' },
  '6months': { days: 180, price: 349900, label: '6 Months' },
  '1year': { days: 365, price: 599900, label: '1 Year' }
};

// Mock database
const otpsDatabase = {};
const usersDatabase = {};
const earningsDatabase = {};

// Generate OTP
const generateOTP = () => {
  return crypto.randomBytes(3).toString('hex').toUpperCase();
};

// Create OTP request
exports.createOTPRequest = async (req, res) => {
  try {
    const { email, duration, recipientEmail } = req.body;

    if (!email || !duration || !recipientEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email, duration, and recipient email are required'
      });
    }

    if (!OTP_PRICES[duration]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid duration'
      });
    }

    // Create Razorpay order
    const orderId = uuidv4();
    const amount = OTP_PRICES[duration].price; // Amount in paise

    const order = await razorpay.orders.create({
      amount: amount,
      currency: 'INR',
      receipt: orderId,
      notes: {
        email: email,
        recipientEmail: recipientEmail,
        duration: duration
      }
    });

    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: amount / 100, // Convert to rupees
      duration: OTP_PRICES[duration].label,
      currency: 'INR'
    });
  } catch (error) {
    console.error('Error creating OTP request:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating OTP request',
      error: error.message
    });
  }
};

// Verify payment and generate OTP
exports.verifyPaymentAndGenerateOTP = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, email, recipientEmail, duration } = req.body;

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpId = uuidv4();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + OTP_PRICES[duration].days);

    // Store OTP
    const otpData = {
      otpId,
      otp,
      email,
      recipientEmail,
      duration,
      expiryDate,
      createdAt: new Date(),
      used: false,
      usedAt: null,
      paymentId: razorpay_payment_id,
      amount: OTP_PRICES[duration].price / 100
    };

    otpsDatabase[otpId] = otpData;

    // Update user earnings
    if (!usersDatabase[email]) {
      usersDatabase[email] = {
        email,
        totalEarnings: 0,
        otpsCreated: 0,
        otpsUsed: 0
      };
    }
    usersDatabase[email].totalEarnings += OTP_PRICES[duration].price / 100;
    usersDatabase[email].otpsCreated += 1;

    // Send OTP email to recipient
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipientEmail,
      subject: `Your JriSita-AI OTP - Valid till ${expiryDate.toDateString()}`,
      html: `
        <h2>Your JriSita-AI OTP</h2>
        <p><strong>OTP Code:</strong> ${otp}</p>
        <p><strong>Valid Duration:</strong> ${OTP_PRICES[duration].label}</p>
        <p><strong>Expiry Date:</strong> ${expiryDate.toDateString()}</p>
        <p><strong>Created By:</strong> ${email}</p>
        <hr>
        <p><strong>⚠️ Important:</strong> This OTP will expire on ${expiryDate.toDateString()}. Do not share this OTP with anyone else.</p>
      `
    };

    await transporter.sendMail(mailOptions);

    // Send confirmation email to creator
    const creatorMailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `OTP Created Successfully - Payment Received ₹${OTP_PRICES[duration].price / 100}`,
      html: `
        <h2>OTP Created Successfully!</h2>
        <p>Your OTP has been created and sent to ${recipientEmail}</p>
        <p><strong>Amount Received:</strong> ₹${OTP_PRICES[duration].price / 100}</p>
        <p><strong>Duration:</strong> ${OTP_PRICES[duration].label}</p>
        <p><strong>Payment ID:</strong> ${razorpay_payment_id}</p>
        <hr>
        <p>You'll receive updates when the OTP is used.</p>
      `
    };

    await transporter.sendMail(creatorMailOptions);

    res.status(200).json({
      success: true,
      otpId,
      message: 'OTP generated and sent successfully',
      amount: OTP_PRICES[duration].price / 100,
      expiryDate
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying payment',
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

    // Check if OTP has expired
    if (new Date() > new Date(otpData.expiryDate)) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired'
      });
    }

    // Check if OTP already used
    if (otpData.used) {
      return res.status(400).json({
        success: false,
        message: 'OTP already used'
      });
    }

    // Mark OTP as used
    otpsDatabase[otpId].used = true;
    otpsDatabase[otpId].usedAt = new Date();

    // Update user earnings
    if (usersDatabase[otpData.email]) {
      usersDatabase[otpData.email].otpsUsed += 1;
    }

    // Send payment notification to creator
    const paymentNotificationEmail = {
      from: process.env.EMAIL_USER,
      to: otpData.email,
      subject: `💰 Payment Received! OTP Used - ₹${otpData.amount}`,
      html: `
        <h2>🎉 OTP Used Successfully!</h2>
        <p>Your OTP has been used by the recipient.</p>
        <p><strong>Amount Earned:</strong> ₹${otpData.amount}</p>
        <p><strong>Duration:</strong> ${OTP_PRICES[otpData.duration].label}</p>
        <p><strong>Used At:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>OTP ID:</strong> ${otpId}</p>
        <hr>
        <p>Keep creating more OTPs to earn more!</p>
      `
    };

    await transporter.sendMail(paymentNotificationEmail);

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      amount: otpData.amount,
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

    res.status(200).json({
      success: true,
      otp: {
        otpId,
        createdBy: otpData.email,
        sentTo: otpData.recipientEmail,
        duration: OTP_PRICES[otpData.duration].label,
        amount: otpData.amount,
        status: otpData.used ? 'USED' : 'ACTIVE',
        expiryDate: otpData.expiryDate,
        createdAt: otpData.createdAt,
        usedAt: otpData.usedAt,
        daysRemaining: Math.ceil((new Date(otpData.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching OTP details'
    });
  }
};

// Get user earnings
exports.getUserEarnings = async (req, res) => {
  try {
    const { email } = req.params;

    if (!usersDatabase[email]) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userData = usersDatabase[email];

    res.status(200).json({
      success: true,
      earnings: {
        email: userData.email,
        totalEarnings: userData.totalEarnings,
        otpsCreated: userData.otpsCreated,
        otpsUsed: userData.otpsUsed,
        conversionRate: userData.otpsCreated > 0 ? ((userData.otpsUsed / userData.otpsCreated) * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user earnings'
    });
  }
};

// Get OTP prices
exports.getOTPPrices = async (req, res) => {
  try {
    const prices = Object.keys(OTP_PRICES).map(key => ({
      id: key,
      label: OTP_PRICES[key].label,
      days: OTP_PRICES[key].days,
      price: OTP_PRICES[key].price / 100
    }));

    res.status(200).json({
      success: true,
      prices
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching OTP prices'
    });
  }
};
