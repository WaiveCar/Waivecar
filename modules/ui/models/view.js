'use strict';

Bento.Register.Model('View', 'mongo', (collection) => {

  /**
   * The id of the collection.
   * @type {String}
   */
  collection.id = 'views';

  return collection;

});
