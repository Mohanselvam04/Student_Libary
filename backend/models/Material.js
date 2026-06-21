// MongoDB models removed — stubbed module
module.exports = new Proxy({}, {
  get() {
    return async function () {
      throw new Error('Material model not implemented: MongoDB removed. Migrate to PostgreSQL.');
    };
  },
});
