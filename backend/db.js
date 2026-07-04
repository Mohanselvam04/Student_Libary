const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error('MONGODB_URI is not defined in backend/.env');
}

mongoose.set('strictQuery', false);

async function connect() {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  await mongoose.connect(uri);
  console.log('MongoDB connected:', mongoose.connection.name);
  return mongoose.connection;
}

async function close() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
}

module.exports = {
  connect,
  close,
  connectToMongo: connect,
};