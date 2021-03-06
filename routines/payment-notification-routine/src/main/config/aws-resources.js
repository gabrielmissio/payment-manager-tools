const AWS = require('aws-sdk');

const { REGION, DYNAMODB_ENDPOINT } = require('./env');

const SNS = new AWS.SNS({
  apiVersion: '2010-03-31',
  region: 'us-east-1'
});

const DYNAMODB = new AWS.DynamoDB({
  endpoint: DYNAMODB_ENDPOINT,
  region: REGION
});

const DYNAMODB_DOCUMENT_CLIENT = new AWS.DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  endpoint: DYNAMODB_ENDPOINT,
  region: REGION
});

module.exports = {
  SNS,
  DYNAMODB,
  DYNAMODB_DOCUMENT_CLIENT
};
