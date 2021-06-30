const router = require("express").Router();
const passport = require("passport");
const database = require("../config/database");
const upload = require("../config/upload");

router.get("/", (req, res) => {
  res.json({ info: "Node.js, Express, and Postgres API Backend driver" });
});

router.get(
  "/pickup",
  passport.authenticate("driver", { session: false }),
  async (req, res, next) => {
    try {
      data = await database
        .select("id", "id_vehicle", "start_at", "end_at")
        .from("pickup");
      res.json({ message: "Success", data });
    } catch (error) {
      res.json({ message: "Error", error });
    }
  }
);
router.get(
  "/service",
  passport.authenticate("driver", { session: false }),
  async (req, res, next) => {
    try {
      data = await database
        .select("id", "id_user", "id_vehicle")
        .from("service");
      res.json({ message: "Success", data });
    } catch (error) {
      res.json({ message: "error", error });
    }
  }
);
router.put(
  "/pickup",
  passport.authenticate("driver", { session: false }),
  async (req, res, next) => {
    try {
      data = await database("pickup").where("id", req.body.id).update({
        ready: req.body.accidents,
      });
      res.json({ message: "success", data });
    } catch (error) {
      res.json({ message: "error", error });
    }
  }
);
router.post(
  "/service",
  passport.authenticate("driver", { session: false }),
  async (req, res, next) => {
    try {
      data = await database("service").insert(
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

module.exports = router;
