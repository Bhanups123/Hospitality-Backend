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
const isEmpty = require("../validation/is-empty");

router.get("/test", (req, res) => {
  res.json({ msg: "Patient route work" });
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

//patient info
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    PatientUser.findOne({ email: req.user.email })
      .then((patient) => {
        let patient_info = patient;

        for (p in patient_info) {
          if (p == "password" || p == "appointments") {
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
      const { name, phoneNumber, address, latitude, longitude } = req.body;

      if (!isEmpty(name)) patient.name = name;
      if (!isEmpty(phoneNumber)) patient.phoneNumber = phoneNumber;
      if (!isEmpty(address)) patient.address = address;
      if (!isEmpty(latitude)) patient.latitude = latitude;
      if (!isEmpty(longitude)) patient.longitude = longitude;

      patient
        .save()
        .then((user_s) =>
          res.json({ success: "true", message: "Info updated successfully." })
        )
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
          hosp_dist.totalBeds = hospital.totalBeds;
          hosp_dist.enable = hospital.enable;
          hosp_dist.note = hospital.note;
          hosp_dist.date = hospital.date;
          hosp_dist.appointments = hospital.appointments;

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
router.post(
  "/hospital/appointment",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { email, note } = req.body;
    if (isEmpty(email))
      return res.status(400).json({ error: "Hospital Email is required" });

    HospitalUser.findOne({ email })
      .populate("appointments")
      .exec((err, hospital) => {
        if (err) return res.json(err);

        PatientUser.findOne({ email: req.user.email }).then((patient) => {
          const newAppointmentPat = { id: hospital, note };
          patient.appointments.push(newAppointmentPat);
          patient.save();
        });

        const newAppointmentHos = { id: req.user, note };
        hospital.appointments.push(newAppointmentHos);
        hospital.save();

        res.json({
          success: "true",
          message: "Appointment drafted successfully.",
        });
      });
  }
);

//patient appointment deletion
router.delete(
  "/appointments/appointment",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    //hospital email
    const { email } = req.body;

    if (isEmpty(email))
      return res.status(400).json({ error: "Hospital Email is required" });

    PatientUser.findOne({ email: req.user.email })
      .populate("appointments.id")
      .exec((err, patient) => {
        const appointment_del_hos = patient.appointments.filter(
          (appointment) => appointment.id.email === email
        );

        if (appointment_del_hos[0].status !== "Pending")
          return res.status(403).json({
            error:
              "Appointment can't be removed, as no longer in Pending status.",
          });

        const ind_hos = patient.appointments.indexOf(appointment_del_hos);

        patient.appointments.splice(ind_hos, 1);
        patient.save();

        HospitalUser.findOne({ email })
          .populate("appointments.id")
          .exec((err, hospital) => {
            if (!hospital)
              return res
                .status(404)
                .json({ notFound: "Hospital with this email not found" });

            const appointment_del_pat = hospital.appointments.filter(
              (patient) => {
                if (!isEmpty(patient.id)) return patient.id.email === email;
              }
            );

            const ind_pat = hospital.appointments.indexOf(appointment_del_pat);

            hospital.appointments.splice(ind_pat, 1);
            hospital.save();

            res.json({
              success: "true",
              message: "Appointment removed successfully.",
            });
          });
      });
  }
);

//patient appointment list
router.get(
  "/appointments",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    PatientUser.findOne({ email: req.user.email })
      .populate("appointments.id")
      .exec((err, patient) => {
        if (err) return res.json(err);

        const appointments = patient.appointments.map((appoint) => {
          let hospital = {};

          hospital.status = appoint.status;
          hospital.date = appoint.date.getTime();
          hospital.note = appoint.note;
          hospital.name = appoint.id.name;
          hospital.email = appoint.id.email;
          hospital.address = appoint.id.address;
          hospital.phoneNumber = appoint.id.phoneNumber;
          hospital.latitude = appoint.id.latitude;
          hospital.longitude = appoint.id.longitude;

          return hospital;
        });

        res.json(appointments);
      });
  }
);

module.exports = router;
