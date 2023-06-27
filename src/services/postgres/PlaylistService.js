const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistService {
  /**
   * Membuat instance baru dari PlaylistService.
   * @param {CollaborationService} collaborationService - Instance CollaborationService.
   */
  constructor(collaborationService) {
    this.pool = new Pool();
    this.collaborationService = collaborationService;
  }

  /**
   * Menambahkan playlist baru ke dalam database.
   * @param {string} name - Nama playlist.
   * @param {string} owner - ID pemilik playlist.
   * @returns {string} - ID playlist yang ditambahkan.
   * @throws {InvariantError} - Jika gagal menambahkan playlist.
   */
  async addPlaylist(name, owner) {
    try {
      const id = `playlist-${nanoid(16)}`;

      const query = {
        text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
        values: [id, name, owner],
      };

      const { rows } = await this.pool.query(query);
      return rows[0].id;
    } catch (error) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }
  }

  /**
   * Mengambil daftar playlist berdasarkan pemilik.
   * @param {string} owner - ID pemilik playlist.
   * @returns {Array} - Daftar playlist.
   */
  async getPlaylists(owner) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username FROM playlists 
        LEFT JOIN users ON playlists.owner = users.id
        LEFT JOIN collaborations ON playlists.id = collaborations.playlist_id
        WHERE playlists.owner = $1 OR collaborations.user_id = $1;`,
      values: [owner],
    };

    const { rows } = await this.pool.query(query);
    return rows;
  }

  /**
   * Menghapus playlist berdasarkan ID.
   * @param {string} id - ID playlist.
   * @throws {NotFoundError} - Jika playlist tidak ditemukan.
   */
  async deletePlaylistById(id) {
    await this.deletePlaylistActivity(id);

    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };

    const { rowCount } = await this.pool.query(query);
    if (!rowCount) {
      throw new NotFoundError('Playlist gagal dihapus. ID tidak ditemukan');
    }
  }

  /**
   * Menambahkan lagu ke dalam playlist.
   * @param {string} playlistId - ID playlist.
   * @param {string} songId - ID lagu.
   * @throws {NotFoundError} - Jika lagu tidak ditemukan.
   */
  async addSongToPlaylist(playlistId, songId) {
    await this.verifyNewSongInPlaylist(playlistId, songId);
    try {
      const id = `playlistsong-${nanoid(16)}`;
      const query = {
        text: 'INSERT INTO playlist_songs VALUES($1, $2, $3)',
        values: [id, playlistId, songId],
      };
      await this.pool.query(query);
    } catch (error) {
      throw new NotFoundError('Lagu tidak ditemukan!');
    }
  }

  /**
   * Mengambil daftar lagu dari playlist.
   * @param {string} playlistId - ID playlist.
   * @returns {Object} - Informasi playlist beserta daftar lagu.
   */
  async getSongsFromPlaylist(playlistId) {
    const query = {
      text: `
        SELECT 
          playlists.id, 
          playlists.name, 
          users.username, 
          ARRAY_AGG(
            JSON_BUILD_OBJECT(
              'id', songs.id ,
              'title', songs.title,
              'performer', songs.performer
            )
            ORDER BY songs.title ASC
          ) songs
        FROM playlist_songs
        INNER JOIN playlists ON playlist_songs.playlist_id = playlists.id
        INNER JOIN users ON playlists.owner = users.id
        INNER JOIN songs ON playlist_songs.song_id = songs.id
        WHERE playlist_id = $1
        GROUP BY playlists.id, users.username`,
      values: [playlistId],
    };

    const { rows } = await this.pool.query(query);
    return rows[0];
  }

  /**
   * Menghapus lagu dari playlist.
   * @param {string} playlistId - ID playlist.
   * @param {string} songId - ID lagu.
   * @throws {NotFoundError} - Jika lagu tidak ditemukan.
   */
  async deleteSongFromPlaylist(playlistId, songId) {
    const query = {
      text: `DELETE FROM playlist_songs 
      WHERE playlist_id = $1 AND song_id = $2 RETURNING id`,
      values: [playlistId, songId],
    };

    const { rowCount } = await this.pool.query(query);

    if (!rowCount) throw new NotFoundError('Lagu tidak ditemukan!');
  }

  /**
   * Menambahkan aktivitas ke dalam playlist.
   * @param {Object} playlistActivity - Objek aktivitas playlist.
   * @param {string} playlistActivity.playlistId - ID playlist.
   * @param {string} playlistActivity.songId - ID lagu.
   * @param {string} playlistActivity.userId - ID pengguna.
   * @param {string} playlistActivity.action - Tindakan yang dilakukan.
   */
  async addPlaylistActivity({ playlistId, songId, userId, action }) {
    const id = `activity-${Date.now()}`;
    const createdAt = new Date().toISOString();

    const query = {
      text: `INSERT INTO playlist_song_activities 
        VALUES($1, $2, $3, $4, $5, $6)`,
      values: [id, playlistId, songId, userId, action, createdAt],
    };

    await this.pool.query(query);
  }

  /**
   * Mengambil daftar aktivitas playlist.
   * @param {string} playlistId - ID playlist.
   * @returns {Array} - Daftar aktivitas playlist.
   * @throws {NotFoundError} - Jika aktivitas playlist tidak ditemukan.
   */
  async getPlaylistActivities(playlistId) {
    const query = {
      text: `SELECT users.username, songs.title, action, time 
        FROM playlist_song_activities
        INNER JOIN users ON playlist_song_activities.user_id = users.id
        INNER JOIN songs ON playlist_song_activities.song_id = songs.id
        WHERE playlist_id = $1 `,
      values: [playlistId],
    };

    const { rows, rowCount } = await this.pool.query(query);
    if (!rowCount) throw new NotFoundError('Playlist Activity tidak ditemukan');

    return rows;
  }

  /**
   * Menghapus aktivitas playlist.
   * @param {string} playlistId - ID playlist.
   */
  async deletePlaylistActivity(playlistId) {
    const query = {
      text: 'DELETE FROM playlist_song_activities WHERE playlist_id = $1',
      values: [playlistId],
    };

    await this.pool.query(query);
  }

  /**
   * Memverifikasi apakah lagu baru sudah ada dalam playlist.
   * @param {string} playlistId - ID playlist.
   * @param {string} songId - ID lagu.
   * @throws {InvariantError} - Jika lagu sudah ada dalam playlist.
   */
  async verifyNewSongInPlaylist(playlistId, songId) {
    const query = {
      text: `SELECT song_id FROM playlist_songs 
        WHERE playlist_id = $1 AND song_id = $2`,
      values: [playlistId, songId],
    };

    const { rowCount } = await this.pool.query(query);

    if (rowCount) throw new InvariantError('Lagu sudah ada dalam playlist.');
  }

  /**
   * Memverifikasi apakah pengguna adalah pemilik playlist.
   * @param {string} playlistId - ID playlist.
   * @param {string} owner - ID pemilik playlist.
   * @throws {NotFoundError} - Jika playlist tidak ditemukan.
   * @throws {AuthorizationError} - Jika pengguna bukan pemilik playlist.
   */
  async verifyPlaylistOwner(playlistId, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [playlistId],
    };

    const { rows, rowCount } = await this.pool.query(query);
    if (!rowCount) throw new NotFoundError('Playlist tidak ditemukan!');

    const playlist = rows[0];
    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini!');
    }
  }

  /**
   * Memverifikasi apakah pengguna memiliki akses ke playlist.
   * @param {string} playlistId - ID playlist.
   * @param {string} userId - ID pengguna.
   * @throws {NotFoundError} - Jika playlist tidak ditemukan.
   * @throws {AuthorizationError} - Jika pengguna tidak memiliki akses ke playlist.
   */
  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      try {
        await this.collaborationService.verifyCollaborator(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }
}

module.exports = PlaylistService;
