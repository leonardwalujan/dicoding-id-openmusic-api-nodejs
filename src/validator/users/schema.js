const Joi = require('joi');

const UserPayloadSchema = Joi.object({
  /**
   * Nama pengguna.
   * @type {string}
   * @required
   * @max 50 karakter
   */
  username: Joi.string().max(50).required(),

  /**
   * Kata sandi pengguna.
   * @type {string}
   * @required
   */
  password: Joi.string().required(),

  /**
   * Nama lengkap pengguna.
   * @type {string}
   * @required
   * @max 50 karakter
   */
  fullname: Joi.string().max(50).required(),
});

module.exports = { UserPayloadSchema };
