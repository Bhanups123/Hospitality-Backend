const keys = require("../config/keys");
const getRandCode = require("./getRandCode");
const User = require("../models/User");

//connecting mailgun
var mailgun = require("mailgun-js")({
  apiKey: keys.API_KEY,
  domain: keys.DOMAIN,
});

module.exports = (email, userType) => {
  const code = getRandCode();

  const data = {
    from: "helpdesk@hospitality.com",
    to: email,
    subject: "Bhool Gayich Password!!",
    html: `<h1>Hospitality!</h1><br><h3>Welcome to Hospitality service!! get right Info! right Time!</h3><br><p>You need to enter below code for reseting your password:</p><br> <b>${code}</b><br><p>Thank You! Apka Din mangal me hoichh!!</p>`,
  };

  mailgun.messages().send(data, (error, body) => {
    console.log(body);
  });

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
