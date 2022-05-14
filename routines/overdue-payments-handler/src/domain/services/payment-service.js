const { BroadcastRepository, CustomerRepository } = require('../../infra/repositories');
const {
  CustomerStatusEnum: { LATE_PAYMENT },
  NotificationMessageEnum: { LATE_PAYMENT_ALERT }
} = require('../../utils/enums');

const overduePaymentHandler = async () => {
  const customersWithLatePayment = await CustomerRepository.getCustomersByStatus(LATE_PAYMENT);
  const messagesSent = await Promise.allSettled(
    customersWithLatePayment.map((customer) =>
      BroadcastRepository.sendSMS({ recipient: customer, message: LATE_PAYMENT_ALERT })
    )
  );

  return messagesSent;
};

module.exports = {
  overduePaymentHandler
};
