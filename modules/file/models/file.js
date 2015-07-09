'use strict';

var _super = Reach.service('mysql/model');
var query  = Reach.service('mysql/query');

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
      id     : 'INT(11) NOT NULL AUTO_INCREMENT',
      source : 'ENUM("local","s3") NOT NULL DEFAULT "local"',
      name   : 'VARCHAR(128) NOT NULL',
      folder : 'VARCHAR(128) NULL',
      path   : 'VARCHAR(128) NOT NULL',
      mime   : 'VARCHAR(64) NOT NULL',
      size   : 'INT(28) NOT NULL'
    },
    primaryKey : 'id'
  };

  /**
   * Adds the user to the database.
   * @method save
   * @return {object}
   */
  File.prototype.save = function *() {
    var result = yield query.insert(this._table, {
      source : this.source,
      name   : this.name,
      folder : this.folder,
      path   : this.path,
      mime   : this.mime,
      size   : this.size,
    });
    this.id        = result.insertId;
    this.createdAt = Date.now();
  };

  /**
   * @static
   * @method find
   * @param  {Object} options
   * @return {Mixed}  Returns either an array of files or a single file object
   */
  File.find = function *(options) {
    var result = yield query.select('files', options);
    if (!result) {
      return result;
    }
    if (options.limit && 1 === options.limit) {
      return new File(result);
    }
    result.forEach(function (user, index) {
      result[index] = new File(user);
    });
    return result;
  };

  /**
   * @method update
   * @param  {Object} data
   * @return {Void}
   */
  File.prototype.update = function *(data) {
    yield query('UPDATE files SET ?, updated_at = NOW() WHERE id = ?', [data, this.id]);
    for (var key in data) {
      if (this.hasOwnProperty(key)) {
        this[key] = data[key];
      }
    }
    this.updatedAt = Date.now();
  };

  return File;

})();