// const logger = require('./logger');
const { ERRORS } = require('../enums');
const { INVALID_ID_ERROR, ENTITY_NOT_FOUND, UPDATE_ERROR, EMPTY_ID_ERROR } =
  ERRORS;

function errorHandler(err, req, res) {
  // cannot get errorName from err object
  const errorName = err.Error;
  if (errorName === 'CastError') {
    res.status(400).json({ error: 'Invalid ID', message: err.message });
  } else if (errorName == INVALID_ID_ERROR) {
    res.status(403).json({ error: INVALID_ID_ERROR, message: err.message });
  } else if (errorName === ENTITY_NOT_FOUND) {
    res.status(404).json({ error: ENTITY_NOT_FOUND, message: err.message });
  } else if (errorName === UPDATE_ERROR) {
    res.status(406).json({ error: UPDATE_ERROR, message: err.message });
  } else if (errorName === EMPTY_ID_ERROR) {
    res.status(401).json({ error: EMPTY_ID_ERROR, message: err.message });
  } else if (errorName === 'ValidationError') {
    res.status(400).json({ error: err.message });
  } else if (errorName === 'MongoServerError') {
    res.status(403).json({ error: 'MongoServerError', message: err.message });
  } else {
    res
      .status(500)
      .json({ error: 'Internal Server Error', message: err.message });
  }
  // need To Do
  //  logger.error(err);
}

module.exports = errorHandler;
