'use strict';

let type  = Bento.Helpers.Type;
let error = Bento.Error;

/**
 * @param  {Object} data
 * @param  {Object} [options]
 */
module.exports = function *update(data, options) {

  // ### Validate Data
  // Make sure the data provided is a valid object.

  if (!type.isObject(data)) {
    throw error.parse({
      code     : `INVALID_UPDATE_DATA`,
      message  : `The provided update data was not a valid [Object].`,
      solution : `Make sure your update methods are providing a valid update object.`
    }, 500);
  }

  // ### Update Collection

  yield this._collection().update({
    _id : this.id
  }, this.parseId(data), options);

  // ### Update Values

  for (let key in data) {
    this[key] = data[key];
  }

};
