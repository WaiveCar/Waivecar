'use strict';

/**
 * Templates
 * =========
 *
 * Templates are staticly defined layout views that defines the space
 * in which component views are rendered.
 *
 * Templates needs to be registered before the primary router is
 * registered.
 *
 * @class Templates
 * @param {Object} fields
 */
let Templates = module.exports = {};

/**
 * List of available templates.
 * @property store
 * @type     Object
 */
Templates.store = {};

/**
 * Registers a new template with the template store.
 * @method register
 * @param  {String} id
 * @param  {Object} template
 */
Templates.register = function (id, template) {
  Templates.store[id] = template;
};

/**
 * Retrieves a template from the template store.
 * @method get
 * @param  {String} id
 * @return {Object}
 */
Templates.get = function (id) {
  if (this.store[id]) {
    return this.store[id];
  }
  throw new Error(`Requested template '${ id }' has not been registered.`);
};

/**
 * Returns all the component templates that has been defined in the store.
 * @method getAll
 * @return {Array}
 */
Templates.getAll = function () {
  let list = [];
  for (let key in this.store) {
    list.push(this.store[key]);
  }
  return list;
};