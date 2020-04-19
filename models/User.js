const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  user: {
    code: {
      type: Number,
      required: true,
    },
    id_p: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PatientUser",
    },
    id_h: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HospitalUser",
    },
  },
});

module.exports = User = mongoose.model("User", userSchema);
