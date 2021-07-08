const router = require("express").Router();
const passport = require("passport");
const database = require("../config/database");
const upload = require("../config/upload");

router.get("/", (req, res) => {
  res.json({ info: "Node.js, Express, and Postgres API Backend admin" });
});

router.get(
  "/pickup",
  passport.authenticate("admin", { session: false }),
  async (req, res, next) => {
    try {
      data = await database
        .select(
          "id",
          "start_at",
          "end_at",
          "route",
          "description",
          "id_vehicle",
          "ready"
        )
        .from("pickup");
      res.json({ message: "Success", data });
    } catch (error) {
      res.json({ message: "error", error });
    }
  }
);

router.get(
  "/pickup/:id",
  passport.authenticate("admin", { session: false }),
  async (req, res, next) => {
    try {
      data = await database
        .select(
          "id",
          "start_at",
          "end_at",
          "route",
          "description",
          "id_vehicle"
        )
        .from("pickup")
        .where("id", req.params.id);
      res.json({ message: "Success", data });
    } catch (error) {
      res.json({ message: "Error", error });
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
          route: req.body.route,
          start_at: req.body.start_at,
          end_at: req.body.end_at,
          id_vehicle: req.body.vehicle,
          read: false,
          ready: false,
          slot: 12,
        },
        "id"
      );
      res.json({ message: "Success", data });
    } catch (error) {
      res.json({ message: "Error", error });
    }
  }
);

router.put(
  "/pickup",
  passport.authenticate("admin", { session: false }),
  async (req, res, next) => {
    try {
      data = await database("pickup").where("id", req.body.id).update({
        id_vehicle: req.body.id_vehicle,
        route: req.body.route,
        start_at: req.body.start_at,
        end_at: req.body.end_at,
      });
      res.json({ message: "Success", data });
    } catch (error) {
      res.json({ message: "Error", error });
    }
  }
);

router.delete(
  "/pickup/:id",
  passport.authenticate("admin", { session: false }),
  async (req, res, next) => {
    try {
      data = await database("pickup").where("id", req.params.id).del();
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
      data = await database
        .select(
          "id",
          "accidents",
          "purpose",
          "id_vehicle",
          "id_user",
          "description",
          "start_at",
          "end_at"
        )
        .from("loan");
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
      data = await database.select("id", "start_at", "end_at").from("service");
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
    try {
      data = await database
        .select("id", "name", "photo", "years", "brand", "type", "description")
        .from("vehicles");
      res.json(data);
    } catch (error) {
      res.json({ message: "error", error });
    }
  }
);
router.get(
  "/inventory/:id",
  passport.authenticate("admin", { session: false }),
  async (req, res, next) => {
    try {
      data = await database
        .select("id", "name", "photo", "years", "brand", "type", "description")
        .from("vehicles")
        .where("id", req.params.id);
      res.json({ message: "Success", data });
    } catch (error) {
      res.json({ message: "Error", error });
    }
  }
);
router.get("/vehicle/:type", async (req, res, next) => {
  try {
    const data = await database
      .select("id", "name", "type")
      .from("vehicles")
      .where("type", req.params.type);
    res.json({ message: "Success", data });
  } catch (error) {
    res.json({ message: "Error", error });
  }
});
router.post(
  "/inventory",
  passport.authenticate("admin", { session: false }),
  upload.single("photo"),
  async (req, res, next) => {
    try {
      const { filename } = req.file;
      data = await database("vehicles").insert(
        {
          name: req.body.name,
          type: req.body.type,
          brand: req.body.brand,
          years: req.body.years,
          photo: filename,
          description: req.body.description,
        },
        "name"
      );
      res.json({ message: "success", data });
    } catch (error) {
      res.json({ error });
    }
  }
);
router.put(
  "/inventory",
  passport.authenticate("admin", { session: false }),
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
      data = await database("vehicles").where("id", req.body.id).update({
        name: req.body.name,
        type: req.body.type,
        brand: req.body.brand,
        years: req.body.years,
        photo: insertFilename,
        description: req.body.description,
      });
      res.json({ message: "Success", data });
    } catch (error) {
      res.json({ message: "Error update", error });
    }
  }
);
router.delete(
  "/inventory/:id",
  passport.authenticate("admin", { session: false }),
  async (req, res, next) => {
    try {
      data = await database("vehicles").where("id", req.params.id).del();
      res.json({ message: "Success", data });
    } catch (error) {
      res.json({ message: "Error", data: error });
    }
  }
);

