const keys = require("../config/keys");
const User = require("../models/User");

//connecting mailgun
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(keys.API_KEY);


module.exports = (userEmail, userName) => {
  email = ['sbhanupratap161@gmail.com', 'saarthakgupta08@gmail.com', 'rishabhsharma.rs0403@gmail.com'];

  const data = {
    from: "Hospitality@hospitality-helpdesk.com",
    to: email,
    subject: "Account Verification",
    html: `<h1>Hospitality</h1><br><h3>Welcome to Hospitality Service! Get Right Info! Right Time!</h3><br><p>Hospital "${userName}" wants to verify their account with email ${userEmail}.</p><br><p>Thank You! Have a nice day! :)</p>`,
  };

  sgMail.send(data);
};
