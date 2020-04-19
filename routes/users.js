const express = require("express");
const User = require("../models/User");
const HospitalUser = require("../models/HospitalUser");
const PatientUser = require("../models/PatientUser");

const router = express.Router();
const sendCode = require("../utils/sendCode");

//send code again route
router.get("/verification/sent", (req, res) => {
  const { email, userType } = req.query;

  sendCode(email, userType);

  res.json({
    success: "true",
    message: `Confirmation code has been sent again to ${email}`,
  });
});

router.get("/verification/check", (req, res) => {
  const { code, email } = req.query;

  let id;

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

    User.findByIdAndDelete({ _id: user._id });

    return res.json({
      success: "true",
      message: "Account has been verified successfully!!",
    });
  });
});

module.exports = router;
