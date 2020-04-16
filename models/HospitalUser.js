const mongoose = require("mongoose");

const hospitalUserSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
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
    required: true,
  },
  phoneNumber: {
    type: Number,
    required: true,
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
    required: true,
  },
  totalBeds: {
    type: Number,
    required: true,
  },
  doctors: {
    type: Number,
    required: true,
  },
  totalDoctors: {
    type: Number,
    required: true,
  },
  availability: {
    type: Boolean,
    required: true,
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment",
  },
  note: {
    type: String,
    required: true,
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
