'use strict';

let License = Reach.model('License');
let error   = Reach.ErrorHandler;
let flux    = Reach.IO.flux;

/**
 * @class LicenseService
 */
let LicenseService = module.exports = {};

/**
 * @method create
 * @param  {Object} data
 * @param  {User}   _user
 * @return {License}
 */
LicenseService.create = function *(data, _user) {
  let model = new License(data);
  yield model.save();
  flux({
    actionType : 'license:stored',
    license    : model.toJSON()
  });
  return model;
};

/**
 * @method get
 * @param  {Integer} id
 * @param  {User}   _user
 * @return {License}
 */
LicenseService.get = function *(id, _user) {
  let model = yield License.findById(id);
  hasAccess(model, _user);
  if (!model) {
    throw error.parse({
      code    : 'LICENSE_NOT_FOUND',
      message : 'The requested license was not found in our records'
    }, 404);
  }
  return model;
};

/**
 * @method getAll
 * @return {License}
 */
LicenseService.getAll = function *() {
  let models = yield License.find();
  return models;
};

/**
 * @method save
 * @param  {Integer} id
 * @param  {Object}  data
 * @param  {User}    _user
 * @return {License}
 */
LicenseService.save = function *(id, data, _user) {
  let model = yield this.get(id);
  hasAccess(model, _user);
  for (let key in data) {
    if (model.hasOwnProperty(key)) {
      model[key] = data[key];
    }
  }
  yield model.update();
  flux({
    actionType : 'license:updated',
    license    : model.toJSON()
  });
  return model;
};

/**
 * @method delete
 * @param  {Integer} id
 * @param  {User}    _user
 * @return {License}
 */
LicenseService.destroy = function *(id, _user) {
  let model = yield this.get(id);
  hasAccess(model, _user);
  yield model.delete();
  flux({
    actionType : 'license:destroyed',
    license    : model.toJSON()
  });
  return model;
};

/**
 * @private
 * @method hasAccess
 * @param  {License} license
 * @param  {User} _user
 */
function hasAccess(license, _user) {
  if (license.userId !== _user.id && _user.role !== 'admin') {
    throw error.parse({
      code    : 'USER_CREDENTIALS_INVALID',
      message : 'You do not have access to update this license'
    }, 401);
  }
}