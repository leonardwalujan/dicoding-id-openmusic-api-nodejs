const CollaborationsHandler = require('./handler');
const routes = require('./routes');

const plugin = {
  name: 'Collaborations Plugin',
  version: '1.0.0',
  register: async (
    server,
    { collaborationService, userService, playlistService, validator },
  ) => {
    const collaborationsHandler = new CollaborationsHandler(
      collaborationService,
      userService,
      playlistService,
      validator,
    );

    server.route(routes(collaborationsHandler));
  },
};

module.exports = plugin;
