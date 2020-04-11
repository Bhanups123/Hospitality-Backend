const express = require("express");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../config/keys");
const passport = require("passport");

const router = express.Router();

//load input validation
const validateRegisterInput = require("../validation/register");
const validateLoginInput = require("../validation/login");

router.get("/test", (req, res) => res.json({ msg: "user work" }));

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
        lattitude: req.body.lattitude,
        longitude: req.body.longitude,
        availability: req.body.availability,
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
          lattitude: user.lattitude,
          longitude: user.longitude,
          availability: user.availability,
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

//current user
//private route

router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({
      name: req.user.name,
      email: req.user.email,
      lattitude: user.lattitude,
      longitude: user.longitude,
      availability: req.user.availability,
    });
  }
);

module.exports = router;

//update route
router.post(
  "/hospital",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    User.findById({ id: req.user.id }).then((user) => {
      user.availability = req.availability;
      user
        .save()
        .then((user_s) => res.json(user_s))
        .err((err) => res.json(err));
    });
  }
);

//patient get route
// router.get();
