const types = [
  'Array',
  'Boolean',
  'Date',
  'Error',
  'Class',
  'Function',
  'Null',
  'Number',
  'RegExp',
  'String',
  'Undefined',
  'Object'
];

/**
 * @class Type
 */
let Type = module.exports = {};

/**
 * Get the object type of provided string.
 * @method getObjectType
 * @param  {String} value
 * @return {Mixed}
 */
Type.getObjectType = function (value) {
  return Object.prototype.toString.call(value);
};

/**
 * Get the type of the provided value.
 * @method getType
 * @param  {Any} value
 * @return {String}
 */
Type.getType = function (value) {
  for (let type of types) {
    if (this['is' + type](value)) {
      return type.toLowerCase();
    }
  }
  return null;
};

/**
 * Checks to see if a value is an object and only an object.
 * @method isPlainObject
 * @param  {Any} value
 * @return {Boolean}
 */
Type.isPlainObject = function (value) {
  return this.isObject(value) && value.__proto__ === Object.prototype;
};

/**
 * Checks to see if value is empty.
 * @method isEmpty
 * @param  {Any} value
 * @return {Boolean}
 */
Type.isEmpty = function (value) {
  return value == null;
};

/**
 * Checks if the provided value is an empty object.
 * @method isEmptyObject
 * @param  {Object} value
 * @return {Boolean}
 */
Type.isEmptyObject = function (value) {
  for (let key in value) {
    if (value.hasOwnProperty(key)) {
      return false;
    }
  }
  return true;
};

/**
 * Check if the provided value is a a ES6+ class.
 * @method isNativeClass
 * @param  {Any} value
 * @return {Boolean}
 */
Type.isNativeClass = function (value) {
  return typeof value === 'function' && value.toString().indexOf('class') === 0;
};

/**
 * Looks for function with capital first letter: function MyClass
 * First letter is the 9th characters, Uppercase letters are between
 * 65 and 90 inclusive.
 * @method isConventionalClass
 * @param  {Any} value
 * @return {Boolean}
 */
Type.isConventionalClass = function (value) {
  let c; return typeof value === 'function' && (c = value.toString().charCodeAt(9)) >= 65 && c <= 90
};

/**
 * @method isClass
 * @param  {Any} value
 * @return {Boolean}
 */
Type.isClass = function (value) {
  let s, c; return typeof value == 'function' && (
    (s = value.toString()).indexOf('class') === 0 || ((c = s.charCodeAt(9)) >= 64 && c <= 90)
  );
};

/**
 * @method isObject
 * @param  {Any} value
 * @return {Boolean}
 */
Type.isObject = function (value) {
  return value && typeof value === 'object';
};

/**
 * @method isError
 * @param  {Any} value
 * @return {Boolean}
 */
Type.isError = function (value) {
  return value instanceof Error;
};

/**
 * @method isDate
 * @param  {Any} value
 * @return {Boolean}
 */
Type.isDate = function (value) {
  return this.getObjectType(value) === '[object Date]';
};

/**
 * @method isArguments
 * @param  {Any} value
 * @return {Boolean}
 */
Type.isArguments = function (value) {
  return this.getObjectType(value) === '[object Arguments]';
};

/**
 * @method isFunction
 * @param  {Any} value
 * @return {Boolean}
 */
Type.isFunction = function (value) {
  return this.getObjectType(value) === '[object Function]';
};

/**
 * @method isRegExp
 * @param  {Any} value
 * @return {Boolean}
 */
Type.isRegExp = function (value) {
  return this.getObjectType(value) === '[object RegExp]';
};

/**
 * @method isArray
 * @param  {Any} value
 * @return {Boolean}
 */
Type.isArray = function (value) {
  return Array.isArray && Array.isArray(value) || this.getObjectType(value) === '[object Array]';
};

/**
 * @method isBoolean
 * @param  {Any} value
 * @return {Boolean}
 */
Type.isBoolean = function (value) {
  return this.getObjectType(value) === '[object Boolean]';
};

/**
 * @method isNumber
 * @param  {Any} value
 * @return {Boolean}
 */
Type.isNumber = function (value) {
  return typeof value === 'number' || this.getObjectType(value) === '[object Number]';
};

/**
 * @method isString
 * @param  {Any} value
 * @return {Boolean}
 */
Type.isString = function (value) {
  return typeof value === 'string' || this.getObjectType(value) === '[object String]';
};

/**
 * @method isNull
 * @param  {Any} value
 * @return {Boolean}
 */
Type.isNull = function (value) {
  return value === null;
};

/**
 * @method isUndefined
 * @param  {Any} value
 * @return {Boolean}
 */
Type.isUndefined = function (value) {
  return typeof value === 'undefined';
};