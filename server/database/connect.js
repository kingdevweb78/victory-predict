const mongoose = require('mongoose');
const config = require('../config');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongodbUri, { autoIndex: true });
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    mongoose.connection.on('error', (err) => logger.error(`MongoDB Error: ${err.message}`));
    mongoose.connection.on('disconnected', () => logger.warn('MongoDB Disconnected'));
    mongoose.connection.on('reconnected', () => logger.info('MongoDB Reconnected'));
    return conn;
  } catch (error) {
    logger.error(`MongoDB Connection Failed: ${error.message}`);
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;