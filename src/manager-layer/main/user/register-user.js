const UserManager = require("./UserManager");
const { isValidObjectId, isValidUUID, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");
const { UserRegisterredPublisher } = require("../../route-events/publishers");

const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");
const { dbRegisterUser } = require("dbLayer");

const { getRedisData } = require("common");

class RegisterUserManager extends UserManager {
  constructor(request, controllerType) {
    super(request, {
      name: "registerUser",
      controllerType: controllerType,
      pagination: false,
      crudType: "create",
      loginRequired: false,
      hasShareToken: false,
    });

    this.dataName = "user";
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.avatar = this.avatar;
    jsonObj.socialCode = this.socialCode;
    jsonObj.password = this.password;
    jsonObj.fullname = this.fullname;
    jsonObj.email = this.email;
  }

  readRestParameters(request) {
    this.avatar = request.body?.avatar;
    this.socialCode = request.body?.socialCode;
    this.password = request.body?.password;
    this.fullname = request.body?.fullname;
    this.email = request.body?.email;
    this.id = request.body?.id ?? request.query?.id ?? request.id;
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readGrpcParameters(request) {
    this.avatar = request.inputData.avatar;
    this.socialCode = request.inputData.socialCode;
    this.password = request.inputData.password;
    this.fullname = request.inputData.fullname;
    this.email = request.inputData.email;
    this.id = request.inputData?.id;
    this.requestData = request.inputData;
  }

  async readRedisParameters() {
    this.socialProfile = this.socialCode
      ? await getRedisData(this.socialCode)
      : undefined;
  }

  async transformParameters() {
    try {
      this.avatar =
        this.socialProfile?.avatar ??
        (this.avatar
          ? this.avatar
          : `https://gravatar.com/avatar/${LIB.common.md5(this.email)}?s=200&d=identicon`);
    } catch (err) {
      hexaLogger.error(`Error transforming parameter avatar: ${err.message}`);
      throw new BadRequestError(
        "errMsg_ErrorTransformingParameter",
        "SCRIPT_ERROR",
        {
          parameter: "avatar",
          script:
            "this.socialProfile?.avatar ?? (this.avatar ? this.avatar : `https://gravatar.com/avatar/${LIB.common.md5(this.email)}?s=200&d=identicon`)",
          error: err.message,
        },
      );
    }
    try {
      this.password = this.socialProfile
        ? (this.password ?? LIB.common.randomCode())
        : this.password;
    } catch (err) {
      hexaLogger.error(`Error transforming parameter password: ${err.message}`);
      throw new BadRequestError(
        "errMsg_ErrorTransformingParameter",
        "SCRIPT_ERROR",
        {
          parameter: "password",
          script:
            "this.socialProfile ? this.password ?? LIB.common.randomCode() : this.password",
          error: err.message,
        },
      );
    }
    try {
      this.fullname = this.socialProfile?.fullname ?? this.fullname;
    } catch (err) {
      hexaLogger.error(`Error transforming parameter fullname: ${err.message}`);
      throw new BadRequestError(
        "errMsg_ErrorTransformingParameter",
        "SCRIPT_ERROR",
        {
          parameter: "fullname",
          script: "this.socialProfile?.fullname ?? this.fullname",
          error: err.message,
        },
      );
    }
    try {
      this.email = this.socialProfile?.email ?? this.email;
    } catch (err) {
      hexaLogger.error(`Error transforming parameter email: ${err.message}`);
      throw new BadRequestError(
        "errMsg_ErrorTransformingParameter",
        "SCRIPT_ERROR",
        {
          parameter: "email",
          script: "this.socialProfile?.email ?? this.email",
          error: err.message,
        },
      );
    }
  }

  async setVariables() {}

  checkParameters() {
    if (this.password == null) {
      throw new BadRequestError("errMsg_passwordisRequired");
    }

    if (this.fullname == null) {
      throw new BadRequestError("errMsg_fullnameisRequired");
    }

    if (this.email == null) {
      throw new BadRequestError("errMsg_emailisRequired");
    }
  }

  setOwnership() {
    this.isOwner = false;
    if (!this.session || !this.session.userId) return;

    this.isOwner = this.user?.id === this.session.userId;
  }

  async doBusiness() {
    // Call DbFunction
    // make an awaited call to the dbRegisterUser function to create the user and return the result to the controller
    const user = await dbRegisterUser(this);

    return user;
  }

  async raiseEvent() {
    UserRegisterredPublisher.Publish(this.output, this.session).catch((err) => {
      console.log("Publisher Error in Rest Controller:", err);
    });
  }

  async getDataClause() {
    const { newUUID } = require("common");

    const { hashString } = require("common");

    if (this.id) this.userId = this.id;
    if (!this.userId) this.userId = newUUID(false);

    const dataClause = {
      id: this.userId,
      email: this.email,
      password: hashString(this.password),
      fullname: this.fullname,
      avatar: this.avatar,
      emailVerified: this.socialProfile?.emailVerified ?? false,
      roleId: this.socialProfile?.roleId ?? "user",
    };

    return dataClause;
  }
}

module.exports = RegisterUserManager;
