'use strict';

let _super = Reach.service('mysql/model');
let query  = Reach.service('mysql/query');

module.exports = (function () {

  Reach.extends(ErrorLog, _super);

  /**
   * @class ErrorLog
   * @constructor
   * @param {object} data
   */
  function ErrorLog(data) {
    _super.call(this, data);
  }

  /**
   * The name of the table to use for this model.
   * @property _table
   * @type     String
   */
  ErrorLog.prototype._table = ErrorLog._table = 'error_log';

  /**
   * Your models database schema.
   * @property _schema
   * @type     Object
   */
  ErrorLog.prototype._schema = ErrorLog._schema = {
    attributes : {
      id            : 'VARCHAR(12) NOT NULL',
      github        : 'VARCHAR(128) NULL',
      errorStatus   : 'VARCHAR(12) NOT NULL',
      clientId      : 'VARCHAR(11) NULL',
      clientIp      : 'VARCHAR(18) NULL',
      detailUri     : 'VARCHAR(128) NULL',
      detailRoute   : 'VARCHAR(128) NULL',
      detailCode    : 'VARCHAR(128) NULL',
      detailMessage : 'TEXT NULL',
      detailData    : 'TEXT NULL',
      stack         : 'TEXT NULL'
    },
    primaryKey : 'id'
  };

  /**
   * Attributes to remove before returning model.toJSON()
   * @property _blacklist
   * @type     Array
   */
  ErrorLog.prototype._blacklist = [
    'deletedAt'
  ];

  /**
   * @static
   * @method find
   * @param  {object} options
   * @return {array}  users
   */
  ErrorLog.find = function *(options) {
    var result = yield query.select('error_log', options);
    if (!result) {
      return result;
    }
    if (options.limit && 1 === options.limit) {
      return new ErrorLog(result);
    }
    result.forEach(function (log, index) {
      result[index] = new ErrorLog(log);
    });
    return result;
  };

  /**
   * @method save
   */
  ErrorLog.prototype.save = function *() {
    let result = yield query.insert(
      this._table,
      this._data()
    );
    this.id        = result.insertId;
    this.createdAt = Date.now();
  };

  return ErrorLog;

})();