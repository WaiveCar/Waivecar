'use strict';

let mongo = Bento.provider('mongo');

/**
 * Finds a single record based on the provided id.
 * @param  {String} id
 * @return {Object}
 */
module.exports = function *findById(id) {
  let result = yield this._collection().findOne({
    _id : mongo.ObjectID(id)
  });
  if (!result) {
    return null;
  }
  return new this(result);
};