'use strict';

let Relations = require('../helpers').Relations;

/**
 * Returns a model based on the provided id.
 * @method findById
 * @param  {Mixed}  id
 * @param  {Object} [options]
 * @return {SequelizeModel}
 */
module.exports = function *(id, options) {
  let relations = new Relations(this, options);
  let result    = yield this._schema.findById(id, options);
  if (!result) {
    return null;
  }
  let data = result.dataValues;
  if (relations.exists) {
    relations.prepare(data);
  }
  return new this(data);
};