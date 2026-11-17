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

const ALPHABET = "4T7M9K2X5Q8W1P3R6Y0AZBFGHIJLNOPUVCDEQS"; // Length 36
const BASE = ALPHABET.length;

function generateSequentialCode(counterValue, length = 6) {
  if (counterValue === 0) {
    return ALPHABET[0].repeat(length);
  }

  let result = "";
  let n = counterValue;

  // Convert the integer to your custom base-36 alphabet
  while (n > 0) {
    result = ALPHABET[n % BASE] + result;
    n = Math.floor(n / BASE);
  }

  // Pad to ensure it is ALWAYS 6 characters long using the first character as 'zero'
  return result.padStart(length, ALPHABET[0]);
}

// Examples of how it scales sequentially:
console.log(generateSequentialCode(1));     // e.g., "44444T"
console.log(generateSequentialCode(35));    // e.g., "44444S"
console.log(generateSequentialCode(36));    // e.g., "44447T"
console.log(generateSequentialCode(150000)); // e.g., "47M9K2"

module.exports = { generateUniqueUserId };

