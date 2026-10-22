const crypto = require("crypto");

function generateVerificationCode() {
  return crypto.randomInt(100000, 1000000).toString();
}
//hash code
function hashCode(code) {
  if (!code || (typeof code !== "string" && typeof code !== "number")) {
    throw new Error("Cannot hash an invalid or empty code");
  }
  return crypto.createHash("sha256").update(String(code)).digest("hex");
}

module.exports = {
   generateVerificationCode,
   hashCode
  };