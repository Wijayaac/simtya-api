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
        .select(
          "id",
          "id_user",
          "id_vehicle",
          "type",
          "description",
          "start_at",
          "end_at"
        )
        .from("services");
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
      data = await database("services").insert(
        {
          id_vehicle: req.body.vehicle,
          start_at: req.body.start_at,
          end_at: req.body.end_at,
          type: req.body.type,
          id_user: 2,
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

router.get(
  "/service/:id",
  passport.authenticate("driver", { session: false }),
  async (req, res, next) => {
    try {
      data = await database
        .select(
          "id",
          "type",
          "description",
          "start_km",
          "end_km",
          "start_at",
          "end_at",
          "id_vehicle"
        )
        .from("services")
        .where("id", req.params.id);
      res.json({ message: "Success", data });
    } catch (error) {
      res.json({ message: "Error", error });
    }
  }
);

router.delete(
  "/service/:id",
  passport.authenticate("driver", { session: false }),
  async (req, res, next) => {
    try {
      data = await database("services").where("id", req.params.id).del();
      res.json({ message: "Success", data });
    } catch (error) {
      res.json({ message: "Error", error });
    }
  }
);

router.put(
  "/service",
  passport.authenticate("driver", { session: false }),
  async (req, res, next) => {
    try {
      data = await database("services").where("id", req.body.id).update(
        {
          id_vehicle: req.body.vehicle,
          start_km: req.body.start_km,
          end_km: req.body.end_km,
          start_at: req.body.start_at,
          end_at: req.body.end_at,
          type: req.body.type,
          description: req.body.description,
        },
        "id"
      );
      res.json({ message: "Success", data });
    } catch (error) {
      res.json({ message: "Error", error });
    }
  }
);

module.exports = router;
