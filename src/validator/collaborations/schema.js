const Joi = require('joi');

/**
 * Skema validasi payload saat menambahkan kolaborasi pada playlist
 */
const PostCollaborationsPayloadSchema = Joi.object({
  playlistId: Joi.string().required(),
  userId: Joi.string().required(),
});

/**
 * Skema validasi payload saat menghapus kolaborasi dari playlist
 */
const DeleteCollaborationsPayloadSchema = Joi.object({
  playlistId: Joi.string().required(),
  userId: Joi.string().required(),
});

module.exports = {
  PostCollaborationsPayloadSchema,
  DeleteCollaborationsPayloadSchema,
};
