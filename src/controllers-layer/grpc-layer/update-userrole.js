const { UpdateUserroleManager } = require("managers");
const AuthServiceGrpcController = require("./AuthServiceGrpcController");
const { status } = require("@grpc/grpc-js");

class UpdateUserroleGrpcController extends AuthServiceGrpcController {
  constructor(call, callback) {
    super("updateUserrole", "updateuserrole", call, callback);
    this.crudType = "update";
    this.dataName = "user";
    this.responseFormat = "dataItem";
    this.responseType = "single";
  }

  async createApiManager() {
    return new UpdateUserroleManager(this.request, "grpc");
  }
}

const updateUserrole = async (call, callback) => {
  try {
    const controller = new UpdateUserroleGrpcController(call, callback);
    await controller.processRequest();
  } catch (error) {
    const grpcError = {
      code: error.grpcStatus || status.INTERNAL,
      message:
        error.message || "An error occurred while processing the request.",
    };

    callback(grpcError);
  }
};

module.exports = updateUserrole;
