const autoBind = require('auto-bind');

/**
 * Kelas yang bertanggung jawab untuk menangani permintaan terkait album.
 */
class AlbumsHandler {
  /**
   * Membuat instance baru dari kelas `AlbumsHandler`.
   *
   * @param {object} service - Instance dari kelas `AlbumService`
   * untuk melakukan operasi terkait album.
   * @param {object} likeService - Instance dari kelas `LikeService`
   * untuk melakukan operasi terkait like album.
   * @param {object} storageService - Instance dari kelas `StorageService`
   * untuk melakukan operasi terkait penyimpanan file.
   * @param {object} validator - Instance dari kelas `AlbumValidator` untuk validasi data album.
   */
  constructor(service, likeService, storageService, validator) {
    this.service = service;
    this.likeService = likeService;
    this.storageService = storageService;
    this.validator = validator;

    autoBind(this);
  }

  /**
   * Handler untuk mengelola permintaan POST album baru.
   *
   * @param {object} request - Objek request yang diterima dari server.
   * @param {object} h - Toolkit response dari hapi.js.
   * @returns {object} Objek response yang berisi status dan data album yang berhasil ditambahkan.
   */
  async postAlbumHandler(request, h) {
    this.validator.validateAlbumPayload(request.payload);

    const albumId = await this.service.addAlbum(request.payload);

    const response = {
      status: 'success',
      data: {
        albumId,
      },
    };

    return h.response(response).code(201);
  }

  /**
   * Handler untuk mengelola permintaan GET album berdasarkan ID.
   *
   * @param {object} request - Objek request yang diterima dari server.
   * @returns {object} Objek response yang berisi status dan data album yang berhasil ditemukan.
   */
  async getAlbumByIdHandler(request, h) {
    const album = await this.service.getAlbumById(request.params.id);

    const response = {
      status: 'success',
      data: {
        album,
      },
    };

    return h.response(response);
  }

  /**
   * Handler untuk mengelola permintaan PUT album berdasarkan ID.
   *
   * @param {object} request - Objek request yang diterima dari server.
   * @returns {object} Objek response yang berisi status dan pesan berhasil diperbarui.
   */
  async putAlbumByIdHandler(request, h) {
    this.validator.validateAlbumPayload(request.payload);

    const { id: albumId } = request.params;
    await this.service.editAlbumById(albumId, request.payload);

    const response = {
      status: 'success',
      message: 'Album berhasil diperbarui.',
    };

    return h.response(response);
  }

  /**
   * Handler untuk mengelola permintaan DELETE album berdasarkan ID.
   *
   * @param {object} request - Objek request yang diterima dari server.
   * @returns {object} Objek response yang berisi status dan pesan berhasil dihapus.
   */
  async deleteAlbumByIdHandler(request, h) {
    await this.service.deleteAlbumById(request.params.id);

    const response = {
      status: 'success',
      message: 'Album berhasil dihapus.',
    };

    return h.response(response);
  }

  /**
   * Handler untuk mengelola permintaan POST cover image album.
   *
   * @param {object} request - Objek request yang diterima dari server.
   * @returns {object} Objek response yang berisi status dan pesan berhasil diunggah.
   */
  async postCoverImageHandler(request, h) {
    const { params, payload } = request;
    const { id: albumId } = params;
    const { cover } = payload;

    this.validator.validateCoverHeaders(cover.hapi.headers);

    const albumCover = await this.service.getAlbumCoverById(albumId);
    const filename = await this.storageService.writeFile(cover, cover.hapi);

    if (albumCover) await this.storageService.deleteFile(albumCover);

    const url = `http://${process.env.HOST}:${process.env.PORT}/albums/covers/${filename}`;
    await this.service.addAlbumCover(albumId, url);

    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    });
    response.code(201);
    return response;
  }

  /**
   * Handler untuk mengelola permintaan POST like album.
   *
   * @param {object} request - Objek request yang diterima dari server.
   * @returns {object} Objek response yang berisi status dan pesan berhasil menyukai album.
   */
  async postAlbumLikeHandler(request, h) {
    const { params, auth } = request;
    const { id: albumId } = params;
    const { userId } = auth.credentials;

    await this.service.verifyAlbumAvailability(albumId);

    await this.likeService.addAlbumLike(userId, albumId);

    const response = h.response({
      status: 'success',
      message: 'Menyukai album.',
    });
    response.code(201);
    return response;
  }

  /**
   * Handler untuk mengelola permintaan DELETE like album.
   *
   * @param {object} request - Objek request yang diterima dari server.
   * @returns {object} Objek response yang berisi status dan pesan berhasil batal menyukai album.
   */
  async deleteAlbumLikeHandler(request, h) {
    const { params, auth } = request;
    const { id: albumId } = params;
    const { userId } = auth.credentials;

    await this.service.verifyAlbumAvailability(albumId);

    await this.likeService.deleteAlbumLike(userId, albumId);

    const response = h.response({
      status: 'success',
      message: 'Batal menyukai album.',
    });
    response.code(200);
    return response;
  }

  /**
   * Handler untuk mengelola permintaan GET jumlah like album.
   *
   * @param {object} request - Objek request yang diterima dari server.
   * @returns {object} Objek response yang berisi status dan jumlah like album.
   */
  async getNumberOfLikeHandler(request, h) {
    const { params } = request;
    const { id } = params;

    await this.service.verifyAlbumAvailability(id);
    const { likes, source } = await this.likeService.getAlbumLikeCount(id);

    const response = h.response({
      status: 'success',
      data: {
        likes: Number(likes),
      },
    });
    response.header('X-Data-Source', source);
    response.code(200);
    return response;
  }
}

module.exports = AlbumsHandler;
