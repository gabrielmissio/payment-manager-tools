const { ResponseHelper } = require('../helpers');
const { CustomerService, PaymentService } = require('../../domain/services');

const paymentNotificationsHandler = async () => {
  try {
    const paymentUpdatesResponses = await PaymentService.paymentUpdateHandler();
    const customerUpdatesResponses = await CustomerService.customerUpdateHandler();
    const paymentNotificationsResponses = await PaymentService.paymentNotificationsHandler();

    const response = { paymentUpdatesResponses, customerUpdatesResponses, paymentNotificationsResponses };

    return ResponseHelper.ok(response);
  } catch (error) {
    console.error(error);
    return ResponseHelper.exceptionHandler(error);
  }
};

module.exports = {
  paymentNotificationsHandler
};
