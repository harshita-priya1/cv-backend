const express = require("express");

const userRouter = express.Router();

userRouter.post("/signup", addNewUser);
userRouter.post("/signin", signinUser);
userRouter.post("/refresh", refreshAccessToken);
userRouter.post("/logout", logoutUser);

module.exports = userRouter;
