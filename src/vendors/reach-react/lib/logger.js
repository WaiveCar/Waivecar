'use strict';

import { app } from 'config';

/**
 * @class Logger
 * @param {String} type
 * @param {String} value
 */
let Logger = module.exports = function (type, value) {
  if (app.log[type]) {
    Logger[type](value);
  }
};

/**
 * @method log
 * @param  {String} value
 */
Logger.log = function (value) {
  if (app.log.verbose) {
    console.log(value);
  }
};

/**
 * @method info
 * @param  {String} value
 */
Logger.info = function (value) {
  if (app.log.info) {
    console.log(value);
  }
};

/**
 * @method warn
 * @param  {String} value
 */
Logger.warn = function (value) {
  if (app.log.warn) {
    console.warn(value);
  }
};

/**
 * @method debug
 * @param  {String} value
 */
Logger.debug = function (value) {
  if (app.log.debug) {
    console.debug(value);
  }
};