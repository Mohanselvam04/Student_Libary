const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { connect } = require('./db');
const express = require('express');
const app = express();

const PORT = process.env.PORT || 8001;

connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Backend running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB', error);
    process.exit(1);
  });