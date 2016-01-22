'use strict';

/**
 * Inserts a new document.
 */
module.exports = function *insert() {
  yield this._collection().insert(this._data());
};