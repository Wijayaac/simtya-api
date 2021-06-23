const express = require("express");
const cors = require("cors");
const passport = require("passport");
const handleErrors = require("./middleware/handleErrors");

/**
 * -------------- GENERAL SETUP ----------------
 */

// Gives us access to variables set in the .env file via `process.env.VARIABLE_NAME` syntax
require("dotenv").config();
// Create the Express application
var app = express();

// Pass the global passport object into the configuration function
require("./config/passport")(passport);

// This will initialize the passport object on every request
app.use(passport.initialize());

// Instead of using body-parser middleware, use the new Express implementation of the same thing
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Allows our Angular application to make HTTP requests to Express application
app.use(cors());

/**
 * -------------- ROUTES ----------------
 */

// Imports all of the routes from ./routes/index.js
app.use(require("./routes"));

// global error handler
app.use(handleErrors);

// Server listens on http://localhost:3000
app.listen(process.env.PORT || 4000, function () {
  console.log(
    "Express server listening on port %d in %s mode",
    this.address().port,
    app.settings.env
  );
});
