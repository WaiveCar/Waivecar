'use strict';

var _super = Reach.service('mysql/model');

module.exports = (function () {

  Reach.extends(File, _super);

  /**
   * @class File
   * @constructor
   * @param {object} data
   */
  function File(data) {
    _super.call(this, data);
  }

  /**
   * The name of the table to use for this model.
   * @property _table
   * @type     String
   */
  File.prototype._table = File._table = 'files';

  /**
   * Your models database schema.
   * @property _schema
   * @type     Object
   */
  File.prototype._schema = File._schema = {
    attributes : {
      id      : 'INT(11) NOT NULL AUTO_INCREMENT',
      name    : 'VARCHAR(128) NULL',
      path    : 'VARCHAR(128) NOT NULL',
      mime    : 'VARCHAR(64) NOT NULL',
      size    : 'INT(28) NOT NULL',
      store   : 'ENUM("local","s3") NOT NULL DEFAULT "local"',
      bucket  : 'VARCHAR(64) NULL',
      private : 'TINYINT(1) DEFAULT 0'
    },
    primaryKey : 'id'
  };

  /**
   * Attributes to remove before returning model.toJSON()
   * @property _blacklist
   * @type     Array
   */
  File.prototype._blacklist = [ 'store', 'bucket', 'private' ];

  return File;

})();