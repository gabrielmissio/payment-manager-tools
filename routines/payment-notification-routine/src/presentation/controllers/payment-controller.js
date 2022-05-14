const { ResponseHelper } = require('../helpers');
const { PaymentService } = require('../../domain/services');

const paymentNotificationsHandler = async () => {
  try {
    const response = await PaymentService.paymentNotificationsHandler();

    return ResponseHelper.ok(response);
  } catch (error) {
    console.error(error);
    return ResponseHelper.exceptionHandler(error);
  }
};

module.exports = {
  paymentNotificationsHandler
};
