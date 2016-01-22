'use strict';

/**
 * @method upsert
 * @return {Void}
 */
module.exports = function *upsert() {
  try {
    yield this._schema.upsert(this._data());
  } catch (err) {
    throw this._error('UPSERT', err);
  }
};
