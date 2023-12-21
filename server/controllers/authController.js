const passport = require('passport');

exports.authenticateGoogle = passport.authenticate('google', { scope: ['email', 'profile'] });

exports.googleCallback = (req, res, next) => {
    passport.authenticate('google', function(err, user) {
        if (err) { return next(err); }
        if (!user) { return res.redirect('/login'); }

        req.login(user, function(err) {
            if (err) { return next(err); }
            return res.redirect('/protected');
        });
    })(req, res, next);
};

exports.protectedRoute = (req, res) => {
    if (req.isAuthenticated()) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.render('home');
    } else {
        res.redirect('/login');
    }
};


exports.logout = (req, res) => {
    req.logout(function(err) {
        if (err) {
            console.log(err);
            return next(err);
        }
        req.session.destroy(() => {
            res.redirect('/');
        });
    });
};

exports.authFailure = (req, res) => {
    res.send('Failed to authenticate..');
};
