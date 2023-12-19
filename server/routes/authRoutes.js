const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Define the Google OAuth routes
router.get('/auth/google', authController.authenticateGoogle);

router.get('/auth/google/callback', authController.googleCallback);

router.get('/protected', authController.protectedRoute);

router.get('/logout', authController.logout);

router.get('/auth/google/failure', authController.authFailure);

module.exports = router;
