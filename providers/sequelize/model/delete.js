'use strict';

let moment = require('moment');

/**
 * Deletes a record based on the provided primary key.
 * @method delete
 * @param  {String} [pk]
 * @return {Void}
 */
module.exports = function *(pk) {
  pk = pk || 'id';

  // ### Query Options
  // Make sure we use the correct primary key of the model.

  let options = {
    where : {}
  };
  options.where[pk] = this[pk];

  // ### Delete Model

  try {
    yield this._schema.destroy(options);
  } catch (err) {
    throw this._error('DELETE', err);
  }

  // ### Temporary Timestamp
  // We add a temporary deletedAt timestamp since we are not receiving this
  // from the resulting update operation.

  this.deletedAt = moment().utc().format('YYYY-MM-DD\THH:mm:ss') + '.000Z';
};
