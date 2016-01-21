'use strict';

let loaded = [];

module.exports = function *() {
  yield relations();
};

/**
 * Setup the model relations.
 * @return {Void}
 */
function *relations() {
  let models = Object.keys(Bento.store.models);
  for (let i = 0, len = models.length; i < len; i++) {
    if (loaded.indexOf(models[i]) !== -1) {
      continue;
    }
    let model = Bento.model(models[i]);
    if (model._relations) {
      prepareRelations(model, model._relations);
    }
    loaded.push(models[i]);
  }
}

/**
 * @param  {Function} model
 * @param  {Array}    relations
 * @return {Void}
 */
function prepareRelations(model, relations) {
  let handler = relations.pop();
  relations.forEach((target, index) => {
    relations[index] = Bento.model(target)._schema;
  });
  handler.apply(model._schema, relations);
}
