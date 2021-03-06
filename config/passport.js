const fs = require("fs");
const path = require("path");
const JWTStrategy = require("passport-jwt").Strategy;
const ExtractJWT = require("passport-jwt").ExtractJwt;

const database = require("../config/database");
const pathToKey = path.join(__dirname, "..", "id_rsa_pub.pem");
const PUB_KEY = fs.readFileSync(pathToKey, "utf-8");

const options = {
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: PUB_KEY,
  algorithms: ["RS256"],
};
module.exports = (passport) => {
  passport.use(
    "admin",
    new JWTStrategy(options, (payload, done) => {
      database("users")
        .where("id", "=", payload.sub)
        .first()
        .then((user) => {
          if (user.role == 1) {
            return done(null, user);
          } else {
            return done(null, false);
          }
        })
        .catch((err) => done(err, null));
    })
  );
  passport.use(
    "member",
    new JWTStrategy(options, (payload, done) => {
      database("users")
        .where("id", "=", payload.sub)
        .first()
        .then((user) => {
          if (user.role == 3) {
            return done(null, user);
          } else {
            return done(null, false);
          }
        })
        .catch((err) => done(err, null));
    })
  );
  passport.use(
    "driver",
    new JWTStrategy(options, (payload, done) => {
      database("users")
        .where("id", "=", payload.sub)
        .first()
        .then((user) => {
          if (user.role == 2) {
            return done(null, user);
          } else {
            return done(null, false);
          }
        })
        .catch((err) => done(err, null));
    })
  );
};
