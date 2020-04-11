const express = require("express");
const User = require("../models/HospitalUser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../config/keys");
const passport = require("passport");

const router = express.Router();

//load input validation
const validateRegisterInput = require("../validation/hospital user/register");
const validateLoginInput = require("../validation/login");

//register route
router.post("/register", (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  User.findOne({ email: req.body.email }).then((user) => {
    if (user) {
      errors.email = "email already exist";
      return res.status(400).json(errors);
    } else {
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        availability: req.body.availability,
        contact: req.body.contact,
      });
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then((user) => res.json(user))
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

  User.findOne({ email: req.body.email }).then((user) => {
    //checking for user
    if (!user) {
      errors.email = "user not found";
      return res.status(404).json(errors);
    }

    //check password
    bcrypt.compare(req.body.password, user.password).then((isMatch) => {
      if (isMatch) {
        //user matched
        const payload = {
          id: user.id,
          name: user.name,
          email: user.email,
          latitude: user.latitude,
          longitude: user.longitude,
          availability: user.availability,
          contact: user.contact,
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
    User.findOne({ email: req.user.email }).then((user) => {
      user.availability = req.body.availability;
      user
        .save()
        .then((user_s) => res.json({ success: "true" }))
        .catch((err) => res.json(err));
    });
  }
);

module.exports = router;
