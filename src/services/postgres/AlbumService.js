const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapDBToModel } = require('../../utils');

class AlbumService {
  /**
   * Membuat instance baru dari AlbumService.
   */
  constructor() {
    this.pool = new Pool();
  }

  /**
   * Menambahkan album baru ke database.
   * @param {Object} albumData - Data album yang akan ditambahkan.
   * @param {string} albumData.name - Nama album.
   * @param {number} albumData.year - Tahun album.
   * @returns {string} - ID album yang ditambahkan.
   * @throws {InvariantError} - Jika gagal menambahkan album.
   */
  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };

    const { rows } = await this.pool.query(query);
    if (!rows[0].id) {
      throw new InvariantError('Gagal menambahkan album');
    }

    return rows[0].id;
  }

  /**
   * Mengambil informasi album berdasarkan ID.
   * @param {string} id - ID album yang akan diambil.
   * @returns {Object} - Informasi album yang sesuai dengan ID.
   * @throws {NotFoundError} - Jika album tidak ditemukan.
   */
  async getAlbumById(id) {
    const query = {
      text: `
        SELECT
          albums.id,
          albums.name,
          albums.year,
          albums.cover_url,
          COALESCE(
            JSON_AGG(
              JSON_BUILD_OBJECT(
                'id', songs.id,
                'title', songs.title,
                'performer', songs.performer
              ) ORDER BY songs.title ASC
            ) FILTER (WHERE songs.id IS NOT NULL), '[]'
          ) AS songs
        FROM albums
        LEFT JOIN songs ON albums.id = songs.album_id
        WHERE albums.id = $1
        GROUP BY albums.id
      `,
      values: [id],
    };

    const { rows, rowCount } = await this.pool.query(query);
    if (!rowCount) {
      throw new NotFoundError('Gagal mendapatkan album, id tidak ditemukan!');
    }

    const mappedResult = rows.map(mapDBToModel);
    return mappedResult[0];
  }

  /**
   * Mengedit album berdasarkan ID.
   * @param {string} id - ID album yang akan diedit.
   * @param {Object} albumData - Data album yang akan diubah.
   * @param {string} albumData.name - Nama album yang baru.
   * @param {number} albumData.year - Tahun album yang baru.
   * @throws {NotFoundError} - Jika album tidak ditemukan.
   */
  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name=$1, year=$2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };

    const { rowCount } = await this.pool.query(query);
    if (!rowCount) {
      throw new NotFoundError('Gagal memperbarui album, id tidak ditemukan!');
    }
  }

  /**
   * Menghapus album berdasarkan ID.
   * @param {string} id - ID album yang akan dihapus.
   * @throws {NotFoundError} - Jika album tidak ditemukan.
   */
  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id=$1 RETURNING id',
      values: [id],
    };

    const { rowCount } = await this.pool.query(query);
    if (!rowCount) {
      throw new NotFoundError('Album gagal dihapus, id tidak ditemukan!');
    }
  }

  /**
   * Menambahkan cover album berdasarkan ID.
   * @param {string} id - ID album yang akan ditambahkan cover.
   * @param {string} url - URL cover album.
   */
  async addAlbumCover(id, url) {
    const query = {
      text: 'UPDATE albums SET cover_url=$1 WHERE id = $2',
      values: [url, id],
    };

    await this.pool.query(query);
  }

  /**
   * Mengambil cover album berdasarkan ID.
   * @param {string} id - ID album yang akan diambil covernya.
   * @returns {string} - URL cover album.
   * @throws {NotFoundError} - Jika album tidak ditemukan.
   */
  async getAlbumCoverById(id) {
    const query = {
      text: 'SELECT cover_url FROM albums WHERE id = $1',
      values: [id],
    };

    const { rows, rowCount } = await this.pool.query(query);
    if (!rowCount) {
      throw new NotFoundError('Album tidak ditemukan!');
    }

    return rows[0].cover_url;
  }

  /**
   * Memverifikasi ketersediaan album berdasarkan ID.
   * @param {string} id - ID album yang akan diverifikasi ketersediaannya.
   * @throws {NotFoundError} - Jika album tidak ditemukan.
   */
  async verifyAlbumAvailability(id) {
    const query = {
      text: 'SELECT id FROM albums WHERE id = $1',
      values: [id],
    };

    const { rowCount } = await this.pool.query(query);
    if (!rowCount) {
      throw new NotFoundError('Album tidak ditemukan!');
    }
  }
}

module.exports = AlbumService;
