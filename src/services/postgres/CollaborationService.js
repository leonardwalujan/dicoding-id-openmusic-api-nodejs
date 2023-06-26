const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');

/**
 * Class yang menangani operasi terkait kolaborasi playlist.
 */
class CollaborationService {
  /**
   * Membuat instance dari CollaborationService.
   */
  constructor() {
    this.pool = new Pool();
  }

  /**
   * Menambahkan kolaborasi playlist baru.
   * @param {string} playlistId - ID playlist.
   * @param {string} userId - ID pengguna.
   * @returns {string} - ID kolaborasi.
   */
  async addCollaboration(playlistId, userId) {
    const id = `collab-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO collaborations VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, userId],
    };

    const { rows } = await this.pool.query(query);
    return rows[0].id;
  }

  /**
   * Menghapus kolaborasi playlist.
   * @param {string} playlistId - ID playlist.
   * @param {string} userId - ID pengguna.
   * @throws {InvariantError} - Jika gagal menghapus user collaborator.
   */
  async deleteCollaboration(playlistId, userId) {
    const query = {
      text: `DELETE FROM collaborations 
        WHERE playlist_id = $1 AND user_id = $2 RETURNING id`,
      values: [playlistId, userId],
    };

    const { rowCount } = await this.pool.query(query);

    if (!rowCount) {
      throw new InvariantError('Gagal menghapus user collaborator');
    }
  }

  /**
   * Memverifikasi keberadaan kolaborator pada playlist.
   * @param {string} playlistId - ID playlist.
   * @param {string} userId - ID pengguna.
   * @throws {InvariantError} - Jika kolaborasi gagal diverifikasi.
   */
  async verifyCollaborator(playlistId, userId) {
    const query = {
      text: `SELECT * FROM collaborations 
        WHERE playlist_id = $1 AND user_id = $2`,
      values: [playlistId, userId],
    };

    const { rowCount } = await this.pool.query(query);

    if (!rowCount) {
      throw new InvariantError('Kolaborasi gagal diverifikasi');
    }
  }
}

module.exports = CollaborationService;
