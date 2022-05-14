const { sendNotification } = require('./customer-service');
const { CustomerRepository } = require('../../infra/repositories');
const {
  CustomerStatusEnum: { LATE_PAYMENT, DEFAULTER },
  NotificationMessageEnum: { DEFAULTER_NOTIFICATION, LATE_PAYMENT_NOTIFICATION }
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

module.exports = {
  paymentNotificationsHandler
};
