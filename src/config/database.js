require('dotenv').config();

const mongoose = require('mongoose');
const dbConfig = {
  useNewUrlParser: true,
  useUnifiedTopology: true
};

mongoose.connect(process.env.DB_URL, dbConfig);
