const autoBind = require('auto-bind');
const ClientError = require('../../exceptions/ClientError');

class SongsHandler {
  /**
   * Membuat instance baru dari kelas `SongsHandler`.
   *
   * @param {object} service - Instance dari kelas `SongService` untuk melakukan operasi terkait lagu.
   * @param {object} validator - Instance dari kelas `SongValidator` untuk validasi data lagu.
   */
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  /**
   * Handler untuk mengelola permintaan POST lagu baru.
   *
   * @param {object} request - Objek request yang diterima dari server.
   * @param {object} h - Toolkit response dari hapi.js.
   * @returns {object} Objek response yang berisi status dan data lagu yang berhasil ditambahkan.
   */
  async postSongHandler(request, h) {
    try {
      this._validator.validateSongPayload(request.payload);

      const songId = await this._service.addSong(request.payload);

      const response = {
        status: 'success',
        data: {
          songId,
        },
      };

      return h.response(response).code(201);
    } catch (error) {
      if (error instanceof ClientError) {
        // Client Error!
        const response = h.response({
          status: 'fail',
          message: error.message,
        });

        response.code(error.statusCode);
        return response;
      }

      // Server Error!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });

      response.code(500);
      console.error(error);
      return response;
    }
  }

  /**
   * Handler untuk mengelola permintaan GET lagu dengan query parameter.
   *
   * @param {object} request - Objek request yang diterima dari server.
   * @returns {object} Objek response yang berisi status dan data lagu yang berhasil ditemukan.
   */
  async getSongsHandler(request, h) {
    try {
      const { title, performer } = request.query;

      const songs = await this._service.getSongs(title, performer);

      const response = {
        status: 'success',
        data: {
          songs,
        },
      };

      return h.response(response);
    } catch (error) {
      if (error instanceof ClientError) {
        // Client Error!
        const response = h.response({
          status: 'fail',
          message: error.message,
        });

        response.code(error.statusCode);
        return response;
      }

      // Server Error!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });

      response.code(500);
      console.error(error);
      return response;
    }
  }

  /**
   * Handler untuk mengelola permintaan GET lagu berdasarkan ID.
   *
   * @param {object} request - Objek request yang diterima dari server.
   * @returns {object} Objek response yang berisi status dan data lagu yang berhasil ditemukan.
   */
  async getSongByIdHandler(request, h) {
    try {
      const song = await this._service.getSongById(request.params.id);

      const response = {
        status: 'success',
        data: {
          song,
        },
      };

      return h.response(response);
    } catch (error) {
      if (error instanceof ClientError) {
        // Client Error!
        const response = h.response({
          status: 'fail',
          message: error.message,
        });

        response.code(error.statusCode);
        return response;
      }

      // Server Error!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });

      response.code(500);
      console.error(error);
      return response;
    }
  }

  /**
   * Handler untuk mengelola permintaan PUT lagu berdasarkan ID.
   *
   * @param {object} request - Objek request yang diterima dari server.
   * @returns {object} Objek response yang berisi status dan pesan berhasil diperbarui.
   */
  async putSongByIdHandler(request, h) {
    try {
      this._validator.validateSongPayload(request.payload);

      const { id: songId } = request.params;
      await this._service.editSongById(songId, request.payload);

      const response = {
        status: 'success',
        message: 'Lagu berhasil diperbarui.',
      };

      return h.response(response);
    } catch (error) {
      if (error instanceof ClientError) {
        // Client Error!
        const response = h.response({
          status: 'fail',
          message: error.message,
        });

        response.code(error.statusCode);
        return response;
      }

      // Server Error!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });

      response.code(500);
      console.error(error);
      return response;
    }
  }

  /**
   * Handler untuk mengelola permintaan DELETE lagu berdasarkan ID.
   *
   * @param {object} request - Objek request yang diterima dari server.
   * @returns {object} Objek response yang berisi status dan pesan berhasil dihapus.
   */
  async deleteSongByIdHandler(request, h) {
    try {
      await this._service.deleteSongById(request.params.id);

      const response = {
        status: 'success',
        message: 'Lagu berhasil dihapus.',
      };

      return h.response(response);
    } catch (error) {
      // Client Error!
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });

        response.code(error.statusCode);
        return response;
      }

      // Server Error!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });

      response.code(500);
      console.error(error);
      return response;
    }
  }
}

module.exports = SongsHandler;
