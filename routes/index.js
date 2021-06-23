const router = require("express").Router();

// route list for API
router.use("/member", require("./member"));
router.use("/driver", require("./driver"));
router.use("/admin", require("./admin"));
router.use("/auth", require("./auth"));

module.exports = router;
