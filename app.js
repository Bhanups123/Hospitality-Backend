const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const passport = require("passport");

const verification = require("./routes/users");
const hospital_users = require("./routes/hospital_users");
const patient_users = require("./routes/patient_users");

const app = express();

mongoose.Promise = global.Promise;

app.use(morgan("dev"));

//body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use((req, res, next) => {
  req.header("Content-Type", "application/json");
  next();
});
//db config
const db = require("./config/keys").mongoURI;

//connect to mongodb
mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => console.log("mongodb is connected succesfully"))
  .catch((err) => console.log(err));

//pasport middleware
app.use(passport.initialize());
require("./config/passport")(passport);

//use routes
app.use("/api/user", verification);
app.use("/api/hospital", hospital_users);
app.use("/api/patient", patient_users);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server is running on port ${port}`));
