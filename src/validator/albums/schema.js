const Joi = require('joi');

/**
 * Skema validasi untuk payload saat menambahkan album
 */
const AlbumPayloadSchema = Joi.object({
  name: Joi.string().required(),
  year: Joi.number()
    .integer()
    .min(1970)
    .max(new Date().getFullYear())
    .required(),
});

/**
 * Skema validasi untuk header saat mengunggah cover album
 */
const PostCoverHeadersSchema = Joi.object({
  'content-type': Joi.string()
    .valid(
      'image/avif',
      'image/bmp',
      'image/gif',
      'image/jpeg',
      'image/png',
      'image/tiff',
      'image/webp',
    )
    .required(),
}).unknown();

module.exports = {
  AlbumPayloadSchema,
  PostCoverHeadersSchema,
};
