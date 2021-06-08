// const Pool = require("pg").Pool;
require("dotenv").config();
// const pool = new Pool({
//   user: process.env.POSTGRES_USER,
//   host: process.env.POSTGRES_HOST,
//   database: process.env.POSTGRES_DB,
//   password: process.env.POSTGRES_PASSWORD,
//   port: process.env.POSTGRES_PORT,
// });

// const getUsers = (request, response) => {
//   pool.query("SELECT * FROM users ORDER BY id ASC", (error, results) => {
//     if (error) {
//       console.log(error);
//     }
//     response.status(200).json(results.rows);
//   });
// };
module.exports = {
  getUsers,
};
