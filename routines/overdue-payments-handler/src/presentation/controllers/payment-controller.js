const { ResponseHelper } = require('../helpers');
const { PaymentService } = require('../../domain/services');

const overduePaymentHandler = async () => {
  try {
    const response = await PaymentService.overduePaymentHandler();

    return ResponseHelper.ok(response);
  } catch (error) {
    console.error(error);
    return ResponseHelper.exceptionHandler(error);
  }
};

module.exports = {
  overduePaymentHandler
};
