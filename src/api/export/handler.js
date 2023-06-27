const autoBind = require('auto-bind');

class ExportHandler {
  constructor(service, validator, playlistService) {
    this.service = service;
    this.validator = validator;
    this.playlistService = playlistService;

    autoBind(this);
  }

  /**
   * Handler untuk permintaan POST pada endpoint /exports/{playlistId}/songs.
   *
   * @param {Object} request - Objek permintaan.
   * @param {Object} h - Response toolkit.
   * @returns {Object} - Objek respons.
   */
  async postExportSongsHandler(request, h) {
    this.validator.validateExportSongsPayload(request.payload);
    const { playlistId } = request.params;
    const { targetEmail } = request.payload;
    const { userId } = request.auth.credentials;

    await this.playlistService.verifyPlaylistAccess(playlistId, userId);

    const message = {
      playlistId,
      targetEmail,
    };

    await this.service.sendMessage('export:songs', JSON.stringify(message));

    const response = h.response({
      status: 'success',
      message: 'Permintaan Anda sedang kami proses',
    });
    response.code(201);
    return response;
  }
}

module.exports = ExportHandler;
