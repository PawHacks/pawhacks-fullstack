const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.sendStatus(401);
    }
}

router.get('/auth/google', authController.authenticateGoogle);
router.get('/auth/google/callback', authController.googleCallback, authController.protectedRoute);
router.get('/protected', isLoggedIn, authController.protectedRoute);
router.get('/logout', authController.logout);
router.get('/auth/google/failure', authController.authFailure);

module.exports = router;
