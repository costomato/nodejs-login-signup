const userSchema = require("../model/userSchema");

const readUsers = async () => {
  const read = await userSchema.find().catch((err) => {
    return "Mongo error thrown is " + err;
  });

  return read;
};

const getId = async (email, password) => {
  const response = { statusOk: false, statusString: "Failed finding id" };
  await userSchema.findOne({ email: email }).select('+password').then(async user => {
    if (!user) {
      response = { statusOk: false, statusString: "Error, could not find account." }
      return;
    }
    if (user.validatePassword(password, user.password)) {
      response.statusOk = true;
      response.statusString = user._id;
    }
  });
  return response;
}

const getUserByToken = async (_id, sessionToken) => {
  const response = { statusOk: false, statusString: "Invalid user" };
  const read = await userSchema.findOne({ _id: _id, sessionToken: sessionToken });
  if (sessionToken && read) {
    response.statusOk = true;
    response.statusString = read.name;
    response.data = {
      name: read.name,
      email: read.email,
      isVerified: read.isVerified,
      createdAt: read.createdAt
    }
  }
  return response;
}

module.exports = { readUsers, getId, getUserByToken };
