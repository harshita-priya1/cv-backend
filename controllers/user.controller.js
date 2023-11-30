const express = require("express");

const User = require("../models/user.model");
const RefreshToken = require("../models/refreshToken.model");

require("dotenv").config();

const jwt = require("jsonwebtoken");

const bcrypt = require("bcrypt");

async function addNewUser(req, res) {
  let { name, email, phone, password } = req.body; // get data from request body
  name = name.trim();
  email = email.trim();
  phone = phone.trim();
  password = password.trim();

  // validate input fields
  if (!name || !email || !phone || !password) {
    return res.status(400).json({ message: "Input fields cannot be empty!" });
  } else if (!/^[a-zA-Z ]*$/.test(name)) {
    return res
      .status(400)
      .json({ message: "Name can only contain alphabets!" });
  } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
    return res.status(400).json({ message: "Invalid email address!" });
  } else if (!/^[0-9]{10}$/.test(phone)) {
    return res.status(400).json({ message: "Invalid phone number!" });
  } else if (password.length < 8) {
    return res
      .status(400)
      .json({ message: "Password must be atleast 8 characters long!" });
  } else {
    // hash password
    let hashedPassword;
    try {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    } catch (error) {
      return res.status(500).json({
        message: `An error occured while hashing password: ${error.message}`,
      });
    }
    // create new user
    const newUser = new User({
      name: name,
      email: email,
      phone: phone,
      password: hashedPassword,
    });
    try {
      // check if email already exists
      const emailExist = await User.findOne({ email: email });
      if (emailExist) {
        return res.status(400).json({ message: "Email already exists!" });
      }
    } catch (error) {
      return res.status(500).json({
        message: `An error occured while checking for email: ${error.message}`,
      });
    }
    // save user
    let savedUser;
    try {
      savedUser = await newUser.save();
    } catch (error) {
      return res.status(500).json({
        message: `An error occured while saving user: ${error.message}`,
      });
    }
    // create access token and refresh token
    const accessToken = jwt.sign(
      { userId: savedUser._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_LIFE }
    );
    const refreshToken = jwt.sign(
      { userId: savedUser._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_LIFE }
    );
    // save refresh token
    let expiresAt = new Date();
    expiresAt.setSeconds(
      expiresAt.getSeconds() + process.env.REFRESH_TOKEN_LIFE // life in seconds
    );
    const newRefreshToken = new RefreshToken({
      refreshToken: refreshToken,
      userId: savedUser._id,
      expiresAt: expiresAt,
    });
    try {
      let savedRefreshToken = await newRefreshToken.save();
      return res.status(201).json({
        message: "User created successfully!",
        accessToken: accessToken,
        refreshToken: refreshToken,
        user: {
          name: savedUser.name,
          email: savedUser.email,
        },
      });
    } catch (error) {
      return res.status(500).json({
        message: `An error occured while saving refresh token: ${error.message}`,
      });
    }
  }
}

async function signinUser(req, res) {}

async function refreshAccessToken(req, res) {}

async function forgotPassword(req, res) {}

async function resetPassword(req, res) {}

async function logoutUser(req, res) {}

module.exports = {
  addNewUser,
  signinUser,
  refreshAccessToken,
  forgotPassword,
  resetPassword,
  logoutUser,
};

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
