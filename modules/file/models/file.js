'use strict';

let shortId = require('shortid');

Bento.Register.Model('File', 'sequelize', (model, Sequelize) => {

  /**
   * The identity of the table created in your database.
   * @property table
   * @type     String
   */
  model.table = 'files';

  /**
   * The sequelize schema definition of your model.
   * @property schema
   * @type     Object
   */
  model.schema = {

    /**
     * The primary key identifier of the file, a custom shortId
     * is created with new files.
     * @type {String}
     */
    id : {
      type         : Sequelize.STRING,
      primaryKey   : true,
      defaultValue : () => {
        return shortId();
      }
    },

    /**
     * File owner.
     * @type {Integer}
     */
    userId : {
      type       : Sequelize.INTEGER,
      allowNull  : false,
      references : {
        model : 'users',
        key   : 'id'
      }
    },

    /**
     * Group owner.
     * @type {Integer}
     */
    groupId : {
      type       : Sequelize.INTEGER,
      references : {
        model : 'groups',
        key   : 'id'
      },
      defaultValue : 1
    },

    /**
     * A collection id exists when its part of a file group/collection.
     * Useful for when you want to retrieve multiple files under a
     * shared identifier.
     * @type {String}
     */
    collectionId : {
      type : Sequelize.STRING(14)
    },

    /**
     * A boolean check if the file is private.
     * @type {Boolean}
     */
    private : {
      type         : Sequelize.BOOLEAN,
      defaultValue : false
    },

    /**
     * The name of the file, used when giving it a human readable
     * identifier.
     * @type {String}
     */
    name : {
      type : Sequelize.STRING(128)
    },

    /**
     * Internal path to the location of the file.
     * @type {String}
     */
    path : {
      type      : Sequelize.STRING,
      allowNull : false
    },

    /**
     * The MIME type of the file.
     * @type {String}
     */
    mime : {
      type      : Sequelize.STRING(64),
      allowNull : false
    },

    /**
     * File size in kb.
     * @type {Integer}
     */
    size : {
      type : Sequelize.INTEGER
    },

    /**
     * File comment, usefull for providing additional information
     * to the file.
     * @type {Text}
     */
    comment : {
      type : Sequelize.TEXT
    },

    organizationId: {
      type: Sequelize.INTEGER,
      defaultValue: null,
    },

    /**
     * The location where the file is stored, this is either local or
     * any of the available 3rd party service providers.
     * @type {Enum}
     */
    store : {
      type         : Sequelize.ENUM('local', 's3'),
      defaultValue : 'local'
    },

    /**
     * Used when storing on AWS.
     * @type {String}
     */
    bucket : {
      type : Sequelize.STRING(64)
    }

  };

  /**
   * If set to false, records will be physicaly removed on delete operations.
   * @property paranoid
   * @type     Boolean
   * @default  true
   */
  model.paranoid = false;

  /**
   * Attributes to remove before returning the model as JSON.
   * @property blacklist
   * @type     Array
   */
  model.blacklist = [ 'store', 'bucket', 'private' ];

  return model;

});

