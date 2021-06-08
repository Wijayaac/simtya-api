const router = require("express").Router();
const database = require("../config/database");
const passport = require("passport");
const utils = require("../lib/utils");

router.get("/", (req, res) => {
  res.json({ info: "Node.js, Express, and Postgres API" });
});

router.get(
  "/list",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    database("users")
      .then((user) => {
        res.status(200).json(user);
      })
      .catch((err) => next(err));
  }
);
router.post("/login", (req, res, next) => {
  database("users")
    .where("username", "=", req.body.username)
    .first()
    .then((user) => {
      if (!user) {
        res.status(401).json({
          success: false,
          message: "could not fin that user",
        });
      }
      const isValid = utils.validPassword(
        req.body.password,
        user.hash,
        user.salt
      );
      if (isValid) {
        const tokenObject = utils.issueJWT(user);
        res.status(200).json({
          user: user,
          success: true,
          token: tokenObject.token,
          expiresIn: tokenObject.expires,
        });
      } else {
        res.status(401).json({
          success: false,
          message: "could not find user with that username",
        });
      }
    })
    .catch((err) => next(err));
});

router.post("/register", (req, res, next) => {
  const saltHash = utils.genPassword(req.body.password);
  const salt = saltHash.salt;
  const hash = saltHash.hash;

  database("users")
    .insert(
      {
        username: req.body.username,
        salt: salt,
        hash: hash,
        role: req.body.role,
      },
      ["id", "role"]
    )
    .then((user) => {
      const jwt = utils.issueJWT(user);
      res.json({
        success: true,
        user: user,
        token: jwt.token,
        expiresIn: jwt.expires,
      });
    })
    .catch((err) => next(err));
});

module.exports = router;
