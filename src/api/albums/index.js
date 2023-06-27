const AlbumsHandler = require('./handler');
const routes = require('./routes');

const plugin = {
  name: 'Plugin Album',
  version: '1.0.0',
  register: async (server, options) => {
    const { service, likeService, storageService, validator } = options;
    const albumsHandler = new AlbumsHandler(
      service,
      likeService,
      storageService,
      validator,
    );
    server.route(routes(albumsHandler));
  },
};

module.exports = plugin;
