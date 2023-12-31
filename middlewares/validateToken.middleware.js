const express = require("express");
const jwt = require("jsonwebtoken");

require("dotenv").config();

const User = require("../models/user.model");
const RefreshToken = require("../models/refreshToken.model");

async function validateToken(req, res, next) {
  // get user id and access token from request
  let refreshToken = req.query.refreshToken;
  let accessToken;
  let userId = req.query.user; // issues with this line everywhere review later    send user id is always sent with request
  // check if token is in request body
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    accessToken = req.headers.authorization.split(" ")[1];
  }
  if (!accessToken) {
    return res.status(401).json({ message: "Access token not found" });
  }
  let decodedToken;
  // find if token is expired

  try {
    decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    let expiryDate = new Date(decodedToken.exp * 1000);

    if (expiryDate > Date.now()) {
      //date.now() returns milliseconds
      // if token is not expired
      console.log("token is valid");
      next();
    } else {
      // if token is expired get refresh token from db and generate new access token
      console.log("token expired");
      try {
        const validRefreshToken = await RefreshToken.findOne({
          refreshToken: refreshToken,
        });
        if (!validRefreshToken) {
          // if refresh token not found
          return res.status(401).json({ message: "Refresh token not found" });
        } else {
          const decodedRefreshToken = jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET
          );
          const expiresAt = validRefreshToken.expiresAt;
          if (expiresAt > Date.now()) {
            // if refresh token is not expired
            console.log("refresh token is valid");
            const newAccessToken = jwt.sign(
              { userId: decodedRefreshToken.userId },
              process.env.ACCESS_TOKEN_SECRET,
              { expiresIn: "1h" }
            );
            res.status(200).json({ accessToken: newAccessToken });
            next();
          } else {
            // if refresh token is expired
            console.log("refresh token expired");
            return res
              .status(401)
              .json({ message: "Refresh token expired,  Please login again!" }); //route to login page
          }
        }
      } catch (error) {
        return res.status(500).json({
          error: error,
          message: `Error while retrieving refresh token ${error.message}`,
        });
      }
    }
  } catch (error) {
    return res.status(500).json({
      error: error,
      message: `Error while verifying access token ${error.message}`,
    });
  }
}

module.exports = validateToken;
