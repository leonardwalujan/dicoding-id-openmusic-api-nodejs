require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');

// Import API modules
const albums = require('./api/albums');
const songs = require('./api/songs');
const users = require('./api/users');
const authentications = require('./api/authentications');
const playlists = require('./api/playlists');
const collaborations = require('./api/collaborations');

// Import services
const AlbumService = require('./services/postgres/AlbumService');
const SongService = require('./services/postgres/SongService');
const UserService = require('./services/postgres/UserService');
const AuthenticationService = require('./services/postgres/AuthenticationService');
const CollaborationService = require('./services/postgres/CollaborationService');
const PlaylistService = require('./services/postgres/PlaylistService');

// Import validators
const AlbumValidator = require('./validator/albums');
const SongValidator = require('./validator/songs');
const UserValidator = require('./validator/users');
const AuthenticationsValidator = require('./validator/authentications');
const PlaylistValidator = require('./validator/playlists');
const CollaborationValidator = require('./validator/collaborations');

// Import exceptions
const ClientError = require('./exceptions/ClientError');

// Import token manager
const TokenManager = require('./tokenize/TokenManager');

/**
 * Inisialisasi server Hapi
 */
const init = async () => {
  // Buat instance dari setiap service
  const albumService = new AlbumService();
  const songService = new SongService();
  const userService = new UserService();
  const authenticationService = new AuthenticationService();
  const collaborationService = new CollaborationService();
  const playlistService = new PlaylistService(collaborationService);

  // Buat server Hapi
  const server = Hapi.server({
    host: process.env.HOST,
    port: process.env.PORT,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  /**
   * Extension point untuk menangani respons sebelum dikirimkan ke client
   */
  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof Error) {
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }

      if (!response.isServer) {
        return h.continue;
      }

      const newResponse = h.response({
        status: 'error',
        message: 'Terjadi kegagalan pada server kami',
      });
      newResponse.code(500);
      console.error(`Terjadi kesalahan: ${response.message}`);
      return newResponse;
    }

    return h.continue;
  });

  // Registrasi plugin JWT
  await server.register(Jwt);

  // Konfigurasi strategi autentikasi JWT
  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        userId: artifacts.decoded.payload.userId,
      },
    }),
  });

  // Registrasi plugin API
  await server.register([
    {
      plugin: albums,
      options: { service: albumService, validator: AlbumValidator },
    },
    {
      plugin: songs,
      options: { service: songService, validator: SongValidator },
    },
    {
      plugin: users,
      options: { service: userService, validator: UserValidator },
    },
    {
      plugin: authentications,
      options: {
        userService,
        authenticationService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: playlists,
      options: { service: playlistService, validator: PlaylistValidator },
    },
    {
      plugin: collaborations,
      options: {
        collaborationService,
        userService,
        playlistService,
        validator: CollaborationValidator,
      },
    },
  ]);

  // Start server
  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

// Jalankan fungsi inisialisasi server
init();
