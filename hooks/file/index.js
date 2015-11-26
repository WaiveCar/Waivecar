'use strict';

let booking = require('./lib/booking');
let license = require('./lib/license');
let hooks   = Bento.Hooks;

/**
  Validates the file before allowing further file operations to take place.
  This should throw an error if the file transfer is invalid.
  @param  {Object} query
  @param  {Object} _user
 */
hooks.set('file:validate', function *(query, _user) {
  if (query.bookingId) { return yield booking.validate(query.bookingId); }
  if (query.licenseId) { return yield license.validate(query.licenseId); }
});

/*
  Creates a shared collection id for files that should be accessible with
  a single identifier.
  @param  {Object} query
  @param  {Object} _user
  @return {String} Default: null
 */
hooks.set('file:collection', function *(query, _user) {
  if (query.bookingId) {
    return yield booking.collection(query.bookingId);
  }
  return null;
});

/*
  Captures the newly created file.
  @param {Object} query
  @param {Object} file
  @param {Object} _user
 */
hooks.set('file:capture', function *(query, file, _user) {
  if (query.licenseId) {
    return yield license.capture(query.licenseId, file);
  }
});

/*
  Handle deletion of files.
  @param {Object} query
  @param {Object} _user
 */
hooks.set('file:delete', function *(query, _user) {
  if (query.licenseId) {
    return yield license.delete(query.licenseId);
  }
});
