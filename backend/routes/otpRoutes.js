const express = require('express');
const router = express.Router();
const otpController = require('../controllers/otpController');

// OTP routes
router.post('/create-request', otpController.createOTPRequest);
router.post('/verify-payment', otpController.verifyPaymentAndGenerateOTP);
router.post('/verify', otpController.verifyOTP);
router.get('/details/:otpId', otpController.getOTPDetails);
router.get('/earnings/:email', otpController.getUserEarnings);
router.get('/prices', otpController.getOTPPrices);

module.exports = router;
