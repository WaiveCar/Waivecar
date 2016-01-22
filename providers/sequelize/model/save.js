'use strict';

let changeCase = Bento.Helpers.Case;

/**
 * Stores a new record in the database with the populated model data.
 * @method save
 * @return {Void}
 */
module.exports = function *save() {
  let result = null;
  try {
    result = yield this._schema.create(this._data());
  } catch (err) {
    throw this._error('SAVE', err);
  }

  // ### Prepare Result
  // Assigns the stored values to the object.

  let values = changeCase.objectKeys('toCamel', result.dataValues);
  for (let key in values) {
    this[key] = values[key];
  }
};
