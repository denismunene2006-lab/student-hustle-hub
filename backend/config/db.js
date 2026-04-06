const mongoose = require('mongoose');

const connectDB = async () => {
  // Check for MONGO_URI or MONGO_URL (Render sometimes uses MONGO_URL)
  const dbURI = process.env.MONGO_URI || process.env.MONGO_URL;

  // Explicit check to fail fast if the variable is missing
  if (!dbURI) {
    throw new Error('Database connection string (MONGO_URI or MONGO_URL) is missing.');
  }

  const conn = await mongoose.connect(dbURI, {
    serverSelectionTimeoutMS: 10000,
  });

  console.log(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);

  return conn;
};

module.exports = connectDB;
