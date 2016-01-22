'use strict';

let mongo = Bento.provider('mongo');

/**
 * Saves a collection record.
 */
module.exports = function *save() {
  let result = yield this._collection().save(this._data());

  // ### Assign ID
  // Assigns the resulting id to the current model

  this.id = mongo.ObjectID(result.ops[0]._id);
  this._attributes.push('id');
};
