const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthenticationError = require('../../exceptions/AuthenticationError');

class UserService {
  constructor() {
    this.pool = new Pool();
  }

  /**
   * Menambahkan user baru.
   * @param {Object} user - Data user.
   * @returns {string} - ID user yang ditambahkan.
   * @throws {InvariantError} - Jika user gagal ditambahkan.
   */
  async addUser({ username, password, fullname }) {
    await this.verifyNewUsername(username);

    const id = `user-${nanoid(16)}`;
    const hashedPassword = await bcrypt.hash(password, 12);

    const query = {
      text: 'INSERT INTO users VALUES($1, $2, $3, $4) RETURNING id',
      values: [id, username, hashedPassword, fullname],
    };

    const { rows, rowCount } = await this.pool.query(query);
    if (!rowCount) {
      throw new InvariantError('User gagal ditambahkan!');
    }

    return rows[0].id;
  }

  /**
   * Mencari user berdasarkan ID.
   * @param {string} userId - ID user.
   * @returns {string} - Username user.
   * @throws {NotFoundError} - Jika user tidak ditemukan.
   */
  async findUserById(userId) {
    const query = {
      text: 'SELECT username FROM users WHERE id = $1',
      values: [userId],
    };

    const { rows, rowCount } = await this.pool.query(query);
    if (!rowCount) {
      throw new NotFoundError('User tidak ditemukan!');
    }

    return rows[0].username;
  }

  /**
   * Memverifikasi keunikan username pada user baru.
   * @param {string} username - Username yang akan diverifikasi.
   * @throws {InvariantError} - Jika username sudah digunakan.
   */
  async verifyNewUsername(username) {
    const query = {
      text: 'SELECT username FROM users WHERE username = $1',
      values: [username],
    };

    const { rowCount } = await this.pool.query(query);
    if (rowCount) {
      throw new InvariantError('Username sudah digunakan!');
    }
  }

  /**
   * Memverifikasi kredensial user saat login.
   * @param {string} username - Username user.
   * @param {string} password - Password user.
   * @returns {string} - ID user.
   * @throws {AuthenticationError} - Jika username atau password salah.
   */
  async verifyUserCredential(username, password) {
    const query = {
      text: 'SELECT id, password FROM users WHERE username = $1',
      values: [username],
    };

    const { rows, rowCount } = await this.pool.query(query);
    if (!rowCount) {
      throw new AuthenticationError('Username yang Anda masukkan salah!');
    }

    const { id, password: hashedPassword } = rows[0];
    const match = await bcrypt.compare(password, hashedPassword);
    if (!match) {
      throw new AuthenticationError('Password yang Anda masukkan salah!');
    }

    return id;
  }
}

module.exports = UserService;
