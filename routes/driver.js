const router = require("express").Router();
const passport = require("passport");
const database = require("../config/database");
const upload = require("../config/upload");

router.get("/", (req, res) => {
  res.json({ info: "Node.js, Express, and Postgres API Backend driver" });
});

router.get(
  "/pickup/:page",
  passport.authenticate("driver", { session: false }),
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
        message: "Success",
        data,
        perPage: parseInt(perPage),
        maxPage: Math.ceil(count / perPage),
      });
    } catch (error) {
      res.status(400).json({ message: "Error", error });
    }
  }
);
router.get(
  "/pickuphistory/:id",
  passport.authenticate("driver", { session: false }),
  async (req, res, next) => {
    try {
      pickup = await database
        .select(
          "pickup.route",
          "pickup.description",
          "pickup.id",
          "pickup.start_at",
          "pickup.start_km",
          "pickup.end_km",
          "pickup.ready",
          "pickup.accidents",
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
router.get(
  "/pickup/:id",
  passport.authenticate("driver", { session: false }),
  async (req, res, next) => {
    try {
      data = await database
        .select(
          "pickup.id",
          "pickup.start_km",
          "pickup.end_km",
          "pickup.ready",
          "pickup.accidents",
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
router.put(
  "/pickup",
  passport.authenticate("driver", { session: false }),
  async (req, res, next) => {
    try {
      data = await database("pickup").where("id", req.body.id).update({
        ready: req.body.ready,
        accidents: req.body.accidents,
        description: req.body.description,
        start_km: req.body.start_km,
        end_km: req.body.end_km,
      });
      res.json({ message: "success", data });
    } catch (error) {
      res.json({ message: "error", error });
    }
  }
);
router.get(
  "/service/:page",
  passport.authenticate("driver", { session: false }),
  async (req, res, next) => {
    let currentPage = req.params.page;
    let perPage = 1;
    try {
      let data = await database
        .select(
          "services.id",
          "services.type",
          "services.start_at",
          "services.end_at",
          "vehicles.name"
        )
        .from("services")
        .leftJoin("vehicles", "services.id_vehicle", "vehicles.id")
        .limit(perPage)
        .offset((currentPage - 1) * perPage);
      let { count } = await database("services").count("id").first();
      res.status(200).json({
        message: "Success",
        data,
        perPage: parseInt(perPage),
        maxPage: Math.ceil(count / perPage),
      });
    } catch (error) {
      res.status(400).json({ message: "error", error });
    }
  }
);
router.post(
  "/service",
  passport.authenticate("driver", { session: false }),
  async (req, res, next) => {
    try {
      let { rows } = await database.raw(
        `select exists(select 1 from loan where start_at='${req.body.start_at}' and id_vehicle=${req.body.vehicle}) as exists limit 1`
      );
      let exists = await database.raw(
        `select exists(select 1 from services where start_at='${req.body.start_at}' and id_vehicle=${req.body.vehicle}) as exists limit 1`
      );
      if (!rows[0].exists && !exists.rows[0].exists) {
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
      }
      res.send(false);
    } catch (error) {
      res.json({ message: "error", error });
    }
  }
);

router.get(
  "/servicedetail/:id",
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
