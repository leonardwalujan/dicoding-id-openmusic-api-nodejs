const SongsHandler = require('./handler');
const routes = require('./routes');

const plugin = {
  name: 'Plugin Songs',
  version: '1.0.0',
  register: async (server, { service, validator }) => {
    const songsHandler = new SongsHandler(service, validator);
    server.route(routes(songsHandler));
  },
};

module.exports = plugin;
