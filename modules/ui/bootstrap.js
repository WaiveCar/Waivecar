'use strict';

let fs             = require('co-fs');
let codes          = require('./lib/errors');
let viewService    = require('./lib/view-service');
let View           = Bento.model('View');
let error          = Bento.Error;
let config         = Bento.config.ui;
let log            = Bento.Log;

module.exports = function *() {
  yield importFixture('views', View, viewService);
};

/**
 * @param  {String} fixture
 * @param  {Object} Model
 * @param  {Object} service
 * @return {Object}
 */
function *importFixture(fixture, Model, service) {
  log.info(`inspecting ${ fixture }.`);
  let existingModels = yield Model.find();
  let count = existingModels.length;
  if (count > 1 && config.force) {
    for (let i = 0, len = existingModels.length; i < len; i++) {
      let existing = existingModels[i];
      yield existing.remove();
      count = count - 1;
    }
  }

  if (count === 0) {
    let models = yield getFixture(fixture);
    log.debug(`importing ${ models.length } ${ fixture }`);
    for (let i = 0, len = models.length; i < len; i++) {
      yield service.create(models[i]);
    }
  }
}

/**
 * @method getFixture
 * @return {Array}
 */
function *getFixture(fixture) {
  if (!config) {
    throw error.parse(codes.CONFIG_MISSING);
  }
  if (!config.fixtures[fixture]) {
    return [];
  }
  let fixtureExists = yield fs.exists(config.fixtures[fixture]);
  if (!fixtureExists) {
    return [];
  }
  let data = JSON.parse(yield fs.readFile(config.fixtures[fixture]));
  if (!data) {
    return [];
  }
  return data;
}
