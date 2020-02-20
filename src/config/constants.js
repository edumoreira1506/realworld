require('dotenv').config();

const config = process.env; // eslint-disable-line

module.exports = {
  dbUrl: config.DB_URL,
  cryptoKey: config.CRYPTO_KEY
}
