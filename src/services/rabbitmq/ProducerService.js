const amqp = require('amqplib');
const config = require('../../utils/config');

/**
 * Layanan untuk mengirim pesan ke antrian RabbitMQ.
 */
const ProducerService = {
  /**
   * Mengirim pesan ke antrian RabbitMQ.
   * @param {string} queue - Nama antrian.
   * @param {string} message - Pesan yang akan dikirim.
   * @returns {Promise<void>}
   */
  sendMessage: async (queue, message) => {
    // Menghubungkan ke server RabbitMQ
    const connection = await amqp.connect(config.rabbitMq.server);

    // Membuat channel
    const channel = await connection.createChannel();

    // Mendeklarasikan antrian dengan opsi durable
    await channel.assertQueue(queue, {
      durable: true,
    });

    // Mengirim pesan ke antrian
    await channel.sendToQueue(queue, Buffer.from(message));

    // Menutup koneksi setelah 1 detik
    setTimeout(() => {
      connection.close();
    }, 1000);
  },
};

module.exports = ProducerService;
