const express = require("express");
const HospitalUser = require("../models/HospitalUser");
const PatientUser = require("../models/PatientUser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../config/keys");
const passport = require("passport");
const router = express.Router();

//degree to radians
const toRadians = (degree) => {
  const one_deg = 22 / (7 * 180);
  return one_deg * degree;
};

//distance calculator fn
const distCalc = (lat1, long1, lat2, long2) => {
  lat1 = toRadians(lat1);
  long1 = toRadians(long1);
  lat2 = toRadians(lat2);
  long2 = toRadians(long2);

  const dlong = long2 - long1;
  const dlat = lat2 - lat1;

  let ans =
    Math.pow(Math.sin(dlat / 2), 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dlong / 2), 2);

  ans = 2 * Math.asin(Math.sqrt(ans));

  const R = 6371;

  ans = ans * R;

  return ans;
};

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
