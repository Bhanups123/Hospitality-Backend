const keys = require("../config/keys");
const getRandCode = require("./getRandCode");
const User = require("../models/User");

//connecting mailgun
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(keys.API_KEY);

module.exports = (email, userType) => {
  const code = getRandCode();

  const data = {
    from: "Hospitality@hospitality-helpdesk.com",
    to: email,
    subject: "Forgot Password",
    html: `<h1>Hospitality</h1><br><h3>Welcome to Hospitality Service! Get Right Info! Right Time!</h3><br><p>You need to enter the code below in order to reset your password:</p><br> <b>${code}</b><br><p>Thank You! Have a nice day! :)</p>`,
  };

  sgMail.send(data);

  User.findOne({ email })
    .then((user) => {
      if (!user) {
        User.create({ email, code, userType }).then((user_s) =>
          console.log(user_s)
        );
      } else {
        user.code = code;
        user.save();
      }
    })
    .catch();
};
