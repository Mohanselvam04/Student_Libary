const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error('MONGODB_URI is not defined in backend/.env');
}

mongoose.set('strictQuery', false);

async function connect() {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  
  try {
    console.log('Attempting to connect to MongoDB Atlas...');
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('MongoDB connected:', mongoose.connection.name);
    return mongoose.connection;
  } catch (atlasError) {
    console.warn('Failed to connect to MongoDB Atlas:', atlasError.message);
    
    const localUri = process.env.LOCAL_MONGODB_URI || 'mongodb://localhost:27017/lms';
    console.log(`Attempting fallback to Local MongoDB: ${localUri}...`);
    try {
      await mongoose.connect(localUri, { serverSelectionTimeoutMS: 5000 });
      console.log('Connected to Local MongoDB:', mongoose.connection.name);
      return mongoose.connection;
    } catch (localError) {
      console.error('Failed to connect to Local MongoDB:', localError.message);
      throw new Error(`Both MongoDB Atlas and Local MongoDB connection attempts failed.\nAtlas Error: ${atlasError.message}\nLocal Error: ${localError.message}`);
    }
  }
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
