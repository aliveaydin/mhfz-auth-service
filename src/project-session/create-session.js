module.exports = {
  createSession: () => {
    const SessionManager = require("./mhfz-login-session");
    return new SessionManager();
  },
};
