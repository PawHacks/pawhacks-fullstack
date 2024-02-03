const express = require("express");
const exphbs = require("express-handlebars");
const path = require("path");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const Handlebars = require("handlebars");
const mysql = require("mysql");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// Connection Pool
const connection = mysql.createConnection({
  // connectionLimit: 10, // Limit for number of connections
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  authPlugins: ["mysql_native_password"],
});

app.use(
  session({
    secret: process.env.SECRET_SESSION,
    resave: false,
    saveUninitialized: true,
    rolling: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }, //cookie resets after 1 hour
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "pawhacks1.0")));

const handlebars = exphbs.create({ extname: ".hbs" }); //loads handlebars for html templates
app.engine(".hbs", handlebars.engine);
app.set("view engine", ".hbs");

Handlebars.registerHelper("eq", function (arg1, arg2) {
  return arg1 === arg2;
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/auth/google/callback" //redirects to this url after authentication
      // callbackURL: "https://pawhacks.io/auth/google/callback", //redirects to this url after authentication
    },
    function (accessToken, refreshToken, profile, done) {
      console.log(profile);
      const googleId = profile.id; //get google id
      const email = profile.emails[0].value; // get email
      const firstName = profile.name.givenName;
      const lastName = profile.name.familyName ? profile.name.familyName : "";
      const fullName = profile.displayName;

      connection.query(
        "SELECT * FROM users WHERE email = ?",
        [email],
        function (err, users) {
          if (err) return done(err);

          // if user already exists, return that user
          if (users.length) {
            return done(null, users[0]);
          } else {
            // if user does not exist, insert that user into the database
            let insertQuery = `INSERT INTO users (google_id, first_name, last_name, full_name, email) VALUES (?, ?, ?, ?, ?)`;
            connection.query(
              insertQuery,
              [googleId, firstName, lastName, fullName, email],
              function (err, result) {
                if (err) return done(err);
                // if user does not exist, return the new user just created
                let newUser = {
                  id: result.insertId,
                  google_id: googleId,
                  email: email,
                };
                return done(null, newUser);
              }
            );
          }
        }
      );
    }
  )
);

// serializes a user - stores user in session
passport.serializeUser(function (user, done) {
  // console.log(user)
  done(null, user.google_id);
});

// converts user session into user data, searching from database
passport.deserializeUser(function (google_id, done) {
  // console.log("Deserializing user with Google ID:", google_id); // Log for debugging
  connection.query(
    "SELECT * FROM users WHERE google_id = ?",
    [google_id],
    function (err, users) {
      if (err) {
        res.send(
          `<script>alert("Your session has expired. You will be logged out); window.history.back();</script>`
        );
        return res.redirect("/login");
      }
      if (users.length > 0) {
        console.log("Found user:", users[0]); // Log found user
        done(null, users[0]);
      } else {
        // console.log("User not found for Google ID:", google_id); // Log if not found
        done(new Error("User not found"), null);
      }
    }
  );
});

// routes
const authRoutes = require("./server/routes/authRoutes");
app.use("/", authRoutes);

const userRotues = require("./server/routes/userRoutes");
app.use("/", userRotues);

// local port
app.listen(port, () => console.log(`Listening on port ${port}`));
