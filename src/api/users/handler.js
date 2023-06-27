const autoBind = require('auto-bind');

/**
 * Class yang menangani operasi terkait pengguna (user).
 */
class UserHandler {
  /**
   * Membuat instance dari UserHandler.
   * @param {Object} service - Instance dari userService.
   * @param {Object} validator - Instance dari validator.
   */
  constructor(service, validator) {
    this.service = service;
    this.validator = validator;

    autoBind(this);
  }

  /**
   * Menambahkan pengguna baru.
   * @param {Object} request - Objek request.
   * @param {Object} h - Objek response toolkit.
   * @returns {Object} - Objek response.
   */
  async postUserHandler(request, h) {
    const { payload } = request;

    this.validator.validateUserPayload(payload);

    const userId = await this.service.addUser(payload);

    const response = {
      status: 'success',
      message: 'User berhasil ditambahkan',
      data: {
        userId,
      },
    };
    return h.response(response).code(201);
  }
}

module.exports = UserHandler;
