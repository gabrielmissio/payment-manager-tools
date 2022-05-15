const { ResponseHelper } = require('../helpers');
const { PaymentService } = require('../../domain/services');

const paymentNotificationsHandler = async () => {
  try {
    const paymentUpdatesResponses = await PaymentService.paymentUpdateHandler();
    const paymentNotificationsResponses = await PaymentService.paymentNotificationsHandler();

    const response = { paymentUpdatesResponses, paymentNotificationsResponses };

    return ResponseHelper.ok(response);
  } catch (error) {
    console.error(error);
    return ResponseHelper.exceptionHandler(error);
  }
};

module.exports = {
  paymentNotificationsHandler
};
