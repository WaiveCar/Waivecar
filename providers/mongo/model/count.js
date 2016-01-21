'use strict';

/**
 * Provides a record count based on the provided query.
 * @param  {Object} query
 * @return {Int}
 */
module.exports = function *count(query) {
  return this._collection().count(this.parseId(query));
};