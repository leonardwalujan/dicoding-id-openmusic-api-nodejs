const { UserPayloadSchema } = require('./schema');
const InvariantError = require('../../exceptions/InvariantError');

const UserValidator = {
  /**
   * Memvalidasi payload pengguna.
   * @param {Object} payload - Payload pengguna yang akan divalidasi.
   * @throws {InvariantError} Jika validasi gagal.
   */
  validateUserPayload: (payload) => {
    const validationResult = UserPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = UserValidator;
