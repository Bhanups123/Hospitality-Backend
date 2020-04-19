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
    from: "sbhanupratap161@gmail.com",
    to: email,
    subject: "Account Verification!!",
    text: `You need to verify your account by entering this code: ${code}`,
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
