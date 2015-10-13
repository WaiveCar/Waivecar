'use strict';

let shortid        = require('shortid');
let FileModule     = Reach.module('file');
let bookingService = Reach.module('waivecar/lib/booking-service');
let licenseService = Reach.module('license/lib/license-service');
let hooks          = Reach.Hooks;
let error          = Reach.Error;

/**
  Validates the file before allowing further file operations to take place.
  This should throw an error if the file transfer is invalid.
  
  @hook   file:validate
  @param  {Object} qs
  @param  {Object} _user
 */
hooks.set('file:validate', function *(qs, _user) {
  let model = yield getModel(qs, _user);
  if (!model) {
    throw error.parse({
      code    : `UPLOAD_FAILED`,
      message : `The id provided for ${ qs.type } does not exist`
    }, 400);
  }
});

/*
  Creates a shared collection id for files that should be accessible with
  a single identifier.
  @hook   file:collection
  @param  {Object} qs
  @param  {Object} _user
  @return {String} Default: null
 */
hooks.set('file:collection', function *(qs, _user) {
  let model = yield getModel(qs, _user);
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
 * @param {Object} qs
 * @param {Object} _user
 * @yield {Object}
 */
function *getModel(qs, _user) {
  switch (qs.type) {
    case 'license' : return yield licenseService(qs.id, _user);
    case 'booking' : return yield bookingService(qs.id, _user);
  }
}