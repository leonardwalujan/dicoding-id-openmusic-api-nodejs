const autoBind = require('auto-bind');

/**
 * Kelas CollaborationsHandler mengelola permintaan terkait kolaborasi playlist.
 */
class CollaborationsHandler {
  /**
   * Membuat instance CollaborationsHandler.
   *
   * @param {CollaborationService} collaborationService - Instance CollaborationService.
   * @param {UserService} userService - Instance UserService.
   * @param {PlaylistsService} playlistsService - Instance PlaylistsService.
   * @param {Validator} validator - Instance Validator.
   */
  constructor(collaborationService, userService, playlistsService, validator) {
    this.collaborationService = collaborationService;
    this.userService = userService;
    this.playlistsService = playlistsService;
    this.validator = validator;

    autoBind(this);
  }

  /**
   * Menambahkan kolaborator ke playlist.
   *
   * @param {Object} request - Objek permintaan.
   * @param {Object} h - Response toolkit.
   * @returns {Object} - Objek respons.
   */
  async postCollaboration(request, h) {
    this.validator.validatePostCollaborationPayload(request.payload);

    const { playlistId, userId } = request.payload;
    const { userId: credentialId } = request.auth.credentials;

    await this.userService.findUserById(userId);
    await this.playlistsService.verifyPlaylistOwner(playlistId, credentialId);
    const collaborationId = await this.collaborationService.addCollaboration(
      playlistId,
      userId,
    );

    const response = h.response({
      status: 'success',
      data: {
        collaborationId,
      },
    });
    response.code(201);
    return response;
  }

  /**
   * Menghapus kolaborator dari playlist.
   *
   * @param {Object} request - Objek permintaan.
   * @param {Object} auth - Informasi otentikasi.
   * @returns {Object} - Objek respons.
   */
  async deleteCollaboration(request, h) {
    this.validator.validateDeleteCollaborationPayload(request.payload);

    const { playlistId, userId } = request.payload;
    const { userId: credentialId } = request.auth.credentials;

    await this.playlistsService.verifyPlaylistOwner(playlistId, credentialId);
    await this.collaborationService.deleteCollaboration(playlistId, userId);

    const response = h.response({
      status: 'success',
      message: 'Collaborator berhasil dihapus',
    });
    response.code(200);
    return response;
  }
}

module.exports = CollaborationsHandler;
