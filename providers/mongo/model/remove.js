'use strict';

/**
 * Removes a record from the collection.
 */
module.exports = function *remove() {
  yield this._collection().remove({
    _id : this.id
  }, {
    justOne : true
  });
};