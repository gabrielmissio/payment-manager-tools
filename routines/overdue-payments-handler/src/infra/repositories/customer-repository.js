const { DYNAMODB_DOCUMENT_CLIENT } = require('../../main/config/aws-resources');
const { PAYMENT_MANAGER_TABLE_NAME } = require('../../main/config/env');
const { MissingParamError } = require('../../utils/errors');
const { CustomerAdapter } = require('../adapters');

const getCustomersByStatus = async (status) => {
  if (!status) throw new MissingParamError('status');

  const parametros = {
    TableName: PAYMENT_MANAGER_TABLE_NAME,
    IndexName: 'sk-index',
    KeyConditionExpression: 'SK = :SK AND begins_with(PK, :PK)',
    ExpressionAttributeNames: { '#status': 'status' },
    ExpressionAttributeValues: { ':SK': 'PROFILE', ':PK': 'CUSTOMER#', ':status': status },
    FilterExpression: '#status = :status' // TODO: make dynamodb filter expression
  };

  const data = await DYNAMODB_DOCUMENT_CLIENT.query(parametros).promise();
  return CustomerAdapter.outputMany(data);
};

module.exports = {
  getCustomersByStatus
};
