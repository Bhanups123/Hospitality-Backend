const express = require("express");
const HospitalUser = require("../models/HospitalUser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../config/keys");
const passport = require("passport");

const router = express.Router();

//load input validation
const validateRegisterInput = require("../validation/hospital user/register");
const validateLoginInput = require("../validation/login");
const isEmpty = require("../validation/is-empty");

router.get("/test", (req, res) => {
  res.json({ msg: "Hospital route work" });
});

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
      const { name, email, password, latitude, longitude } = req.body;

      let newUser = new HospitalUser({
        name,
        email,
        password,
        latitude,
        longitude,
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
          userType: "hospital",
        }; //create jwt payload

        //jwt sign
        jwt.sign(
          payload,
          keys.secretOrKey,
          { expiresIn: "2d" },
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

//hospital info
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    HospitalUser.findOne({ email: req.user.email })
      .then((hospital) => {
        let hospital_info = hospital;

        for (p in hospital_info) {
          if (p == "password") {
            hospital_info[p] = undefined;
          }
        }
        res.json(hospital_info);
      })
      .catch((err) => res.json(err));
  }
);

//update information
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    HospitalUser.findOne({ email: req.user.email }).then((hospital) => {
      const {
        name,
        beds,
        doctors,
        availability,
        phoneNumber,
        totalDoctors,
        totalBeds,
        note,
        website,
        latitude,
        longitude,
      } = req.body;

      if (!isEmpty(name)) hospital.name = name;
      if (!isEmpty(beds)) hospital.beds = beds;
      if (!isEmpty(doctors)) hospital.doctors = doctors;
      if (!isEmpty(availability)) hospital.availability = availability;
      if (!isEmpty(phoneNumber)) hospital.phoneNumber = phoneNumber;
      if (!isEmpty(totalDoctors)) hospital.totalDoctors = totalDoctors;
      if (!isEmpty(totalBeds)) hospital.totalBeds = totalBeds;
      if (!isEmpty(note)) hospital.note = note;
      if (!isEmpty(website)) hospital.website = website;
      if (!isEmpty(latitude)) hospital.latitude = latitude;
      if (!isEmpty(longitude)) hospital.longitude = longitude;
      hospital
        .save()
        .then((user_s) => res.json({ success: "true" }))
        .catch((err) => res.json(err));
    });
  }
);

//appointment list
router.get(
  "/appointments",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    HospitalUser.findOne({ email: req.user.email })
      .populate("appointment.id")
      .exec((err, hospital) => {
        if (err) return res.json(err);

        const appointments = hospital.appointment.map((appoint) => {
          let patient = {};

          patient.status = appoint.status;
          patient.date = appoint.date.getTime();
          patient.note = appoint.note;
          patient.name = appoint.id.name;
          patient.email = appoint.id.email;
          patient.address = appoint.id.address;
          patient.phoneNumber = appoint.id.phoneNumber;
          patient.latitude = appoint.id.latitude;
          patient.longitude = appoint.id.longitude;

          return patient;
        });

        res.json(appointments);
      });
  }
);

//patient appointment deletion
router.delete(
  "/:id_patient",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    HospitalUser.findOne({ _id: req.user.id })
      .populate("appointment")
      .exec((err, hospital) => {
        let patient_del = hospital.appointment.appointments.filter(
          (patient) => patient._id == req.params.id_patient
        );
        const ind = hospital.appointment.appointments.indexOf(patient_del);

        hospital.appointment.appointments.splice(ind, 1);
        hospital.appointment.save();
        hospital.save();
        res.json(hospital);
      });
  }
);

module.exports = router;
