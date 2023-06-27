const ExportHandler = require('./handler');
const routes = require('./routes');

const plugin = {
  name: 'Export Plugin',
  version: '1.0.0',
  register: async (server, { service, validator, playlistService }) => {
    const exportHandler = new ExportHandler(
      service,
      validator,
      playlistService,
    );
    server.route(routes(exportHandler));
  },
};

module.exports = plugin;
