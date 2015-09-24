'use strict';

let NON_WORD_REGEXP       = require('./vendor/non-word-regexp');
let CAMEL_CASE_REGEXP     = require('./vendor/camel-case-regexp');
let TRAILING_DIGIT_REGEXP = require('./vendor/trailing-digit-regexp');
let LANGUAGES_UPPERCASE   = require('./vendor/languages-uppercase.js');
let LANGUAGES_LOWERCASE   = require('./vendor/languages-lowercase.js');

/**
 * @class Case
 * @static
 */
let Case = module.exports = {};

/**
 * Changes the case of the string values in the provided array.
 * @method array
 * @param  {String} caseType
 * @param  {Array}  arr
 * @return {Array}
 */
Case.array = (caseType, arr) => {
  return arr.reduce((store, value) => {
    store.push(Case[caseType](value));
    return store;
  }, []);
};

/**
 * @method objectKeys
 * @param  {String} caseType
 * @param  {Object} obj
 * @return {Object}
 */
Case.objectKeys = (caseType, obj) => {
  let result = {};
  for (let key in obj) {
    result[Case[caseType](key)] = obj[key];
  }
  return result;
};

/**
 * @method toCapital
 * @param  {String} value
 * @param  {String} [locale]
 * @return {String}
 */
Case.toCapital = (value, locale) => {
  if (value == null) {
    return '';
  }
  value = String(value);
  return Case.toUpper(value.charAt(0), locale) + value.substr(1);
};

/**
 * @method toUpper
 * @param  {String} value
 * @param  {String} [locale]
 * @return {String}
 */
Case.toUpper = (value, locale) => {
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
Case.toLower = (value, locale) => {
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
Case.toCamel = (value, locale) => {
  return Case
    .toSentence(value, locale)
    .replace(/(\d) (?=\d)/g, '$1_')
    .replace(/ (.)/g, (m, $1) => Case.toUpper($1, locale));
};

/**
 * @method toSnake
 * @param  {String} value
 * @param  {String} [locale]
 * @return {String}
 */
Case.toSnake = (value, locale) => {
  return Case.toSentence(value, locale, '_');
};

/**
 * @method toPascal
 * @param  {String} value
 * @param  {String} [locale]
 * @return {String}
 */
Case.toPascal = (value, locale) => {
  return Case.toCapital(Case.toCamel(value, locale), locale);
};

/**
 * @method toParam
 * @param  {String} value
 * @param  {String} [locale]
 * @return {String}
 */
Case.toParam = (value, locale) => {
  return Case.toSentence(value, locale, '-');
};

/**
 * @method toSentence
 * @param  {String} value
 * @param  {String} [locale]
 * @param  {String} [replacement]
 * @return {String}
 */
Case.toSentence = (value, locale, replacement) => {
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
  return Case.toLower(value, locale);
};