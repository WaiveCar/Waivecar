'use strict';

let select  = require('./select');
let helpers = require('./helpers');

/**
 * A query language designed to be compatible with facebooks GraphQL in the future.
 * @class ReachQL
 * @static
 */
let ReachQL = module.exports = {};

/**
 * Performs an advanced select query.
 * @method query
 * @param  {Object} options
 * @return {Object}
 */
ReachQL.query = function *(options) {
  var model = helpers.getModel(options);
  var opts  = options[model.key];

  if (!model) {
    throw new Error('Request model ['+ model.key +'] does not exist');
  }

  var items = yield select.query(model.creator._table, opts);

  // ### Empty Result
  // Return null on empty results

  if (!items.length) {
    return null;
  }

  // ### Instantiate
  // Instantiate the items with the model

  if (opts.limit && 1 === opts.limit) { items = [items]; }
  items = items.reduce(function (items, item) {
    return items.concat([new model.creator(item).toJSON(opts.attributes)]);
  }, []);

  // ### Relation Queries

  if (opts.hasMany) {
    for (let key in opts.hasMany) {
      yield this.hasMany(items, model.key, key, opts.hasMany[key]);
    }
  }

  if (opts.hasOne) {
    for (let key in opts.hasOne) {
      yield this.hasOne(items, model.key, key, opts.hasOne[key]);
    }
  }

  // ### Result

  if (opts.limit && 1 === opts.limit) {
    return items[0];
  }
  return items;
};