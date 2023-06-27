const {
  PostCollaborationsPayloadSchema,
  DeleteCollaborationsPayloadSchema,
} = require('./schema');
const InvariantError = require('../../exceptions/InvariantError');

/**
 * Validator untuk kolaborasi pada album musik
 */
const CollaborationsValidator = {
  /**
   * Memvalidasi payload saat menambahkan kolaborasi pada album
   * @param {Object} payload - Payload kolaborasi
   * @throws {InvariantError} - Jika validasi gagal
   */
  validatePostCollaborationPayload: (payload) => {
    const validationResult = PostCollaborationsPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },

  /**
   * Memvalidasi payload saat menghapus kolaborasi pada album
   * @param {Object} payload - Payload kolaborasi
   * @throws {InvariantError} - Jika validasi gagal
   */
  validateDeleteCollaborationPayload: (payload) => {
    const validationResult = DeleteCollaborationsPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = CollaborationsValidator;
