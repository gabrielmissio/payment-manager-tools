const { BroadcastRepository, CustomerRepository } = require('../../infra/repositories');
const {
  CustomerStatusEnum: { DEFAULTER, DEFAULTER_NOTIFIED, INACTIVE, LATE_PAYMENT_NOTIFIED },
  NotificationMessageEnum: {
    DOMAIN_NAME,
    LATE_PAYMENT_ALERT,
    DEFAULTER_ALERT,
    DEFAULTER_NOTIFICATION,
    LATE_PAYMENT_NOTIFICATION
  }
} = require('../../utils/enums');

const notificationOptions = {
  [LATE_PAYMENT_NOTIFICATION]: `${DOMAIN_NAME}\n\n${LATE_PAYMENT_ALERT}`,
  [DEFAULTER_NOTIFICATION]: `${DOMAIN_NAME}\n\n${DEFAULTER_ALERT}`
};

const getNextStatus = (currentStatus) => {
  const statusRule = {
    LATE_PAYMENT: LATE_PAYMENT_NOTIFIED,
    LATE_PAYMENT_NOTIFIED: DEFAULTER,
    DEFAULTER: DEFAULTER_NOTIFIED,
    DEFAULTER_NOTIFIED: INACTIVE,
    INACTIVE
  };

  return statusRule[currentStatus];
};

const sendNotification = async (customer, notification) => {
  const { status: currentStatus, customerId } = customer;
  const nextStatus = getNextStatus(currentStatus);

  const response = await Promise.all([
    BroadcastRepository.sendSMS({ recipient: customer, message: notificationOptions[notification] }),
    CustomerRepository.updateCustomerById({ customerId, status: nextStatus })
  ]);
  return response;
};

module.exports = {
  sendNotification
};
