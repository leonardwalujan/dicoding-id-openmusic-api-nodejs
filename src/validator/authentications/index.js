const InvariantError = require('../../exceptions/InvariantError');
const {
  PostAuthenticationPayloadSchema,
  PutAuthenticationPayloadSchema,
  DeleteAuthenticationPayloadSchema,
} = require('./schema');

/**
 * Validator untuk autentikasi
 */
const AuthenticationValidator = {
  /**
   * Memvalidasi payload saat membuat autentikasi (POST)
   * @param {Object} payload - Payload autentikasi
   */
  validatePostAuthenticationPayload: (payload) => {
    const { error } = PostAuthenticationPayloadSchema.validate(payload);
    if (error) {
      throw new InvariantError(error.message);
    }
  },

  /**
   * Memvalidasi payload saat memperbarui autentikasi (PUT)
   * @param {Object} payload - Payload autentikasi
   */
  validatePutAuthenticationPayload: (payload) => {
    const { error } = PutAuthenticationPayloadSchema.validate(payload);
    if (error) {
      throw new InvariantError(error.message);
    }
  },

  /**
   * Memvalidasi payload saat menghapus autentikasi (DELETE)
   * @param {Object} payload - Payload autentikasi
   */
  validateDeleteAuthenticationPayload: (payload) => {
    const { error } = DeleteAuthenticationPayloadSchema.validate(payload);
    if (error) {
      throw new InvariantError(error.message);
    }
  },
};

module.exports = AuthenticationValidator;
