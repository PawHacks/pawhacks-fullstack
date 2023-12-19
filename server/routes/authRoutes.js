const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
require('dotenv').config();

function isLoggedIn(req, res, next) {
    console.log("logged out cant go in")
    req.user ? next() : res.sendStatus(401);
}

// Define the Google OAuth routes
router.get('/auth/google', authController.authenticateGoogle);

router.get('/auth/google/callback', authController.googleCallback);

router.get('/protected', isLoggedIn, authController.protectedRoute);

router.get('/logout', function(req, res, next) {
    authController.logout(req, res, next);
});


router.get('/auth/google/failure', authController.authFailure);

module.exports = router;
