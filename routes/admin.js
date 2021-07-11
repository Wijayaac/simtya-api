const router = require("express").Router();
const passport = require("passport");
const database = require("../config/database");
const upload = require("../config/upload");

router.get(
  "/",
  passport.authenticate("admin", { session: false }),
  async (req, res) => {
    try {
      let { rows } = await database.raw(
        "SELECT COUNT(id),type from vehicles GROUP BY type"
      );
      res
        .status(200)
        .json({ success: true, message: "Success getting that data", rows });
    } catch (error) {
      res
        .status(401)
        .json({ success: false, message: "Cannot proceed that request" });
    }
  }
);

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
      res
        .status(200)
        .json({ success: true, message: "Success processing data", data });
    } catch (error) {
      res
        .status(401)
        .json({ success: false, message: "Cannot proceed that request" });
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
      res
        .status(200)
        .json({ success: true, message: "Success processing data", data });
    } catch (error) {
      res
        .status(401)
        .json({ success: false, message: "Cannot proceed that request" });
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
      res
        .status(200)
        .json({ success: true, message: "Success processing data", data });
    } catch (error) {
      res
        .status(401)
        .json({ success: false, message: "Cannot proceed that request" });
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
      res
        .status(200)
        .json({ success: true, message: "Success processing data", data });
    } catch (error) {
      res
        .status(401)
        .json({ success: false, message: "Cannot proceed that request" });
    }
  }
);

router.delete(
  "/pickup/:id",
  passport.authenticate("admin", { session: false }),
  async (req, res, next) => {
    try {
      data = await database("pickup").where("id", req.params.id).del();
      res
        .status(200)
        .json({ success: true, message: "Success processing data", data });
    } catch (error) {
      res
        .status(401)
        .json({ success: false, message: "Cannot proceed that request" });
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
      res
        .status(200)
        .json({ success: true, message: "Success processing data", data });
    } catch (error) {
      res
        .status(401)
        .json({ success: false, message: "Cannot proceed that request" });
    }
  }
);
router.get(
  "/service/:page",
  passport.authenticate("admin", { session: false }),
  async (req, res, next) => {
    let currentPage = req.params.page;
    let perPage = 2;
    try {
      let data = await database
        .select(
          "services.id",
          "services.description",
          "services.type",
          "services.start_at",
          "services.end_at",
          "vehicles.name"
        )
        .from("services")
        .innerJoin("vehicles", "services.id_vehicle", "vehicles.id")
        .limit(perPage)
        .offset((currentPage - 1) * perPage);
      let { count } = await database("services").count("id").first();
      res.status(200).json({
        success: true,
        message: "Success processing data",
        data,
        perPage: parseInt(perPage),
        maxPage: Math.ceil(count / perPage),
      });
    } catch (error) {
      res
        .status(401)
        .json({ success: false, message: "Cannot proceed that request" });
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
      res.status(200).json(data);
    } catch (error) {
      res
        .status(401)
        .json({ success: false, message: "Cannot proceed that request" });
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
      res
        .status(200)
        .json({ success: true, message: "Success processing data", data });
    } catch (error) {
      res
        .status(401)
        .json({ success: false, message: "Cannot proceed that request" });
    }
  }
);
router.get("/vehicle/:type", async (req, res, next) => {
  try {
    const data = await database
      .select("id", "name", "type")
      .from("vehicles")
      .where("type", req.params.type);
    res
      .status(200)
      .json({ success: true, message: "Success processing data", data });
  } catch (error) {
    res
      .status(401)
      .json({ success: false, message: "Cannot proceed that request" });
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
      res
        .status(200)
        .json({ success: true, message: "success processing data", data });
    } catch (error) {
      res
        .status(401)
        .json({ success: false, message: "Cannot proceed that request" });
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
      res
        .status(200)
        .json({ success: true, message: "Success processing data", data });
    } catch (error) {
      res
        .status(401)
        .json({ success: false, message: "Cannot proceed that request" });
    }
  }
);
router.delete(
  "/inventory/:id",
  passport.authenticate("admin", { session: false }),
  async (req, res, next) => {
    try {
      data = await database("vehicles").where("id", req.params.id).del();
      res
        .status(200)
        .json({ success: true, message: "Success processing data", data });
    } catch (error) {
      res
        .status(401)
        .json({ success: false, message: "Cannot proceed that request" });
    }
  }
);

