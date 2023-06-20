const autoBind = require('auto-bind');
const ClientError = require('../../exceptions/ClientError');

/**
 * Kelas `AlbumsHandler` merupakan handler untuk mengelola endpoint-endpoint yang berhubungan dengan album.
 */
class AlbumsHandler {
  /**
   * Membuat instance baru dari kelas `AlbumsHandler`.
   *
   * @param {object} service - Instance dari kelas `AlbumService` untuk melakukan operasi terkait album.
   * @param {object} validator - Instance dari kelas `AlbumValidator` untuk validasi data album.
   */
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  /**
   * Handler untuk mengelola permintaan POST album baru.
   *
   * @param {object} request - Objek request yang diterima dari server.
   * @param {object} h - Toolkit response dari hapi.js.
   * @returns {object} Objek response yang berisi status dan data album yang berhasil ditambahkan.
   */
  async postAlbumHandler(request, h) {
    try {
      // Validasi payload album
      this._validator.validateAlbumPayload(request.payload);

      // Menambahkan album
      const albumId = await this._service.addAlbum(request.payload);

      const response = {
        status: 'success',
        data: {
          albumId,
        },
      };
      return h.response(response).code(201);
    } catch (error) {
      if (error instanceof ClientError) {
        // Tangani kesalahan yang disebabkan oleh klien
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Tangani kesalahan yang disebabkan oleh server
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  /**
   * Handler untuk mengelola permintaan GET album berdasarkan ID.
   *
   * @param {object} request - Objek request yang diterima dari server.
   * @returns {object} Objek response yang berisi status dan data album yang berhasil ditemukan.
   */
  async getAlbumByIdHandler(request, h) {
    try {
      // Mendapatkan album berdasarkan ID
      const album = await this._service.getAlbumById(request.params.id);

      const response = {
        status: 'success',
        data: {
          album,
        },
      };
      return h.response(response);
    } catch (error) {
      if (error instanceof ClientError) {
        // Tangani kesalahan yang disebabkan oleh klien
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Tangani kesalahan yang disebabkan oleh server
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
   * Handler untuk mengelola permintaan PUT album berdasarkan ID.
   *
   * @param {object} request - Objek request yang diterima dari server.
   * @returns {object} Objek response yang berisi status dan pesan berhasil diperbarui.
   */
  async putAlbumByIdHandler(request, h) {
    try {
      // Validasi payload album
      this._validator.validateAlbumPayload(request.payload);

      const { id: albumId } = request.params;
      // Mengedit album berdasarkan ID
      await this._service.editAlbumById(albumId, request.payload);

      const response = {
        status: 'success',
        message: 'Album berhasil diperbarui.',
      };
      return h.response(response);
    } catch (error) {
      if (error instanceof ClientError) {
        // Tangani kesalahan yang disebabkan oleh klien
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Tangani kesalahan yang disebabkan oleh server
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
   * Handler untuk mengelola permintaan DELETE album berdasarkan ID.
   *
   * @param {object} request - Objek request yang diterima dari server.
   * @returns {object} Objek response yang berisi status dan pesan berhasil dihapus.
   */
  async deleteAlbumByIdHandler(request, h) {
    try {
      // Menghapus album berdasarkan ID
      await this._service.deleteAlbumById(request.params.id);

      const response = {
        status: 'success',
        message: 'Album berhasil dihapus.',
      };
      return h.response(response);
    } catch (error) {
      if (error instanceof ClientError) {
        // Tangani kesalahan yang disebabkan oleh klien
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Tangani kesalahan yang disebabkan oleh server
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

module.exports = AlbumsHandler;
