const passport = require('passport');

exports.authenticateGoogle = passport.authenticate('google', { scope: ['email', 'profile'] });

exports.googleCallback = passport.authenticate('google', {
    successRedirect: '/protected',
    failureRedirect: '/auth/google/failure'
});

exports.protectedRoute = (req, res) => {
    if (req.isAuthenticated()) {
        res.send(`Hello ${req.user.displayName}`);
    } else {
        res.sendStatus(401);
    }
};

exports.logout = (req, res) => {
    req.logout();
    req.session.destroy();
    res.send('Goodbye!');
};

exports.authFailure = (req, res) => {
    res.send('Failed to authenticate..');
};
