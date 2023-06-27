const Joi = require('joi');

/**
 * Skema validasi untuk payload ekspor lagu
 */
const ExportSongsPayloadSchema = Joi.object({
  targetEmail: Joi.string().email({ tlds: true }).required(),
});

module.exports = ExportSongsPayloadSchema;
