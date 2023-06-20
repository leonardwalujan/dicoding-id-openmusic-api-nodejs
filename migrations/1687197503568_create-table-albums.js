const tableName = 'albums';

exports.up = (pgm) => {
  pgm.createTable(tableName, {
    id: {
      type: 'varchar(22)',
      primaryKey: true,
    },
    name: {
      type: 'TEXT',
      notNull: true,
    },
    year: {
      type: 'INTEGER',
      notNull: true,
    },
    created_at: {
      type: 'TIMESTAMP',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    updated_at: {
      type: 'TIMESTAMP',
      default: null,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable(tableName);
};
