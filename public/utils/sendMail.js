const nodemailer = require("nodemailer");

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
    /*
    user contains:
    first name, last name, email, message, phone
     */

    const response = { statusOk: false, statusString: "" };

    const mailOptions = {
        from: process.env.REC_EMAIL,
        to: process.env.REC_EMAIL,
        subject: "Contact Form Submission - Portfolio",
        text: `${user.message} \n Name: ${user.firstName} ${user.lastName}\n Email: ${user.email}\n Phone:${user.phone}`,
    };

    const send = async (options) => {
        return new Promise((resolve, reject) => {
            transporter.sendMail(options, async (error, _) => {
                if (error) {
                    response.statusOk = false;
                    response.statusString = "Failed to send mail";
                    console.log("Error = " + error);
                    resolve(false);
                } else {
                    response.statusOk = true;
                    response.statusString = "Mail sent";
                    resolve(true);
                }
            });
        });
    };

    await send(mailOptions);

    botTransporter.sendMail({
        from: process.env.BOT_MAIL,
        to: user.email || process.env.REC_MAIL,
        subject: 'Thank you for contacting us!',
        text: `Dear ${user.firstName + (user.lastName ? " " + user.lastName : "")},

Thank you for reaching out to FlyProsper! We appreciate your interest and value your time. Your message has been received, and we are thrilled to connect with you.
        
At FlyProsper, we are dedicated to transforming ideas into reality and delivering innovative solutions. As the CEO of FlyProsper, I, Kaustubh, personally assure you that your inquiry is important to us. Our team of experts is currently reviewing your message, and we will provide you with a thoughtful response shortly.
        
In the meantime, feel free to explore our website at www.flyprosper.com to learn more about our services and the exciting projects we have undertaken. We are committed to driving your success and helping you achieve your goals.
        
If you have any further questions or require immediate assistance, please don't hesitate to reach out to us at support@flyprosper.com. We are here to support you every step of the way.
        
Once again, thank you for choosing FlyProsper. We look forward to collaborating with you and turning your vision into reality!
        
Best regards,
        
Kaustubh
CEO, FlyProsper
        
        
Please note that this email address (noreply@flyprosper.com) is not monitored for incoming messages. If you need further assistance or have any questions, please reach out to our support team at support@flyprosper.com. We are here to help you and provide prompt assistance.`
    },
        (err, _) => {
            if (err)
                console.log("Auto reply failed with error\n" + err)
            else
                console.log("Auto reply sent successfully")
        })

    return response;
};

module.exports = sendMail