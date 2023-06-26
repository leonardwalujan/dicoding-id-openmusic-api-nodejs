const Jwt = require('@hapi/jwt');
const InvariantError = require('../exceptions/InvariantError');

/**
 * Objek untuk mengelola token JWT.
 */
const TokenManager = {
  /**
   * Membuat access token.
   * @param {Object} payload - Data payload untuk token.
   * @returns {string} - Access token.
   */
  generateAccessToken: (payload) => Jwt.token.generate(payload, process.env.ACCESS_TOKEN_KEY),

  /**
   * Membuat refresh token.
   * @param {Object} payload - Data payload untuk token.
   * @returns {string} - Refresh token.
   */
  generateRefreshToken: (payload) => Jwt.token.generate(payload, process.env.REFRESH_TOKEN_KEY),

  /**
   * Memverifikasi refresh token.
   * @param {string} refreshToken - Refresh token.
   * @returns {Object} - Payload dari refresh token.
   * @throws {InvariantError} - Jika refresh token tidak valid.
   */
  verifyRefreshToken: (refreshToken) => {
    try {
      const artifacts = Jwt.token.decode(refreshToken);
      Jwt.token.verifySignature(artifacts, process.env.REFRESH_TOKEN_KEY);
      const { payload } = artifacts.decoded;
      return payload;
    } catch (error) {
      throw new InvariantError('Refresh token tidak valid');
    }
  },
};

module.exports = TokenManager;
