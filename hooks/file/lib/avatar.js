'use strict';

let File  = Bento.model('File');
let User  = Bento.model('User');
let relay = Bento.Relay;
let error = Bento.Error;

module.exports = class Avatar {

  /**
   * Validates the user.
   * @param  {String} userId
   * @return {Void}
   */
  static *validate(userId) {
    let user = yield User.findById(userId);
    if (!user) {
      throw error.parse({
        code    : `FILE_INVALID_USER`,
        message : `The user id does not exist.`
      }, 404);
    }
  }

  /**
   * Assigns the file as the new avatar for the provided userId.
   * @param  {String} userId
   * @param  {Object} file
   * @param  {Object} _user
   * @return {Void}
   */
  static *assign(userId, file, _user) {
    let user = yield User.findById(userId);
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
