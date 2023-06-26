const autoBind = require('auto-bind');

class AuthenticationsHandler {
  /**
   * Membuat instance dari AuthenticationsHandler.
   * @param {Object} authenticationService - Instance dari authenticationService.
   * @param {Object} userService - Instance dari userService.
   * @param {Object} tokenManager - Instance dari tokenManager.
   * @param {Object} validator - Instance dari validator.
   */
  constructor(authenticationService, userService, tokenManager, validator) {
    this.authenticationService = authenticationService;
    this.userService = userService;
    this.tokenManager = tokenManager;
    this.validator = validator;

    autoBind(this);
  }

  /**
   * Handler untuk permintaan POST pada endpoint /authentication.
   * @param {Object} request - Objek request dari server.
   * @param {Object} h - Objek respons toolkit dari hapi.
   * @returns {Object} - Objek respons HTTP.
   */
  async postAuthenticationHandler(request, h) {
    this.validator.validatePostAuthenticationPayload(request.payload);
    const { username, password } = request.payload;

    const userId = await this.userService.verifyUserCredential(
      username,
      password,
    );

    const accessToken = this.tokenManager.generateAccessToken({ userId });
    const refreshToken = this.tokenManager.generateRefreshToken({ userId });

    await this.authenticationService.addRefreshToken(refreshToken);

    const response = h.response({
      status: 'success',
      message: 'Authentication berhasil ditambahkan',
      data: {
        accessToken,
        refreshToken,
      },
    });
    response.code(201);
    return response;
  }

  /**
   * Handler untuk permintaan PUT pada endpoint /authentication.
   * @param {Object} request - Objek request dari server.
   * @returns {Object} - Objek respons HTTP.
   */
  async putAuthenticationHandler(request) {
    this.validator.validatePutAuthenticationPayload(request.payload);
    const { refreshToken } = request.payload;

    await this.authenticationService.verifyRefreshToken(refreshToken);
    const { userId } = this.tokenManager.verifyRefreshToken(refreshToken);

    const accessToken = this.tokenManager.generateAccessToken({ userId });

    return {
      status: 'success',
      message: 'Access Token berhasil diperbarui',
      data: {
        accessToken,
      },
    };
  }

  /**
   * Handler untuk permintaan DELETE pada endpoint /authentication.
   * @param {Object} request - Objek request dari server.
   * @returns {Object} - Objek respons HTTP.
   */
  async deleteAuthenticationHandler(request) {
    this.validator.validateDeleteAuthenticationPayload(request.payload);

    const { refreshToken } = request.payload;
    await this.authenticationService.verifyRefreshToken(refreshToken);
    await this.authenticationService.deleteRefreshToken(refreshToken);

    return {
      status: 'success',
      message: 'Refresh Token berhasil dihapus',
    };
  }
}

module.exports = AuthenticationsHandler;