router.get(
  "/loanlist",
  passport.authenticate("admin", { session: false }),
  async (req, res, next) => {
    try {
      data = await database
        .select(
          "loan.id",
          "loan.accidents",
          "loan.purpose",
          "users.email",
          "users.username",
          "loan.start_at",
          "loan.end_at",
          "vehicles.name"
        )
        .from("loan")
        .innerJoin("vehicles", "loan.id_vehicle", "vehicles.id")
        .innerJoin("users", "loan.id_user", "users.id");
      res.json({ message: "Success", data });
    } catch (error) {
      res.json({ message: "Error", error });
    }
  }
);
router.get(
  "/loanlist/:id",
  passport.authenticate("admin", { session: false }),
  async (req, res, next) => {
    try {
      data = await database
        .select(
          "loan.id",
          "loan.accidents",
          "loan.purpose",
          "users.email",
          "loan.description",
          "loan.start_at",
          "loan.end_at",
          "vehicles.name"
        )
        .from("loan")
        .innerJoin("vehicles", "loan.id_vehicle", "vehicles.id")
        .innerJoin("users", "loan.id_user", "users.id")
        .where("loan.id", req.params.id);
      res.json({ message: "Success", data });
    } catch (error) {
      res.json({ message: "Error", error });
    }
  }
);
router.get(
  "/loanhistory/:id",
  passport.authenticate("admin", { session: false }),
  async (req, res, next) => {
    try {
      history = await database
        .select(
          "loan.purpose",
          "loan.description",
          "loan.id",
          "loan.id_vehicle",
          "users.username",
          "users.email",
          "loan.start_at",
          "loan.start_km",
          "loan.end_km",
          "loan.end_at",
          "loan.accidents",
          "vehicles.name"
        )
        .from("loan")
        .leftJoin("vehicles", "loan.id_vehicle", "vehicles.id")
        .leftJoin("users", "loan.id_user", "users.id")
        .where("loan.id", req.params.id)
        .first();
      res.json({ history });
    } catch (error) {
      res.send(error);
    }
  }
);

router.get(
  "/pickuplist",
  passport.authenticate("admin", { session: false }),
  async (req, res, next) => {
    try {
      data = await database
        .select(
          "pickup.id",
          "pickup.route",
          "pickup.start_at",
          "pickup.end_at",
          "pickup.ready",
          "vehicles.name"
        )
        .from("pickup")
        .innerJoin("vehicles", "pickup.id_vehicle", "vehicles.id");
      res.json({ message: "Success", data });
    } catch (error) {
      res.json({ message: "Error", error });
    }
  }
);
router.get(
  "/pickuplist/:id",
  passport.authenticate("admin", { session: false }),
  async (req, res, next) => {
    try {
      data = await database
        .select(
          "pickup.id",
          "pickup.route",
          "pickup.id_vehicle",
          "pickup.start_at",
          "pickup.end_at",
          "pickup.ready",
          "pickup.description",
          "vehicles.name"
        )
        .from("pickup")
        .innerJoin("vehicles", "pickup.id_vehicle", "vehicles.id")
        .where("pickup.id", req.params.id);

      res.json({ message: "Success", data });
    } catch (error) {
      res.json({ message: "Error", error });
    }
  }
);
router.get(
  "/pickuphistory/:id",
  passport.authenticate("admin", { session: false }),
  async (req, res, next) => {
    try {
      pickup = await database
        .select(
          "pickup.route",
          "pickup.description",
          "pickup.id",
          "pickup.id_vehicle",
          "pickup.start_at",
          "pickup.end_at",
          "pickup.ready",
          "vehicles.name"
        )
        .from("pickup")
        .innerJoin("vehicles", "pickup.id_vehicle", "vehicles.id")
        .where("pickup.id", req.params.id);
      history = await database
        .select(
          "pickup_details.id",
          "users.email",
          "pickup_details.description",
          "pickup_details.created_at"
        )
        .from("pickup_details")
        .leftJoin("users", "pickup_details.id_user", "users.id")
        .where("pickup_details.id_pickup", req.params.id)
        .orderBy("pickup_details.id", "desc");
      res.json({
        pickup,
        history,
      });
    } catch (error) {
      res.send(error);
    }
  }
);

module.exports = router;
