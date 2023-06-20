const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

/**
 * Service yang bertanggung jawab untuk operasi terkait album.
 */
class AlbumService {
  /**
   * Membuat instance baru dari kelas `AlbumService`.
   */
  constructor() {
    this._pool = new Pool();
  }

  /**
   * Menambahkan album baru ke database.
   * @param {object} album - Informasi album yang akan ditambahkan.
   * @param {string} album.name - Nama album.
   * @param {number} album.year - Tahun album.
   * @returns {string} ID album yang berhasil ditambahkan.
   * @throws {InvariantError} Jika gagal menambahkan album.
   */
  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };

    const { rows } = await this._pool.query(query);
    if (!rows[0].id) {
      throw new InvariantError('Gagal menambahkan album');
    }

    return rows[0].id;
  }

  /**
   * Mengambil data album berdasarkan ID.
   * @param {string} id - ID album yang akan dicari.
   * @returns {object} Data album yang ditemukan.
   * @throws {NotFoundError} Jika album tidak ditemukan.
   */
  async getAlbumById(id) {
    const query = {
      text: `
        SELECT 
          albums.id,
          albums.name,
          albums.year,
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

    const { rows, rowCount } = await this._pool.query(query);
    if (!rowCount) {
      throw new NotFoundError('Album tidak ditemukan');
    }
    return rows[0];
  }

  /**
   * Mengedit data album berdasarkan ID.
   * @param {string} id - ID album yang akan diubah.
   * @param {object} album - Informasi album yang akan diubah.
   * @param {string} album.name - Nama album baru.
   * @param {number} album.year - Tahun album baru.
   * @throws {NotFoundError} Jika album tidak ditemukan.
   */
  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name=$1, year=$2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };

    const { rowCount } = await this._pool.query(query);
    if (!rowCount) {
      throw new NotFoundError('Gagal memperbarui album, album tidak ditemukan');
    }
  }

  /**
   * Menghapus album berdasarkan ID.
   * @param {string} id - ID album yang akan dihapus.
   * @throws {NotFoundError} Jika album tidak ditemukan.
   */
  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id=$1 RETURNING id',
      values: [id],
    };

    const { rowCount } = await this._pool.query(query);
    if (!rowCount) {
      throw new NotFoundError('Gagal menghapus album, album tidak ditemukan');
    }
  }
}

module.exports = AlbumService;
