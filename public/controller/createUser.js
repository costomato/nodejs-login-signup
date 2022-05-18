const userSchema = require("../model/userSchema");
const generateToken = require("../utils/generateToken");

const createUser = async (name, email, pass) => {
  let response = {};
  const hash = userSchema.generateHash(pass)
  await userSchema
    .create({
      name: name,
      email: email,
      password: hash,
      sessionToken: generateToken(45)
    })
    .catch((err) => {
      response.statusOk = false;
      console.log(err)
      response.statusString = "Email already exists";
    });

  if (response.statusOk == null) {
    const user = await userSchema.findOne({ email: email }).catch((err) => {
      response.statusOk = false;
      response.statusString = "Failed finding id";
    });
    if (response.statusOk == null) {
      response.statusOk = true;
      response.statusString = "User created";
      response._id = user._id;
      response.sessionToken = user.sessionToken;
    }
  }
  return response;
};

module.exports = createUser;
