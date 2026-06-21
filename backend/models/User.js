// MongoDB models removed — stubbed module
// Replace with PostgreSQL model implementation (e.g., using `pg`, `sequelize`, or `knex`).
module.exports = new Proxy({}, {
  get() {
    return async function () {
      throw new Error('User model not implemented: MongoDB removed. Migrate to PostgreSQL.');
    };
  },
});