const fs = require('fs');

/**
 * Layanan untuk mengelola penyimpanan file.
 */
class StorageService {
  /**
   * Membuat instance StorageService.
   * @param {string} folder - Direktori penyimpanan file.
   */
  constructor(folder) {
    this.folder = folder;

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
  }

  /**
   * Menyimpan file ke penyimpanan.
   * @param {ReadableStream} file - File yang akan disimpan.
   * @param {object} meta - Metadata file.
   * @returns {Promise<string>} - Nama file yang disimpan.
   */
  writeFile(file, meta) {
    const filename = `${Date.now()}_${meta.filename}`;
    const path = `${this.folder}/${filename}`;

    const fileStream = fs.createWriteStream(path);

    return new Promise((resolve, reject) => {
      fileStream.on('error', (error) => reject(error));
      file.pipe(fileStream);
      file.on('end', () => resolve(filename));
    });
  }

  /**
   * Menghapus file dari penyimpanan.
   * @param {string} url - URL file yang akan dihapus.
   * @returns {void}
   */
  deleteFile(url) {
    const filename = url.split('/').pop();
    const path = `${this.folder}/${filename}`;

    fs.unlink(path, (error) => {
      if (error) {
        console.error('Gagal menghapus file:', error);
      }
    });
  }
}

module.exports = StorageService;
