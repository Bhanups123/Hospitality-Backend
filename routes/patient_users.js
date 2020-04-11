const express = require("express");
const HospitalUser = require("../models/HospitalUser");
const PatientUser = require("../models/PatientUser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../config/keys");
const passport = require("passport");
const router = express.Router();

const distCalc = require("../utils/distCalc");

//load input validation
const validateRegisterInput = require("../validation/patient user/register");
const validateLoginInput = require("../validation/login");

//nearby hospitals route
router.get("/hospitals", (req, res) => {
  const { latitude, longitude, range } = req.query;
  HospitalUser.find({})
    .then((hospitals) => {
      if (hospitals.length === 0) {
        res.status(404).json({ notFound: "No hospital found" });
      } else {
        let arr = hospitals.map((hospital) => {
          let hosp_dist = {};

          const dist = distCalc(
            latitude,
            longitude,
            hospital.latitude,
            hospital.longitude
          );

          hosp_dist.name = hospital.name;
          hosp_dist.contact = hospital.contact;
          hosp_dist.distance = dist;
          hosp_dist.latitude = hospital.latitude;
          hosp_dist.longitude = hospital.longitude;

          return hosp_dist;
        });
        arr = arr.filter((hospital) => hospital.distance <= range);

        if (arr.length === 0) {
          res.status(404).json({ notFound: "No nearby hospital found" });
        } else {
          res.json(arr);
        }
      }
    })
    .catch((err) => res.json(err));
});

//register route
router.post("/register", (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  PatientUser.findOne({ email: req.body.email }).then((patient) => {
    if (patient) {
      errors.email = "email already exist";
      return res.status(400).json(errors);
    } else {
      const newUser = new PatientUser({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        contact: req.body.contact,
      });
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then((patient) => res.json(patient))
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

  PatientUser.findOne({ email: req.body.email }).then((patient) => {
    //checking for hospital
    if (!patient) {
      errors.email = "user not found";
      return res.status(404).json(errors);
    }

    //check password
    bcrypt.compare(req.body.password, patient.password).then((isMatch) => {
      if (isMatch) {
        //patient matched
        const payload = {
          id: patient.id,
          name: patient.name,
          email: patient.email,
          latitude: patient.latitude,
          longitude: patient.longitude,
          availability: patient.availability,
          contact: patient.contact,
          userType: "patient",
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

//patient appoint
//private route
// router.get("/patients/:patient");
module.exports = router;
