const { SNS } = require('../../main/config/aws-resources');
const { BroadcastAdapter } = require('../adapters');

const sendSMS = async (payload) => {
  const { recipient, message } = BroadcastAdapter.inputOne(payload);

  const params = {
    Message: message,
    PhoneNumber: recipient
  };

  const data = await SNS.publish(params).promise();
  return BroadcastAdapter.outputOne(data);
};

module.exports = {
  sendSMS
};
