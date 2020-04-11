const mongoose = require("mongoose");
const PatientUser = require("../models/PatientUser");

const appointmentSchema = mongoose.Schema({
  appointments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PatientUser",
    },
  ],
});

module.exports = Appointment = mongoose.model("Appointment", appointmentSchema);
