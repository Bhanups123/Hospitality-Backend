//degree to radians
module.exports = (degree) => {
  const one_deg = 22 / (7 * 180);
  return one_deg * degree;
};
