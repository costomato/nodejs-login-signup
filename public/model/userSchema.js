const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt');
const saltRounds = 10;

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter your name"],
        maxLength: [45, "Name must be less than or equal to 45 characters long"],
        minLength: [2, "Name should be at least 2 characters long"]
    },
    email: {
        type: String,
        required: [true, "Please enter your email address"],
        unique: true,
        validate: [validator.isEmail, "Invalid email"]
    },
    password: {
        type: String,
        required: [true, "Please enter your password"],
        minLength: [8, "Password must be at least 8 characters long"],
        select: false
    },

    /* add anything else if required */

    newEmail: {
        type: String,
        unique: true,
        validate: [validator.isEmail, "Invalid email"]
    },
    _newEmailVerification: String,

    sessionToken: String,

    resetPasswordToken: String,
    resetPasswordExpire: Number,
    createdAt: {
        type: Date,
        default: Date.now
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    _otp: String
});

userSchema.statics.generateHash = password => {
    return bcrypt.hashSync(password, saltRounds);
}

userSchema.methods.validatePassword = (password, hash) => {
    return bcrypt.compareSync(password, hash);
}

module.exports = mongoose.model("User", userSchema)
