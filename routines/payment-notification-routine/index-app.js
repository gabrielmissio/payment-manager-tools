const { PaymentController } = require('./src/presentation/controllers');

module.exports.handler = () => PaymentController.paymentNotificationsHandler();
