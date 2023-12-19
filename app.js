const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;

require('./server/controllers/authController');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

function isLoggedIn(req, res, next) {
    req.user ? next() : res.sendStatus(401);
}
  
app.use(session({ secret: process.env.SECRET_SESSION, resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// Parsing middleware
// Parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true })); 

// Parse application/json
// app.use(bodyParser.json());
app.use(express.json()); // New

// Static Files
// app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'pawhacks1.0')));

// Templating Engine
const handlebars = exphbs.create({ extname: '.hbs', });
app.engine('.hbs', handlebars.engine);
app.set('view engine', '.hbs');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/auth/google/callback"
}, function(accessToken, refreshToken, profile, done) {
    return done(null, profile);
}));

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

const userRotues = require('./server/routes/userRoutes');
app.use('/', userRotues);   

const authRoutes = require('./server/routes/authRoutes');
app.use('/', authRoutes);

app.listen(port, () => console.log(`Listening on port ${port}`));