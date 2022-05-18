const userSchema = require("../model/userSchema");
const nodemailer = require("nodemailer");
const generateToken = require("../utils/generateToken");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS,
    },
});

const sendVerificationOtp = async (user) => {
    /*
    user contains:
    email, name, _id,
     */
    const response = { statusOk: false, statusString: "" };
    const otp = `${Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000}`;
    const mailOptions = {
        from: process.env.EMAIL,
        to: user.email,
        subject: "Account verification request",
        text: `Dear ${user.name}\n\nWe received an account creation request at our website from this email. The OTP to verify your account is:\n${otp}\n\nPlease do not share it with anyone. Enter this OTP in your login signup app`,
    };

    const sendMail = async (options) => {
        return new Promise((resolve, reject) => {
            transporter.sendMail(options, async (error, _) => {
                console.log("Error = " + error);
                if (error) {
                    response.statusOk = false;
                    response.statusString = "Failed to send OTP";
                    resolve(false);
                } else {
                    response.statusOk = true;
                    response.statusString = "OTP sent. Check your email's inbox. Make sure to check the spam folder as well.";
                    await userSchema.updateOne(
                        {
                            _id: user._id,
                            email: user.email
                        },
                        {
                            $set: {
                                _otp: otp
                            },
                        }
                    );
                    resolve(true);
                }
            });
        });
    };

    await sendMail(mailOptions);

    return response;
};

const verifyOtp = async (user) => {
    const response = { statusOk: false, statusString: "" };
    await userSchema.findOne({ _id: user._id, email: user.email, _otp: user._otp })
        .then(async (data) => {
            console.log(`OTP verification data ${data}`);
            if (data) {
                response.statusOk = true;
                response.statusString = "Verification successful"
                await userSchema.updateOne(
                    {
                        email: user.email
                    },
                    {
                        $set: {
                            isVerified: true
                        },
                    }
                );
            } else {
                response.statusString = "Invalid OTP"
            }
        });
    return response
}

const verifyNewEmail = async (oldEmail, newEmail, token) => {
    const exp = await userSchema.updateOne(
        { email: oldEmail, newEmail: newEmail, _newEmailVerification: token },
        { $set: { email: newEmail, sessionToken: generateToken(45) }, $unset: { newEmail: "", _newEmailVerification: "" } }
    );
    if (exp.matchedCount)
        return { statusOk: true, statusString: "Email updated successfully" };
    else
        return { statusOk: false, statusString: "Email could not be updated" };
}

module.exports = { sendVerificationOtp, verifyOtp, verifyNewEmail }