const passport = require('passport');
const mysql = require('mysql');
const path = require('path');
require('dotenv').config();

// Connection Pool
let connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

exports.authenticateGoogle = passport.authenticate('google', { scope: ['email', 'profile'] });

exports.googleCallback = passport.authenticate('google', {
    successRedirect: '/protected',
    failureRedirect: '/auth/google/failure'
});

exports.protectedRoute = (req, res) => {
    if (req.isAuthenticated()) {

        const { id, given_name, family_name, displayName, email } = req.user;

        // Break the query into multiple lines for better readability
        let query = `
            INSERT INTO users
            SET 
            google_id = ?, 
            first_name = ?, 
            last_name = ?, 
            full_name = ?, 
            email = ?
        `;

        // Execute the query
        connection.query(query, [id, given_name, family_name, displayName, email], (err, rows) => {
            if (!err) {
            // res.render('home', { rows });
            } else {
            console.log(err);
            }
            console.log('The data from user table: \n', rows);
        });

        console.log(req.user)
        // res.send(`Hello ${req.user.displayName}`);
        res.render("home")
    } else {
        res.redirect("/hi")
    }
};

exports.logout = (req, res) => {
    req.logout(function(err) {
        if (err) {
            // handle error
            console.log(err);
            return next(err);
        }
        // destroy session data
        req.session.destroy(function (err) {
            if (err) {
                // handle error
                console.log('Session could not be destroyed.', err);
                return next(err);
            }
            // redirect user to homepage or login page
            req.user = null;
            res.redirect('/'); 
        });
    });
};

exports.authFailure = (req, res) => {
    res.send('Failed to authenticate..');
};
