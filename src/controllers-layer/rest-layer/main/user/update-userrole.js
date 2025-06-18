const { UpdateUserroleManager } = require("managers");

const AuthRestController = require("../../AuthServiceRestController");

class UpdateUserroleRestController extends AuthRestController {
  constructor(req, res) {
    super("updateUserrole", "updateuserrole", req, res);
    this.dataName = "user";
    this.crudType = "update";
    this.status = 200;
    this.httpMethod = "PATCH";
  }

  createApiManager() {
    return new UpdateUserroleManager(this._req, "rest");
  }
}

const updateUserrole = async (req, res, next) => {
  const updateUserroleRestController = new UpdateUserroleRestController(
    req,
    res,
  );
  try {
    await updateUserroleRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = updateUserrole;
