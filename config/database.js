const environment = process.env.NODE_ENV || "development";
let configuration = require("../knexfile")[environment];
module.exports = require("knex")(configuration);
