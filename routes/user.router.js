const express = require("express");

const userRouter = express.Router();

userRouter.post("/signup", addNewUser);
userRouter.post("/login", loginUser);
userRouter.post("/forgotpassword", forgotPassword);
userRouter.post("/resetpassword", resetPassword);
userRouter.post("/logout", logoutUser); // will check if needed

module.exports = userRouter;
