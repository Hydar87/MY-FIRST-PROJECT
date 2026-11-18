/*
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

module.exports = transporter;
*/

const transporter = {
  sendMail: async ({ from, to, subject, html, text }) => {
    if (!process.env.BREVO_API_KEY) {
      throw new Error("Missing BREVO_API_KEY in environment variables");
    }

    const senderEmail = process.env.EMAIL_USER;
    if (!senderEmail) {
      throw new Error("Missing EMAIL_USER in environment variables");
    }

    // Normalize `to` into Brevo's expected [{ email }] array format
    const recipients = Array.isArray(to)
      ? to.map((item) => (typeof item === "string" ? { email: item } : item))
      : [{ email: to }];

    const payload = {
      sender: {
        name: "zumzum",
        email: senderEmail,
      },
      to: recipients,
      subject,
      ...(html ? { htmlContent: html } : {}),
      ...(text ? { textContent: text } : {}),
    };

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Brevo API error (${response.status}): ${JSON.stringify(data)}`);
    }

    return data;
  },
};

module.exports = transporter;