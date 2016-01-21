'use strict';

let type = Bento.Helpers.Type;

module.exports = class Relations {

  constructor(Model, options) {
    this.exists = false;
    this.store  = {};
    if (!options || !options.include) {
      return;
    }
    if (options.include) {
      this.exists = true;
      for (let i = 0, len = options.include.length; i < len; i++) {
        let relation = options.include[i];
        let model    = Bento.model(relation.model);       // Fetch related model
        let key      = relation.as || model._schema.name; // Add key, if no as value is present we use _schema.name

        // ### Store Relation
        // Stores the model and relational attributes for when we need to
        // prepare the relation for toJSON filtering.

        this.store[key]       = {};
        this.store[key].model = model;
        this.store[key].attr  = relation.attr || null;

        // ### Assign Real Model
        // Assign the real model to the options model.

        options.include[i].model = model._schema;

        // ### Push Attribute
        // Add the relation key to the model as a valid attribute.

        Model._attributes.push(key);
      }
    }
  }

  /**
   * Prepares related data.
   * @param  {Object} data
   * @return {Void}
   */
  prepare(data) {
    let relations = this.store;
    for (let key in relations) {
      data[key] = populateRelation(data[key], relations[key]);
    }
  }

};

/**
 * @param  {Mixed}    data
 * @param  {Function} relation
 * @return {Mixed}
 */
function populateRelation(data, relation) {
  if (!data) { return null; }
  let Model = relation.model;
  let model = null;
  if (type.isArray(data)) {
    for (let i = 0, len = data.length; i < len; i++) {
      model = new Model(data[i].dataValues);
      model.toJSON.bind(model, relation.attr);
      data[i] = model;
    }
    return data;
  }
  model = new Model(data.dataValues);
  model.toJSON.bind(model, relation.attr);
  return model;
}
