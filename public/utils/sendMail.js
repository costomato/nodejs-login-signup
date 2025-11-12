require("dotenv").config();
const nodemailer = require("nodemailer");

console.log("Initializing mail transporters with environment variables...");
console.log({
  HOST: process.env.HOST,
  REC_EMAIL: process.env.REC_EMAIL,
  BOT_MAIL: process.env.BOT_MAIL
});

const transporter = nodemailer.createTransport({
  host: process.env.HOST,
  port: 465,
  secure: true,
  auth: {
    user: process.env.REC_EMAIL,
    pass: process.env.REC_PASS,
  },
});

const botTransporter = nodemailer.createTransport({
  host: process.env.HOST,
  port: 465,
  secure: true,
  auth: {
    user: process.env.BOT_MAIL,
    pass: process.env.BOT_PASS,
  },
});

const sendMail = async (user) => {
  console.log("Incoming user data:", user);

  const response = { statusOk: false, statusString: "" };

  const mailOptions = {
    from: process.env.REC_EMAIL,
    to: process.env.REC_EMAIL,
    subject: "Contact Form Submission - Portfolio",
    text: `${user.message} \n Name: ${user.firstName} ${user.lastName}\n Email: ${user.email}\n Phone:${user.phone}`,
  };

  try {
    console.log("Verifying SMTP transporter...");
    await transporter.verify();
    console.log("SMTP transporter verified successfully.");

    console.log("Sending contact email...");
    const result = await transporter.sendMail(mailOptions);
    console.log("Contact mail sent successfully:", result.response);

    response.statusOk = true;
    response.statusString = "Mail sent";

    console.log("Sending auto-reply to user...");
    const autoReply = await botTransporter.sendMail({
      from: process.env.BOT_MAIL,
      to: user.email || process.env.REC_MAIL,
      subject: "Thank you for contacting us!",
      text: `Dear ${user.firstName + (user.lastName ? " " + user.lastName : "")},

Thank you for getting in touch! I really appreciate you taking the time to reach out. 
Your message has been received, and I’ll personally go through it as soon as possible.

If your message is urgent or you’d prefer to reach me directly, feel free to email me at support@costomato.com.

Thanks again for contacting me. I look forward to connecting with you!

Warm regards,  
Kaustubh Dubey  
(costomato)`
    });
    console.log("Auto-reply sent successfully:", autoReply.response);
  } catch (error) {
    console.error("ERROR while sending email:", error);
    response.statusOk = false;
    response.statusString = "Failed to send mail";
  }

  return response;
};

module.exports = sendMail;
