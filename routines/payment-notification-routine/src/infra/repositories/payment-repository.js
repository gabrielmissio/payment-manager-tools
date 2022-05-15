const { DYNAMODB_DOCUMENT_CLIENT } = require('../../main/config/aws-resources');
const { PAYMENT_MANAGER_TABLE_NAME } = require('../../main/config/env');
const { MissingParamError } = require('../../utils/errors');
const { DynamodbHelper } = require('../helpers');
const { PaymentAdapter } = require('../adapters');

const getPaymentsByStatus = async (status, filters) => {
  const filterSettings = DynamodbHelper.makeDynamicFilterExpression(filters);
  const parametros = {
    TableName: PAYMENT_MANAGER_TABLE_NAME,
    IndexName: 'status-index',
    KeyConditionExpression: '#status = :status AND begins_with(SK, :payment)',
    FilterExpression: filterSettings.FilterExpression,
    ExpressionAttributeNames: { ...filterSettings.ExpressionAttributeNames, '#status': 'status' },
    ExpressionAttributeValues: {
      ...filterSettings.ExpressionAttributeValues,
      ':status': status,
      ':payment': 'PAYMENT#'
    }
  };

  const data = await DYNAMODB_DOCUMENT_CLIENT.query(parametros).promise();
  return PaymentAdapter.outputMany(data);
};

const getPaymentsByCustomerId = async (payload) => {
  if (!payload) throw new MissingParamError('payload');
  const { PK } = PaymentAdapter.inputOne(payload);

  const parametros = {
    TableName: PAYMENT_MANAGER_TABLE_NAME,
    KeyConditionExpression: 'PK = :PK AND begins_with(SK, :payment)',
    ExpressionAttributeValues: { ':PK': PK, ':payment': 'PAYMENT#' }
    // TODO: make dynamodb filter expression
  };

  const data = await DYNAMODB_DOCUMENT_CLIENT.query(parametros).promise();
  return PaymentAdapter.outputMany(data);
};

const updatePaymentById = async (payload) => {
  if (!payload) throw new MissingParamError('payload');
  const { PK, SK, ...payment } = PaymentAdapter.inputOne(payload);

  const parametros = {
    TableName: PAYMENT_MANAGER_TABLE_NAME,
    Key: { PK, SK },
    ReturnValues: 'ALL_NEW'
  };

  Object.assign(parametros, DynamodbHelper.makeDynamicUpdateParams(payment));
  const data = await DYNAMODB_DOCUMENT_CLIENT.update(parametros).promise();

  return PaymentAdapter.outputOne(data);
};

module.exports = {
  getPaymentsByStatus,
  getPaymentsByCustomerId,
  updatePaymentById
};
