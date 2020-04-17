const mongoose = require("mongoose");

const appointmentSchema = mongoose.Schema({
  appointments: [
    {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PatientUser",
      },
      status: {
        type: String,
        default: "Pending",
      },
    },
  ],
});

module.exports = Appointment = mongoose.model("Appointment", appointmentSchema);
