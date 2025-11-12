require("dotenv").config();
const nodemailer = require("nodemailer");

const sendMail = async (user) => {
  console.log("Incoming user data:", user);
  const response = { statusOk: false, statusString: "" };

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.HOST,
      port: 465,
      secure: true,
      auth: {
        user: process.env.REC_EMAIL,
        pass: process.env.REC_PASS,
      },
    });

    console.log("Sending contact email...");
    await transporter.sendMail({
      from: process.env.REC_EMAIL,
      to: process.env.REC_EMAIL,
      subject: "Contact Form Submission - Portfolio",
      text: `${user.message}\n\nName: ${user.firstName} ${user.lastName}\nEmail: ${user.email}\nPhone: ${user.phone}`,
    });

    console.log("Contact email sent successfully.");
    response.statusOk = true;
    response.statusString = "Mail sent";

    await transporter.sendMail({
      from: process.env.BOT_MAIL,
      to: user.email,
      subject: "Thanks for reaching out!",
      text: `Hey ${user.firstName},

Thanks for getting in touch! I’ve received your message and will respond shortly.

Warm regards,
Kaustubh Dubey
(costomato)`,
    });

    console.log("Auto-reply sent successfully.");
  } catch (err) {
    console.error("Zoho SMTP error:", err);
    response.statusOk = false;
    response.statusString = "Failed to send mail";
  }

  return response;
};

module.exports = sendMail;
