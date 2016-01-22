'use strict';

let mongo = require('mongodb');

module.exports = {

  /**
   * The mongo database instance created on setup.
   * @property db
   * @type     Object
   * @default  null
   */
  db : null,

  /**
   * Creates a new ObjectID instance.
   * @param  {String} id
   * @return {Object}
   */
  ObjectID : mongo.ObjectID,

  /**
   * Returns a mongoDB collection instanced connection.
   * @param  {String} id
   * @return {Object}
   */
  collection(id) {
    if (!this.db) {
      return null;
    }
    if (!this.db.collection(id)) {
      this.db.createCollection(id);
    }
    return this.db.collection(id);
  }

};
