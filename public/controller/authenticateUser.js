const userSchema = require("../model/userSchema");

const authenticateUser = async (email, password, sessionToken) => {
  let login = {
    statusOk: false,
    _id: null,
    _name: null,
    _isVerified: null,
    sessionToken: null,
    statusString: "Authentication failed",
  };
  
  await userSchema.findOne({ email: email }).select('+password').then(async user => {
    if (!user) {
      login = { statusOk: false, statusString: "No such email" }
      return;
    }

    if ((sessionToken == user.sessionToken) || (password && user.validatePassword(password, user.password))) {
      login._id = user._id;
      login._name = user.name;
      login._isVerified = user.isVerified;
      login.sessionToken = user.sessionToken;
      login.statusOk = true;
      login.statusString = `Authenticated as ${email}`;
    }
    else login.statusString = "Please check your password and try again"
  });

  return login;
};

module.exports = authenticateUser;
