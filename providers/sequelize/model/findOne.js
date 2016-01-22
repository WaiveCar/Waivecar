'use strict';

let Relations = require('../helpers').Relations;

/**
 * Retrieves a single record based on the query options provided.
 * @method findOne
 * @param  {Object} options
 * @return {Model}
 */
module.exports = function *(options) {
  let relations = new Relations(this, options);
  let result    = yield this._schema.findOne(options);
  if (!result) {
    return null;
  }
  let data = result.dataValues;
  if (relations.exists) {
    relations.prepare(data);
  }
  return new this(data);
};