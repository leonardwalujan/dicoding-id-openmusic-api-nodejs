const autoBind = require('auto-bind');

class SongsHandler {
  /**
   * Membuat instance baru dari kelas `SongsHandler`.
   *
   * @param {object} service - Instance dari kelas `SongService`
   * untuk melakukan operasi terkait lagu.
   * @param {object} validator - Instance dari kelas `SongValidator` untuk validasi data lagu.
   */
  constructor(service, validator) {
    this.service = service;
    this.validator = validator;

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
    this.validator.validateSongPayload(request.payload);

    const songId = await this.service.addSong(request.payload);

    const response = {
      status: 'success',
      data: {
        songId,
      },
    };

    return h.response(response).code(201);
  }

  /**
   * Handler untuk mengelola permintaan GET lagu dengan query parameter.
   *
   * @param {object} request - Objek request yang diterima dari server.
   * @returns {object} Objek response yang berisi status dan data lagu yang berhasil ditemukan.
   */
  async getSongsHandler(request, h) {
    const { title, performer } = request.query;

    const songs = await this.service.getSongs(title, performer);

    const response = {
      status: 'success',
      data: {
        songs,
      },
    };

    return h.response(response);
  }

  /**
   * Handler untuk mengelola permintaan GET lagu berdasarkan ID.
   *
   * @param {object} request - Objek request yang diterima dari server.
   * @returns {object} Objek response yang berisi status dan data lagu yang berhasil ditemukan.
   */
  async getSongByIdHandler(request, h) {
    const song = await this.service.getSongById(request.params.id);

    const response = {
      status: 'success',
      data: {
        song,
      },
    };

    return h.response(response);
  }

  /**
   * Handler untuk mengelola permintaan PUT lagu berdasarkan ID.
   *
   * @param {object} request - Objek request yang diterima dari server.
   * @returns {object} Objek response yang berisi status dan pesan berhasil diperbarui.
   */
  async putSongByIdHandler(request, h) {
    this.validator.validateSongPayload(request.payload);

    const { id: songId } = request.params;
    await this.service.editSongById(songId, request.payload);

    const response = {
      status: 'success',
      message: 'Lagu berhasil diperbarui.',
    };

    return h.response(response);
  }

  /**
   * Handler untuk mengelola permintaan DELETE lagu berdasarkan ID.
   *
   * @param {object} request - Objek request yang diterima dari server.
   * @returns {object} Objek response yang berisi status dan pesan berhasil dihapus.
   */
  async deleteSongByIdHandler(request, h) {
    await this.service.deleteSongById(request.params.id);

    const response = {
      status: 'success',
      message: 'Lagu berhasil dihapus.',
    };

    return h.response(response);
  }
}

module.exports = SongsHandler;
