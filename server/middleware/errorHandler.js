const logger = require('../utils/logger');
const errorHandler = (err, req, res, next) => {
  logger.error(`${err.name}: ${err.message}`);
  if (err.name === 'ValidationError') { const msgs = Object.values(err.errors).map(e => e.message); return res.status(400).json({ success: false, message: 'Validation Error', errors: msgs }); }
  if (err.code === 11000) return res.status(400).json({ success: false, message: `Duplicate: ${Object.keys(err.keyValue)[0]}` });
  if (err.name === 'CastError') return res.status(400).json({ success: false, message: `Invalid ${err.path}: ${err.value}` });
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({ success: false, message: err.message || 'Server Error' });
};
const notFound = (req, res, next) => { const error = new Error(`Not Found - ${req.originalUrl}`); error.statusCode = 404; next(error); };
module.exports = { errorHandler, notFound };