const inputOne = (payload) => ({
  PK: `CUSTOMER#${payload.customerId}`,
  SK: 'PROFILE',
  ...payload
});

const outputOne = ({ Item, Attributes }) => {
  if (!Item && !Attributes) return null;

  const { PK, SK, ...data } = Item || Attributes;
  return { ...data, customerId: PK.split('#')[1] };
};

const outputMany = (payload) => payload.Items.map((Item) => outputOne({ Item }));

module.exports = {
  inputOne,
  outputOne,
  outputMany
};
