const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Explicit check to fail fast if the variable is missing
    if (!process.env.MONGO_URI) {
      console.error('WARNING: MONGO_URI is missing. Database will not connect.');
      return; // Don't crash, just return
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    // process.exit(1); // DISABLED: Keep server running for debugging
  }
};

module.exports = connectDB;