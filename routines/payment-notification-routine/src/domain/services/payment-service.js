const { sendNotification } = require('./customer-service');
const { CustomerRepository, PaymentRepository } = require('../../infra/repositories');
const { DataHelper } = require('../../utils/helpers');
const { MissingParamError } = require('../../utils/errors');
const {
  CustomerStatusEnum: { LATE_PAYMENT, DEFAULTER },
  NotificationMessageEnum: { DEFAULTER_NOTIFICATION, LATE_PAYMENT_NOTIFICATION },
  PaymentStatusEnum: { VALID, EXHAUSTED }
} = require('../../utils/enums');

const getCustomersToNotify = async () => {
  const data = [
    CustomerRepository.getCustomersByStatus(LATE_PAYMENT),
    CustomerRepository.getCustomersByStatus(DEFAULTER)
  ];

  const [customersWithLatePayment, defaulterCustomers] = await Promise.all(data);
  return { customersWithLatePayment, defaulterCustomers };
};

const paymentNotificationsHandler = async () => {
  const { customersWithLatePayment, defaulterCustomers } = await getCustomersToNotify();
  const messagesSent = await Promise.allSettled(
    customersWithLatePayment.map((customer) => sendNotification(customer, LATE_PAYMENT_NOTIFICATION)),
    defaulterCustomers.map((customer) => sendNotification(customer, DEFAULTER_NOTIFICATION))
  );

  return messagesSent;
};

const updatePayment = async ({ requestUser, ...payload }) => {
  if (!requestUser) throw new MissingParamError('requestUser');
  if (!payload) throw new MissingParamError('payload');

  const currentDate = DataHelper.getCurrentDateISOString();
  const dataForUpdate = { ...payload, updatedAt: currentDate, lastUpdateBy: requestUser.username };

  const customer = await PaymentRepository.updatePaymentById(dataForUpdate);
  return customer;
};

const paymentUpdateHandler = async () => {
  const dateFilter = [`endDate <= ${DataHelper.getCurrentYearMonthDay()}`];
  const exhaustedPayments = await PaymentRepository.getPaymentsByStatus(VALID, dateFilter);

  const updatesResponses = await Promise.allSettled(
    exhaustedPayments.map((payment) => {
      const { customerId, paymentId } = payment;
      const requestUser = { username: 'payment-notification-routine' };

      return updatePayment({ requestUser, customerId, paymentId, status: EXHAUSTED });
    })
  );

  return updatesResponses;
};

module.exports = {
  paymentNotificationsHandler,
  paymentUpdateHandler
};
