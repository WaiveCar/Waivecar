'use strict';

import { app } from 'config';

let Logger = module.exports = function (type, value) {
  if (app.log[type]) {
    Logger[type](value);
  }
};

/**
 * @param  {String} value
 * @return {Void}
 */
Logger.log = function (value) {
  if (app.log.verbose) {
    console.log(value);
  }
};

/**
 * @param  {String} value
 * @return {Void}
 */
Logger.info = function (value) {
  if (app.log.info) {
    console.log(value);
  }
};

/**
 * @param  {String} value
 * @return {Void}
 */
Logger.warn = function (value) {
  if (app.log.warn) {
    console.warn(value);
  }
};

/**
 * @param  {String} value
 * @return {Void}
 */
Logger.debug = function (value) {
  if (app.log.debug) {
    console.debug(value);
  }
};
