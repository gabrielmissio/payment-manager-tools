const inputOne = (payload) => ({
  PK: `CUSTOMER#${payload.customerId}`,
  SK: `PAYMENT#${payload.paymentId}`,
  ...payload
});

const outputOne = ({ Item, Attributes }) => {
  if (!Item && !Attributes) return null;

  const { PK, SK, ...data } = Item || Attributes;
  return { ...data, paymentId: SK.split('#')[1], customerId: PK.split('#')[1] };
};

const outputMany = (payload) => payload.Items.map((Item) => outputOne({ Item }));

module.exports = {
  inputOne,
  outputOne,
  outputMany
};
