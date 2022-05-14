class MissingParamError extends Error {
  constructor(paramName) {
    super(`Missing Param Error: ${paramName}`);
    this.name = 'MissingParamError';
  }
}

module.exports = MissingParamError;
