/**
  MySQL Query
  ===========

  Exports a generator method that performs a query on the provided sql string and options.

  @author  Christoffer Rødvik (c) 2015
  @license MIT
 */

'use strict';

var changeCase = require('change-case');
var connection = require('./connection');

/**
 * @class Query
 * @static
 */
var Query = module.exports = function *query(sql, options) {
  return yield connection.query(sql, prepareOptions(options));
};

/**
 * Performs a MySQL insert query with the provided table name and options.
 * @method insert
 * @param  {String} tableName
 * @param  {Object} options
 * @return {Object}
 */
Query.insert = function *(tableName, options) {
  return yield connection.query('INSERT INTO ' + tableName + ' SET ?', prepareOptions(options));
};

/**
 * Performs a MySQL select query with the provided table name and otions.
 * @method select
 * @param  {String} tableName
 * @param  {Object} options
 * @return {Object}
 */
Query.select = function *(tableName, options) {
  var sql  = '';
  var data = [];

  sql += handleSelect(options.attributes, tableName, data);
  if (options.where) {
    sql += handleWhere(options.where, data) + ' AND deleted_at IS NULL';
  }
  if (options.order)  { sql += handleOrderBy(options.order, data); }
  if (options.limit)  { sql += ' LIMIT '    + options.limit; }
  if (options.offset) { sql += ' OFFSET '   + options.offset; }

  // ### Query

  var result = yield connection.query(sql, data);
  if (!result.length)      { return null; }
  if (1 === options.limit) { return result[0]; }
  return result;
};

/**
 * Performs an advanced select query.
 * @method ql
 * @param  {Object} options
 * @return {Object}
 */
