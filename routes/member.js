const router = require("express").Router();
const passport = require("passport");
const database = require("../config/database");
const upload = require("../config/upload");

router.get("/", (req, res) => {
  res.json({ info: "Node.js, Express, and Postgres API Backend Member" });
});

router.get("/event/", async (req, res, next) => {
  try {
    loan = await database
      .select("loan.start_at", "vehicles.name")
      .from("loan")
      .innerJoin("vehicles", "loan.id_vehicle", "vehicles.id")
      .orderBy("loan.start_at", "asc");
    service = await database
      .select("services.start_at", "vehicles.name")
      .from("services")
      .innerJoin("vehicles", "services.id_vehicle", "vehicles.id")
      .orderBy("services.start_at", "asc");
    res.json({ message: "Success", loan, service });
  } catch (error) {
    res.json({ message: "error", error });
  }
});
router.get(
  "/loanlist/:id/:page",
  passport.authenticate("member", { session: false }),
  async (req, res) => {
    const currentPage = req.params.page || 1;
    const perPage = 2;
    try {
      const list = await database
        .select(
          "loan.id",
          "loan.purpose",
          "loan.start_at",
          "loan.end_at",
          "vehicles.name"
        )
        .from("loan")
        .innerJoin("vehicles", "loan.id_vehicle", "vehicles.id")
        .where("loan.id_user", req.params.id)
        .limit(perPage)
        .offset((currentPage - 1) * perPage);
      let { count } = await database("loan")
        .count("id")
        .where("id_user", req.params.id)
        .first();
      res.status(200).json({
        message: "Fetched loanlist",
        list,
        currentPage: parseInt(currentPage),
        maxPage: Math.ceil(count / perPage),
      });
    } catch (error) {
      res.json({ message: "Error", error });
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
  "/pickup/:page",
  passport.authenticate("member", { session: false }),
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
          "pickup.slot",
          "vehicles.name"
        )
        .from("pickup")
        .innerJoin("vehicles", "pickup.id_vehicle", "vehicles.id")
        .where("pickup.ready", true)
        .limit(perPage)
        .offset((currentPage - 1) * perPage);
      let { count } = await database("pickup")
        .count("id")
        .where("ready", true)
        .first();
      res.status(200).json({
        message: "Fetched Pickup list",
        data,
        currentPage: parseInt(currentPage),
        maxPage: Math.ceil(count / perPage),
      });
    } catch (error) {
      res.json({ message: "Error", error });
    }
  }
);
router.get(
  "/profile/:id",
  passport.authenticate("member", { session: false }),
  async (req, res, next) => {
    try {
      data = await database
        .select("id", "name", "email", "username", "photo", "description")
        .from("users")
        .where("id", req.params.id)
        .first();
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
      let { rows } = await database.raw(
        `select exists(select 1 from loan where start_at='${req.body.start_at}' and id_vehicle=${req.body.vehicle}) as exists limit 1`
      );
      let exists = await database.raw(
        `select exists(select 1 from services where start_at='${req.body.start_at}' and id_vehicle=${req.body.vehicle}) as exists limit 1`
      );
      if (!rows[0].exists && !exists.rows[0].exists) {
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
      }
      res.send(false);
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

router.post(
  "/pickup",
  passport.authenticate("member", { session: false }),
  async (req, res, next) => {
    try {
      let slot = await database("pickup")
        .where("id", req.body.pickup)
        .decrement("slot", 1);
      data = await database("pickup_details").insert({
        id_user: req.body.user,
        id_pickup: req.body.pickup,
        description: req.body.description,
        active: req.body.active,
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
        email: req.body.email,
        username: req.body.email,
        photo: insertFilename,
        description: req.body.description,
      });
      res.json({ message: "success", data });
    } catch (error) {
      res.json({ message: "error", error });
    }
  }
);
router.get(
  "/joinpickup/:sub",
  passport.authenticate("member", { session: false }),
  async (req, res, next) => {
    try {
      data = await database
        .select("active", "created_at")
        .from("pickup_details")
        .where("id_user", req.params.sub)
        .orderBy("id", "desc")
        .first();
      res.send(data);
    } catch (error) {
      res.send(error);
    }
  }
);

router.get("/exists/:date", async (req, res) => {
  try {
    let exists = await database.raw(
      `select exists(select 1 from services where start_at='${req.params.date}') as exists limit 1`
    );
    res.send(exists.rows[0].exists);
  } catch (error) {
    res.send(error);
  }
});

module.exports = router;
