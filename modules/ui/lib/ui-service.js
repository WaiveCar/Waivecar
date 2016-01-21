'use strict';

let error  = Bento.Error;
let config = Bento.config;
let View   = Bento.model('View');

/**
 * @class UiService
 */
let UiService = module.exports = {};

/**
 * @method getAll
 * @param  {User}   _user
 * @return {License}
 */
UiService.getAll = function *(_user) {
  let result = {
    resources : {},
    fields    : {},
    views     : yield View.find()
  };
  for (let key in config) {
    if (config[key].ui) {
      let ui = config[key].ui;
      append(ui.resources, result.resources);
      append(ui.fields, result.fields);
    }
  }
  return result;
};

/**
 * @private
 * @method append
 * @param  {Object} target
 * @param  {Object} source
 */
function append(target, source) {
  for (let key in target) {
    if (!source.hasOwnProperty(key)) {
      source[key] = target[key];
    }
  }
}
