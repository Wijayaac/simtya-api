const router = require("express").Router();
const passport = require("passport");
const database = require("../config/database");
const upload = require("../config/upload");
const pdf = require("html-pdf");
const fs = require("fs");
const path = require("path");
const moment = require("moment");

// init the html builder
const inventoryHTML = require("../documents").inventoryHTML;
const pickupHTML = require("../documents").pickupHTML;
const serviceHTML = require("../documents").serviceHTML;
const loanHTML = require("../documents").loanHTML;
var options = { format: "Letter" };

// testing create and send inventory pdf into client
router.get("/inventory-pdf/:month", async (req, res) => {
  const month = req.params.month;
  const inventoryTemplate = await fs.readFileSync(
    `${path.join(__dirname, "..", "documents", "inventory.html")}`,
    "utf-8"
  );
  const { rows } = await database.raw(
    `SELECT vehicles.name,vehicles.now_km,vehicles.km, COUNT(services.id)::int AS service, COUNT(loan.id)::int AS loan, COUNT(pickup.id)::int AS pickup FROM vehicles LEFT JOIN services ON services.id_vehicle = vehicles.id LEFT JOIN loan ON loan.id_vehicle = vehicles.id LEFT JOIN pickup ON pickup.id_vehicle = vehicles.id WHERE vehicles.created_at::text like '%${month}%' GROUP BY vehicles.id;`
  );
  const inventory = await rows.map((item) => {
    return `<tr class="item">
              <td>${item.name}</td>
              <td>${item.service}</td>
              <td>${item.loan + item.pickup}</td>
              <td>${item.now_km - item.km} KM</td>
            </tr>`;
  });
  await inventoryHTML(inventory);
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
router.get("/pickup-pdf/:month", async (req, res) => {
  let pickupTemplate = await fs.readFileSync(
    `${path.join(__dirname, "..", "documents", "pickup.html")}`,
    "utf-8"
  );
  let month = req.params.month;

  let { rows } = await database.raw(
    `SELECT vehicles.name,pickup.start_at, pickup.route, pickup.description,pickup.start_km, pickup.end_km FROM pickup LEFT JOIN vehicles ON vehicles.id = pickup.id_vehicle WHERE pickup.created_at::text LIKE '%${month}%' `
  );
  let pickup = await rows.map((item) => {
    return `<tr class="item">
            <td>${item.name}</td>
            <td>${item.route}</td>
            <td>${moment(item.start_at).format("D/MMM, HH:mm")}</td>
            <td>${item.end_km - item.start_km} KM</td>
            <td>${item.description}</td>
          </tr>`;
  });
  await pickupHTML(pickup);
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
router.get("/loan-pdf/:month", async (req, res) => {
  const loanTemplate = await fs.readFileSync(
    `${path.join(__dirname, "..", "documents", "loan.html")}`,
    "utf-8"
  );
  const month = req.params.month;
  const { rows } = await database.raw(
    `SELECT vehicles.name, loan.description AS problem, loan.start_at AS date, users.name AS borrower FROM loan LEFT JOIN vehicles ON vehicles.id = loan.id_vehicle LEFT JOIN users ON users.id = loan.id_user WHERE loan.start_at::text LIKE '%${month}%'`
  );
  let loan = await rows.map((item) => {
    return `<tr class="item">
              <td>${item.name}</td>
              <td>${moment(item.date).format("D-MMM-YY")}</td>
              <td>${!item.problem ? "nothing" : item.problem}</td>
              <td>${item.borrower}</td>
            </tr>`;
  });
  await loanHTML(loan);
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
router.get("/service-pdf/:month", async (req, res) => {
  let serviceTemplate = await fs.readFileSync(
    `${path.join(__dirname, "..", "documents", "service.html")}`,
    "utf-8"
  );
  let month = req.params.month;
  let { rows } = await database.raw(
    `SELECT vehicles.name, service_details.service_part AS part,service_details.service_fee AS cost, services.start_at AS date, services.type FROM services  LEFT JOIN service_details ON service_details.id_service = services.id LEFT JOIN vehicles ON services.id_vehicle = vehicles.id WHERE services.start_at::text LIKE '%${month}%' `
  );
  let service = await rows.map((item) => {
    return `<tr class="item">
              <td>${item.name}</td>
              <td>${item.type}</td>
              <td>${moment(item.date).format("D-MM-YY")}</td>
              <td>${item.part}</td>
              <td>${item.cost}</td>
            </tr>`;
  });
  await serviceHTML(service);
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

router.get("/chart/inventory", async (req, res) => {
  try {
    const { rows } = await database.raw(
      "SELECT COUNT(id),type from vehicles GROUP BY type"
    );
    data = {
      rows,
    };
    res.status(200).json({
      success: true,
      message: "Success getting that data",
      data,
    });
  } catch (error) {
    data = {
      error,
    };
    res.status(500).json({
      success: false,
      message: "Oops you hit an error, try again later ya....",
      data,
    });
  }
});
router.get("/chart/pickup", async (req, res) => {
  try {
    const { rows } = await database.raw(
      "SELECT COUNT(pickup.id_vehicle), vehicles.name FROM pickup LEFT JOIN vehicles ON vehicles.id = pickup.id_vehicle WHERE pickup.ready = true GROUP BY vehicles.name  "
    );
    data = {
      rows,
    };
    res.status(200).json({
      success: true,
      message: "Success getting that data",
      data,
    });
  } catch (error) {
    data = {
      error,
    };
    res.status(500).json({
      success: false,
      message: "Oops you hit an error, try again later ya....",
      data,
    });
  }
});

router.get("/chart/loan", async (req, res) => {
  let data;
  try {
    const { rows } = await database.raw(
      "SELECT COUNT(loan.id_vehicle), vehicles.name FROM loan LEFT JOIN vehicles ON vehicles.id = loan.id_vehicle GROUP BY vehicles.name"
    );
    data = {
      rows,
    };
    res.status(200).json({
      success: true,
      message: "Success getting that data",
      data,
    });
  } catch (error) {
    data = {
      error,
    };
    res.status(500).json({
      success: false,
      message: "Oops you hit an error, try again later ya....",
      data,
    });
  }
});

router.get("/chart/service", async (req, res) => {
  let data;
  try {
    const { rows } = await database.raw(
      "SELECT vehicles.name, SUM(service_details.service_fee) AS total FROM services LEFT JOIN service_details ON service_details.id_service = services.id LEFT JOIN vehicles ON vehicles.id = services.id_vehicle GROUP BY vehicles.name"
    );
    data = {
      rows,
    };
    res.status(200).json({
      success: true,
      message: "Success getting that data",
      data,
    });
  } catch (error) {
    data = {
      error,
    };
    res.status(500).json({
      success: false,
      message: "Oops you hit an error, try again later ya....",
      data,
    });
  }
});

router.get(
  "/",
  // passport.authenticate("admin", { session: false }),
  async (req, res) => {
    let data;
    try {
      let inventory = await database
        .select("type", "name", "km", "now_km")
        .from("vehicles");
      data = {
        inventory,
      };
      res.status(200).json({
        success: true,
        message: "Success getting that data",
        data,
      });
    } catch (error) {
      data = {
        error,
      };
      res.status(500).json({
        success: false,
        message: "Oops you hit an error, try again later ya....",
        data,
      });
    }
  }
);

router.get(
  "/pickup/:id",
  passport.authenticate("admin", { session: false }),
  async (req, res) => {
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
      res.status(500).json({
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
  async (req, res) => {
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
      res.status(500).json({
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
  async (req, res) => {
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
      res.status(500).json({
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
  async (req, res) => {
    try {
      data = await database("pickup").where("id", req.params.id).del();
      res
        .status(200)
        .json({ success: true, message: "Success processing data", data });
    } catch (error) {
      res.status(500).json({
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
  async (req, res) => {
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
      res.status(500).json({
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
  async (req, res) => {
    let currentPage = req.params.page;
    let perPage = 10;
    try {
      let data = await database
        .select(
          "services.id",
          "services.description",
          "services.type",
          "services.start_at",
          "services.end_at",
          "vehicles.name",
          "vehicles.plate"
        )
        .from("services")
        .innerJoin("vehicles", "services.id_vehicle", "vehicles.id")
        .limit(perPage)
        .offset((currentPage - 1) * perPage)
        .orderBy("vehicles.id", "desc");
      let { count } = await database("services").count("id").first();
      res.status(200).json({
        success: true,
        message: "Success processing data",
        data,
        perPage: parseInt(perPage),
        maxPage: Math.ceil(count / perPage),
      });
    } catch (error) {
      res.status(500).json({
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
  async (req, res) => {
    try {
      data = await database
        .select("id", "name", "photo", "years", "brand", "type", "description")
        .from("vehicles");
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({
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
  async (req, res) => {
    try {
      data = await database
        .select(
          "id",
          "name",
          "photo",
          "years",
          "plate",
          "brand",
          "type",
          "now_km",
          "km",
          "description",
          "created_at",
          "updated_at"
        )
        .from("vehicles")
        .where("id", req.params.id);
      res
        .status(200)
        .json({ success: true, message: "Success processing data", data });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Oops you hit an error, try again later ya....",
        error,
      });
    }
  }
);
router.get("/vehicle/:type", async (req, res) => {
  try {
    const data = await database
      .select("id", "name", "type", "plate")
      .from("vehicles")
      .where("type", req.params.type);
    res
      .status(200)
      .json({ success: true, message: "Success processing data", data });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Oops you hit an error, try again later ya....",
      error,
    });
  }
});
router.get("/vehicle-ready/:type", async (req, res) => {
  try {
    const data = await database
      .select("id", "name", "type", "plate")
      .from("vehicles")
      .where("type", req.params.type)
      .where("ready", true);
    res
      .status(200)
      .json({ success: true, message: "Success processing data", data });
  } catch (error) {
    res.status(500).json({
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
  async (req, res) => {
    try {
      const { filename } = req.file;
      data = await database("vehicles").insert(
        {
          name: req.body.name,
          type: req.body.type,
          plate: req.body.plate,
          brand: req.body.brand,
          km: req.body.km,
          now_km: req.body.now,
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
      res.status(500).json({
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
  async (req, res) => {
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
        plate: req.body.plate,
        brand: req.body.brand,
        km: req.body.km,
        now_km: req.body.now,
        years: req.body.years,
        photo: insertFilename,
        description: req.body.description,
      });
      res
        .status(200)
        .json({ success: true, message: "Success processing data", data });
    } catch (error) {
      res.status(500).json({
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
  async (req, res) => {
    try {
      data = await database("vehicles").where("id", req.params.id).del();
      res
        .status(200)
        .json({ success: true, message: "Success processing data", data });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Oops you hit an error, try again later ya....",
        error,
      });
    }
  }
);

router.get(
  "/loan-list/:page",
  passport.authenticate("admin", { session: false }),
  async (req, res) => {
    let currentPage = req.params.page;
    let perPage = 10;
    try {
      let data = await database
        .select(
          "loan.id",
          "loan.accidents",
          "loan.finish",
          "loan.purpose",
          "users.email",
          "users.username",
          "loan.start_at",
          "loan.end_at",
          "vehicles.name",
          "vehicles.plate",
          "loan.id_vehicle"
        )
        .from("loan")
        .leftJoin("vehicles", "loan.id_vehicle", "vehicles.id")
        .leftJoin("users", "loan.id_user", "users.id")
        .limit(perPage)
        .offset((currentPage - 1) * perPage)
        .orderBy("vehicles.id", "desc");
      let { count } = await database("loan").count("id").first();
      res.status(200).json({
        success: true,
        message: "Success processing data",
        data,
        perPage: parseInt(perPage),
        maxPage: Math.ceil(count / perPage),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Oops you hit an error, try again later ya....",
        error,
      });
    }
  }
);

router.put("/loan/confirm/:id", async (req, res) => {
  const start = moment().format("YYYY-MM-DD");
  const finish = req.body.finish;
  try {
    if (finish) {
      await database("loan").where("id", req.params.id).update({
        finish: req.body.finish,
      });
    } else {
      await database("loan").where("id", req.params.id).update({
        finish: !req.body.finish,
        description: req.body.description,
      });
      let service = await database("services").insert(
        {
          id_vehicle: req.body.vehicle,
          start_at: start,
          end_at: start,
          type: "Check Service",
          id_user: 1,
        },
        "id"
      );
      await database("service_details").insert({
        id_service: service[0],
      });
      await database("vehicles").where("id", req.body.vehicle).update({
        ready: false,
      });
    }
    res
      .status(200)
      .json({ success: true, message: "Thanks for the confirmation" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Oops you hit an error, try again later ya....",
      error,
    });
  }
});

router.get(
  "/loan/:id",
  passport.authenticate("admin", { session: false }),
  async (req, res) => {
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
        .leftJoin("vehicles", "loan.id_vehicle", "vehicles.id")
        .leftJoin("users", "loan.id_user", "users.id")
        .where("loan.id", req.params.id);
      res
        .status(200)
        .json({ success: true, message: "Success processing data", data });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Oops you hit an error, try again later ya....",
        error,
      });
    }
  }
);
router.get(
  "/loan-history/:id",
  passport.authenticate("admin", { session: false }),
  async (req, res) => {
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
      res.status(500).json({
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
        message: "Success processing data",
        data,
        perPage: parseInt(perPage),
        maxPage: Math.ceil(count / perPage),
      });
    } catch (error) {
      res.status(500).json({
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
  async (req, res) => {
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
        .leftJoin("vehicles", "pickup.id_vehicle", "vehicles.id")
        .where("pickup.id", req.params.id);

      res
        .status(200)
        .json({ success: true, message: "Success processing data", data });
    } catch (error) {
      res.status(500).json({
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
  async (req, res) => {
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
        .leftJoin("vehicles", "pickup.id_vehicle", "vehicles.id")
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
      res.status(500).json({
        success: false,
        message: "Oops you hit an error, try again later ya....",
        error,
      });
    }
  }
);

router.get(
  "/service-detail/:id",
  passport.authenticate("admin", { session: false }),
  async (req, res) => {
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
        .leftJoin("vehicles", "services.id_vehicle", "vehicles.id")
        .leftJoin("users", "services.id_user", "users.id")
        .where("services.id", req.params.id);
      res
        .status(200)
        .json({ success: true, message: "Success processing data", data });
    } catch (error) {
      res.status(500).json({
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
  async (req, res) => {
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
      res.status(500).json({
        success: false,
        message: "Oops you hit an error, try again later ya....",
        error,
      });
    }
  }
);

module.exports = router;
