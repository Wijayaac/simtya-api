const router = require("express").Router();
const passport = require("passport");
const database = require("../config/database");
const TelegramBot = require("node-telegram-bot-api");
const moment = require("moment");
require("dotenv").config();

const token = process.env.TELEGRAM_TOKEN;
const chatId = process.env.TELEGRAM_GROUP;
const bot = new TelegramBot(token, { polling: false });

router.get(
  "/pickup/:page",
  passport.authenticate("driver", { session: false }),
  async (req, res) => {
    let currentPage = req.params.page;
    let perPage = 10;
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
        .offset((currentPage - 1) * perPage)
        .orderBy("id", "desc");
      let { count } = await database("pickup").count("id").first();
      res.status(200).json({
        success: true,
        message: "Success processing that data",
        data,
        perPage: parseInt(perPage),
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
  "/pickuphistory/:id",
  passport.authenticate("driver", { session: false }),
  async (req, res) => {
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
      res.status(200).json({
        success: true,
        message: "Success processing that data",
        pickup,
        history,
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
  "/pickup/:id",
  passport.authenticate("driver", { session: false }),
  async (req, res) => {
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
router.put(
  "/pickup",
  passport.authenticate("driver", { session: false }),
  async (req, res) => {
    try {
      data = await database("pickup").where("id", req.body.id).update({
        ready: req.body.ready,
        accidents: req.body.accidents,
        description: req.body.description,
        start_km: req.body.start_km,
        end_km: req.body.end_km,
      });
      if (req.body.accidents)
        bot.sendMessage(
          chatId,
          `Pickup schedule with route :${req.body.route} having an accident with detail : ${req.body.description}, pick up schedule will be late `
        );
      if (req.body.ready)
        bot.sendMessage(
          chatId,
          `Pickup schedule with route :${req.body.route} Ready`
        );
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
  "/service/:page",
  passport.authenticate("driver", { session: false }),
  async (req, res) => {
    let currentPage = req.params.page;
    let perPage = 10;
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
        .offset((currentPage - 1) * perPage)
        .orderBy("id", "desc");
      let { count } = await database("services").count("id").first();
      res.status(200).json({
        success: true,
        message: "Success processing that data",
        data,
        perPage: parseInt(perPage),
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
router.post(
  "/service",
  passport.authenticate("driver", { session: false }),
  async (req, res) => {
    const idVehicle = req.body.vehicle;
    const startService = moment(req.body.start_at).format("YYYY-MM-DD");
    const endService = moment(req.body.end_at).format("YYYY-MM-DD");
    try {
      let { rows } = await database.raw(
        `select exists(select 1 from loan where start_at='${startService}' and id_vehicle=${idVehicle}) as exists limit 1`
      );
      let exists = await database.raw(
        `select exists(select 1 from services where start_at='${startService}' and id_vehicle=${idVehicle}) as exists limit 1`
      );
      if (!rows[0].exists && !exists.rows[0].exists) {
        let service = await database("services").insert(
          {
            id_vehicle: idVehicle,
            start_at: startService,
            end_at: endService,
            type: req.body.type,
            id_user: 2,
          },
          "id"
        );
        await database("service_details").insert({
          id_service: service[0],
        });
        await database("vehicles").where("id", idVehicle).update({
          ready: false,
        });
        await database("loan")
          .where("id_vehicle", idVehicle)
          .whereBetween("start_at", [startService, endService])
          .update({
            ready: false,
          });
        let data = `${idVehicle} Scheduled for service`;
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

router.get(
  "/service-detail/:id",
  passport.authenticate("driver", { session: false }),
  async (req, res) => {
    try {
      data = await database
        .select(
          "service_details.service_fee",
          "service_details.service_part",
          "services.id",
          "services.type",
          "services.description",
          "services.start_km",
          "services.end_km",
          "services.start_at",
          "services.end_at",
          "services.id_vehicle",
          "vehicles.now_km"
        )
        .from("services")
        .leftJoin(
          "service_details",
          "services.id",
          "service_details.id_service"
        )
        .leftJoin("vehicles", "services.id_vehicle", "vehicles.id")
        .where("services.id", req.params.id);
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
  "/service/:id",
  passport.authenticate("driver", { session: false }),
  async (req, res) => {
    try {
      data = await database("services").where("id", req.params.id).del();
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

router.put(
  "/service",
  passport.authenticate("driver", { session: false }),
  async (req, res) => {
    const idVehicle = req.body.vehicle;
    const serviceId = req.body.id;
    const description = req.body.description;
    const endService = moment(req.body.end_at).format("YYYY-MM-DD");
    const endOfMonth = moment().endOf("month").format("YYYY-MM-DD");
    try {
      await database("services").where("id", serviceId).update({
        id_vehicle: idVehicle,
        start_km: req.body.start_km,
        end_km: req.body.end_km,
        start_at: req.body.start_at,
        end_at: endService,
        type: req.body.type,
        description: description,
        finish: req.body.finish,
      });
      if (req.body.finish) {
        await database("service_details")
          .where("id_service", serviceId)
          .update({
            service_fee: req.body.fee,
            service_part: req.body.part,
            description: description,
          });
        await database("vehicles").where("id", idVehicle).update({
          ready: true,
        });
        await database("loan")
          .where("id_vehicle", idVehicle)
          .whereBetween("start_at", [endService, endOfMonth])
          .update({
            ready: true,
          });
      }
      let data = `${idVehicle} Updated`;
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

module.exports = router;
