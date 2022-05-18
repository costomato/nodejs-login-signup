const userSchema = require("../model/userSchema");
const generateToken = require("../utils/generateToken");
const nodemailer = require("nodemailer");

const updateUser = async (id, password, sessionToken, update) => {
  if (!update) {
    return { statusOk: false, statusString: "Invalid request" };
  }
  if (id.length < 24)
    return { statusOk: false, statusString: "Invalid ID" };
  if (update.email)
    return { statusOk: false, statusString: "Could not update data. Please remove email field" };
  if (update.password && update.password.length > 7) {
    update.sessionToken = generateToken(45);
    update.password = userSchema.generateHash(update.password);
  } else if (update.password) return { statusOk: false, statusString: "Password must be at least 8 characters long" }

  let response = {};
  await userSchema.findOne({ _id: id }).select('+password').then(async user => {
    if (!user) {
      response = { statusOk: false, statusString: "Error, could not find account." }
      return;
    }
    if ((sessionToken == user.sessionToken) || (password && user.validatePassword(password, user.password))) {
      const exp = await userSchema.updateOne(
        { _id: id },
        { $set: update }
      );
      if (exp.matchedCount)
        response = { statusOk: true, statusString: "Updated", data: { newSessionToken: update.sessionToken } };
      else
        response = { statusOk: false, statusString: "Error updating data" };
    }
    else response = { statusOk: false, statusString: "Could not update account. Invalid authentication." };
  });

  return response;
};

const sendEmailUpdateLink = async (oldEmail, password, sessionToken, newEmail) => {
  let response = { statusOk: false, statusString: "" };
  await userSchema.findOne({ email: newEmail }).then(data => {
    console.log("Finding email")
    if (data)
      response.statusString = "Email already exists"
  })
  if (response.statusString)
    return response;

  const emailVerifToken = generateToken(40);
  await userSchema.findOne({ email: oldEmail }).select('+password').then(async user => {
    if (!user) {
      response = { statusOk: false, statusString: "Error, could not find account." }
      return;
    }
    if ((sessionToken == user.sessionToken) || (password && user.validatePassword(password, user.password))) {
      const exp = await userSchema.updateOne(
        { email: oldEmail }, { $set: { newEmail: newEmail, _newEmailVerification: emailVerifToken } }
      )
      if (exp.matchedCount) {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL,
            pass: process.env.PASS,
          },
        });
        const mailOptions = {
          from: process.env.EMAIL,
          to: newEmail,
          subject: "Email verification request",
          text: `Dear ${newEmail}\n\nYou requested for updation of email from login signup app and provided this email. Clicking the link below will verify this email and it will be updated in your account:\n\n${process.env.BASE_URL}updateEmail?link=${emailVerifToken}&fromEmail=${oldEmail}&toEmail=${newEmail}\n\nIgnore if this request was not made by you.`
        };

        const sendMail = async (options) => {
          return new Promise((resolve, reject) => {
            transporter.sendMail(options, async (error, info) => {
              console.log("Error = " + error);
              if (error) {
                response.statusString = "Failed to send link";
                resolve(false);
              } else {
                response.statusOk = true;
                response.statusString = "Verification link sent. Check your new email's inbox. Make sure to check the spam folder as well.";
                resolve(true);
              }
            });
          });
        };
        await sendMail(mailOptions);
      }
      else
        response = { statusOk: false, statusString: "Error while updating email." }

    }
    else response = { statusOk: false, statusString: "Could not update email. Invalid authentication." };
  });

  return response;
}

module.exports = { updateUser, sendEmailUpdateLink }
