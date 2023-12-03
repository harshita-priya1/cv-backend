const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const User = require("../models/user.model");
const RefreshToken = require("../models/refreshToken.model");

require("dotenv").config();

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
      const phoneExist = await User.findOne({ phone: phone });
      if (phoneExist) {
        return res.status(400).json({ message: "Phone no. already in use!" });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: `An error occured while checking for email and phone number: ${error.message}`,
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
        status: 201,
        user: {
          name: savedUser.name,
          email: savedUser.email,
          id: savedUser._id,
        },
      });
    } catch (error) {
      return res.status(500).json({
        message: `An error occured while saving refresh token, error while signing up: ${error.message}`,
      });
    }
  }
}

async function signinUser(req, res) {
  let { email, password } = req.body; // get data from request body
  email = email.trim();
  password = password.trim();
  if (!email || !password) {
    return res.status(400).json({ message: "Input fields cannot be empty!" });
  } else {
    let user;
    try {
      user = await User.findOne({ email: email });
      if (!user) {
        return res.status(400).json({ message: "Email does not exist!" });
      }
    } catch (error) {
      return res.status(500).json({
        message: `An error occured while looking for user in the database: ${error.message}`,
      });
    }
    // compare password
    let validPassword = user.password;
    try {
      const isMatch = await bcrypt.compare(password, validPassword);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid password!" });
      }
    } catch (error) {
      return res.status(500).json({
        message: `An error occured while comparing passwords: ${error.message}`,
      });
    }
    // create new access token and refresh token
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_LIFE }
    );
    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_LIFE }
    );
    const expiresAt = new Date();
    expiresAt.setSeconds(
      expiresAt.getSeconds() + process.env.REFRESH_TOKEN_LIFE
    );
    // save refresh token
    const newRefreshToken = new RefreshToken({
      refreshToken: refreshToken,
      userId: user._id,
      expiresAt: expiresAt,
    });
    try {
      let savedRefreshToken = await newRefreshToken.save();
      return res.status(200).json({
        message: "User signed in successfully!",
        accessToken: accessToken,
        refreshToken: refreshToken,
        status: 200,
        user: {
          name: user.name,
          email: user.email,
          id: user._id,
        },
      });
    } catch (error) {
      return res.status(500).json({
        message: `An error occured while saving refresh token: ${error.message}`,
      });
    }
  }
}

async function refreshAccessToken(req, res) {
  let { refreshToken, user } = req.body;
  refreshToken = refreshToken.trim();
  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token not received!" });
  }
  let validRefreshToken;
  try {
    validRefreshToken = await RefreshToken.findOne({
      refreshToken: refreshToken,
    });
    if (!validRefreshToken) {
      return res.status(400).json({ message: "Refresh token not found!" });
    }
  } catch (error) {
    return res.status(500).json({
      message: `An error occured while looking for refresh token: ${error.message}`,
    });
  }
  if (validRefreshToken.expiresAt < Date.now()) {
    return res.status(400).json({ message: "Refresh token expired!" }); //Make sure to re-direct to login page
  }
  let newAccessToken = jwt.sign(
    { userId: validRefreshToken.user },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_LIFE }
  );
  return res.status(200).json({ accessToken: newAccessToken, status: 200 }); // send new access token
}

async function logoutUser(req, res) {
  let { refreshToken } = req.body;
  refreshToken = refreshToken.trim();
  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token not found!" });
  } else {
    try {
      const deletedRefreshToken = await RefreshToken.findOneAndDelete({
        refreshToken: refreshToken,
      });
      if (deletedRefreshToken) {
        return res
          .status(200)
          .json({ message: "User logged out!", status: 200 });
      } else {
        return res.status(400).json({ message: "Refresh token not found!" });
      }
    } catch (error) {
      return res.status(500).json({
        message: `An error occured while logging out : ${error.message}`,
      });
    }
  }
}

module.exports = {
  addNewUser,
  signinUser,
  refreshAccessToken,
  logoutUser,
};
