// MongoDB models removed — stubbed module
// Implement PostgreSQL-backed models and replace this file.
module.exports = new Proxy({}, {
  get() {
    return async function () {
      throw new Error('Course model not implemented: MongoDB removed. Migrate to PostgreSQL.');
    };
  },
});
