const crypto = require("crypto");
const db = require("../config/db");

function generateUserId() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  let randomPart = "";

  for (let i = 0; i < 8; i++) {
    const randomIndex = crypto.randomInt(
      0,
      characters.length
    );

    randomPart += characters[randomIndex];
  }

  return `USR-${randomPart}`;
}

 async function  generateUniqueUserId() {
  while (true) {
    const userId = generateUserId();

    const [rows] = await db.query(
      "SELECT id FROM users WHERE public_id = ?",
      [userId]
    );

    if (rows.length === 0) {
      return userId;
    }
  }
}
module.exports = { generateUniqueUserId };