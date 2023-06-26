const CollaborationsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'Collaborations Plugin',
  version: '1.0.0',
  register: (
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
