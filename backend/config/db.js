
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432, // Default Postgres port
  max: 10,                           // Equivalent to connectionLimit
  idleTimeoutMillis: 30000,          // Close idle clients after 30s
  connectionTimeoutMillis: 2000,     // Timeout if queue takes >2s to get a connection
});

module.exports = pool;