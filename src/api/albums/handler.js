const autoBind = require('auto-bind');

class AlbumsHandler {
  /**
   * Membuat instance baru dari kelas `AlbumsHandler`.
   *
   * @param {object} service - Instance dari kelas `AlbumService`
   * untuk melakukan operasi terkait album.
   * @param {object} validator - Instance dari kelas `AlbumValidator` untuk validasi data album.
   */
  constructor(service, validator) {
    this.service = service;
    this.validator = validator;

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
    this.validator.validateAlbumPayload(request.payload);

    const albumId = await this.service.addAlbum(request.payload);

    const response = {
      status: 'success',
      data: {
        albumId,
      },
    };

    return h.response(response).code(201);
  }

  /**
   * Handler untuk mengelola permintaan GET album berdasarkan ID.
   *
   * @param {object} request - Objek request yang diterima dari server.
   * @returns {object} Objek response yang berisi status dan data album yang berhasil ditemukan.
   */
  async getAlbumByIdHandler(request, h) {
    const album = await this.service.getAlbumById(request.params.id);

    const response = {
      status: 'success',
      data: {
        album,
      },
    };

    return h.response(response);
  }

  /**
   * Handler untuk mengelola permintaan PUT album berdasarkan ID.
   *
   * @param {object} request - Objek request yang diterima dari server.
   * @returns {object} Objek response yang berisi status dan pesan berhasil diperbarui.
   */
  async putAlbumByIdHandler(request, h) {
    this.validator.validateAlbumPayload(request.payload);

    const { id: albumId } = request.params;
    await this.service.editAlbumById(albumId, request.payload);

    const response = {
      status: 'success',
      message: 'Album berhasil diperbarui.',
    };

    return h.response(response);
  }

  /**
   * Handler untuk mengelola permintaan DELETE album berdasarkan ID.
   *
   * @param {object} request - Objek request yang diterima dari server.
   * @returns {object} Objek response yang berisi status dan pesan berhasil dihapus.
   */
  async deleteAlbumByIdHandler(request, h) {
    await this.service.deleteAlbumById(request.params.id);

    const response = {
      status: 'success',
      message: 'Album berhasil dihapus.',
    };

    return h.response(response);
  }
}

module.exports = AlbumsHandler;
