const express = require("express");
const HospitalUser = require("../models/HospitalUser");
const PatientUser = require("../models/PatientUser");
const Appointment = require("../models/Appointment");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../config/keys");
const passport = require("passport");
const router = express.Router();

const distCalc = require("../utils/distCalc");

//load input validation
const validateRegisterInput = require("../validation/patient user/register");
const validateLoginInput = require("../validation/login");
const isEmpty = require("../validation/is-empty");


router.get('/test', (req, res) => {
  res.json({ msg: 'Patient route work' })
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
      const {
        name,
        email,
        password,
        address,
        latitude,
        longitude,
        phoneNumber,
      } = req.body;

      const newUser = new PatientUser({
        name,
        email,
        password,
        address,
        latitude,
        longitude,
        phoneNumber,
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
          id: patient._id,
          name: patient.name,
          email: patient.email,
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

//patient info
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    PatientUser.findOne({ email: req.user.email })
      .then((patient) => {
        let patient_info = patient;

        for (p in patient_info) {
          if (p == "password") {
            patient_info[p] = undefined;
          }
        }
        res.json(patient_info);
      })
      .catch((err) => res.json(err));
  }
);

//patient info update
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    PatientUser.findOne({ email: req.user.email }).then((patient) => {
      const {
        email,
        name,
        phoneNumber,
        address,
        latitude,
        longitude,
      } = req.body;

      if (!isEmpty(name)) patient.name = name;
      if (!isEmpty(phoneNumber)) patient.phoneNumber = phoneNumber;
      if (!isEmpty(address)) patient.address = address;
      if (!isEmpty(latitude)) patient.latitude = latitude;
      if (!isEmpty(longitude)) patient.longitude = longitude;
      if (!isEmpty(email)) {
        patient.email = email;
        patient.enable = false;
      }

      patient
        .save()
        .then((user_s) => res.json({ success: "true" }))
        .catch((err) => res.json(err));
    });
  }
);

//nearby hospitals
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
          hosp_dist.distance = dist;
          hosp_dist.name = hospital.name;
          hosp_dist.email = hospital.email;
          hosp_dist.website = hospital.website;
          hosp_dist.phoneNumber = hospital.phoneNumber;
          hosp_dist.latitude = hospital.latitude;
          hosp_dist.longitude = hospital.longitude;
          hosp_dist.doctors = hospital.doctors;
          hosp_dist.beds = hospital.beds;
          hosp_dist.availability = hospital.availability;
          hosp_dist.totalDoctors = hospital.totalDoctors;
          hosp_dist.enable = hospital.enable;
          hosp_dist.note = hospital.note;
          hosp_dist.date = hospital.date;
          hosp_dist.appointment = hospital.appointment;

          console.log(hosp_dist);
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

//patient appointment
router.get(
  "/hospitals/:id/patient",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    HospitalUser.findOne({ _id: req.params.id })
      .populate("appointment")
      .exec((err, hospital) => {
        if (err) return res.json(err);
        hospital.appointment.appointments.push(req.user);
        hospital.appointment.save();
        hospital.save();
        console.log(hospital);
        res.json(hospital);
      });
  }
);

module.exports = router;
