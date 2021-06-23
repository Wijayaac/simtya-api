const router = require("express").Router();
const database = require("../config/database");
const passport = require("passport");

router.get("/", (req, res) => {
  res.json({ info: "Node.js, Express, and Postgres API Backend Member" });
});

router.get(
  "/loan",
  passport.authenticate("member", { session: false }),
  async (req, res, next) => {
    try {
      data = await database.select("id", "id_user", "id_vehicle").from("loan");
      res.json({ message: "success", data });
    } catch (error) {
      res.json({ message: "error", error });
    }
  }
);
router.get(
  "/pickup",
  passport.authenticate("member", { session: false }),
  async (req, res, next) => {
    try {
      data = await database
        .select("id", "id_user", "id_vehicle")
        .from("pickup");
      res.json({ message: "success", data });
    } catch (error) {
      res.json({ message: "error", error });
    }
  }
);
router.get(
  "/profile",
  passport.authenticate("member", { session: false }),
  async (req, res, next) => {
    try {
      data = await database.select("id", "name", "description").from("users");
      res.json({ message: "success", data });
    } catch (error) {
      res.json({ message: "error", error });
    }
  }
);
router.post(
  "/loan",
  passport.authenticate("member", { session: false }),
  async (req, res, next) => {
    try {
      data = await database("loan").insert(
        {
          id_vehicle: req.body.vehicle,
          id_user: req.body.user,
          description: req.body.description,
        },
        "id"
      );
      res.json({ message: "success", data });
    } catch (error) {
      res.json({ message: "error", error });
    }
  }
);
router.put(
  "/pickup",
  passport.authenticate("member", { session: false }),
  async (req, res, next) => {
    try {
      data = await database("passenger_details")
        .where("id", req.body.id)
        .update({
          id_user: req.body.user,
        });
      res.json({ message: "success", data });
    } catch (error) {
      res.json({ message: "error", error });
    }
  }
);
router.put(
  "/profile",
  passport.authenticate("member", { session: false }),
  async (req, res, next) => {
    try {
      data = await database("users").where("id", req.body.id).update({
        name: req.body.name,
        photo: req.body.photo,
        description: req.body.description,
      });
      res.json({ message: "success", data });
    } catch (error) {
      res.json({ message: "error", error });
    }
  }
);

module.exports = router;
