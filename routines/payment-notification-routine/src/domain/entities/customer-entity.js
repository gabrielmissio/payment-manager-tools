const { PaymentRepository } = require('../../infra/repositories');
const {
  CustomerStatusEnum: { ACTIVE, LATE_PAYMENT, DEFAULTER, DEFAULTER_NOTIFIED, INACTIVE, LATE_PAYMENT_NOTIFIED },
  PaymentStatusEnum: { VALID }
} = require('../../utils/enums');

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

const hasValidPayments = async (customer) => {
  const statusEqualToValidFilter = [`status == ${VALID}`];
  const validPayments = await PaymentRepository.getPaymentsByCustomerId(
    { customerId: customer.customerId },
    statusEqualToValidFilter
  );

  return validPayments.length > 0;
};

const hasExpiredPayments = async (customer, endDate) => {
  const cutomerHasValidPayments = await hasValidPayments(customer);
  if (cutomerHasValidPayments) return false;

  const expiredPaymentFilter = [`status != ${VALID}`, '&&', `endDate <= ${endDate}`];
  const expiredPayments = await PaymentRepository.getPaymentsByCustomerId(
    { customerId: customer.customerId },
    expiredPaymentFilter
  );

  return expiredPayments.length > 0;
};

module.exports = {
  getNextStatus,
  hasValidPayments,
  hasExpiredPayments
};
