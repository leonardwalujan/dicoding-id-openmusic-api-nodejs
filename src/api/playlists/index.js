const PlaylistsHandler = require('./handler');
const routes = require('./routes');

const plugin = {
  name: 'Playlists Plugin',
  version: '1.0.0',
  register: (server, { service, validator }) => {
    const playlistsHandler = new PlaylistsHandler(service, validator);
    server.route(routes(playlistsHandler));
  },
};

module.exports = plugin;
