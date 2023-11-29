const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true, // remove extra spaces
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true, // unique email
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    unique: true, // unique phone
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now() + 5.5 * 60 * 60 * 1000,
  },
  passwordResetToken: {
    type: String,
    default: null,
  },
  passwordResetExpires: {
    type: Date,
    default: null,
  },
});

const User = mongoose.model("user", userSchema);
module.exports = User;
