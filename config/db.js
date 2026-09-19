const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/auratech_db';
    
    // Set strictQuery to true for modern query filtering enforcement
    mongoose.set('strictQuery', true);

    const conn = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true
    });

    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`❌ Database Connection Error: ${error.message}`);
    // If running in test mode or local offline, log warning instead of crashing immediately
    if (process.env.NODE_ENV !== 'test') {
      console.warn('⚠️ Please ensure MongoDB service is running on your machine (mongodb://127.0.0.1:27017).');
    }
    throw error;
  }
};

module.exports = connectDB;
