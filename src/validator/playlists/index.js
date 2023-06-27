const {
  PostPlaylistPayloadSchema,
  PostSongIntoPlaylistSchema,
  DeleteSongFromPlaylistSchema,
} = require('./schema');

const InvariantError = require('../../exceptions/InvariantError');

/**
 * Validator untuk validasi playlist
 */
const PlaylistsValidator = {
  /**
   * Memvalidasi payload untuk membuat playlist baru
   * @param {Object} payload - Payload untuk membuat playlist
   */
  validatePostPlaylistPayload: (payload) => {
    const validationResult = PostPlaylistPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },

  /**
   * Memvalidasi payload untuk menambahkan lagu ke dalam playlist
   * @param {Object} payload - Payload untuk menambahkan lagu ke dalam playlist
   */
  validatePostSongIntoPlaylistPayload: (payload) => {
    const validationResult = PostSongIntoPlaylistSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },

  /**
   * Memvalidasi payload untuk menghapus lagu dari playlist
   * @param {Object} payload - Payload untuk menghapus lagu dari playlist
   */
  validateDeleteSongFromPlaylistPayload: (payload) => {
    const validationResult = DeleteSongFromPlaylistSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = PlaylistsValidator;
