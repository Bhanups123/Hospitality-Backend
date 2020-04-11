const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const mongoose = require("mongoose");
const HospitalUser = mongoose.model("HospitalUser");
const PatientUser = mongoose.model("PatientUser");
const keys = require("./keys");

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = keys.secretOrKey;

module.exports = (passport) => {
  passport.use(
    new JwtStrategy(opts, (jwt_payload, done) => {
      // console.log(jwt_payload);
      if (jwt_payload.userType === "hospital") {
        HospitalUser.findById(jwt_payload.id)
          .then((hospital) => {
            if (hospital) {
              return done(null, hospital);
            }
            return done(null, false);
          })
          .catch((err) => console.log(err));
      } else {
        PatientUser.findById(jwt_payload.id)
          .then((patient) => {
            if (patient) {
              return done(null, patient);
            }
            return done(null, false);
          })
          .catch((err) => console.log(err));
      }
    })
  );
};
