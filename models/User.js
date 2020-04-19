const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  code: {
    type: Number,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  userType: {
    type: String,
    required: true,
  },
});

module.exports = User = mongoose.model("User", userSchema);
