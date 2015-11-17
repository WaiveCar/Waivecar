import { helpers } from 'bento';

let { type } = helpers;

/**
 * @class Fields
 * @param {Object} fields
 */
let Fields = module.exports = {};

/**
 * List of form fields.
 * @property store
 * @type     Object
 */
Fields.store = {};

/**
 * @method add
 * @param  {Object} fields
 */
Fields.add = function (fields) {
  for (let key in fields) {
    this.store[key] = fields[key];
  }
};

/**
 * @method get
 * @param  {String} key
 */
Fields.get = function (key) {
  return this.store[key];
};

/**
 * Fills in Layout with field values.
 * @param  {String} resource
 * @param  {Array}  filter
 * @return {Array}
 */
Fields.mergeFromLayout = function(resource, layout) {
  let fields = this.get(resource);
  let getRow = (rowItem) => {
    if (Array.isArray(rowItem)) {
      return rowItem.map(getRow);
    } else {
      let field = fields[rowItem.name];
      return { ...rowItem, ...field };
    }
  }

  return layout.map(getRow);
};

/**
 * Returns a list of fields in array form.
 * @param  {String} resource
 * @param  {Array}  filter
 * @return {Array}
 */
Fields.getArray = function (resource, filter = []) {
  let fields = this.get(resource);
  let result = [];
  if (filter.length) {
    result = filter.map((val) => {
      return fields[val];
    });
  } else {
    for (let key in fields) {
      result.push(fields[key]);
    }
  }
  return result;
};

/**
 * Returns a list of stores based on the provided targets.
 * @method getSelectList
 * @param  {Array} targets
 * @return {Array}
 */
Fields.getSelectList = function (targets) {
  let result = {};

  // ### All
  // If no targets is provided we create a list from the entire store.

  if (!targets) {
    for (let key in this.store) {
      result[key] = this.getSelectMap(key);
    }
  }

  // ### Array
  // If array is provided we only include stores defined in the array.

  if (type.isArray(targets)) {
    targets.forEach(function(key) {
      result[key] = this.getSelectMap(key);
    }.bind(this));
  }

  return result;
};

/**
 * Returns an array of object containing a select mapped dictionary.
 * @method getSelectMap
 * @param  {String} key
 * @return {Array}
 */
Fields.getSelectMap = function (key) {
  let fields = this.store[key];
  let result = [];
  for (let key in fields) {
    result.push({
      name  : fields[key].label,
      value : key
    });
  }
  return result;
};