Query.ql = function *(options) {
  var model = Query.getModel(options);
  var opts  = options[model.key];

  if (!model) {
    throw new Error('Request model ['+ model.key +'] does not exist');
  }

  var items = yield Query.select(model.creator._table, opts);

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

/**
 * Performs a has many relational query.
 * @method hasMany
 * @param  {Array} items The parent items being populated
 */
Query.hasMany = function *(items, parent, child, options) {
  var table     = options.ref || parent.toLowerCase() + '_' + child.toLowerCase();
  var model     = Query.getModel(child);
  var childName = child.toLowerCase() + 's';

  if (!model) {
    return false;
  }

  // ### Parent IDS

  var parentRef = {};
  items.forEach(function (item, index) {
    parentRef[item.id] = {
      index : index
    };
    item[childName] = [];
  });

  // ### Records
  // Query relational connections table used when assigning children to parents

  var data    = [];
  var records = yield connection.query('SELECT * FROM ' + table + ' WHERE ' + parent.toLowerCase() + '_id IN ('+ joinArray(Object.keys(parentRef), data) +')', data);

  // ### Child IDS

  var childIds = [];
  records.forEach(function (ref) {
    var id = ref[child.toLowerCase() + '_id'];
    if (-1 === childIds.indexOf(id)) {
      childIds.push(id);
    }
  });

  // ### Query Options

  var queryOptions = {};
  options.where = {
    id : { $in : childIds }
  };
  queryOptions[child] = options;

  // ### Query Relations

  var relations = yield Query.ql(queryOptions);
  var childRef  = {};
  relations.forEach(function (item, index) {
    childRef[item.id] = {
      index : index
    };
  });

  // ### Assign Relations

  records.forEach(function (ref) {
    items[parentRef[ref[parent.toLowerCase() + '_id']].index][childName].push(relations[childRef[ref[child.toLowerCase() + '_id']].index]);
  });

};

/**
 * Performs a hasOne relational query.
 * @method hasOne
 */
Query.hasOne = function *(items, parent, child, options) {
  var model     = Query.getModel(child);
  var childName = changeCase.camelCase(child);

  if (!model) {
    return false;
  }

  // ### Parent IDS

  var parentRef = {};
  var childIds  = [];
  items.forEach(function (item, index) {
    var childId = item[options.ref];

    if (!parentRef[childId] || !parentRef[childId].index) {
      parentRef[childId] = {
        index : [index]
      };
    } else {
      parentRef[childId].index.push(index);
    }

    if (-1 === childIds.indexOf(childId)) {
      childIds.push(childId);
    }
    item[childName] = [];
  });

  // ### Query Options

  var queryOptions = {};
  options.where = {
    id : { $in : childIds }
  };
  queryOptions[child] = options;

  // ### Query Relations

  var relations = yield Query.ql(queryOptions);
  relations.forEach(function (item) {
    parentRef[item.id].index.forEach(function (parentIndex) {
      items[parentIndex][childName] = item;
    });
  });

};

/**
 * Returns model key and creator.
 * @method getModel
 * @param  {Mixed} options Can be a string or object
 * @return {Object}
 */
Query.getModel = function (options) {
  var model = {};

  model.key     = 'string' === typeof options ? options : Object.keys(options)[0];
  model.creator = Reach.model(model.key);

  return model.creator ? model : false;
};

/**
 * @private
 * @method handleSelect
 * @param  {Array}  [attributes]
 * @param  {String} tableName
 * @param  {Array}  data
 * @return {String}
 */
function handleSelect(attributes, tableName, data) {
  return 'SELECT ' + handleAttributes(attributes, data) + ' FROM ' + tableName.replace(/[^a-zA-Z_]/g, '');
}

/**
 * @private
 * @method handleAttributes
 * @param  {Array} [attributes]
 * @param  {Array} data
 * @return {String}
 */
function handleAttributes(attributes, data) {
  if (!attributes || Array !== data.constructor) {
    return '*';
  }
  var result = [];
  attributes.forEach(function (attribute) {
    result.push(changeCase.snakeCase(attribute.replace(/[^a-zA-Z]/g, '')));
  });
  return result.join(', ');
}

/**
 * @private
 * @method handleWhere
 * @param  {Object} where
 * @param  {Array}  data
 * @return {String}
 */
function handleWhere(where, data) {
  return ' WHERE ' + handleAnd(where, data);
}

/**
 * @private
 * @method handleAnd
 * @param  {Object} values
 * @param  {Array}  data
 * @param  {String} [parentKey]
 * @return {String}
 */
function handleAnd(values, data, parentKey) {
  var sql = [];
  for (var key in values) {
    sql.push(handleValue(key, values[key], data, parentKey));
  }
  return sql.join(' AND ');
}

/**
 * @private
 * @method handleOr
 * @param  {Object} values
 * @param  {Array}  data
 * @param  {String} [parentKey]
 * @return {String}
 */
function handleOr(values, data, parentKey) {
  var sql = [];
  if (Array === values.constructor) {
    values.forEach(function (value) {
      sql.push(handleAnd(value, data, parentKey));
    });
  } else {
    for (var key in values) {
      sql.push(handleValue(key, values[key], data, parentKey));
    }
  }
  return sql.join(' OR ');
}

/**
 * @private
 * @method handleValue
 * @param  {String} key
 * @param  {Mixed}  values
 * @param  {Array}  data
 * @param  {String} [parentKey]
 * @return {String}
 */
function handleValue(key, value, data, parentKey) {
  var sql = null;

  parentKey = parentKey ? changeCase.snakeCase(parentKey.replace(/[^a-zA-Z]/g, '')) : '';

  switch (key) {
    case '$or'         : return handleOr(value, data, parentKey);
    case '$gt'         : sql = parentKey + ' > ?'; break;
    case '$gte'        : sql = parentKey + ' >= ?'; break;
    case '$lt'         : sql = parentKey + ' < ?'; break;
    case '$lte'        : sql = parentKey + ' <= ?'; break;
    case '$ne'         : sql = parentKey + ' id != ?'; break;
    case '$between'    : sql = parentKey + ' BETWEEN ? AND ?'; break;
    case '$notBetween' : sql = parentKey + ' NOT BETWEEN ? AND ?'; break;
    case '$in'         : sql = parentKey + ' IN ('+ joinArray(value, data) +')'; break;
    case '$like'       : sql = parentKey + ' LIKE ?'; break;
    case '$notLike'    : sql = parentKey + ' NOT LIKE ?'; break;
    case '$iLike'      : sql = parentKey + ' ILIKE ?'; break;
    case '$notILike'   : sql = parentKey + ' NOT ILIKE ?'; break;
    case '$likeAny'    : sql = parentKey + ' LIKE ANY ARRAY['+ joinArray(value, data) +']'; break;
    case '$eq'         : sql = parentKey + ' = ?';  break;
  }

  if (sql) {
    if (value && Array === value.constructor) {
      value.forEach(function (val) {
        data.push(val);
      });
    } else {
      data.push(value);
    }
    return sql;
  }

  if (value && Object === value.constructor) {
    return handleAnd(value, data, key);
  } else {
    data.push(value);
    return changeCase.snakeCase(key.replace(/[^a-zA-Z]/g, '')) + ' = ?';
  }
}

/**
 * Adds values to the data array and return a string of comma seperated ? equal to amount of values.
 * @private
 * @method joinArray
 * @param  {Array} values
 * @param  {Array} data
 * @return {String}
 */
function joinArray(values, data) {
  var vals = [];
  values.forEach(function (val) {
    vals.push('?');
    data.push(val);
  });
  return vals.join(',');
}

/**
 * Prepares MySQL options
 * @private
 * @method prepareOptions
 * @param  {Object} [options]
 * @return {Object}
 */
function prepareOptions(options) {
  if (!options) {
    return {};
  }

  if (Object === options.constructor) {
    options = changeKeyCase(options);
  }

  if (Array === options.constructor) {
    for (var i = 0, len = options.length; i < len; i++) {
      if (Object === options[i].constructor) {
        options[i] = changeKeyCase(options[i]);
      }
    }
  }

  return options;
}

/**
 * Converts keys in an object from camelCase to snake_case
 * @private
 * @method changeKeyCase
 * @param  {object} obj
 * @return {object}
 */
function changeKeyCase(obj) {
  var converted = {};
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      var newKey = key;
      if (-1 === key.indexOf('.')) {
        newKey = changeCase.snakeCase(key);
      }
      converted[newKey] = obj[key];
    }
  }
  return converted;
}

/**
 * @private
 * @method handleOrderBy
 * @param  {Array} order
 * @param  {Array} data
 * @return {String}
 */
function handleOrderBy(order, data) {
  var sql = [];

  if ('object' === typeof order[0]) {
    for (var i = 0, len = order.length; i < len; i++) {
      sql.push(handleOrderBy(order[i], data));
    }
    return sql.join(', ');
  }

  var direction = order.pop();
  if ('ASC' !== direction && 'DESC' !== direction) {
    return '';
  }
  order.forEach(function (val) {
    sql.push(changeCase.snakeCase(val.replace(/[^a-zA-Z]/g, '')));
  });
  return ' ORDER BY ' + sql.join(', ') + ' ' + direction;
}