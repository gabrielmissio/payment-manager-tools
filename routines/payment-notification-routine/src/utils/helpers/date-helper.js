const getCurrentDateISOString = () => new Date().toISOString();

const getCurrentYearMonthDay = () => new Date().toISOString().split('T')[0];

const getDateToISOString = (date) => (date ? new Date(date).toISOString().split('T')[0] : getCurrentYearMonthDay());

module.exports = {
  getCurrentDateISOString,
  getCurrentYearMonthDay,
  getDateToISOString
};
