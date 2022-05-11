const REGION = process.env.REGION || 'localhost';
const isLocalhost = REGION === 'localhost';

module.exports = {
  REGION,
  NODE_ENV: process.env.NODE_ENV || 'dev',
  DYNAMODB_ENDPOINT: isLocalhost ? 'http://localhost:8000' : null,
  PAYMENT_MANAGER_TABLE_NAME: isLocalhost ? 'payment-manager' : process.env.PAYMENT_MANAGER_TABLE_NAME
};
