const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "salonbook",
  user: process.env.DB_USER || "salonbook",
  password: process.env.DB_PASSWORD || "salonbook_password",
});

module.exports = pool;