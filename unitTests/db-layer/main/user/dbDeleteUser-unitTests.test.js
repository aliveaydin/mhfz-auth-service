const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

//these tests will work when DbDeleteUserCommand is exported from main code

describe("DbDeleteUserCommand", () => {
  let DbDeleteUserCommand, dbDeleteUser;
  let sandbox, UserStub, getUserByIdStub, ElasticIndexerStub, BaseCommandStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    UserStub = {};

    getUserByIdStub = sandbox.stub();

    ElasticIndexerStub = sandbox.stub().returns({
      deleteData: sandbox.stub().resolves(),
    });

    BaseCommandStub = class {
      constructor(input, model, instanceMode) {
        this.input = input;
        this.session = input.session;
        this.requestId = input.requestId;
        this.dataClause = input.dataClause || {};
        this.dbData = { id: input.userId || 123 };
        this.dbInstance = null;
      }

      loadHookFunctions() {}
      initOwnership() {}
      async execute() {
        await this.createQueryCacheInvalidator?.();
        await this.createDbInstance?.();
        await this.indexDataToElastic?.();
        return this.dbData;
      }
    };

    ({ DbDeleteUserCommand, dbDeleteUser } = proxyquire(
      "../../../../src/db-layer/main/user/dbDeleteUser",
      {
        models: { User: UserStub },
        "./query-cache-classes": {
          UserQueryCacheInvalidator: sandbox.stub(),
        },
        "./utils/getUserById": getUserByIdStub,
        serviceCommon: { ElasticIndexer: ElasticIndexerStub },
        dbCommand: {
          DBSoftDeleteSequelizeCommand: BaseCommandStub,
        },
        common: {
          NotFoundError: class NotFoundError extends Error {
            constructor(msg) {
              super(msg);
              this.name = "NotFoundError";
            }
          },
          HttpServerError: class extends Error {
            constructor(msg, details) {
              super(msg);
              this.details = details;
            }
          },
        },
      },
    ));
  });

  afterEach(() => sandbox.restore());

  describe("constructor", () => {
    it("should set command metadata correctly", () => {
      const cmd = new DbDeleteUserCommand({});
      expect(cmd.commandName).to.equal("dbDeleteUser");
      expect(cmd.objectName).to.equal("user");
      expect(cmd.serviceLabel).to.equal("mhfz-auth-service");
      expect(cmd.dbEvent).to.equal("mhfz-auth-service-dbevent-user-deleted");
    });
  });

  describe("indexDataToElastic", () => {
    it("should call ElasticIndexer.deleteData with dbData.id", async () => {
      const cmd = new DbDeleteUserCommand({
        session: "sess",
        requestId: "req-1",
      });
      cmd.dbData = { id: 42 };

      await cmd.indexDataToElastic();

      sinon.assert.calledOnce(ElasticIndexerStub);
      sinon.assert.calledWith(ElasticIndexerStub().deleteData, 42);
    });
  });

  describe("dbDeleteUser", () => {
    it("should execute deletion command successfully", async () => {
      const mockInstance = { id: 10 };
      getUserByIdStub.resolves(mockInstance);

      const input = {
        userId: 10,
        session: "s",
        requestId: "r",
      };

      const result = await dbDeleteUser(input);

      expect(result).to.deep.equal({ id: 10 });
    });
  });
  ////syncJoins() tests will be added here
});
