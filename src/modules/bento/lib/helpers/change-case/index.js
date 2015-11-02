let NON_WORD_REGEXP       = require('./vendor/non-word-regexp');
let CAMEL_CASE_REGEXP     = require('./vendor/camel-case-regexp');
let TRAILING_DIGIT_REGEXP = require('./vendor/trailing-digit-regexp');
let LANGUAGES_UPPERCASE   = require('./vendor/languages-uppercase.js');
let LANGUAGES_LOWERCASE   = require('./vendor/languages-lowercase.js');

/**
 * @class ChangeCase
 * @static
 */
let ChangeCase = module.exports = {};

/**
 * Changes the case of the string values in the provided array.
 * @method array
 * @param  {String} caseType
 * @param  {Array}  arr
 * @return {Array}
 */
ChangeCase.array = function (caseType, arr) {
  return arr.reduce((store, value) => {
    store.push(ChangeCase[caseType](value));
    return store;
  }, []);
};

/**
 * @method objectKeys
 * @param  {String} caseType
 * @param  {Object} obj
 * @return {Object}
 */
ChangeCase.objectKeys = function (caseType, obj) {
  let result = {};
  for (let key in obj) {
    result[this[caseType](key)] = obj[key];
  }
  return result;
};

/**
 * @method toCapital
 * @param  {String} value
 * @param  {String} [locale]
 * @return {String}
 */
ChangeCase.toCapital = function (value, locale) {
  if (value == null) {
    return '';
  }
  value = String(value);
  return this.toUpper(value.charAt(0), locale) + value.substr(1);
};

/**
 * @method toUpper
 * @param  {String} value
 * @param  {String} [locale]
 * @return {String}
 */
ChangeCase.toUpper = function (value, locale) {
  var lang = LANGUAGES_UPPERCASE[locale];
  value = (value == null) ? '' : String(value);
  if (lang) {
    value = value.replace(lang.regexp, (m) => lang.map[m]);
  }
  return value.toUpperCase();
};

/**
 * @method toLower
 * @param  {String} value
 * @param  {String} [locale]
 * @return {String}
 */
ChangeCase.toLower = function (value, locale) {
  var lang = LANGUAGES_LOWERCASE[locale]
  value = (value == null) ? '' : String(value);
  if (lang) {
    value = value.replace(lang.regexp, (m) => lang.map[m]);
  }
  return value.toLowerCase();
}

/**
 * @method toCamel
 * @param  {String} value
 * @param  {String} [locale]
 * @return {String}
 */
ChangeCase.toCamel = function (value, locale) {
  return this
    .toSentence(value, locale)
    .replace(/(\d) (?=\d)/g, '$1_')
    .replace(/ (.)/g, function(m, $1) {
      return this.toUpper($1, locale)
    }.bind(this));
};

/**
 * @method toSnake
 * @param  {String} value
 * @param  {String} [locale]
 * @return {String}
 */
ChangeCase.toSnake = function (value, locale) {
  return this.toSentence(value, locale, '_');
};

/**
 * @method toPascal
 * @param  {String} value
 * @param  {String} [locale]
 * @return {String}
 */
ChangeCase.toPascal = function (value, locale) {
  return this.toCapital(this.toCamel(value, locale), locale);
};

/**
 * @method toParam
 * @param  {String} value
 * @param  {String} [locale]
 * @return {String}
 */
ChangeCase.toParam = function (value, locale) {
  return this.toSentence(value, locale, '-');
};

/**
 * @method toSentence
 * @param  {String} value
 * @param  {String} [locale]
 * @param  {String} [replacement]
 * @return {String}
 */
ChangeCase.toSentence = function (value, locale, replacement) {
  if (value == null) {
    return '';
  }
  replacement = replacement || ' ';
  function replace (match, index, string) {
    if (index === 0 || index === (string.length - match.length)) {
      return '';
    }
    return replacement;
  }
  value = String(value)
    .replace(CAMEL_CASE_REGEXP, '$1 $2')
    .replace(TRAILING_DIGIT_REGEXP, '$1 $2')
    .replace(NON_WORD_REGEXP, replace);
  return this.toLower(value, locale);
};