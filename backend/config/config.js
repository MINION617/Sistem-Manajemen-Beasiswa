require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'beasiswa_user',
    password: process.env.DB_PASS || 'beasiswa_pass',
    database: process.env.DB_NAME || 'sim_beasiswa_db',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'mysql',
  },
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'mysql',
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'mysql',
  },
};
