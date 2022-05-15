const { DataHelper } = require('../../utils/helpers');
const { MissingParamError } = require('../../utils/errors');
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

const updateCustomer = async ({ requestUser, cpf, ...payload }) => {
  if (!requestUser) throw new MissingParamError('requestUser');
  if (!payload) throw new MissingParamError('payload');

  const currentDate = DataHelper.getCurrentDateISOString();
  const dataForUpdate = { ...payload, updatedAt: currentDate, lastUpdateBy: requestUser.username };

  const customer = await CustomerRepository.updateCustomerById(dataForUpdate);
  return customer;
};

const getCustomers = async (filters) => {
  const customers = await CustomerRepository.getCustomers(filters);
  return customers;
};

const sendNotification = async (customer, notification) => {
  const { status: currentStatus, customerId } = customer;
  const nextStatus = getNextStatus(currentStatus);

  const response = await Promise.all([
    BroadcastRepository.sendSMS({ recipient: customer, message: notificationOptions[notification] }),
    updateCustomer({ requestUser: { username: 'payment-notification-routine' }, customerId, status: nextStatus })
  ]);
  return response;
};

module.exports = {
  updateCustomer,
  getCustomers,
  sendNotification
};
