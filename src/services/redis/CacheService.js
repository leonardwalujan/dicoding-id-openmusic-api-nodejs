const redis = require('redis');
const config = require('../../utils/config');

/**
 * Service untuk mengelola cache menggunakan Redis
 */
class CacheService {
  /**
   * Membuat instance CacheService dan menghubungkannya ke Redis
   */
  constructor() {
    // Membuat koneksi Redis
    this.client = redis.createClient({
      socket: {
        host: config.redis.host,
      },
    });

    // Menangani event error pada Redis client
    this.client.on('error', (error) => console.error(error));

    // Menghubungkan ke Redis
    this.client.connect();
  }

  /**
   * Menyimpan nilai dalam cache dengan kunci dan opsi kedaluwarsa
   * @param {string} key - Kunci untuk menyimpan nilai dalam cache
   * @param {any} value - Nilai yang akan disimpan dalam cache
   * @param {number} expirationInSecond - Opsi kedaluwarsa dalam detik (default: 1800 detik)
   */
  async set(key, value, expirationInSecond = 1800) {
    await this.client.set(key, value, {
      EX: expirationInSecond,
    });
  }

  /**
   * Mengambil nilai dari cache berdasarkan kunci
   * @param {string} key - Kunci untuk mengambil nilai dari cache
   * @returns {Promise<any>} - Nilai yang sesuai dengan kunci
   * @throws {Error} - Jika nilai tidak ditemukan dalam cache
   */
  async get(key) {
    const result = await this.client.get(key);
    if (!result) throw new Error('Cache tidak ditemukan!');
    return result;
  }

  /**
   * Menghapus nilai dari cache berdasarkan kunci
   * @param {string} key - Kunci untuk menghapus nilai dari cache
   * @returns {Promise<number>} - Jumlah nilai yang dihapus (biasanya 1)
   */
  delete(key) {
    return this.client.del(key);
  }
}

module.exports = CacheService;
