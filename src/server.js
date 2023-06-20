require('dotenv').config();

const Hapi = require('@hapi/hapi');

// Album
const albums = require('./api/albums');
const AlbumService = require('./services/postgres/AlbumService');
const AlbumValidator = require('./validator/albums');

// Songs
const songs = require('./api/songs');
const SongService = require('./services/postgres/SongService');
const SongValidator = require('./validator/songs');

// Error Handling
const ClientError = require('./exceptions/ClientError');

/**
 * Fungsi inisialisasi server Hapi.
 */
const init = async () => {
  // Membuat instance AlbumService dan SongService
  const albumService = new AlbumService();
  const songService = new SongService();

  // Membuat server Hapi
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  // Registrasi plugin albums dan songs pada server
  await server.register([
    {
      plugin: albums,
      options: {
        service: albumService,
        validator: AlbumValidator,
      },
    },
    {
      plugin: songs,
      options: {
        service: songService,
        validator: SongValidator,
      },
    },
  ]);

  // Extension untuk menangani response pada event onPreResponse
  server.ext('onPreResponse', (request, h) => {
    const { response } = request;
    if (response instanceof Error) {
      if (response instanceof ClientError) {
        // Jika response merupakan instance dari ClientError, maka memberikan response fail
        return h
          .response({
            status: 'fail',
            message: response.message,
          })
          .code(response.statusCode);
      }
      if (!response.isServer) {
        // Jika response bukan berasal dari server, melanjutkan responsenya
        return h.continue;
      }
      console.log(response.stack);
      // Jika terjadi kegagalan yang tidak diharapkan pada server, memberikan response error
      return h
        .response({
          status: 'error',
          message: 'Terjadi Kegagalan yang tidak diharapkan pada server kami!',
        })
        .code(500);
    }
    // Melanjutkan responsenya
    return h.continue;
  });

  // Memulai server
  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

// Memanggil fungsi inisialisasi server
init();
