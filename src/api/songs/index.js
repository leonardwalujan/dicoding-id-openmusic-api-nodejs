const SongsHandler = require('./handler');
const routes = require('./routes');

const plugin = {
  name: 'Songs Plugin',
  version: '1.0.0',
  register: async (server, options) => {
    const { service, validator } = options;
    const songsHandler = new SongsHandler(service, validator);
    server.route(routes(songsHandler));
  },
};

module.exports = plugin;
