const router = require("express").Router();
const passport = require("passport");
const database = require("../config/database");
const upload = require("../config/upload");

router.get("/", (req, res) => {
  res.json({ info: "Node.js, Express, and Postgres API Backend Member" });
});

router.get(
  "/loan",
  passport.authenticate("member", { session: false }),
  async (req, res, next) => {
    try {
      data = await database
        .select(
          "id",
          "purpose",
          "accidents",
          "start_at",
          "end_at",
          "description",
          "id_vehicle"
        )
        .from("loan");
      res.json({ message: "success", data });
    } catch (error) {
      res.json({ message: "error", error });
    }
  }
);

router.get(
  "/loan/:id",
  passport.authenticate("member", { session: false }),
  async (req, res, next) => {
    try {
      data = await database
        .select(
          "id",
          "purpose",
          "accidents",
          "start_at",
          "end_at",
          "description",
          "id_vehicle",
          "start_km",
          "end_km"
        )
        .from("loan")
        .where("id", req.params.id);
      res.json({ message: "success", data });
    } catch (error) {
      res.json({ message: "Error", error });
    }
  }
);

router.get(
  "/pickup",
  passport.authenticate("member", { session: false }),
  async (req, res, next) => {
    try {
      data = await database
        .select("id", "start_at", "id_vehicle", "end_at")
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
          purpose: req.body.purpose,
          start_at: req.body.start_at,
          end_at: req.body.end_at,
          accidents: req.body.accidents,
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
  "/loan",
  passport.authenticate("member", { session: false }),
  async (req, res, next) => {
    try {
      data = await database("loan").where("id", req.body.id).update({
        id_vehicle: req.body.id_vehicle,
        purpose: req.body.purpose,
        accidents: req.body.accidents,
        start_at: req.body.start_at,
        end_at: req.body.end_at,
        start_km: req.body.start_km,
        end_km: req.body.end_km,
        description: req.body.description,
      });
      res.json({ message: "Success", data });
    } catch (error) {
      res.json({ message: "Error", error });
    }
  }
);

router.delete(
  "/loan/:id",
  passport.authenticate("member", { session: false }),
  async (req, res, next) => {
    try {
      data = await database("loan").where("id", req.params.id).del();
      res.json({ message: "Success", data });
    } catch (error) {
      res.json({ message: "Error", error });
    }
  }
);

router.put(
  "/pickup",
  passport.authenticate("member", { session: false }),
  async (req, res, next) => {
    try {
      data = await database("pickup_details").where("id", req.body.id).update({
        id_user: req.body.user,
        description: req.body.description,
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
  upload.single("photo"),
  async (req, res, next) => {
    try {
      var insertFilename = "";
      if (!req.file) {
        insertFilename = req.body.oldFilename;
      } else {
        const { filename } = req.file;
        insertFilename = filename;
      }
      data = await database("users").where("id", req.body.id).update({
        name: req.body.name,
        photo: insertFilename,
        description: req.body.description,
      });
      res.json({ message: "success", data });
    } catch (error) {
      res.json({ message: "error", error });
    }
  }
);

module.exports = router;
