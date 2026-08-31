const express = require('express');
const router = express.Router();
const freeOtpController = require('../controllers/freeOtpController');

// OTP routes (Free version)
router.post('/create', freeOtpController.createOTP);
router.post('/verify', freeOtpController.verifyOTP);
router.get('/details/:otpId', freeOtpController.getOTPDetails);
router.get('/list', freeOtpController.listOTPs);
router.get('/pricing', freeOtpController.getOTPPricing);
router.get('/stats/:email', freeOtpController.getUserStats);

module.exports = router;
