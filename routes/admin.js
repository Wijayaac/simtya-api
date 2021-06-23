const router = require("express").Router();
const database = require("../config/database");
const passport = require("passport");

router.get("/", (req, res) => {
  res.json({ info: "Node.js, Express, and Postgres API Backend admin" });
});

router.get(
  "/pickup",
  passport.authenticate("admin", { session: false }),
  async (req, res, next) => {
    try {
      data = await database
        .select("id", "id_user", "id_vehicle")
        .from("pickup");
      res.json({ message: "Success", data });
    } catch (error) {
      res.json({ message: "error", error });
    }
  }
);
router.post(
  "/pickup",
  passport.authenticate("admin", { session: false }),
  async (req, res, next) => {
    try {
      data = await database("pickup").insert(
        {
          id_vehicle: req.body.vehicle,
          id_user: req.body.user,
          description: req.body.description,
          read: false,
        },
        "id"
      );
      res.json({ message: "Success", data });
    } catch (error) {
      res.json({ message: "Error", error });
    }
  }
);
router.get(
  "/loan",
  passport.authenticate("admin", { session: false }),
  async (req, res, next) => {
    try {
      data = await database.select("id", "id_user", "id_vehicle").from("loan");
      res.json({ message: "Success", data });
    } catch (error) {
      res.json({ message: "error", error });
    }
  }
);
router.get(
  "/service",
  passport.authenticate("admin", { session: false }),
  async (req, res, next) => {
    try {
      data = await database
        .select("id", "id_vehicle", "id_user")
        .from("service");
      res.json({ message: "Success", data });
    } catch (error) {
      res.json({ message: "error", error });
    }
  }
);
router.get(
  "/inventory",
  passport.authenticate("admin", { session: false }),
  async (req, res, next) => {
    data = await database.select("name", "years", "brand").from("vehicles");
    res.json(data);
  }
);
router.post(
  "/inventory",
  passport.authenticate("admin", { session: false }),
  async (req, res, next) => {
    try {
      data = await database("vehicles").insert(
        {
          name: req.body.name,
          type: req.body.type,
          brand: req.body.brand,
          years: req.body.years,
          photo: req.body.photo,
          description: req.body.description,
        },
        "name"
      );
      res.json({ message: "success", data: data });
    } catch (error) {
      res.json({ message: "Error insert data", data: error });
    }
  }
);
router.put(
  "/inventory",
  passport.authenticate("admin", { session: false }),
  async (req, res, next) => {
    try {
      data = await database("vehicles").where("id", 1).update({
        name: req.body.name,
        type: req.body.type,
        brand: req.body.brand,
        years: req.body.years,
        photo: req.body.photo,
        description: req.body.description,
      });
      res.json({ message: "Success", data });
    } catch (error) {
      res.json({ message: "Error update", error });
    }
  }
);
router.delete(
  "/inventory",
  passport.authenticate("admin", { session: false }),
  async (req, res, next) => {
    try {
      data = await database("vehicles").where("name", req.body.name).del();
      res.json({ message: "Success", data });
    } catch (error) {
      res.json({ message: "Error", data: error });
    }
  }
);

module.exports = router;
