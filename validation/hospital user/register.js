const validator = require("validator");
const isEmpty = require("../is-empty");

module.exports = function validateRegisterInput(data) {
  let errors = {};

  data.name = isEmpty(data.name) ? "" : data.name;
  data.email = isEmpty(data.email) ? "" : data.email;
  data.password = isEmpty(data.password) ? "" : data.password;
  data.password2 = isEmpty(data.password2) ? "" : data.password2;
  data.phoneNumber = isEmpty(data.phoneNumber) ? "" : data.phoneNumber;
  data.availability = isEmpty(data.availability) ? "" : data.availability;
  data.latitude = isEmpty(data.latitude) ? "" : data.latitude;
  data.website = isEmpty(data.website) ? "" : data.website;
  data.note = isEmpty(data.note) ? "" : data.note;
  data.totalBeds = isEmpty(data.totalBeds) ? "" : data.totalBeds;
  data.totalDoctors = isEmpty(data.totalDoctors) ? "" : data.totalDoctors;
  data.doctors = isEmpty(data.doctors) ? "" : data.doctors;
  data.beds = isEmpty(data.beds) ? "" : data.beds;

  //name
  if (!validator.isLength(data.name, { min: 2, max: 30 })) {
    errors.name = "Name must be between 2 and 30 characters";
  }

  if (validator.isEmpty(data.name)) {
    errors.name = "Name is required";
  }

  //email
  if (!validator.isEmail(data.email)) {
    errors.email = "Email is invalid";
  }

  if (validator.isEmpty(data.email)) {
    errors.email = "Email is required";
  }

  //password
  if (!validator.isLength(data.password, { min: 6, max: 30 })) {
    errors.password = "Password must be between 6 and 30 characters";
  }

  if (validator.isEmpty(data.password)) {
    errors.password = "Password is required";
  }

  //confirm password
  if (!validator.equals(data.password, data.password2)) {
    errors.password2 = "Password must match";
  }

  if (validator.isEmpty(data.password2)) {
    errors.password2 = "Confirm Password is required";
  }

  // phoneNumber
  if (!validator.isLength(data.phoneNumber, { min: 10, max: 10 })) {
    errors.phoneNumber = "Phone Number must be 10 digits";
  }

  if (validator.isEmpty(data.phoneNumber)) {
    errors.phoneNumber = "Phone Number is required";
  }
  //latitude
  if (validator.isEmpty(data.latitude)) {
    errors.latitude = "Latitude is required";
  }

  //longitude
  if (validator.isEmpty(data.longitude)) {
    errors.longitude = "Longitude is required";
  }

  //availability
  if (validator.isEmpty(data.availability)) {
    errors.availability = "Availability is required";
  }

  //doctors
  if (validator.isEmpty(data.doctors)) {
    errors.doctors = "Doctor count is required";
  }

  //beds
  if (validator.isEmpty(data.beds)) {
    errors.beds = "Bed count is required";
  }

  //note
  if (validator.isEmpty(data.note)) {
    errors.note = "Note is required";
  }

  //totalBeds
  if (validator.isEmpty(data.totalBeds)) {
    errors.totalBeds = "Total bed count is required";
  }

  //totalDoctors
  if (validator.isEmpty(data.totalDoctors)) {
    errors.totalDoctors = "Total doctor count is required";
  }

  //website
  if (validator.isEmpty(data.website)) {
    errors.website = "Website is required";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
