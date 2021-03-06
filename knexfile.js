// Update with your config settings.
require("dotenv").config();

module.exports = {
  development: {
    client: "postgresql",
    connection: process.env.POSTGRES_URL,
    migrations: {
      directory: "./db/migrations",
    },
    seeds: {
      directory: "./db/seeds/dev",
    },
    useNullAsDefault: true,
    pool: { min: 0, max: 5 },
  },
  production: {
    client: "postgresql",
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: "./db/migrations",
    },
    seeds: {
      directory: "./db/seeds/production",
    },
    useNullAsDefault: true,
    pool: { min: 0, max: 5 },
  },
};
