const userSchema = require("../model/userSchema");
const generateToken = require("../utils/generateToken");

const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
});

const sendResetLink = async (email) => {
  const response = { statusOk: false, statusString: "" };
  await userSchema.findOne({ email: email }).then(async (data) => {
    if (data) {
      if (
        data.resetPasswordExpire != null &&
        data.resetPasswordExpire > Date.now()
      ) {
        response.statusOk = false;
        response.statusString =
          "Reset link was already sent. Please wait for its expiration to generate new.";
      } else {
        const date = Date.now() + 1000 * 60 * 10;
        const token = generateToken();
        // send email
        const resetLink = `${process.env.BASE_URL}resetPassword?link=${token}&user=${email}`;
        const mailOptions = {
          from: process.env.EMAIL,
          to: email,
          subject: "Password reset request",
          text: `Visit this link to reset your password: ${resetLink}\nValid for 10 minutes`,
        };

        const sendMail = async (options) => {
          return new Promise((resolve, reject) => {
            transporter.sendMail(options, async (error, info) => {
              console.log("Error\n" + error);
              if (error) {
                response.statusOk = false;
                response.statusString = "Failed to send email";
                resolve(false);
              } else {
                response.statusOk = true;
                response.statusString = "Password reset link sent. Check your email's inbox. Make sure to check the spam folder as well.";
                await userSchema.updateOne(
                  { email: email },
                  {
                    $set: {
                      resetPasswordExpire: date,
                      resetPasswordToken: token,
                    },
                  }
                );
                resolve(true);
              }
            });
          });
        };

        await sendMail(mailOptions);
      }
    } else {
      response.statusOk = false;
      response.statusString = "Account with that email is unavailable";
    }
  });

  return response;
};

const resetPassword = async (email, token, newPassword) => {
  const response = {
    statusOk: false,
    statusString: "Invalid link for resetting password",
  };
  if (token) {
    await userSchema
      .findOne({ email: email, resetPasswordToken: token })
      .then(async (data) => {
        if (data) {
          if (data.resetPasswordExpire < Date.now()) {
            response.statusString = `Link expired`;
            return;
          }
          await userSchema
            .updateOne(
              { email: email, resetPasswordToken: token },
              { $set: { password: userSchema.generateHash(newPassword), resetPasswordToken: null, sessionToken: generateToken(45) } }
            )
            .then((data) => {
              if (data.matchedCount) {
                response.statusOk = true;
                response.statusString = `Password has been reset for user ${email}`;
              }
            });
        }
      });
  }
  return response;
};

const validateLink = async (email, token) => {
  const response = {
    statusOk: false,
    statusString: "Invalid link for resetting password",
  };
  if (token) {
    await userSchema
      .findOne({ email: email, resetPasswordToken: token })
      .then(async (data) => {
        if (data) {
          if (data.resetPasswordExpire < Date.now()) {
            response.statusString = `Link expired`;
            return;
          } else {
            response.statusOk = true;
            response.statusString = `Reset password for ${email}`
          }
        }
      });
  }
  return response;
};

module.exports = { sendResetLink, resetPassword, validateLink };
