const router = require("express").Router();
const passport = require("passport");
const database = require("../config/database");
const upload = require("../config/upload");
const moment = require("moment");
const TelegramBot = require("node-telegram-bot-api");

const token = process.env.TELEGRAM_TOKEN;
const adminId = process.env.TELEGRAM_ADMIN;
const bot = new TelegramBot(token, { polling: false });

router.get("/chart/loan/:user", async (req, res) => {
  let data;
  let userId = req.params.user;
  try {
    const { rows } = await database.raw(
      `SELECT COUNT(loan.id_vehicle), vehicles.name FROM loan LEFT JOIN vehicles ON vehicles.id = loan.id_vehicle WHERE loan.id_user = ${userId} GROUP BY vehicles.name`
    );
    data = rows;
    res.status(200).json({
      success: true,
      message: " Success getting that data",
      data,
    });
  } catch (error) {
    data = error;
    res.status(500).json({
      success: false,
      message: "Oops you hit an error, try again later ya....",
      data,
    });
  }
});
router.get("/chart/pickup/:user", async (req, res) => {
  let data;
  const userId = req.params.user;
  try {
    const { rows } = await database.raw(
      `select count(pickup.id_vehicle)as times, vehicles.name from pickup left join pickup_details on pickup_details.id_pickup = pickup.id left join vehicles on vehicles.id = pickup.id_vehicle where pickup_details.id_user = ${userId} group by vehicles.name;`
    );
    data = rows;
    res.status(200).json({
      success: true,
      message: "Success getting that data",
      data,
    });
  } catch (error) {
    data = error;
  }
  res.status(500).json({
    success: false,
    message: "Oops you hit an error, try again later ya....",
    data,
  });
});

router.get("/event", async (req, res) => {
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
    res.status(200).json({
      success: true,
      message: "Success processing that data",
      loan,
      service,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Oops you hit an error, try again later ya...",
      error,
    });
  }
});
router.get(
  "/loanlist/:id/:page",
  passport.authenticate("member", { session: false }),
  async (req, res) => {
    const currentPage = req.params.page || 1;
    let perPage = 10;
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
        .offset((currentPage - 1) * perPage)
        .orderBy("id", "desc");
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
      res.status(500).json({
        success: false,
        message: "Oops you hit an error, try again later ya...",
        error,
      });
    }
  }
);

router.get(
  "/loan/:id",
  passport.authenticate("member", { session: false }),
  async (req, res) => {
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
      res.status(200).json({
        success: true,
        message: "success processing that data",
        data,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Oops you hit an error, try again later ya...",
        error,
      });
    }
  }
);

router.get(
  "/pickup/:page",
  passport.authenticate("member", { session: false }),
  async (req, res) => {
    let today = moment(moment()).format("YYYY-MM-DD");
    let currentPage = req.params.page;
    let perPage = 10;
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
        .whereRaw(`pickup.start_at::text LIKE '%${today}%'`)
        .limit(perPage)
        .offset((currentPage - 1) * perPage)
        .orderBy("id", "desc");
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
      res.status(500).json({
        success: false,
        message: "Oops you hit an error, try again later ya...",
        error,
      });
    }
  }
);
router.get(
  "/profile/:id",
  passport.authenticate("member", { session: false }),
  async (req, res) => {
    try {
      data = await database
        .select("id", "name", "email", "username", "photo", "description")
        .from("users")
        .where("id", req.params.id)
        .first();
      res.status(200).json({
        success: true,
        message: "success processing that data",
        data,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Oops you hit an error, try again later ya...",
        error,
      });
    }
  }
);
router.post(
  "/loan",
  passport.authenticate("member", { session: false }),
  async (req, res) => {
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
        res.status(200).json({
          success: true,
          message: "success processing that data",
          data,
        });
      }
      res.send(false);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Oops you hit an error, try again later ya...",
        error,
      });
    }
  }
);

