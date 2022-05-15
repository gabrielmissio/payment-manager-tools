const getCurrentDateISOString = () => new Date().toISOString();

const getCurrentYearMonthDay = () => new Date().toISOString().split('T')[0];

module.exports = {
  getCurrentDateISOString,
  getCurrentYearMonthDay
};
