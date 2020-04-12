const express = require("express");
const HospitalUser = require("../models/HospitalUser");
const Appointment = require("../models/Appointment");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../config/keys");
const passport = require("passport");

const router = express.Router();

//load input validation
const validateRegisterInput = require("../validation/hospital user/register");
const validateLoginInput = require("../validation/login");
const isEmpty = require("../validation/is-empty");

//register route
router.post("/register", (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  HospitalUser.findOne({ email: req.body.email }).then((hospital) => {
    if (hospital) {
      errors.email = "email already exist";
      return res.status(400).json(errors);
    } else {
      const newUser = new HospitalUser({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        doctors: req.body.doctors,
        beds: req.body.beds,
        contact: req.body.contact,
      });
      const newAppointent = new Appointment({
        appointments: [],
      });
      newAppointent.save().then((appointment) => {
        newUser.appointment = appointment;
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then((hospital) => res.json(hospital))
            .catch((err) => console.log(err));
        });
      });
    }
  });
});

//login route
router.post("/login", (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  HospitalUser.findOne({ email: req.body.email }).then((hospital) => {
    //checking for hospital
    if (!hospital) {
      errors.email = "hospital not found";
      return res.status(404).json(errors);
    }

    //check password
    bcrypt.compare(req.body.password, hospital.password).then((isMatch) => {
      if (isMatch) {
        //hospital matched
        const payload = {
          id: hospital.id,
          name: hospital.name,
          email: hospital.email,
          latitude: hospital.latitude,
          longitude: hospital.longitude,
          doctors: hospital.doctors,
          beds: hospital.beds,
          contact: hospital.contact,
          userType: "hospital",
        }; //create jwt payload

        //jwt sign
        jwt.sign(
          payload,
          keys.secretOrKey,
          { expiresIn: 3600 },
          (err, token) => {
            res.json({
              success: true,
              token: "Bearer " + token,
            });
          }
        );
      } else {
        errors.password = "Incorrect Password!!";
        return res.status(400).json(errors);
      }
    });
  });
});

//private route

// router.get(
//   "/current",
//   passport.authenticate("jwt", { session: false }),
//   (req, res) => {
//     res.json({
//       name: req.user.name,
//       email: req.user.email,
//       latitude: req.user.latitude,
//       longitude: req.user.longitude,
//       availability: req.user.availability,
//       contact: req.user.contact,
//     });
//   }
// );

//update information route
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    HospitalUser.findOne({ email: req.user.email }).then((hospital) => {
      const { beds, doctors } = req.body;
      if (!isEmpty(beds)) hospital.beds = beds;
      if (!isEmpty(doctors)) hospital.doctors = doctors;
      hospital
        .save()
        .then((user_s) => res.json({ success: "true" }))
        .catch((err) => res.json(err));
    });
  }
);

module.exports = router;
