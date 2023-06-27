exports.up = (pgm) => {
  pgm.createTable('user_album_likes', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: {
        table: 'users',
        constraintName: 'fk_user_album_likes.user_id:users.id',
        onDelete: 'CASCADE',
      },
    },
    album_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: {
        table: 'albums',
        constraintName: 'fk_user_album_likes.album_id:albums.id',
        onDelete: 'CASCADE',
      },
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('user_album_likes');
};
