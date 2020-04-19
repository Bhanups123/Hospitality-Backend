module.exports = () => {
  //6 digit code required, therefore, range = 1000000 - 100000 = 900000
  return Math.floor(Math.random() * (1000000 - 100000) + 100000);
};
