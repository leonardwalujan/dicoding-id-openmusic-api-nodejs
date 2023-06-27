const InvariantError = require('../../exceptions/InvariantError');
const { AlbumPayloadSchema, PostCoverHeadersSchema } = require('./schema');

/**
 * Validator untuk data album.
 */
const AlbumsValidator = {
  /**
   * Memvalidasi payload album.
   * @param {object} payload - Payload album.
   */
  validateAlbumPayload(payload) {
    const { error } = AlbumPayloadSchema.validate(payload);
    if (error) {
      throw new InvariantError(error.message);
    }
  },

  /**
   * Memvalidasi header saat mengunggah cover album.
   * @param {object} headers - Header permintaan.
   */
  validateCoverHeaders(headers) {
    const { error } = PostCoverHeadersSchema.validate(headers);
    if (error) {
      throw new InvariantError(error.message);
    }
  },
};

module.exports = AlbumsValidator;
