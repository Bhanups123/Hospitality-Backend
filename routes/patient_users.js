const express = require("express");
const HospitalUser = require("../models/HospitalUser");
const PatientUser = require("../models/PatientUser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../config/keys");
const passport = require("passport");
const router = express.Router();

const distCalc = require("../utils/distCalc");

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

//hospital appoint
//private route
// router.get("/hospitals/:hospital");
module.exports = router;
