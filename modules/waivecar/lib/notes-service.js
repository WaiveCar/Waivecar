'use strict';

let Service = require('./classes/service');
let error = Bento.Error;

let BookingNote = Bento.model('BookingNote');
let CarNote = Bento.model('CarNote');
let UserNote = Bento.model('UserNote');


module.exports = class NotesService extends Service {
  static *create(type, payload, _user) {
    let Model = this.getModel(type);
    payload.authorId = _user.id;
    let model = new Model(payload);
    yield model.save();

    model = yield this.getNote(type, model.id);

    model.relay('store', 'notes');
    return model;
  }

  /**
   * Retrieve existing note
   * @param {String} type
   * @param {Number} id
   * @param {Object} _user
   * @return {Object}
   */
  static *show(type, id, _user) {
    return yield this.getNote(type, id);
  }

  /**
   * Update existing note
   * @param {String} type
   * @param {Number} id
   * @param {Object} payload
   * @param {Object} _user
   * @return {Object}
   */
  static *update(type, id, payload, _user) {
    let model = yield this.getNote(type, id);

    if (model.userId !== _user.id && !_user.hasAccess('owner')) {
      throw error.parse({
        code    : 'NOTE_UNAUTHORIZED',
        message : 'Not authorized to update this note'
      }, 400);
    }

    yield model.update({ content : payload.content });

    model = yield this.getNote(type, model.id);

    model.relay('update', 'notes', model);

    return model;
  }

  /**
   * Remove note
   * @param {String} type
   * @param {Number} id
   * @param {Object} _user
   * @return {Object}
   */
  static *remove(type, id, _user) {
    let model = yield this.getNote(type, id);

    if (model.userId !== _user.id && !_user.hasAccess('owner')) {
      throw error.parse({
        code    : 'NOTE_UNAUTHORIZED',
        message : 'Not authorized to remove this note'
      }, 400);
    }

    yield model.delete();
    model.relay('delete', 'notes');
  }

  /**
   * Get list of all notes for specific booking
   * @param {Number} bookingId
   */
  static *getBookingNotes(bookingId) {
    return yield BookingNote.find({
      where   : { bookingId },
      include : [
        {
          model : 'User',
          as    : 'author'
        }
      ]
    });
  }

  /**
   * Get list of all notes for specific car
   * @param {String} carId
   */
  static *getCarNotes(carId) {
    return yield CarNote.find({
      where   : { carId },
      include : [
        {
          model : 'User',
          as    : 'author'
        }
      ]
    });
  }

  /**
   * Get list of all notes for specific user
   * @param {String} userId
   */
  static *getUserNotes(userId) {
    return yield UserNote.find({
      where   : { userId },
      include : [
        {
          model : 'User',
          as    : 'author'
        }
      ]
    });
  }

  /**
   * Divine correct note model
   * @param {String} type
   * @return {Object}
   */
  static getModel(type) {
    switch (type) {
      case 'booking':
        return BookingNote;
      case 'car':
        return CarNote;
      case 'user':
        return UserNote;
      default:
      throw error.parse({
        code    : 'NOTE_TYPE',
        message : 'Unrecognized note type.'
      }, 400);
    }
  }

  /**
   * Fetch note
   * @param {String} type
   * @param {Number} id
   * @return {Object}
   */
  static *getNote(type, id) {
    let relations = {
      include : [
        {
          model : 'User',
          as    : 'author'
        }
      ]
    };
    let Model = this.getModel(type);
    let model = yield Model.findById(id, relations);
    if (!model) {
      throw error.parse({
        code    : `NOTE_NOT_FOUND`,
        message : `The requested note does not exist.`,
        data    : {
          noteId : parseInt(id)
        }
      }, 400);
    }

    return model;
  }
};
