const { DataHelper } = require('../../utils/helpers');
const { MissingParamError } = require('../../utils/errors');
const { CustomerEntity } = require('../entities');
const { BroadcastRepository, CustomerRepository } = require('../../infra/repositories');
const {
  CustomerStatusEnum: { ACTIVE, LATE_PAYMENT, DEFAULTER, DEFAULTER_NOTIFIED, INACTIVE, LATE_PAYMENT_NOTIFIED },
  NotificationMessageEnum: {
    DOMAIN_NAME,
    LATE_PAYMENT_ALERT,
    DEFAULTER_ALERT,
    DEFAULTER_NOTIFICATION,
    LATE_PAYMENT_NOTIFICATION
  },
  RulesEnum: { LATE_PAYMENT_LIMIT_IN_DAYS, DEFAULTER_LIMIT_IN_DAYS, DEACTIVATION_LIMIT_IN_DAYS }
} = require('../../utils/enums');

const notificationOptions = {
  [LATE_PAYMENT_NOTIFICATION]: `${DOMAIN_NAME}\n\n${LATE_PAYMENT_ALERT}`,
  [DEFAULTER_NOTIFICATION]: `${DOMAIN_NAME}\n\n${DEFAULTER_ALERT}`
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
  const nextStatus = CustomerEntity.getNextStatus(currentStatus);

  const response = await Promise.all([
    BroadcastRepository.sendSMS({ recipient: customer, message: notificationOptions[notification] }),
    updateCustomer({ requestUser: { username: 'payment-notification-routine' }, customerId, status: nextStatus })
  ]);
  return response;
};

const tryToActivateTheCustomer = async (customer) => {
  const customerHasValidPayments = await CustomerEntity.hasValidPayments(customer);
  if (!customerHasValidPayments) return {};

  const updatedCustomer = await updateCustomer({
    requestUser: { username: 'payment-notification-routine' },
    customerId: customer.customerId,
    status: ACTIVE
  });

  return { updatedCustomer };
};

const getEndDate = async (timeInDays) => {
  // TODO: rename function
  const expirationDate = new Date(DataHelper.getCurrentYearMonthDay());
  expirationDate.setDate(expirationDate.getDate() + timeInDays);
  return DataHelper.getDateToISOString(expirationDate);
};

const updateCustomerToTheNextStatus = async (customer) => {
  const nextStatus = CustomerEntity.getNextStatus(customer.status);
  const updatedCustomer = await updateCustomer({
    requestUser: { username: 'payment-notification-routine' },
    customerId: customer.customerId,
    status: nextStatus
  });

  return updatedCustomer;
};

const apllyCustomerUpdateRules = async (customer) => {
  const option = {
    [ACTIVE]: async () => {
      const endDate = getEndDate(LATE_PAYMENT_LIMIT_IN_DAYS);
      const customerHasExpiredPayments = await CustomerEntity.hasExpiredPayments(customer, endDate);
      if (!customerHasExpiredPayments) return {};

      const updatedCustomer = await updateCustomerToTheNextStatus(customer);
      return { updatedCustomer };
    },

    [LATE_PAYMENT]: tryToActivateTheCustomer(customer),

    [LATE_PAYMENT_NOTIFIED]: async () => {
      let { updatedCustomer } = await tryToActivateTheCustomer(customer);
      if (updatedCustomer) return { updatedCustomer };

      const endDate = getEndDate(DEFAULTER_LIMIT_IN_DAYS);
      const customerHasExpiredPayments = await CustomerEntity.hasExpiredPayments(customer, endDate);
      if (customerHasExpiredPayments) return {};

      updatedCustomer = await updateCustomerToTheNextStatus(customer);
      return { updatedCustomer };
    },

    [DEFAULTER]: tryToActivateTheCustomer(customer),

    [DEFAULTER_NOTIFIED]: async () => {
      let { updatedCustomer } = await tryToActivateTheCustomer(customer);
      if (updatedCustomer) return { updatedCustomer };

      const endDate = getEndDate(DEACTIVATION_LIMIT_IN_DAYS);
      const customerHasExpiredPayments = await CustomerEntity.hasExpiredPayments(customer, endDate);
      if (customerHasExpiredPayments) return {};

      updatedCustomer = await updateCustomerToTheNextStatus(customer);
      return { updatedCustomer };
    }
  };

  if (!customer.status) throw new Error('InvalidCustomerUpdateOption');
  return option[customer.status]();
};

const customerUpdateHandler = async () => {
  // find a better name

  const statusFilter = [`status != ${INACTIVE}`];
  const activeCustomers = await CustomerRepository.getCustomers(statusFilter);

  const updatesResponses = await Promise.allSettled(
    activeCustomers.map((customer) => apllyCustomerUpdateRules(customer))
  );
  return updatesResponses;
};

module.exports = {
  updateCustomer,
  getCustomers,
  sendNotification,
  customerUpdateHandler
};
