const autoBind = require('auto-bind');

/**
 * Kelas yang menangani operasi terkait kolaborasi.
 */
class CollaborationsHandler {
  /**
   * Membuat instance CollaborationsHandler.
   * @param {collaborationService} collaborationService - Instance dari collaborationService.
   * @param {userService} userService - Instance dari userService.
   * @param {playlistService} playlistService - Instance dari playlistService.
   * @param {validator} validator - Instance dari validator.
   */
  constructor(collaborationService, userService, playlistService, validator) {
    this.collaborationService = collaborationService;
    this.userService = userService;
    this.playlistService = playlistService;
    this.validator = validator;

    autoBind(this);
  }

  /**
   * Menambahkan kolaborasi baru.
   * @param {request} request - Objek request.
   * @param {h} h - Objek response toolkit.
   * @returns {Object} - Objek response sukses.
   */
  async postCollaboration(request, h) {
    const { payload } = request;
    const { auth } = request;

    this.validator.validatePostCollaborationPayload(payload);

    const { playlistId, userId } = payload;
    const { userId: credentialId } = auth.credentials;

    await this.userService.findUserById(userId);
    await this.playlistService.verifyPlaylistOwner(playlistId, credentialId);
    const collaborationId = await this.collaborationService.addCollaboration(
      playlistId,
      userId,
    );

    const response = {
      status: 'success',
      data: {
        collaborationId,
      },
    };
    return h.response(response).code(201);
  }

  /**
   * Menghapus kolaborasi.
   * @param {request} request - Objek request.
   * @returns {Object} - Objek response sukses.
   */
  async deleteCollaboration(request) {
    const { payload } = request;
    const { auth } = request;

    this.validator.validateDeleteCollaborationPayload(payload);

    const { playlistId, userId } = payload;
    const { userId: credentialId } = auth.credentials;

    await this.playlistService.verifyPlaylistOwner(playlistId, credentialId);
    await this.collaborationService.deleteCollaboration(playlistId, userId);

    return {
      status: 'success',
      message: 'Collaborator berhasil dihapus',
    };
  }
}

module.exports = CollaborationsHandler;
