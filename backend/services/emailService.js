const transporter = require("../config/mail");

async function sendVerificationEmail(email, code) {  
  if (!email) {
    throw new Error("Recipient email is missing!");
  }

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verify your email",
    text: `Your verification code is ${code}.

This code will expire in 5 minutes.`,
  });
}

module.exports = {
  sendVerificationEmail,
};