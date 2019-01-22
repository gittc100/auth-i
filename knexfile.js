// Update with your config settings.

module.exports = {

  development: {
    client: 'sqlite3',
    connection: {
      filename: './database/Auth.sqlite3'
    },
    migrations: {
      directory: './database/migrations',
      tableName: 'table_users',
    },
    useNullAsDefault: true
  }
};
