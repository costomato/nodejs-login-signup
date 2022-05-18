const userSchema = require("../model/userSchema");

const deleteUser = async (id, email, password) => {
  let response
  await userSchema.findOne({ _id: id, email: email }).select('+password').then(async user => {
    if (!user) {
      response = { statusOk: false, statusString: "Error, could not find account." }
      return;
    }
    if (user.validatePassword(password, user.password)) {
      const exp = await userSchema.deleteOne(
        { _id: id, email: email }
      );
      if (exp.deletedCount)
        response = { statusOk: true, statusString: "Account deleted successfully" };
      else
        response = { statusOk: false, statusString: "Could not delete account." };
    }
    else response = { statusOk: false, statusString: "Could not delete account. Please check your password." };
  });

  return response;
};

module.exports = deleteUser
