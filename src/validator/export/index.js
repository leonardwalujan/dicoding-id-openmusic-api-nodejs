const ExportSongsPayloadSchema = require('./schema');
const InvariantError = require('../../exceptions/InvariantError');

/**
 * Validator untuk memvalidasi payload ekspor lagu
 */
const ExportsValidator = {
  validateExportSongsPayload: (payload) => {
    const validationResult = ExportSongsPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = ExportsValidator;
