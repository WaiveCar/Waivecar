'use strict';

/**
 * Provides a record count based on the provided query options.
 * @param  {Object} options
 * @return {Int}
 */
module.exports = function *count(options) {
  try {
    return yield this._schema.count(options);
  } catch (err) {
    throw this._error('COUNT', err);
  }
};
