const inputOne = (payload) => {
  const { message, recipient } = payload;
  return { message, recipient: recipient.phone };
};

const outputOne = (payload) => payload;

module.exports = {
  inputOne,
  outputOne
};
