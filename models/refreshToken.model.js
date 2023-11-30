const mongoose = require("mongoose");

const refreshTokenSchema = new mongoose.Schema({
  refreshToken: {
    type: String,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  expiresAt: {
    type: Date,
  },
});

const RefreshToken = mongoose.model("refreshToken", refreshTokenSchema);
module.exports = RefreshToken;
