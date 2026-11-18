require("dotenv").config(); // Loads BREVO_API_KEY and EMAIL_USER from your .env file

const transporter = {
  sendMail: async ({ from, to, subject, html, text }) => {
    if (!process.env.BREVO_API_KEY) {
      throw new Error("Missing BREVO_API_KEY in environment variables");
    }

    const senderEmail = process.env.EMAIL_USER;
    if (!senderEmail) {
      throw new Error("Missing EMAIL_USER in environment variables");
    }

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

// Run the test email
async function sendDemoEmail() {
  try {
    const result = await transporter.sendMail({
      to: "hydarzuma@gmail.com", // Replace with your actual email
      subject: "Demo Email",
      text: "Hey, it's a demo email",
      html: "<p>Hey, it's a demo email</p>",
    });

    console.log("Email sent successfully:", result);
  } catch (error) {
    console.error("Failed to send demo email:", error);
  }
}

sendDemoEmail();