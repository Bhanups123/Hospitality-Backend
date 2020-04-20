const express = require("express");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const HospitalUser = require("../models/HospitalUser");
const PatientUser = require("../models/PatientUser");

const router = express.Router();
const sendVerifyCode = require("../utils/sendVerifyCode");
const sendForgotCode = require("../utils/sendForgotCode");

//send code again route
router.get("/verification/sent", (req, res) => {
  const { email, userType } = req.query;

  sendVerifyCode(email, userType);

  res.json({
    success: "true",
    message: `Confirmation code has been sent again to ${email}`,
  });
});

//confirmation code matching route
router.post("/verification/check", (req, res) => {
  const { code, email } = req.body;

  User.findOne({ email }).then((user) => {
    if (!user) return res.status(404).json({ error: "Incorrect email!!" });

    if (user.code == code) {
      if (user.userType === "Patient") {
        PatientUser.findOne({ email }).then((patient) => {
          patient.enable = true;
          patient.save();
        });
      } else {
        HospitalUser.findOne({ email }).then((hospital) => {
          hospital.enable = true;
          hospital.save();
        });
      }
    } else {
      return res
        .status(401)
        .json({ error: "confirmation code doesn't match!!" });
    }

    User.findByIdAndDelete({ _id: user._id }).then();

    return res.json({
      success: "true",
      message: "Account has been verified successfully!!",
    });
  });
});

//send forgot code route
router.get("/forgot/sent", (req, res) => {
  const { email, userType } = req.query;

  console.log(userType);

  if (userType === "Patient") {
    PatientUser.findOne({ email }).then((patient) => {
      if (!(patient)) {
        return res.status(404).json({ error: "Incorrect email!!!" })
      }
      else {
        sendForgotCode(email, userType);
        res.json({
          success: "true",
          message: `Confirmation code has been sent to ${email}`,
        });
      }
    });
  }
  else {
    HospitalUser.findOne({ email }).then((hospital) => {
      if (!(hospital)) {
        return res.status(404).json({ error: "Incorrect email!!" })
      }
      else {
        sendForgotCode(email, userType);
        res.json({
          success: "true",
          message: `Confirmation code has been sent to ${email}`,
        });
      }
    });
  }
});

//confirmation code matching route
router.post("/forgot/check", (req, res) => {
  let { code, email, passwordNew } = req.body;

  User.findOne({ email }).then((user) => {
    if (!user) return res.status(404).json({ error: "Incorrect email!!" });

    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(passwordNew, salt, (err, hash) => {
        if (err) throw err;
        passwordNew = hash;
      });

      if (user.code == code) {
        if (user.userType === "Patient") {
          PatientUser.findOne({ email }).then((patient) => {
            patient.password = passwordNew;
            patient.save();
          });
        } else {
          HospitalUser.findOne({ email }).then((hospital) => {
            hospital.password = passwordNew;
            hospital.save();
          });
        }
      } else {
        return res
          .status(401)
          .json({ error: "confirmation code doesn't match!!" });
      }

      User.findByIdAndDelete({ _id: user._id }).then();

      return res.json({
        success: "true",
        message: "Password has been changed successfully!!",
      });
    });
  });
});

module.exports = router;
