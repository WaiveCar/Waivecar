'use strict';

let Storage = require('./storage');
let S3      = require('./s3');
let File    = Bento.model('File');
let User    = Bento.model('User');
let error   = Bento.Error;

module.exports = class Service {

  /**
   * Returns a single file.
   * @param {String} id
   * @param {Object} _user
   */
  *getFile(id, _user) {
    let file = yield File.findById(id);
    if (!file) {
      throw error.parse({
        code    : `FILE_NOT_FOUND`,
        message : `The requested file does not exist in our records`
      }, 404);
    }

    // ### Owner
    // Retrieve the owner of the file.

    let user = yield this.getUser(file.userId);

    // ### Access Check
    // If the file requested is private we need to make sure the user
    // requesting the file has the permissions to view the file.

    if (file.private) {
      this.hasAccess(user, _user);
    }

    return file;
  }

  /**
   * Attempts to return the user with the provided id or throws an error.
   * @param  {Number} id
   * @return {Object}
   */
  *getUser(id) {
    let user = yield User.findById(id);
    if (!user) {
      throw error.parse({
        code    : `INVALID_USER`,
        message : `The user was not found in our records.`
      }, 400);
    }
    return user;
  }

  *deleteFiles(files) {
    for (let i = 0, len = files.length; i < len; i++) {
      try {
        let file = files[i];
        switch (file.store) {
          case 'local' : {
            yield Storage.delete(file);
            break;
          }
          case 's3' : {
            yield S3.delete(file);
            break;
          }
        }
      } catch(ex) { 
        console.log('Unable to delete ', file);
      }
    }
  }

  /**
   * Only allow access if the requesting user is the actor or is administrator.
   * @param  {Object}  user  The user to be modified.
   * @param  {Object}  _user The user requesting modification.
   * @return {Boolean}
   */
  hasAccess(user, _user) {
    if (!_user || (user.id !== _user.id && _user.role !== 'admin')) {
      throw error.parse({
        error   : `INVALID_PRIVILEGES`,
        message : `You do not have the required privileges to perform this operation.`
      }, 400);
    }
  }

};
