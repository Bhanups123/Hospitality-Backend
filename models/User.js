const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  coordinate: {
    type: String,
    required: true
  },
  availability: {
    type: Number,
    defult: 0
  }
});

module.exports = User = mongoose.model("User", userSchema);
