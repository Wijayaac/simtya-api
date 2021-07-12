const router = require("express").Router();
const passport = require("passport");
const database = require("../config/database");
const upload = require("../config/upload");
const pdf = require("html-pdf");
const fs = require("fs");
const path = require("path");

// init the html builder
const inventoryHTML = require("../documents").inventoryHTML;
const pickupHTML = require("../documents").pickupHTML;
const serviceHTML = require("../documents").serviceHTML;
const loanHTML = require("../documents").loanHTML;
var options = { format: "Letter" };

var inventoryTemplate = fs.readFileSync(
  `${path.join(__dirname, "..", "documents", "inventory.html")}`,
  "utf-8"
);
var serviceTemplate = fs.readFileSync(
  `${path.join(__dirname, "..", "documents", "service.html")}`,
  "utf-8"
);
var loanTemplate = fs.readFileSync(
  `${path.join(__dirname, "..", "documents", "loan.html")}`,
  "utf-8"
);
var pickupTemplate = fs.readFileSync(
  `${path.join(__dirname, "..", "documents", "pickup.html")}`,
  "utf-8"
);

// testing create and send pdf into client
router.get("/inventory-pdf", async (req, res) => {
  inventoryHTML();
  try {
    await pdf
      .create(inventoryTemplate, options)
      .toFile("inventory.pdf", (err) => {
        if (err)
          res.json({ success: false, message: "Oops you hit an error", err });
        res.sendFile("inventory.pdf", { root: "." });
      });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error occured", error });
  }
});
// testing create and send pdf into client
router.get("/pickup-pdf", async (req, res) => {
  pickupHTML();
  try {
    await pdf.create(pickupTemplate, options).toFile("pickup.pdf", (err) => {
      if (err)
        res.json({ success: false, message: "Oops you hit an error", err });
      res.sendFile("pickup.pdf", { root: "." });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error occured", error });
  }
});
// testing create and send pdf into client
router.get("/loan-pdf", async (req, res) => {
  loanHTML();
  try {
    await pdf.create(loanTemplate, options).toFile("loan.pdf", (err) => {
      if (err)
        res.json({ success: false, message: "Oops you hit an error", err });
      res.sendFile("loan.pdf", { root: "." });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error occured", error });
  }
});
// testing create and send pdf into client
router.get("/service-pdf", async (req, res) => {
  serviceHTML();
  try {
    await pdf.create(serviceTemplate, options).toFile("service.pdf", (err) => {
      if (err)
        res.json({ success: false, message: "Oops you hit an error", err });
      res.sendFile("service.pdf", { root: "." });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error occured", error });
  }
});

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
      res.status(401).json({
        success: false,
        message: "Oops you hit an error, try again later ya....",
        error,
      });
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
      res.status(401).json({
        success: false,
        message: "Oops you hit an error, try again later ya....",
        error,
      });
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
      res.status(401).json({
        success: false,
        message: "Oops you hit an error, try again later ya....",
        error,
      });
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
      res.status(401).json({
        success: false,
        message: "Oops you hit an error, try again later ya....",
        error,
      });
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
      res.status(401).json({
        success: false,
        message: "Oops you hit an error, try again later ya....",
        error,
      });
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
      res.status(401).json({
        success: false,
        message: "Oops you hit an error, try again later ya....",
        error,
      });
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
      res.status(401).json({
        success: false,
        message: "Oops you hit an error, try again later ya....",
        error,
      });
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
      res.status(401).json({
        success: false,
        message: "Oops you hit an error, try again later ya....",
        error,
      });
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
      res.status(401).json({
        success: false,
        message: "Oops you hit an error, try again later ya....",
        error,
      });
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
      res.status(401).json({
        success: false,
        message: "Oops you hit an error, try again later ya....",
        error,
      });
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
    res.status(401).json({
      success: false,
      message: "Oops you hit an error, try again later ya....",
      error,
    });
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
      res.status(401).json({
        success: false,
        message: "Oops you hit an error, try again later ya....",
        error,
      });
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
      res.status(401).json({
        success: false,
        message: "Oops you hit an error, try again later ya....",
        error,
      });
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
      res.status(401).json({
        success: false,
        message: "Oops you hit an error, try again later ya....",
        error,
      });
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
      res.status(401).json({
        success: false,
        message: "Oops you hit an error, try again later ya....",
        error,
      });
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
      res.status(401).json({
        success: false,
        message: "Oops you hit an error, try again later ya....",
        error,
      });
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
      res.status(401).json({
        success: false,
        message: "Oops you hit an error, try again later ya....",
        error,
      });
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
      res.status(401).json({
        success: false,
        message: "Oops you hit an error, try again later ya....",
        error,
      });
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
      res.status(401).json({
        success: false,
        message: "Oops you hit an error, try again later ya....",
        error,
      });
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
      res.status(401).json({
        success: false,
        message: "Oops you hit an error, try again later ya....",
        error,
      });
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
      res.status(401).json({
        success: false,
        message: "Oops you hit an error, try again later ya....",
        error,
      });
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
      res.status(401).json({
        success: false,
        message: "Oops you hit an error, try again later ya....",
        error,
      });
    }
  }
);

module.exports = router;
