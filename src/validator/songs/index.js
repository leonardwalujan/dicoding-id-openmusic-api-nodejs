const InvariantError = require('../../exceptions/InvariantError');
const { SongPayloadSchema } = require('./schema');

/**
 * Validator lagu untuk memvalidasi payload lagu.
 */
const SongsValidator = {
  /**
   * Memvalidasi payload lagu.
   * @param {Object} payload - Payload lagu.
   * @throws {InvariantError} - Jika validasi gagal.
   */
  validateSongPayload: (payload) => {
    const validationResult = SongPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = SongsValidator;