router.get("/testing-km", async (req, res) => {
  try {
    let data = await database
      .select("vehicles.km", "loan.end_km")
      .from("loan")
      .leftJoin("vehicles", "vehicles.id", "loan.id_vehicle")
      .where("loan.id", "=", 17);

    const start = data[0].km;
    const end = data[0].end_km;
    let serviceRoutine = (end - start) % 2000 <= 50;
    if (serviceRoutine) res.status(200).json({ serviceRoutine });

    res.status(203).json({ message: "Thank for loan" });
  } catch (error) {
    res.status(404).json(error);
  }
});
router.put(
  "/loan",
  passport.authenticate("member", { session: false }),
  async (req, res) => {
    const start = moment().format("YYYY-MM-DD");
    const idService = req.body.id;
    let serviceRoutine = false;
    const description = req.body.description;
    const accident = req.body.accidents;
    try {
      let data = await database("loan").where("id", idService).update({
        purpose: req.body.purpose,
        accidents: accident,
        start_km: req.body.start_km,
        end_km: req.body.end_km,
        description: description,
      });
      let countKm = await database
        .select("vehicles.km", "loan.end_km")
        .from("loan")
        .leftJoin("vehicles", "vehicles.id", "loan.id_vehicle")
        .where("loan.id", "=", idService);

      if (countKm) {
        const startKm = countKm[0].km;
        const endKm = countKm[0].end_km;
        serviceRoutine = (endKm - startKm) % 2000 <= 70;
      } else {
        serviceRoutine = false;
      }

      if (accident) {
        await database("vehicles").where("id", req.body.vehicle).update({
          ready: false,
        });
        bot.sendMessage(
          adminId,
          `Loan motorcycle with purpose :${req.body.purpose} having an accident with detail : ${description}`
        );
      }
      if (req.body.finish)
        bot.sendMessage(
          adminId,
          `Loan motorcycle with purpose :${req.body.purpose} finish loan please confirm`
        );
      if (serviceRoutine || accident)
        await database("services").insert({
          id_vehicle: req.body.vehicle,
          start_at: start,
          end_at: start,
          type: `${serviceRoutine ? "Service Routine," : ""}  ${
            accident ? "Incident Service" : ""
          }`,
          id_user: 2,
          description: description,
        });
      res.status(200).json({
        success: true,
        message: "Success processing that data",
        data,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Oops you hit an error, try again later ya...",
        error,
      });
    }
  }
);

router.delete(
  "/loan/:id",
  passport.authenticate("member", { session: false }),
  async (req, res) => {
    try {
      data = await database("loan").where("id", req.params.id).del();
      res.status(200).json({
        success: true,
        message: "Success processing that data",
        data,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Oops you hit an error, try again later ya...",
        error,
      });
    }
  }
);

router.post(
  "/pickup",
  passport.authenticate("member", { session: false }),
  async (req, res) => {
    try {
      await database("pickup")
        .where("id", req.body.pickup)
        .decrement("slot", 1);
      data = await database("pickup_details").insert({
        id_user: req.body.user,
        id_pickup: req.body.pickup,
        description: req.body.description,
        active: req.body.active,
      });
      res.status(200).json({
        success: true,
        message: "success processing that data",
        data,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Oops you hit an error, try again later ya...",
        error,
      });
    }
  }
);
router.put(
  "/profile",
  passport.authenticate("member", { session: false }),
  upload.single("photo"),
  async (req, res) => {
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
      res.status(200).json({
        success: true,
        message: "success processing that data",
        data,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Oops you hit an error, try again later ya...",
        error,
      });
    }
  }
);
router.get(
  "/joinpickup/:sub",
  passport.authenticate("member", { session: false }),
  async (req, res) => {
    try {
      data = await database
        .select("active", "created_at")
        .from("pickup_details")
        .where("id_user", req.params.sub)
        .orderBy("id", "desc")
        .first();
      res
        .status(200)
        .json({ success: true, message: "Success processing that data", data });
    } catch (error) {
      res.status().json({
        success: false,
        message: "Oops you hit an error, try again later ya...",
        error,
      });
    }
  }
);

router.get("/exists/:date", async (req, res) => {
  try {
    let exists = await database.raw(
      `select exists(select 1 from services where start_at='${req.params.date}') as exists limit 1`
    );
    res.status(200).send(exists.rows[0].exists);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
