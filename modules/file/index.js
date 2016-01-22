'use strict';

/**
 * @module payment
 */
let File = module.exports = {};

/**
 * Holds a list of file hooks used when files are managed.
 * @property hooks
 * @type     Object
 */
File.hooks = {};

/**
 * @method hook
 * @param  {String}   id
 * @param  {Function} handler
 */
File.hook = function(id, handler) {
  this.hooks[id] = handler;
};