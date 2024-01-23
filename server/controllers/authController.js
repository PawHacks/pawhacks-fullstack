const passport = require('passport');
const mysql = require('mysql');

// Connection Pool
let connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

exports.authenticateGoogle = passport.authenticate('google', { scope: ['email', 'profile'] });

exports.googleCallback = (req, res, next) => {
    passport.authenticate('google', function(err, user) {
        if (err) { return next(err); }
        if (!user) { return res.redirect('/login'); }

        req.login(user, function(err) {
            if (err) { return next(err); }
            const google_id = req.user.google_id; 
            let query = `SELECT * FROM USERS WHERE google_id = ?`; 

            connection.query(query, [google_id], (err, result) => { 
                if (err) {
                    console.error("Database query error:", err);
                    return next(err); // Handle the error appropriately
                }

                if (result.length === 0) {
                    // No user found, handle this case appropriately
                    return res.redirect('/some-appropriate-url');
                }

                const user = result[0]; 
                if(Object.values(user).some(value => value === null || value === undefined)) { 
                    return res.redirect('/application');
                } else { 
                    return res.redirect('/create_team');
                }
            });
        });
    })(req, res, next);
};


// exports.googleCallback = (req, res, next) => {
//     passport.authenticate('google', function(err, user) {
//         if (err) { return next(err); }
//         if (!user) { return res.redirect('/login'); }

//         req.login(user, function(err) {
//             if (err) { return next(err); }
//             const google_id = req.user.google_id; 
//             let query = ` 
//             SELECT * 
//             FROM USERS 
//             WHERE google_id = ?
//             `; 

//             connection.query(query, [google_id], (err, result) => { 
//                 const user = result
//                 if(Object.values(user).some(value => value === null || value === undefined)) { 
//                     return res.redirect('/application')
//                 } else { 
//                     return res.redirect('/create_team')
//                 }
//             })
//         });
//     })(req, res, next);
// };

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
