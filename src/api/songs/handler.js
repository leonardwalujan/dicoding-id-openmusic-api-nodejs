const autoBind = require('auto-bind');

/**
 * Class yang menangani operasi terkait lagu.
 */
class SongsHandler {
  /**
   * Membuat instance dari SongsHandler.
   * @param {Object} service - Instance dari songService.
   * @param {Object} validator - Instance dari validator.
   */
  constructor(service, validator) {
    this.service = service;
    this.validator = validator;

    autoBind(this);
  }

  /**
   * Handler untuk permintaan POST pada endpoint /songs.
   * Menambahkan lagu baru.
   * @param {Object} request - Objek permintaan.
   * @param {Object} h - Response toolkit.
   * @returns {Object} - Objek respons.
   */
  async postSongHandler(request, h) {
    const { payload } = request;

    this.validator.validateSongPayload(payload);

    const songId = await this.service.addSong(payload);

    const response = {
      status: 'success',
      data: {
        songId,
      },
    };
    return h.response(response).code(201);
  }

  /**
   * Handler untuk permintaan GET pada endpoint /songs.
   * Mengambil daftar lagu dengan filter opsional berdasarkan judul dan penyanyi.
   * @param {Object} request - Objek permintaan.
   * @returns {Object} - Objek respons.
   */
  async getSongsHandler(request) {
    const { query } = request;
    const { title, performer } = query;

    const songs = await this.service.getSongs(title, performer);
    return {
      status: 'success',
      data: {
        songs,
      },
    };
  }

  /**
   * Handler untuk permintaan GET pada endpoint /songs/{id}.
   * Mengambil detail lagu berdasarkan ID.
   * @param {Object} request - Objek permintaan.
   * @param {Object} h - Response toolkit.
   * @returns {Object} - Objek respons.
   */
  async getSongByIdHandler(request, h) {
    const { params } = request;

    const { song, source } = await this.service.getSongById(params.id);

    const response = {
      status: 'success',
      data: {
        song,
      },
    };
    return h.response(response).header('X-Data-Source', source).code(200);
  }

  /**
   * Handler untuk permintaan PUT pada endpoint /songs/{id}.
   * Mengedit lagu berdasarkan ID.
   * @param {Object} request - Objek permintaan.
   * @returns {Object} - Objek respons.
   */
  async putSongByIdHandler(request) {
    const { params } = request;
    const { payload } = request;

    this.validator.validateSongPayload(payload);

    const { id: songId } = params;
    await this.service.editSongById(songId, payload);

    return {
      status: 'success',
      message: 'Lagu berhasil diperbarui',
    };
  }

  /**
   * Handler untuk permintaan DELETE pada endpoint /songs/{id}.
   * Menghapus lagu berdasarkan ID.
   * @param {Object} request - Objek permintaan.
   * @returns {Object} - Objek respons.
   */
  async deleteSongByIdHandler(request) {
    const { params } = request;

    await this.service.deleteSongById(params.id);

    return {
      status: 'success',
      message: 'Lagu berhasil dihapus',
    };
  }
}

module.exports = SongsHandler;
