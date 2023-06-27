const AuthenticationsHandler = require('./handler');
const routes = require('./routes');

const plugin = {
  name: 'Authentication Plugin',
  version: '1.0.0',
  register: async (
    server,
    { userService, authenticationService, tokenManager, validator },
  ) => {
    const authenticationsHandler = new AuthenticationsHandler(
      authenticationService,
      userService,
      tokenManager,
      validator,
    );

    server.route(routes(authenticationsHandler));
  },
};

module.exports = plugin;
