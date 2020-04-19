const express = require("express");
const router = express.Router();
const keys = require("../config/keys");
const getRandCode = require("../utils/getRandCode");

//connecting mailgun
var mailgun = require("mailgun-js")({
  apiKey: keys.API_KEY,
  domain: keys.DOMAIN,
});

router.post("/verification/sent", (req, res) => {
  const { email } = req.body;

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

  res.json({
    success: "true",
    message: `Confirmation code has been sent to ${email}`,
  });
});

router.post("/verification/done", (req, res) => {
  const { code } = req.query;
});

module.exports = router;
