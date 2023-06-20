const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

/**
 * Service yang bertanggung jawab untuk operasi terkait lagu.
 */
class SongService {
  /**
   * Membuat instance baru dari kelas `SongService`.
   */
  constructor() {
    this._pool = new Pool();
  }

  /**
   * Menambahkan lagu baru ke database.
   * @param {object} payload - Informasi lagu yang akan ditambahkan.
   * @param {string} payload.title - Judul lagu.
   * @param {number} payload.year - Tahun lagu.
   * @param {string} payload.performer - Penyanyi lagu.
   * @param {string} payload.genre - Genre lagu.
   * @param {number} [payload.duration] - Durasi lagu.
   * @param {string} [payload.albumId] - ID album tempat lagu ini termasuk.
   * @returns {string} ID lagu yang berhasil ditambahkan.
   * @throws {InvariantError} Jika gagal menambahkan lagu.
   */
  async addSong(payload) {
    const id = `song-${nanoid(12)}`;
    const { title, year, performer, genre, duration = null, albumId = null } = payload;

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, year, performer, genre, duration, albumId],
    };

    const { rows, rowCount } = await this._pool.query(query);
    if (!rowCount) {
      throw new InvariantError('Lagu gagal ditambahkan');
    }

    return rows[0].id;
  }

  /**
   * Mengambil daftar lagu berdasarkan judul dan/atau penyanyi.
   * @param {string} [title] - Judul lagu yang akan dicari.
   * @param {string} [performer] - Penyanyi lagu yang akan dicari.
   * @returns {Array} Daftar lagu yang ditemukan.
   */
  async getSongs(title = '', performer = '') {
    const query = {
      text: 'SELECT id, title, performer FROM songs WHERE title ILIKE $1 AND performer ILIKE $2',
      values: [`%${title}%`, `%${performer}%`],
    };

    const { rows } = await this._pool.query(query);

    return rows;
  }

  /**
   * Mengambil data lagu berdasarkan ID.
   * @param {string} id - ID lagu yang akan dicari.
   * @returns {object} Data lagu yang ditemukan.
   * @throws {NotFoundError} Jika lagu tidak ditemukan.
   */
  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };

    const { rows, rowCount } = await this._pool.query(query);
    if (!rowCount) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }

    return rows[0];
  }

  /**
   * Mengedit data lagu berdasarkan ID.
   * @param {string} id - ID lagu yang akan diedit.
   * @param {object} payload - Data yang akan diubah pada lagu.
   * @param {string} payload.title - Judul lagu.
   * @param {number} payload.year - Tahun lagu.
   * @param {string} payload.performer - Penyanyi lagu.
   * @param {string} payload.genre - Genre lagu.
   * @param {number} payload.duration - Durasi lagu.
   * @param {string} payload.albumId - ID album tempat lagu ini termasuk.
   * @throws {NotFoundError} Jika lagu tidak ditemukan.
   */
  async editSongById(id, payload) {
    const { title, year, performer, genre, duration, albumId } = payload;

    const query = {
      text: 'UPDATE songs SET title=$1, year=$2, performer=$3, genre=$4, duration=$5, album_id=$6 WHERE id = $7 RETURNING id',
      values: [title, year, performer, genre, duration, albumId, id],
    };

    const { rowCount } = await this._pool.query(query);
    if (!rowCount) {
      throw new NotFoundError('Gagal memperbarui lagu, ID tidak ditemukan');
    }
  }

  /**
   * Menghapus data lagu berdasarkan ID.
   * @param {string} id - ID lagu yang akan dihapus.
   * @throws {NotFoundError} Jika lagu tidak ditemukan.
   */
  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };

    const { rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('Gagal menghapus lagu, ID tidak ditemukan');
    }
  }
}

module.exports = SongService;
