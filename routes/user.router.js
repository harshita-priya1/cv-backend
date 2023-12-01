const express = require("express");

const {
  addNewUser,
  signinUser,
  refreshAccessToken,
  logoutUser,
} = require("../controllers/user.controller");

const userRouter = express.Router();

userRouter.post("/signup", addNewUser);
userRouter.post("/signin", signinUser);
userRouter.post("/refresh", refreshAccessToken);
userRouter.post("/logout", logoutUser);

module.exports = userRouter;
