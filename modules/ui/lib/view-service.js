'use strict';

let View  = Bento.model('View');
let error    = Bento.Error;
let relay    = Bento.Relay;
let resource = 'views';
/**
 * @class ViewService
 */
let ViewService = module.exports = {};

/**
 * @method getAll
 * @return {View}
 */
ViewService.getAll = function *(_user) {
  let models = yield View.find();
  return models;
};

/**
 * @method get
 * @param  {Integer} id
 * @param  {User}   _user
 * @return {View}
 */
ViewService.get = function *(id, _user) {
  let model = yield View.findById(id);
  if (!model) {
    throw error.parse({
      code    : 'CONTENT_NOT_FOUND',
      message : 'The requested view was not found'
    }, 404);
  }
  if (model.userId !== _user.id && !_user.hasAccess('admin')) {
    throw error.parse({
      code    : 'USER_CREDENTIALS_INVALID',
      message : 'You do not have access to update this view'
    }, 401);
  }
  return model;
};

/**
 * @method create
 * @param  {Object} data
 * @param  {User}   _user
 * @return {View}
 */
ViewService.create = function *(data, _user) {
  let model = new View(data);
  model.userId = _user ? _user.id : 1;
  model.createdAt = new Date();
  yield model.save();
  relay.emit(resource, {
    type : 'store',
    data : model.toJSON()
  });
  return model;
};

/**
 * @method update
 * @param  {Integer} id
 * @param  {Object}  data
 * @param  {User}    _user
 * @return {View}
 */
ViewService.update = function *(id, data, _user) {
  let model = yield this.get(id, _user);
  data.updatedAt = new Date();
  yield model.update(data);
  relay.emit(resource, {
    type : 'update',
    data : model.toJSON()
  });
  return model;
};

/**
 * @method destroy
 * @param  {Integer} id
 * @param  {User}    _user
 * @return {View}
 */
ViewService.destroy = function *(id, _user) {
  let model = yield this.get(id, _user);
  yield model.update({ deletedAt : new Date() });
  yield model.delete();
  relay.emit(resource, {
    type : 'delete',
    data : model.toJSON()
  });
  return model;
};
