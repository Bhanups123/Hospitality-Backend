const express = require("express");
const HospitalUser = require("../models/HospitalUser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../config/keys");
const passport = require("passport");

const router = express.Router();

const sendVerifyCode = require("../utils/sendVerifyCode");

//load input validation
const validateRegisterInput = require("../validation/register");
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
      const {
        name,
        email,
        password,
        latitude,
        longitude,
        phoneNumber,
      } = req.body;

      //sending verification code to user email
      sendVerifyCode(email, "Hospital");

      let newUser = new HospitalUser({
        name,
        email,
        password,
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

        //if user have not verified its account
        if (!hospital.enable)
          return res
            .status(401)
            .json({ error: "You need to verify your account first" });

      	//if user have not verified its hospital
        // if (!hospital.verified)
        //   return res
        //     .status(401)
        //     .json({ error: "Your hospital is not verified yet!!" });

		//creating jwt payload
        const payload = {
          id: hospital.id,
          name: hospital.name,
          email: hospital.email,
          userType: "hospital",
        };

        //jwt signature
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
        errors.password = "Incorrect password!";
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
          if (p == "password" || p == "appointments") {
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
        .then((user_s) =>
          res.json({ success: "true", message: "Info updated successfully." })
        )
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
      .populate("appointments.id")
      .exec((err, hospital) => {
        if (err) return res.json(err);

        const appointments = hospital.appointments.map((appoint) => {
          let patient = {};

          patient.status = appoint.status;
          patient.date = appoint.date;
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

//Appointment confirmation
router.post(
  "/appointments/appointment",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    //confirmation = { "accepted", "rejected" }
    //patient's email
    const { confirmation, email, date } = req.body;

    PatientUser.findOne({ email: email })
      .populate("appointments.id")
      .exec((err, patient) => {
        const appointment_pat = patient.appointments.filter((appointment) => {
          return (
            appointment.id.email === req.user.email && appointment.date == date
          );
        });
        const ind_hos = patient.appointments.indexOf(appointment_pat[0]);
        console.log(confirmation);
        patient.appointments[ind_hos].status = confirmation;

        patient.save();
        console.log(patient);

        HospitalUser.findOne({ email: req.user.email })
          .populate("appointments.id")
          .exec((err, hospital) => {
            const appointment_hos = hospital.appointments.filter((patient) => {
              if (!isEmpty(patient.id))
                return patient.id.email === email && patient.date == date;
            });

            const ind_pat = hospital.appointments.indexOf(appointment_hos[0]);

            hospital.appointments[ind_pat].status = confirmation;
            hospital.save();

            res.json({
              success: "true",
              message: "Appointment confirmation handled successfully.",
            });
          });
      });
  }
);

module.exports = router;
