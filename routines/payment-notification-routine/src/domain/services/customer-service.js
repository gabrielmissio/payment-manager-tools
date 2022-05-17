const { DataHelper } = require('../../utils/helpers');
const { MissingParamError } = require('../../utils/errors');
const { BroadcastRepository, CustomerRepository, PaymentRepository } = require('../../infra/repositories');
const {
  CustomerStatusEnum: { ACTIVE, LATE_PAYMENT, DEFAULTER, DEFAULTER_NOTIFIED, INACTIVE, LATE_PAYMENT_NOTIFIED },
  NotificationMessageEnum: {
    DOMAIN_NAME,
    LATE_PAYMENT_ALERT,
    DEFAULTER_ALERT,
    DEFAULTER_NOTIFICATION,
    LATE_PAYMENT_NOTIFICATION
  },
  PaymentStatusEnum: { VALID },
  RulesEnum: { LATE_PAYMENT_LIMIT_IN_DAYS, DEFAULTER_LIMIT_IN_DAYS, DEACTIVATION_LIMIT_IN_DAYS }
} = require('../../utils/enums');

const notificationOptions = {
  [LATE_PAYMENT_NOTIFICATION]: `${DOMAIN_NAME}\n\n${LATE_PAYMENT_ALERT}`,
  [DEFAULTER_NOTIFICATION]: `${DOMAIN_NAME}\n\n${DEFAULTER_ALERT}`
};

const getNextStatus = (currentStatus) => {
  const statusRule = {
    [ACTIVE]: LATE_PAYMENT,
    [LATE_PAYMENT]: LATE_PAYMENT_NOTIFIED,
    [LATE_PAYMENT_NOTIFIED]: DEFAULTER,
    [DEFAULTER]: DEFAULTER_NOTIFIED,
    [DEFAULTER_NOTIFIED]: INACTIVE,
    [INACTIVE]: INACTIVE
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

const getPaymentsByCustomerId = async (customerId, filters) => {
  const payments = await PaymentRepository.getPaymentsByCustomerId({ customerId }, filters);

  // TODO: implement pagination
  return payments;
};

const apllyCustomerUpdateRules = async (customer) => {
  const option = {
    [ACTIVE]: async () => {
      const { customerId } = customer;

      const statusEqualToValidFilter = [`status == ${VALID}`];
      const validPayments = await getPaymentsByCustomerId(customerId, statusEqualToValidFilter);
      if (validPayments.length > 0) return {};

      const expirationDate = new Date(DataHelper.getCurrentYearMonthDay());
      expirationDate.setDate(expirationDate.getDate() + LATE_PAYMENT_LIMIT_IN_DAYS);
      const filterDate = DataHelper.getDateToISOString(expirationDate);

      const expiredPaymentFilter = [`status != ${VALID}`, '&&', `endDate <= ${filterDate}`];
      const expiredPayments = await getPaymentsByCustomerId(customerId, expiredPaymentFilter);
      if (expiredPayments.length > 0) return {};

      const nextStatus = getNextStatus(customer.status);
      const updatedCustomer = await updateCustomer({
        requestUser: { username: 'payment-notification-routine' },
        customerId,
        status: nextStatus
      });

      return { updatedCustomer };
    },

    [LATE_PAYMENT]: async () => {
      const { customerId } = customer;

      const statusEqualToValidFilter = [`status == ${VALID}`];
      const validPayments = await getPaymentsByCustomerId(customerId, statusEqualToValidFilter);
      if (validPayments.length < 1) return {};

      const updatedCustomer = await updateCustomer({
        requestUser: { username: 'payment-notification-routine' },
        customerId,
        status: ACTIVE
      });

      return { updatedCustomer };
    },

    [LATE_PAYMENT_NOTIFIED]: async () => {
      const { customerId } = customer;

      const statusEqualToValidFilter = [`status == ${VALID}`];
      const validPayments = await getPaymentsByCustomerId(customerId, statusEqualToValidFilter);
      if (validPayments.length > 0) return {};

      const expirationDate = new Date(DataHelper.getCurrentYearMonthDay());
      expirationDate.setDate(expirationDate.getDate() + DEFAULTER_LIMIT_IN_DAYS);
      const filterDate = DataHelper.getDateToISOString(expirationDate);

      const expiredPaymentFilter = [`status != ${VALID}`, '&&', `endDate <= ${filterDate}`];
      const expiredPayments = await getPaymentsByCustomerId(customerId, expiredPaymentFilter);
      if (expiredPayments.length > 0) return {};

      const updatedCustomer = await updateCustomer({
        requestUser: { username: 'payment-notification-routine' },
        customerId,
        status: DEFAULTER
      });

      return { updatedCustomer };
    },

    [DEFAULTER]: async () => {
      const { customerId } = customer;

      const statusEqualToValidFilter = [`status == ${VALID}`];
      const validPayments = await getPaymentsByCustomerId(customerId, statusEqualToValidFilter);
      if (validPayments.length < 1) return {};

      const updatedCustomer = await updateCustomer({
        requestUser: { username: 'payment-notification-routine' },
        customerId,
        status: ACTIVE
      });

      return { updatedCustomer };
    },

    [DEFAULTER_NOTIFIED]: async () => {
      const { customerId } = customer;

      const statusEqualToValidFilter = [`status == ${VALID}`];
      const validPayments = await getPaymentsByCustomerId(customerId, statusEqualToValidFilter);
      if (validPayments.length > 0) return {};

      const expirationDate = new Date(DataHelper.getCurrentYearMonthDay());
      expirationDate.setDate(expirationDate.getDate() + DEACTIVATION_LIMIT_IN_DAYS);
      const filterDate = DataHelper.getDateToISOString(expirationDate);

      const expiredPaymentFilter = [`status != ${VALID}`, '&&', `endDate <= ${filterDate}`];
      const expiredPayments = await getPaymentsByCustomerId(customerId, expiredPaymentFilter);
      if (expiredPayments.length > 0) return {};

      const updatedCustomer = await updateCustomer({
        requestUser: { username: 'payment-notification-routine' },
        customerId,
        status: INACTIVE
      });

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
