'use strict';

/**
 * Finds a single record based on the provided query.
 * @param  {Object} [query]
 * @param  {Object} [projection]
 * @return {Object}
 */
module.exports = function *findOne(query, projection) {
  let result = yield this._collection().findOne(this.parseId(query), projection);
  if (!result) {
    return null;
  }
  return new this(result);
};