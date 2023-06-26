const autoBind = require('auto-bind');

/**
 * Class yang menangani operasi terkait playlist.
 */
class PlaylistsHandler {
  /**
   * Membuat instance dari PlaylistsHandler.
   * @param {Object} service - Instance dari playlistService.
   * @param {Object} validator - Instance dari validator.
   */
  constructor(service, validator) {
    this.service = service;
    this.validator = validator;

    autoBind(this);
  }

  /**
   * Menambahkan playlist baru.
   * @param {Object} request - Objek request.
   * @param {Object} h - Objek response toolkit.
   * @returns {Object} - Objek response.
   */
  async postPlaylistHandler(request, h) {
    const { payload } = request;
    const { auth } = request;

    this.validator.validatePostPlaylistPayload(payload);
    const { name: playlistName } = payload;
    const { userId: owner } = auth.credentials;

    const playlistId = await this.service.addPlaylist(playlistName, owner);

    const response = {
      status: 'success',
      data: {
        playlistId,
      },
    };
    return h.response(response).code(201);
  }

  /**
   * Mengambil daftar playlist milik pengguna.
   * @param {Object} request - Objek request.
   * @returns {Object} - Objek response.
   */
  async getPlaylistsHandler(request) {
    const { auth } = request;
    const { userId: owner } = auth.credentials;

    const playlists = await this.service.getPlaylists(owner);

    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  /**
   * Menghapus playlist berdasarkan ID.
   * @param {Object} request - Objek request.
   * @returns {Object} - Objek response.
   */
  async deletePlaylistByIdHandler(request) {
    const { params } = request;
    const { auth } = request;

    const { id: playlistId } = params;
    const { userId: owner } = auth.credentials;

    await this.service.verifyPlaylistOwner(playlistId, owner);
    await this.service.deletePlaylistById(playlistId);

    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  }

  /**
   * Menambahkan lagu ke dalam playlist.
   * @param {Object} request - Objek request.
   * @param {Object} h - Objek response toolkit.
   * @returns {Object} - Objek response.
   */
  async postSongIntoPlaylistHandler(request, h) {
    const { params } = request;
    const { payload } = request;
    const { auth } = request;

    this.validator.validatePostSongIntoPlaylistPayload(payload);

    const { id: playlistId } = params;
    const { songId } = payload;
    const { userId } = auth.credentials;

    await this.service.verifyPlaylistAccess(playlistId, userId);
    await this.service.addSongToPlaylist(playlistId, songId);

    await this.service.addPlaylistActivity({
      playlistId,
      songId,
      userId,
      action: 'add',
    });

    const response = {
      status: 'success',
      message: 'Lagu berhasil ditambahkan ke playlist',
    };
    return h.response(response).code(201);
  }

  /**
   * Mengambil daftar lagu dari playlist.
   * @param {Object} request - Objek request.
   * @returns {Object} - Objek response.
   */
  async getSongsFromPlaylistHandler(request) {
    const { params } = request;
    const { auth } = request;

    const { id: playlistId } = params;
    const { userId } = auth.credentials;

    await this.service.verifyPlaylistAccess(playlistId, userId);
    const playlist = await this.service.getSongsFromPlaylist(playlistId);

    return {
      status: 'success',
      data: {
        playlist,
      },
    };
  }

  /**
   * Menghapus lagu dari playlist.
   * @param {Object} request - Objek request.
   * @returns {Object} - Objek response.
   */
  async deleteSongFromPlaylistHandler(request) {
    const { params } = request;
    const { payload } = request;
    const { auth } = request;

    this.validator.validateDeleteSongFromPlaylistPayload(payload);

    const { id: playlistId } = params;
    const { songId } = payload;
    const { userId } = auth.credentials;

    await this.service.verifyPlaylistAccess(playlistId, userId);
    await this.service.deleteSongFromPlaylist(playlistId, songId);

    await this.service.addPlaylistActivity({
      playlistId,
      songId,
      userId,
      action: 'delete',
    });

    return {
      status: 'success',
      message: 'Lagu berhasil dihapus dari playlist',
    };
  }

  /**
   * Mengambil aktivitas playlist.
   * @param {Object} request - Objek request.
   * @returns {Object} - Objek response.
   */
  async getPlaylistActivitiesHandler(request) {
    const { params } = request;
    const { auth } = request;

    const { id: playlistId } = params;
    const { userId } = auth.credentials;

    await this.service.verifyPlaylistAccess(playlistId, userId);

    const activities = await this.service.getPlaylistActivities(playlistId);

    return {
      status: 'success',
      data: {
        playlistId,
        activities,
      },
    };
  }
}

module.exports = PlaylistsHandler;
