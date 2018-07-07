'use strict';

let type = Bento.Helpers.Type;

//
// This code was utterly confusing because fields were named terrrribly.
// This has been mostly fixed with the explanation below:
//
//  First, this code takes a set of key/value pairs and some options and then
//  spits out a Sequelize compatible vanilla javascript object that can be fed 
//  back in to Sequelize.find.
//
//  This sounds and likely is unncessary - but it's used extensively so we might 
//  as well document it.
//
//  queryValueMap is generally the code that is coming in via a query string
//   in a GET post, such as /endpoint?animal=goat&type=cute.
//   This will become: { animal: 'goat', type: 'cute' }
//   Although this is generic of course.
//
//  options is how you want to process the values in queryValueMap.
//   This is essentially a poor and overzealous version of concern separation.
//   An example may be { animal: qs.STRING, type: qs.STRING }. There's
//   other things in here that cover IN and many other types of sequelize
//   things. 
//
// Again, all this does is output an object that is going to  be fed back 
// into Sequelize so this code could be 100% bypassed ... 
//
let Query = module.exports = function query(queryValueMap, options) {
  // Pass in a limit to the queryValueMap (as in the query string coming in)
  // to override this.
  let DEFAULT_LIMIT = 20;
  let result = { where : {} };

  let handlerMap = options.where;
  for (let key in handlerMap) {
    if (queryValueMap && queryValueMap.hasOwnProperty(key)) {
      result.where[key] = prepareValue(handlerMap[key], queryValueMap[key]);
    }
  }

  // ### Relations

  if (options.include) { result.include = options.include; }

  // ### Offset & Limit

  result.limit  = queryValueMap.limit  ? Query.NUMBER(queryValueMap.limit)  : DEFAULT_LIMIT;
  result.offset = queryValueMap.offset ? Query.NUMBER(queryValueMap.offset) : 0;
  if (!result.limit)  { delete result.limit; }
  if (!result.offset) { delete result.offset; }

  // ### Order

  if (queryValueMap.order) {
    result.order = [ queryValueMap.order.split(',') ];
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
