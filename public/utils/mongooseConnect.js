const mongoose = require("mongoose");
const dotenv = require("dotenv")
dotenv.config()

const mongooseConnect = () => {
  mongoose
    .connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("Connected to database");
    })
    .catch((err) => {
      console.log(err);
    });
};

module.exports = mongooseConnect