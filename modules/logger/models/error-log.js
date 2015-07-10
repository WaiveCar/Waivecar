'use strict';

let _super = Reach.service('mysql/model');

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

  return ErrorLog;

})();