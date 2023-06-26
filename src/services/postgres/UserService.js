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
   * Menambahkan pengguna baru.
   * @param {Object} userData - Data pengguna yang akan ditambahkan.
   * @param {string} userData.username - Nama pengguna.
   * @param {string} userData.password - Kata sandi pengguna.
   * @param {string} userData.fullname - Nama lengkap pengguna.
   * @returns {string} - ID pengguna yang ditambahkan.
   * @throws {InvariantError} - Jika terjadi kesalahan pada query atau pengguna gagal ditambahkan.
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
      throw new InvariantError('User gagal ditambahkan');
    }

    return rows[0].id;
  }

  /**
   * Mencari pengguna berdasarkan ID.
   * @param {string} userId - ID pengguna yang dicari.
   * @returns {string} - Nama pengguna yang ditemukan.
   * @throws {NotFoundError} - Jika pengguna tidak ditemukan.
   */
  async findUserById(userId) {
    const query = {
      text: 'SELECT username FROM users WHERE id = $1',
      values: [userId],
    };

    const { rows, rowCount } = await this.pool.query(query);

    if (!rowCount) throw new NotFoundError('User tidak ditemukan');

    return rows[0].username;
  }

  /**
   * Memverifikasi apakah username baru sudah digunakan.
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
      throw new InvariantError('Username sudah digunakan.');
    }
  }

  /**
   * Memverifikasi kredensial pengguna.
   * @param {string} username - Username pengguna.
   * @param {string} password - Kata sandi pengguna.
   * @returns {string} - ID pengguna jika kredensial valid.
   * @throws {AuthenticationError} - Jika kredensial tidak valid.
   */
  async verifyUserCredential(username, password) {
    const query = {
      text: 'SELECT id, password FROM users WHERE username = $1',
      values: [username],
    };

    const { rows, rowCount } = await this.pool.query(query);
    if (!rowCount) {
      throw new AuthenticationError('Username yang anda masukkan salah');
    }

    const { id, password: hashedPassword } = rows[0];

    const match = await bcrypt.compare(password, hashedPassword);
    if (!match) {
      throw new AuthenticationError('Password yang anda masukkan salah');
    }

    return id;
  }
}

module.exports = UserService;
