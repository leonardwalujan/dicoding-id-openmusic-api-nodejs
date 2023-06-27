const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');

class AuthenticationService {
  /**
   * Membuat instance baru dari AuthenticationService.
   */
  constructor() {
    this.pool = new Pool();
  }

  /**
   * Menambahkan refresh token ke database.
   * @param {string} token - Refresh token.
   */
  async addRefreshToken(token) {
    const query = {
      text: 'INSERT INTO authentications VALUES($1)',
      values: [token],
    };

    await this.pool.query(query);
  }

  /**
   * Memverifikasi kevalidan refresh token.
   * @param {string} token - Refresh token.
   * @throws {InvariantError} - Jika refresh token tidak valid.
   */
  async verifyRefreshToken(token) {
    const query = {
      text: 'SELECT token FROM authentications WHERE token = $1',
      values: [token],
    };

    const { rowCount } = await this.pool.query(query);
    if (!rowCount) {
      throw new InvariantError('Refresh token tidak valid!');
    }
  }

  /**
   * Menghapus refresh token dari database.
   * @param {string} token - Refresh token.
   */
  async deleteRefreshToken(token) {
    const query = {
      text: 'DELETE FROM authentications WHERE token = $1',
      values: [token],
    };

    await this.pool.query(query);
  }
}

module.exports = AuthenticationService;
