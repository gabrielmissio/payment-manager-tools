const { MissingParamError } = require('../../utils/errors');

const makeDynamicUpdateParams = (payload) => {
  if (!payload) throw new MissingParamError('payload');

  const hasAtLeastOneKey = Object.keys(payload).length > 0;
  if (!hasAtLeastOneKey) return null;

  const expressionAttributeValues = {};
  const expressionAttributeNames = {};
  const updateExpression = [];

  Object.keys(payload).forEach((key) => {
    expressionAttributeValues[`:${key}`] = payload[key];
    expressionAttributeNames[`#${key}`] = key;
    updateExpression.push(`#${key} = :${key}`);
  });

  return {
    ExpressionAttributeValues: expressionAttributeValues,
    ExpressionAttributeNames: expressionAttributeNames,
    UpdateExpression: `SET ${updateExpression.join(', ')}`
  };
};

const makeDynamicFilterExpression = (payload) => {
  if (!payload) throw new MissingParamError('payload');

  const hasAtLeastOneKey = payload.length > 0;
  if (!hasAtLeastOneKey) return null;

  const expressionAttributeValues = {};
  const expressionAttributeNames = {};
  const filterExpression = [];

  payload.forEach((filter) => {
    const [sortKeyName, operation, sortKeyVal] = filter.split(' ');
    expressionAttributeValues[`:${sortKeyName}`] = sortKeyVal;
    expressionAttributeNames[`#${sortKeyName}`] = sortKeyName;
    filterExpression.push(`#${sortKeyName} ${operation} :${sortKeyName}`);
  });

  return {
    ExpressionAttributeValues: expressionAttributeValues,
    ExpressionAttributeNames: expressionAttributeNames,
    FilterExpression: filterExpression.join(' AND') // review
  };
};

module.exports = {
  makeDynamicUpdateParams,
  makeDynamicFilterExpression
};
