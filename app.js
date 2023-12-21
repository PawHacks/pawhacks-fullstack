const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const mysql = require('mysql');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Connection Pool
let connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

app.use(session({
    secret: process.env.SECRET_SESSION,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 3600000 }
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'pawhacks1.0')));

const handlebars = exphbs.create({ extname: '.hbs' });
app.engine('.hbs', handlebars.engine);
app.set('view engine', '.hbs');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/auth/google/callback"
}, function(accessToken, refreshToken, profile, done) {
    console.log(profile)
    const googleId = profile.id;
    const email = profile.emails[0].value;
    const firstName = profile.name.givenName;
    const lastName = profile.name.familyName;
    const fullName = profile.displayName;

    connection.query('SELECT * FROM users WHERE email = ?', [email], function(err, users) {
        if (err) return done(err);

        if (users.length) {
            return done(null, users[0]);
        } else {
            let insertQuery = `INSERT INTO users (google_id, first_name, last_name, full_name, email) VALUES (?, ?, ?, ?, ?)`;
            connection.query(insertQuery, [googleId, firstName, lastName, fullName, email], function(err, result) {
                if (err) return done(err);

                let newUser = { id: result.insertId, google_id: googleId, email: email };
                return done(null, newUser);
            });
        }
    });
}));

passport.serializeUser(function(user, done) {
    // console.log(user)
    done(null, user.google_id);
});

passport.deserializeUser(function(google_id, done) {
    // console.log("Deserializing user with Google ID:", google_id); // Log for debugging
    connection.query('SELECT * FROM users WHERE google_id = ?', [google_id], function(err, users) {
        if (err) return done(err);
        if (users.length > 0) {
            console.log("Found user:", users[0]); // Log found user
            done(null, users[0]);
        } else {
            // console.log("User not found for Google ID:", google_id); // Log if not found
            done(new Error("User not found"), null);
        }
    });
});


const authRoutes = require('./server/routes/authRoutes');
app.use('/', authRoutes);

const userRotues = require('./server/routes/userRoutes');
app.use('/', userRotues);  

app.listen(port, () => console.log(`Listening on port ${port}`));
