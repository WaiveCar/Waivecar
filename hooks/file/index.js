'use strict';

let shortid = require('shortid');
let Booking = Reach.model('Booking');
let hooks   = Reach.Hooks;
let error   = Reach.Error;

/**
  Validates the file before allowing further file operations to take place.
  This should throw an error if the file transfer is invalid.
  
  @hook   file:validate
  @param  {Object} data
  @param  {Object} _user
 */
hooks.set('file:validate', function *(data, _user) {
  let model = yield getModel(data.type, data.id);
  if (!model) {
    throw error.parse({
      code    : `UPLOAD_FAILED`,
      message : `The ${ data.type } id provided does not exist`
    }, 400);
  }
});

/*
  Creates a shared collection id for files that should be accessible with
  a single identifier.
  @hook   file:collection
  @param  {Object} data
  @param  {Object} _user
  @return {String} Default: null
 */
hooks.set('file:collection', function *(data, _user) {
  let model = yield getModel(data.type, data.id);
  if (!model.collectionId) {
    yield model.update({
      collectionId : shortid.generate()
    });
  }
  return model.collectionId;
});

/*
  Captures the newly created file.
  @hook  file:capture
  @param {Object} file
  @param {Object} options
  @param {Object} _user
 */
hooks.set('file:capture', function *(file, options, _user) {
  // ...
});

/**
 * Returns a model based on the requested type.
 * @param {String} type
 * @param {Number} id
 * @param {Object} _user
 * @yield {Object}
 */
function *getModel(type, id, _user) {
  switch (type) {
    case 'booking' : return yield Booking.findById(id);
  }
}