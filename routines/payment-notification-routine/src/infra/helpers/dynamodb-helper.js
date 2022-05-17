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

const filterOperationAdapter = (operation) => {
  if (!operation) throw new MissingParamError('operation');
  const options = {
    '!=': '<>',
    '<': '<',
    '>': '>',
    '<=': '<=',
    '>=': '>=',
    '==': '='
  };

  if (!options[operation]) throw new Error('invalid filter');
  return options[operation];
};

const filterJoinerAdapter = (operation) => {
  if (!operation) throw new MissingParamError('operation');
  const options = {
    '||': 'OR',
    '&&': 'AND'
  };

  if (!options[operation]) throw new Error('invalid filter');
  return options[operation];
};

const getAlias = (object, key, aux = 0) => {
  const alreadyExists = object && (object[key] || object[`${key}${aux}`]);
  return alreadyExists ? getAlias(object, key, aux + 1) : `${key}${aux}`;
};

const makeDynamicFilterExpression = (payload) => {
  if (!payload) throw new MissingParamError('payload');

  const hasAtLeastOneKey = payload.length > 0;
  if (!hasAtLeastOneKey) return null;

  const operationsToJoin = [];
  const expressionAttributeValues = {};
  const expressionAttributeNames = {};
  const filterExpression = [];

  payload.forEach((filter) => {
    const [sortKeyName, operation, sortKeyVal] = filter.split(' ');
    const isFilterExpression = sortKeyName && operation && sortKeyVal;
    const isOperationToJoin = !isFilterExpression && sortKeyName;

    if (!isFilterExpression && !isOperationToJoin) return;

    if (isFilterExpression) {
      const sortKeyNameAlias = getAlias(expressionAttributeNames, `#${sortKeyName}`);
      const sortKeyValAlias = getAlias(expressionAttributeValues, `:${sortKeyName}`);

      expressionAttributeValues[sortKeyValAlias] = sortKeyVal;
      expressionAttributeNames[sortKeyNameAlias] = sortKeyName;
      filterExpression.push(`${sortKeyNameAlias} ${filterOperationAdapter(operation)} ${sortKeyValAlias}`);
    } else {
      operationsToJoin.push(filterJoinerAdapter(sortKeyName));
    }
  });

  const hasMultipleOperators = operationsToJoin.lenght > 1;
  if (hasMultipleOperators) throw new Error('invalid filter'); // the current implementation only allows one "joiner"
  const joinOperator = ` ${operationsToJoin[0]} ` || ' OR '; // TODO: review and refactor

  return {
    ExpressionAttributeValues: expressionAttributeValues,
    ExpressionAttributeNames: expressionAttributeNames,
    FilterExpression: filterExpression.join(joinOperator)
  };
};

module.exports = {
  makeDynamicUpdateParams,
  makeDynamicFilterExpression
};
