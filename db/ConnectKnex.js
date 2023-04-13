require("dotenv").config();

const knex = require("knex")({
  client: "pg",
  connection: {
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
  },
  pool: {
    min: 2,
    max: 10,
  },
});

module.exports = { knex };
