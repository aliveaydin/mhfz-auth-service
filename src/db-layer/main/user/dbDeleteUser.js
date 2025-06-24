const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");

const { User } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const { UserQueryCacheInvalidator } = require("./query-cache-classes");
const { UserEntityCache } = require("./entity-cache-classes");

const { ElasticIndexer } = require("serviceCommon");

const { DBSoftDeleteSequelizeCommand } = require("dbCommand");

class DbDeleteUserCommand extends DBSoftDeleteSequelizeCommand {
  constructor(input) {
    const instanceMode = true;
    super(input, User, instanceMode);
    this.commandName = "dbDeleteUser";
    this.nullResult = false;
    this.objectName = "user";
    this.serviceLabel = "mhfz-auth-service";
    this.dbEvent = "mhfz-auth-service-dbevent-user-deleted";
  }

  loadHookFunctions() {
    super.loadHookFunctions({});
  }

  initOwnership(input) {
    super.initOwnership(input);
  }

  async createQueryCacheInvalidator() {
    this.queryCacheInvalidator = new UserQueryCacheInvalidator();
  }

  createEntityCacher() {
    super.createEntityCacher();
  }

  async indexDataToElastic() {
    const elasticIndexer = new ElasticIndexer(
      "user",
      this.session,
      this.requestId,
    );
    await elasticIndexer.deleteData(this.dbData.id);
  }

  async transposeResult() {
    // transpose dbData
  }
}

const dbDeleteUser = async (input) => {
  input.id = input.userId;
  const dbDeleteCommand = new DbDeleteUserCommand(input);
  return dbDeleteCommand.execute();
};

module.exports = dbDeleteUser;
