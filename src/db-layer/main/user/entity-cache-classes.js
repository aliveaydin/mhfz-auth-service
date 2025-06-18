const { EntityCache } = require("common");

class UserEntityCache extends EntityCache {
  constructor() {
    super("user", ["email"]);
  }

  async getUserById(userId) {
    result = await getEntityFromCache(userId);
    return result;
  }

  async getUsers(input) {
    const query = {};

    result = await selectEntityFromCache(query);
    return result;
  }
}

module.exports = {
  UserEntityCache,
};
