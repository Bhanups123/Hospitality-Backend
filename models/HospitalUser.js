const mongoose = require("mongoose");

const hospitalUserSchema = mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  website: {
    type: String,
  },
  phoneNumber: {
    type: Number,
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  beds: {
    type: Number,
  },
  totalBeds: {
    type: Number,
  },
  doctors: {
    type: Number,
  },
  totalDoctors: {
    type: Number,
  },
  availability: {
    type: Boolean,
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment",
  },
  note: {
    type: String,
  },
  enable: {
    type: Boolean,
    default: false,
  },
});

module.exports = HospitalUser = mongoose.model(
  "HospitalUser",
  hospitalUserSchema
);
