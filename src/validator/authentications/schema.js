const Joi = require('joi');

/**
 * Skema validasi untuk payload saat membuat autentikasi (POST)
 */
const PostAuthenticationPayloadSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

/**
 * Skema validasi untuk payload saat memperbarui autentikasi (PUT)
 */
const PutAuthenticationPayloadSchema = Joi.object({
  refreshToken: Joi.required(),
});

/**
 * Skema validasi untuk payload saat menghapus autentikasi (DELETE)
 */
const DeleteAuthenticationPayloadSchema = Joi.object({
  refreshToken: Joi.required(),
});

module.exports = {
  PostAuthenticationPayloadSchema,
  PutAuthenticationPayloadSchema,
  DeleteAuthenticationPayloadSchema,
};
