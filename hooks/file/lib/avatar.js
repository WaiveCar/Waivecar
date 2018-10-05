'use strict';

let File  = Bento.model('File');
let User  = Bento.model('User');
let relay = Bento.Relay;
let error = Bento.Error;
let UserLog      = require('../../../modules/log/lib/log-service');

module.exports = class Avatar {

  static *validate(userId) {
    let user = yield User.findById(userId);
    if (!user) {
      throw error.parse({
        code    : `FILE_INVALID_USER`,
        message : `The user id does not exist.`
      }, 404);
    }
  }

  static *assign(userId, file, _user) {
    let user = yield User.findById(userId);
    if (user.avatar) {
      let oldFile = yield File.findById(user.avatar);
      let reason = `Selfie<br/><img src='http://waivecar-prod.s3.amazonaws.com/${oldFile.path}'><img src='http://waivecar-prod.s3.amazonaws.com/${file.path}'>`;
      yield UserLog.addUserEvent(user, 'PHOTO', _user.id, reason);
    }
    yield user.update({
      avatar : file.id
    });

    if (user.id === _user.id) {
      relay.emit('me', {
        type : 'update',
        data : user.toJSON()
      });
    }

    relay.emit('users', {
      type : 'update',
      data : user.toJSON()
    });
  }

};
