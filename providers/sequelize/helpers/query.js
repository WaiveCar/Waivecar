'use strict';

let type = Bento.Helpers.Type;

// ### Query

let Query = module.exports = function query(options, schema) {
  let result = { where : {} };

  // ### Where

  let where = schema.where;
  for (let key in where) {
    if (options.hasOwnProperty(key)) {
      result.where[key] = prepareValue(where[key], options[key]);
    }
  }

  // ### Relations

  if (schema.include) { result.include = schema.include; }

  // ### Offset & Limit

  result.limit  = options.limit  ? Query.NUMBER(options.limit)  : 20;
  result.offset = options.offset ? Query.NUMBER(options.offset) : 0;
  if (!result.limit)  { delete result.limit; }
  if (!result.offset) { delete result.offset; }

  // ### Order

  if (options.order) {
    result.order = [ options.order.split(',') ];
  }

  return result;
};

/**
 * Returns value as boolean true|false.
 * @param  {String} val
 * @return {Boolean}
 */
Query.BOOLEAN = function BOOLEAN(val) {
  switch (val) {
    case 'true'  : case 1 : return true;
    case 'false' : case 0 : return false;
    default :
      return val;
  }
};

/**
 * Returns value as string.
 * @param  {String} val
 * @return {String}
 */
Query.STRING = function STRING(val) {
  return String(val);
};

/**
 * Returns value as number.
 * @param  {String} val
 * @return {Number}
 */
Query.NUMBER = function NUMBER(val) {
  return Number(val);
};

/**
 * Returns value as date.
 * @param  {String} val
 * @return {Date}
 */
Query.DATE = function DATE(val) {
  return Date(val);
};

// ### SEQUELIZE OPERATORS

/**
 * @param  {String} val
 * @return {Object}
 */
Query.GT = function GT(val) {
  return {
    $gt : Number(val)
  };
};


/**
 * @param  {String} val
 * @return {Object}
 */
Query.GTE = function GTE(val) {
  return {
    $gte : Number(val)
  };
};

/**
 * @param  {String} val
 * @return {Object}
 */
Query.LT = function LT(val) {
  return {
    $lt : Number(val)
  };
};

/**
 * @param  {String} val
 * @return {Object}
 */
Query.LTE = function LTE(val) {
  return {
    $lte : Number(val)
  };
};

/**
 * @param  {String} val
 * @return {Object}
 */
Query.NE = function NE(val) {
  return {
    $ne : Number(val)
  };
};

/**
 * @param  {String} val Comma seperated array string.
 * @return {Object}
 */
Query.BETWEEN = function BETWEEN(val) {
  return {
    $between : val.split(',')
  };
};

/**
 * @param  {String} val Comma seperated array string.
 * @return {Object}
 */
Query.NOT_BETWEEN = function NOT_BETWEEN(val) {
  return {
    $notBetween : val.split(',')
  };
};

/**
 * @param  {String} val Comma seperated array string.
 * @return {Object}
 */
Query.IN = function IN(val) {
  return {
    $in : val.split(',')
  };
};

/**
 * @param  {String} val Comma seperated array string.
 * @return {Object}
 */
Query.NOT_IN = function NOT_IN(val) {
  return {
    $notIn : val.split(',')
  };
};

/**
 * @param  {String} val
 * @return {Object}
 */
Query.LIKE = function LIKE(val) {
  return {
    $like : val
  };
};

/**
 * @param  {String} val
 * @return {Object}
 */
Query.NOT_LIKE = function NOT_LIKE(val) {
  return {
    $notLike : val
  };
};

/**
 * @param  {Mixed} handler
 * @param  {String} val
 * @return {Object}
 */
function prepareValue(handler, val) {
  if (type.isFunction(handler)) {
    return handler(val);
  }
  let result = {};
  for (let key in handler) {
    result[key] = prepareValue(handler[key], val);
  }
  return result;
};
