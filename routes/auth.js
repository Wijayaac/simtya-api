const router = require("express").Router();
const passport = require("passport");
const database = require("../config/database");
const utils = require("../lib/utils");

router.post("/login", (req, res, next) => {
  database("users")
    .where("email", "=", req.body.email)
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
        salt: salt,
        hash: hash,
        username: req.body.username,
        role: 3,
        email: req.body.email,
      },
      ["id", "role"]
    )
    .then((user) => {
      res.json({
        success: true,
        user: user,
      });
    })
    .catch((err) => next(err));
});

module.exports = router;
