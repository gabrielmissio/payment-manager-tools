const { DYNAMODB_DOCUMENT_CLIENT } = require('../../main/config/aws-resources');
const { PAYMENT_MANAGER_TABLE_NAME, NODE_ENV } = require('../../main/config/env');

const items = [
  {
    PK: 'PLAN',
    SK: '001',
    description: '2X PER WEEK',
    value: 100,
    createdBy: 'admin',
    lastUpdateBy: 'admin',
    createdAt: '2022-05-10T20:36:59.632Z',
    updatedAt: '2022-05-10T20:36:59.632Z',
    status: 'ACTIVE'
  },
  {
    PK: 'PLAN',
    SK: '002',
    description: '5X PER WEEK',
    value: 200,
    createdBy: 'admin',
    lastUpdateBy: 'admin',
    createdAt: '2022-05-10T20:37:59.632Z',
    updatedAt: '2022-05-10T20:37:59.632Z',
    status: 'ACTIVE'
  },
  {
    PK: 'CUSTOMER#001',
    SK: 'PROFILE',
    name: 'John Smith',
    cpf: '05939246060',
    email: 'john@main.com',
    createdBy: 'admin',
    lastUpdateBy: 'admin',
    createdAt: '2022-05-10T20:36:59.632Z',
    updatedAt: '2022-05-10T20:36:59.632Z',
    status: 'ACTIVE'
  },
  {
    PK: 'CUSTOMER#001',
    SK: 'PAYMENT#2022-05-11T10:36:20.632Z',
    paymentType: 'CASH',
    plan: {
      description: '2X PER WEEK',
      value: 100,
      createdBy: 'admin',
      lastUpdateBy: 'admin',
      createdAt: '2022-05-1T20:36:59.632Z',
      updatedAt: '2022-05-10T20:36:59.632Z',
      status: 'ACTIVE'
    },
    startDate: 'john@main.com',
    endDate: 'john@main.com',
    createdBy: 'admin',
    lastUpdateBy: 'admin',
    createdAt: '2022-05-11T10:36:20.632Z',
    updatedAt: '2022-05-11T10:36:20.632Z',
    status: 'ACTIVE'
  }
];

const putItems = () => {
  items.forEach(async (item) => {
    await DYNAMODB_DOCUMENT_CLIENT.put({
      TableName: PAYMENT_MANAGER_TABLE_NAME,
      Item: item
    }).promise();

    console.log(`created item ${JSON.stringify(item)}`);
  });
};

const deleteItems = () => {
  items.forEach(async (item) => {
    await DYNAMODB_DOCUMENT_CLIENT.delete({
      TableName: PAYMENT_MANAGER_TABLE_NAME,
      Key: {
        PK: item.PK,
        SK: item.SK
      }
    }).promise();

    console.log(`deleted item ${JSON.stringify(item)}`);
  });
};

const handler = () => {
  const operation = process.argv[2];
  const isProd = NODE_ENV === 'prod';

  if (operation === 'start') return !isProd ? putItems() : null;
  if (operation === 'undo') return !isProd ? deleteItems() : null;

  return console.log(`Invalid parameter: ${process.argv[2]}`);
};

handler();
