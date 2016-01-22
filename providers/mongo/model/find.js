'use strict';

/**
 * Finds a list of records based on the provided query.
 * @param  {Object} [query]
 * @param  {Object} [projection]
 * @return {Array}
 */
module.exports = function *find(query, projection) {
  let result = yield this._collection().find(this.parseId(query), projection).toArray();
  if (!result) {
    return null;
  }
  return result.map((data) => {
    return new this(data);
  });
};
