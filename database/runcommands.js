// test-db.js
const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  user: process.env.DB_USER ,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: String(process.env.DB_PASSWORD), // Forces string type
  port: Number(process.env.DB_PORT),
});

async function testConnection() {
  try {
    await client.connect();
    console.log('db connected successfull');
  } catch (err) {
    console.error('db connection failed:', err.message);
  } finally {
    await client.end();
  }
}

testConnection();