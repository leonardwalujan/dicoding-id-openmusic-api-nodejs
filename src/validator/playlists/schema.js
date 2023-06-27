const Joi = require('joi');

/**
 * Skema validasi payload untuk membuat playlist baru
 */
const PostPlaylistPayloadSchema = Joi.object({
  name: Joi.string().required(),
});

/**
 * Skema validasi payload untuk menambahkan lagu ke dalam playlist
 */
const PostSongIntoPlaylistSchema = Joi.object({
  songId: Joi.string().required(),
});

/**
 * Skema validasi payload untuk menghapus lagu dari playlist
 */
const DeleteSongFromPlaylistSchema = Joi.object({
  songId: Joi.string().required(),
});

module.exports = {
  PostPlaylistPayloadSchema,
  PostSongIntoPlaylistSchema,
  DeleteSongFromPlaylistSchema,
};
