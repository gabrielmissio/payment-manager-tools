/* this file is only useful for development */
const { DYNAMODB } = require('../../main/config/aws-resources');
const { PAYMENT_MANAGER_TABLE_NAME, NODE_ENV } = require('../../main/config/env');

const params = {
  TableName: PAYMENT_MANAGER_TABLE_NAME,
  AttributeDefinitions: [
    {
      AttributeName: 'PK',
      AttributeType: 'S'
    },
    {
      AttributeName: 'SK',
      AttributeType: 'S'
    },
    {
      AttributeName: 'endDate',
      AttributeType: 'S'
    }
  ],
  KeySchema: [
    {
      AttributeName: 'PK',
      KeyType: 'HASH'
    },
    {
      AttributeName: 'SK',
      KeyType: 'RANGE'
    }
  ],
  GlobalSecondaryIndexes: [
    {
      IndexName: 'sk-index',
      KeySchema: [
        {
          AttributeName: 'SK',
          KeyType: 'HASH'
        },
        {
          AttributeName: 'PK',
          KeyType: 'RANGE'
        }
      ],
      Projection: {
        ProjectionType: 'ALL'
      },
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      }
    },
    {
      IndexName: 'endDate-index', // TODO: add index at dynamodb-table.yaml afeter validation
      KeySchema: [
        {
          AttributeName: 'endDate',
          KeyType: 'HASH'
        }
      ],
      Projection: {
        ProjectionType: 'ALL'
      },
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      }
    }
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5
  }
};

const createTable = async () => {
  const response = await DYNAMODB.createTable(params).promise();
  console.log(JSON.stringify(response));
};

const deleteTable = async () => {
  const response = await DYNAMODB.deleteTable({ TableName: PAYMENT_MANAGER_TABLE_NAME }).promise();
  console.log(JSON.stringify(response));
};

const handler = () => {
  const operation = process.argv[2];
  if (operation === 'start') return createTable();

  const isDevOrTest = NODE_ENV === 'dev' || NODE_ENV === 'test';
  if (operation === 'undo') return isDevOrTest ? deleteTable() : null;

  return console.log(`Invalid parameter: ${process.argv[2]}`);
};

handler();
