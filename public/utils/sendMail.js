const nodemailer = require("nodemailer");


const sendMail = async (user) => {
    /*
    user contains:
    first name, last name, email, message, phone
     */

    const transporter = nodemailer.createTransport({
        service: process.env.MAIL_SERVICE,
        auth: {
            user: process.env.REC_EMAIL,
            pass: process.env.REC_PASS,
        },
    });

    const response = { statusOk: false, statusString: "" };

    const mailOptions = {
        from: process.env.EMAIL,
        to: process.env.EMAIL,
        subject: "Contact Form Submission - Portfolio",
        text: `${user.message} \n Name: ${user.firstName} ${user.lastName}\n Email: ${user.email}\n Phone:${user.phone}`,
    };

    const sendMail = async (options) => {
        return new Promise((resolve, reject) => {
            transporter.sendMail(options, async (error, _) => {
                console.log("Error = " + error);
                if (error) {
                    response.statusOk = false;
                    response.statusString = "Failed to send mail";
                    resolve(false);
                } else {
                    response.statusOk = true;
                    response.statusString = "Mail sent";
                    resolve(true);
                }
            });
        });
    };

    await sendMail(mailOptions);

    return response;
};

module.exports = sendMail