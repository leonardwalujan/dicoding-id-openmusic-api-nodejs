const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class SongService {
  constructor(cacheService) {
    this.pool = new Pool();
    this.cacheService = cacheService;
  }

  /**
   * Menambahkan lagu baru.
   * @param {Object} payload - Data lagu.
   * @returns {string} - ID lagu yang ditambahkan.
   * @throws {InvariantError} - Jika lagu gagal ditambahkan.
   */
  async addSong(payload) {
    const id = `song-${nanoid(12)}`;
    const {
      title,
      year,
      performer,
      genre,
      duration = null,
      albumId = null,
    } = payload;

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, year, performer, genre, duration, albumId],
    };

    const { rows, rowCount } = await this.pool.query(query);
    if (!rowCount) {
      throw new InvariantError('Gagal menambahkan lagu!');
    }

    return rows[0].id;
  }

  /**
   * Mengambil daftar lagu berdasarkan judul dan penyanyi.
   * @param {string} title - Judul lagu.
   * @param {string} performer - Penyanyi lagu.
   * @returns {Array} - Daftar lagu yang sesuai dengan kriteria pencarian.
   */
  async getSongs(title = '', performer = '') {
    const query = {
      text: `SELECT id, title, performer FROM songs 
        WHERE title ILIKE $1 AND performer ILIKE $2`,
      values: [`%${title}%`, `%${performer}%`],
    };

    const { rows } = await this.pool.query(query);
    return rows;
  }

  /**
   * Mengambil informasi lagu berdasarkan ID.
   * @param {string} id - ID lagu.
   * @returns {Object} - Informasi lagu beserta sumber data.
   * @throws {NotFoundError} - Jika lagu tidak ditemukan.
   */
  async getSongById(id) {
    try {
      const result = await this.cacheService.get(`song:${id}`);
      const song = JSON.parse(result);
      return { song, source: 'cache' };
    } catch (error) {
      const query = {
        text: 'SELECT * FROM songs WHERE id=$1',
        values: [id],
      };

      const { rows, rowCount } = await this.pool.query(query);
      if (!rowCount) {
        throw new NotFoundError('Lagu tidak ditemukan!');
      }

      await this.cacheService.set(`song:${id}`, JSON.stringify(rows[0]));
      return { song: rows[0], source: 'dbserver' };
    }
  }

  /**
   * Mengedit informasi lagu berdasarkan ID.
   * @param {string} id - ID lagu.
   * @param {Object} payload - Data lagu yang akan diedit.
   * @throws {NotFoundError} - Jika lagu tidak ditemukan.
   */
  async editSongById(id, payload) {
    const { title, year, performer, genre, duration, albumId } = payload;

    const query = {
      text: `UPDATE songs 
        SET title=$1, year=$2, performer=$3, genre=$4, duration=$5, album_id=$6
        WHERE id = $7 RETURNING id`,
      values: [title, year, performer, genre, duration, albumId, id],
    };

    const { rowCount } = await this.pool.query(query);
    if (!rowCount) {
      throw new NotFoundError('Gagal memperbarui lagu, id tidak ditemukan!');
    }

    await this.cacheService.delete(`song:${id}`);
  }

  /**
   * Menghapus lagu berdasarkan ID.
   * @param {string} id - ID lagu.
   * @throws {NotFoundError} - Jika lagu tidak ditemukan.
   */
  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };

    const { rowCount } = await this.pool.query(query);
    if (!rowCount) {
      throw new NotFoundError('Lagu gagal dihapus, id tidak ditemukan!');
    }

    await this.cacheService.delete(`song:${id}`);
  }
}

module.exports = SongService;