router.get(
  "/loanlist/:page",
  passport.authenticate("admin", { session: false }),
  async (req, res, next) => {
    let currentPage = req.params.page;
    let perPage = 2;
    try {
      let data = await database
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
        .innerJoin("users", "loan.id_user", "users.id")
        .limit(perPage)
        .offset((currentPage - 1) * perPage);
      let { count } = await database("loan").count("id").first();
      res.status(200).json({
        success: true,
        message: "Success processing data",
        data,
        perPage: parseInt(perPage),
        maxPage: Math.ceil(count / perPage),
      });
    } catch (error) {
      res
        .status(401)
        .json({ success: false, message: "Cannot proceed that request" });
    }
  }
);
router.get(
  "/loan/:id",
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
      res
        .status(200)
        .json({ success: true, message: "Success processing data", data });
    } catch (error) {
      res
        .status(401)
        .json({ success: false, message: "Cannot proceed that request" });
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
      res.status(200).json({ history });
    } catch (error) {
      res
        .status(401)
        .json({ success: false, message: "Cannot proceed that request" });
    }
  }
);

router.get(
  "/pickuplist/:page",
  passport.authenticate("admin", { session: false }),
  async (req, res, next) => {
    let currentPage = req.params.page;
    let perPage = 1;
    try {
      let data = await database
        .select(
          "pickup.id",
          "pickup.route",
          "pickup.start_at",
          "pickup.end_at",
          "pickup.ready",
          "vehicles.name"
        )
        .from("pickup")
        .innerJoin("vehicles", "pickup.id_vehicle", "vehicles.id")
        .limit(perPage)
        .offset((currentPage - 1) * perPage);
      let { count } = await database("pickup").count("id").first();
      res.status(200).json({
        success: true,
        message: "Success processing data",
        data,
        perPage: parseInt(perPage),
        maxPage: Math.ceil(count / perPage),
      });
    } catch (error) {
      res
        .status(401)
        .json({ success: false, message: "Cannot proceed that request" });
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

      res
        .status(200)
        .json({ success: true, message: "Success processing data", data });
    } catch (error) {
      res
        .status(401)
        .json({ success: false, message: "Cannot proceed that request" });
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
      res.status(200).json({
        pickup,
        history,
      });
    } catch (error) {
      res
        .status(401)
        .json({ success: false, message: "Cannot proceed that request" });
    }
  }
);

router.get(
  "/servicedetail/:id",
  passport.authenticate("admin", { session: false }),
  async (req, res, next) => {
    try {
      data = await database
        .select(
          "services.id",
          "services.type",
          "services.start_km",
          "services.end_km",
          "services.description",
          "services.start_at",
          "services.end_at",
          "vehicles.name"
        )
        .from("services")
        .innerJoin("vehicles", "services.id_vehicle", "vehicles.id")
        .innerJoin("users", "services.id_user", "users.id")
        .where("services.id", req.params.id);
      res
        .status(200)
        .json({ success: true, message: "Success processing data", data });
    } catch (error) {
      res
        .status(401)
        .json({ success: false, message: "Cannot proceed that request" });
    }
  }
);
router.get(
  "/servicehistory/:id",
  passport.authenticate("admin", { session: false }),
  async (req, res, next) => {
    try {
      history = await database
        .select(
          "services.type",
          "services.description",
          "services.id",
          "services.id_vehicle",
          "users.email",
          "services.start_at",
          "services.start_km",
          "services.end_km",
          "services.end_at",
          "vehicles.name"
        )
        .from("services")
        .leftJoin("vehicles", "services.id_vehicle", "vehicles.id")
        .leftJoin("users", "services.id_user", "users.id")
        .where("services.id", req.params.id)
        .first();
      res.status(200).json({ history });
    } catch (error) {
      res
        .status(401)
        .json({ success: false, message: "Cannot proceed that request" });
    }
  }
);

module.exports = router;
