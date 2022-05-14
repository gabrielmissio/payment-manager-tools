const { InternalServerError } = require('../../utils/errors');

const ok = (data) => ({ data, code: 200 });

const exceptionHandler = (error) => ({
  code: error.code || 500,
  data: { error: error.description || new InternalServerError().message }
});

module.exports = {
  ok,
  exceptionHandler
};
