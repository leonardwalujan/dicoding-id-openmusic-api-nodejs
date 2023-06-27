const Joi = require('joi');

const SongPayloadSchema = Joi.object({
  /**
   * Judul lagu.
   */
  title: Joi.string().required(),

  /**
   * Tahun rilis lagu.
   */
  year: Joi.number()
    .integer()
    .min(1970)
    .max(new Date().getFullYear())
    .required(),

  /**
   * Genre lagu.
   */
  genre: Joi.string().required(),

  /**
   * Penyanyi lagu.
   */
  performer: Joi.string().required(),

  /**
   * Durasi lagu dalam satuan detik.
   */
  duration: Joi.number().integer().min(0),

  /**
   * ID album tempat lagu ini termasuk.
   */
  albumId: Joi.string(),
});

module.exports = { SongPayloadSchema };
